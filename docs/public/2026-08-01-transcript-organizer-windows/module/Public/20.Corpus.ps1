function Export-TranscriptOrganizerCorpus {
    <#
    .SYNOPSIS
    Builds a reusable timestamped extraction corpus from one local media file.
    .DESCRIPTION
    Performs at most one internal JSON transcription, derives readable text and SRT, records media metadata, extracts bounded periodic frames, and writes validation and integrity manifests.
    .EXAMPLE
    Export-TranscriptOrganizerCorpus -InputPath '.\talk.webm' -OutputFolder '.\talk-transcript' -Configuration $config
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory,Position=0)][string] $InputPath,
        [Parameter()][string] $OutputFolder,
        [Parameter()] $Configuration = (New-TranscriptOrganizerConfiguration),
        [Parameter()][string] $WhisperModelPath,
        [Parameter()][switch] $ReuseExistingTranscript,
        [Parameter()][switch] $Overwrite,
        [Parameter()][switch] $DryRun,
        [Parameter()][ValidateRange(5,600)][int] $FrameIntervalSeconds = 60,
        [Parameter()][ValidateRange(1,300)][int] $MaximumFrames = 60,
        [Parameter()][ValidateRange(0.1,3600)][double] $QueueSeconds = 20,
        [Parameter()][bool] $UseGpu = $true,
        [Parameter()][ValidateRange(0,[int]::MaxValue)][int] $GpuDevice = 0,
        [Parameter()][switch] $RequireGpu,
        [Parameter()][bool] $AllowCpuFallback = $true,
        [Parameter()][switch] $EnableVad,
        [Parameter()][string] $VadModelPath,
        [Parameter()][ValidateRange(0.0,1.0)][double] $VadThreshold = 0.5,
        [Parameter()][ValidateRange(0.0,60.0)][double] $VadMinimumSpeechSeconds = 0.2,
        [Parameter()][ValidateRange(0.0,60.0)][double] $VadMinimumSilenceSeconds = 0.6,
        [Parameter()][ValidateSet('en','auto')][string] $Language = 'en',
        [Parameter()][string] $AudioStream = '0:a:0',
        [Parameter()][switch] $DownloadMissingModels,
        [Parameter()][ValidateRange(1,86400)][Nullable[int]] $TimeoutSeconds,
        [Parameter()][ValidateRange(1,100)][double] $TimeoutMultiplier = 6,
        [Parameter()][ValidateRange(0,86400)][int] $TimeoutStartupAllowanceSeconds = 1800,
        [Parameter()][ValidateRange(1,86400)][int] $MinimumTimeoutSeconds = 7200,
        [Parameter()][ValidateRange(1,86400)][int] $UnknownDurationTimeoutSeconds = 21600,
        [Parameter()][ValidateRange(1,86400)][int] $MaximumTimeoutSeconds = 86400
    )

    $sourceCandidate = if ([IO.Path]::IsPathRooted($InputPath)) { $InputPath } else { Join-Path $Configuration.ProjectDirectory $InputPath }
    $sourcePath = [IO.Path]::GetFullPath($sourceCandidate)
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Input media file does not exist: $sourcePath" }

    $backend = Resolve-TranscriptOrganizerBackend -Configuration $Configuration
    if (-not $backend.Succeeded) { throw "A paired Whisper-enabled FFmpeg and FFprobe installation was not found: $($backend.Reason)" }
    $ffmpegPath = $backend.FFmpegPath
    $ffprobePath = $backend.FFprobePath
    $media = Get-TranscriptOrganizerMediaMetadataInternal -FFprobePath $ffprobePath -InputPath $sourcePath -WorkingDirectory $Configuration.ProjectDirectory -TimeoutSeconds 60
    if (-not $media.Succeeded) { throw "The input does not contain a readable audio stream: $sourcePath" }

    $corpusPath = Resolve-TranscriptOrganizerOutputFolderPath -InputPath $sourcePath -OutputFolder $OutputFolder -WorkingDirectory (Get-Location).Path -Overwrite:$Overwrite
    $effectiveTimeout = if ($null -ne $TimeoutSeconds) { [int]$TimeoutSeconds } else {
        Get-TranscriptOrganizerAutomaticTimeoutSeconds -MediaDurationSeconds $media.DurationSeconds -Multiplier $TimeoutMultiplier -StartupAllowanceSeconds $TimeoutStartupAllowanceSeconds -MinimumSeconds $MinimumTimeoutSeconds -UnknownDurationSeconds $UnknownDurationTimeoutSeconds -MaximumSeconds $MaximumTimeoutSeconds
    }
    $resolvedWhisperModel = Resolve-TranscriptOrganizerModel -Configuration $Configuration -Model $Configuration.RequiredModel -ExplicitPath $WhisperModelPath
    $version = if ($backend.PSObject.Properties['Version'] -and $backend.Version) { $backend.Version } else { Get-TranscriptOrganizerFFmpegVersionInternal -FFmpegPath $ffmpegPath -WorkingDirectory $Configuration.ProjectDirectory }

    $resolvedPlan = [pscustomobject][ordered]@{
        InputPath = $sourcePath
        OutputFolder = $corpusPath
        FFmpegPath = $ffmpegPath
        FFprobePath = $ffprobePath
        FFmpegVersion = $version.FirstLine
        WhisperModelPath = $resolvedWhisperModel
        MediaDurationSeconds = $media.DurationSeconds
        TimeoutSeconds = $effectiveTimeout
        Timeout = [timespan]::FromSeconds($effectiveTimeout).ToString()
        TimeoutHeuristic = if ($null -ne $TimeoutSeconds) { 'Fixed user setting' } else { "ceil(duration x $TimeoutMultiplier + $TimeoutStartupAllowanceSeconds), clamped to $MinimumTimeoutSeconds..$MaximumTimeoutSeconds" }
        Language = $Language
        QueueSeconds = $QueueSeconds
        UseGpu = $UseGpu
        GpuDevice = $GpuDevice
        RequireGpu = $RequireGpu.IsPresent
        AllowCpuFallback = $AllowCpuFallback
        EnableVad = $EnableVad.IsPresent
        FrameIntervalSeconds = $FrameIntervalSeconds
        MaximumFrames = $MaximumFrames
        Overwrite = $Overwrite.IsPresent
        DryRun = $DryRun.IsPresent
    }
    Write-Host 'Resolved Transcript Organizer configuration:' -ForegroundColor Cyan
    $resolvedPlan | Format-List | Out-Host

    $rawPath = Join-Path $corpusPath 'transcript.raw.jsonl'
    $segmentsPath = Join-Path $corpusPath 'transcript.segments.json'
    $textPath = Join-Path $corpusPath 'transcript.txt'
    $srtPath = Join-Path $corpusPath 'transcript.srt'
    $transcriptionResultPath = Join-Path $corpusPath 'transcription-result.json'
    $metadataPath = Join-Path $corpusPath 'media-metadata.json'
    $visualIndexPath = Join-Path $corpusPath 'visual-index.json'
    $validationPath = Join-Path $corpusPath 'validation-report.json'
    $manifestPath = Join-Path $corpusPath 'corpus-manifest.json'
    $framesPath = Join-Path $corpusPath 'frames'
    $knownArtifacts = @($rawPath,$segmentsPath,$textPath,$srtPath,$transcriptionResultPath,$metadataPath,$visualIndexPath,$validationPath,$manifestPath)

    $requestParameters = @{
        InputPath=$sourcePath; OutputFolder=$corpusPath; WhisperModelPath=$resolvedWhisperModel
        Language=$Language; QueueSeconds=$QueueSeconds; UseGpu=$UseGpu; GpuDevice=$GpuDevice
        RequireGpu=$RequireGpu; AllowCpuFallback=$AllowCpuFallback; EnableVad=$EnableVad; VadModelPath=$VadModelPath
        VadThreshold=$VadThreshold; VadMinimumSpeechSeconds=$VadMinimumSpeechSeconds; VadMinimumSilenceSeconds=$VadMinimumSilenceSeconds
        DownloadMissingModels=$DownloadMissingModels; Overwrite=$Overwrite; DryRun=$DryRun
        TimeoutSeconds=$effectiveTimeout; AudioStream=$AudioStream
    }
    $request = New-TranscriptOrganizerRequest @requestParameters
    if ($DryRun) {
        $dryResult = Invoke-TranscriptOrganizer -Request $request -Configuration $Configuration
        return [pscustomobject][ordered]@{
            Succeeded=$dryResult.Succeeded; DryRun=$true; InputPath=$sourcePath; OutputFolder=$corpusPath
            MediaDurationSeconds=$media.DurationSeconds; TimeoutSeconds=$effectiveTimeout; ResolvedConfiguration=$resolvedPlan
            Transcription=$dryResult; Artifacts=@(); Error=$dryResult.Error
        }
    }

    if (-not (Test-Path -LiteralPath $corpusPath -PathType Container)) { $null = New-Item -ItemType Directory -Path $corpusPath -Force }
    if (-not $Overwrite) {
        $collisionPaths = if ($ReuseExistingTranscript) { @($knownArtifacts | Where-Object { $_ -notin @($rawPath,$transcriptionResultPath) }) } else { $knownArtifacts }
        foreach ($path in $collisionPaths) {
            if (Test-Path -LiteralPath $path) { throw "Generated corpus artifact already exists. Use -Overwrite or choose another output folder: $path" }
        }
        if (@(Get-ChildItem -LiteralPath $framesPath -File -ErrorAction SilentlyContinue).Count -gt 0) { throw "Generated visual frames already exist. Use -Overwrite or choose another output folder: $framesPath" }
    }

    $transcriptionResult = $null
    if ($ReuseExistingTranscript) {
        if (-not (Test-Path -LiteralPath $rawPath -PathType Leaf) -or (Get-Item -LiteralPath $rawPath).Length -eq 0) { throw "A reusable raw transcript was not found: $rawPath" }
        if (Test-Path -LiteralPath $transcriptionResultPath -PathType Leaf) { $transcriptionResult = Get-Content -LiteralPath $transcriptionResultPath -Raw | ConvertFrom-Json }
    } else {
        $transcriptionResult = Invoke-TranscriptOrganizer -Request $request -Configuration $Configuration
        $transcriptionResult | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $transcriptionResultPath -Encoding utf8
        if (-not $transcriptionResult.Succeeded) { throw "Transcription failed: $($transcriptionResult.Error.Code): $($transcriptionResult.Error.Message)" }
    }

    $segments = ConvertFrom-TranscriptOrganizerJsonLines -Lines @(Get-Content -LiteralPath $rawPath) -RecoverBackendTextQuotes
    if ($segments.Count -eq 0) { throw 'The raw transcript contains no usable timestamped segments.' }
    $segments | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $segmentsPath -Encoding utf8
    ConvertTo-TranscriptOrganizerReadableText -Segments $segments | Set-Content -LiteralPath $textPath -Encoding utf8
    ConvertTo-TranscriptOrganizerSrt -Segments $segments | Set-Content -LiteralPath $srtPath -Encoding utf8
    $media.Metadata | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $metadataPath -Encoding utf8
    $mediaDuration = [double]$media.DurationSeconds

    if (-not (Test-Path -LiteralPath $framesPath -PathType Container)) { $null = New-Item -ItemType Directory -Path $framesPath -Force }
    $existingFrames = @(Get-ChildItem -LiteralPath $framesPath -File -Filter 'frame-*.jpg' -ErrorAction SilentlyContinue)
    if ($Overwrite) { foreach ($frame in $existingFrames) { Remove-Item -LiteralPath $frame.FullName -Force } }
    $temporaryPattern = Join-Path $framesPath 'frame-sequence-%04d.jpg'
    $frameFilter = "fps=fps=1/$($FrameIntervalSeconds):start_time=0:round=near,scale=1280:-2,format=yuvj420p"
    $frameArguments = @('-hide_banner','-nostdin','-loglevel','error','-i',$sourcePath,'-vf',$frameFilter,'-frames:v',$MaximumFrames.ToString(),'-q:v','3','-y',$temporaryPattern)
    $frameResult = Invoke-TranscriptOrganizerProcess -FilePath $ffmpegPath -ArgumentList $frameArguments -WorkingDirectory $Configuration.ProjectDirectory -TimeoutSeconds ([math]::Min($effectiveTimeout,1800))
    if (-not $frameResult.Succeeded) { throw "Visual frame extraction failed: $($frameResult.StandardError)" }
    $visualEntries = [System.Collections.Generic.List[object]]::new()
    $sequence = @(Get-ChildItem -LiteralPath $framesPath -File -Filter 'frame-sequence-*.jpg' | Sort-Object Name)
    for ($index=0; $index -lt $sequence.Count; $index++) {
        $timestampMs = [long]($index * $FrameIntervalSeconds * 1000)
        $targetName = 'frame-{0:D9}ms.jpg' -f $timestampMs
        $targetPath = Join-Path $framesPath $targetName
        if (Test-Path -LiteralPath $targetPath) { Remove-Item -LiteralPath $targetPath -Force }
        Move-Item -LiteralPath $sequence[$index].FullName -Destination $targetPath
        $visualEntries.Add([pscustomobject][ordered]@{
            Index=$index+1; TimestampMilliseconds=$timestampMs; TimestampSeconds=$timestampMs/1000.0
            RelativePath=('frames/' + $targetName); SizeBytes=(Get-Item -LiteralPath $targetPath).Length
            Sha256=(Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash.ToLowerInvariant()
        })
    }
    $visualEntries.ToArray() | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $visualIndexPath -Encoding utf8

    $ordered = $true
    for ($index=1; $index -lt $segments.Count; $index++) { if ($segments[$index].StartMilliseconds -lt $segments[$index-1].StartMilliseconds) { $ordered=$false; break } }
    $timeline = Get-TranscriptOrganizerTimelineStatistics -Segments $segments
    $recoveredRecordCount = @($segments | Where-Object RecoveredFromMalformedJson).Count
    $validation = [pscustomobject][ordered]@{
        Succeeded=$segments.Count -gt 0 -and $ordered -and $visualEntries.Count -gt 0
        RawJsonLinesStrictlyValid=$recoveredRecordCount -eq 0; RecoveredRecordCount=$recoveredRecordCount
        RecoveryMode=$(if($recoveredRecordCount -gt 0){'ExactFFmpegRecordShape'}else{'NotRequired'})
        SegmentCount=$segments.Count; SegmentsOrderedByStart=$ordered
        FirstTimestampMilliseconds=$timeline.FirstTimestampMilliseconds; LastTimestampMilliseconds=$timeline.LastTimestampMilliseconds
        MediaDurationSeconds=$mediaDuration; EndpointCoverageRatio=[math]::Round(($timeline.LastTimestampMilliseconds/1000.0)/$mediaDuration,4)
        SpeechCoverageRatio=[math]::Round(($timeline.CoveredMilliseconds/1000.0)/$mediaDuration,4)
        GapCount=$timeline.GapCount; TotalGapMilliseconds=$timeline.TotalGapMilliseconds
        OverlapCount=$timeline.OverlapCount; TotalOverlapMilliseconds=$timeline.TotalOverlapMilliseconds
        LargeGapThresholdMilliseconds=$timeline.LargeGapThresholdMilliseconds; LargeGaps=$timeline.LargeGaps
        VisualFrameCount=$visualEntries.Count; MaximumVisualFrames=$MaximumFrames; FrameIntervalSeconds=$FrameIntervalSeconds
    }
    $validation | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $validationPath -Encoding utf8
    if (-not $validation.Succeeded) { throw 'Corpus validation failed. Inspect validation-report.json.' }

    $artifactPaths = @($rawPath,$segmentsPath,$textPath,$srtPath,$transcriptionResultPath,$metadataPath,$visualIndexPath,$validationPath) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf }
    $artifacts = foreach ($path in $artifactPaths) {
        $item = Get-Item -LiteralPath $path
        [pscustomobject][ordered]@{RelativePath=[IO.Path]::GetRelativePath($corpusPath,$path).Replace('\','/');SizeBytes=$item.Length;Sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()}
    }
    $manifestParameters = @{
        SourceId=(Split-Path -Leaf $corpusPath);InputPath=$sourcePath;MediaDurationSeconds=$mediaDuration;SegmentCount=$segments.Count
        Artifacts=$artifacts;FFmpegVersion=$version.FirstLine
        WhisperModelPath=$(if($transcriptionResult){[string]$transcriptionResult.WhisperModelPath}else{$resolvedWhisperModel})
        UsedGpu=$(if($transcriptionResult){[bool]$transcriptionResult.UsedGpu}else{$UseGpu})
        UsedCpuFallback=$(if($transcriptionResult){[bool]$transcriptionResult.UsedCpuFallback}else{$false})
        CreatedAtUtc=[datetimeoffset]::UtcNow
    }
    $manifest = New-TranscriptOrganizerCorpusManifestValue @manifestParameters
    $manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding utf8
    [pscustomobject][ordered]@{
        Succeeded=$true;DryRun=$false;InputPath=$sourcePath;OutputFolder=$corpusPath;ManifestPath=$manifestPath
        SegmentCount=$segments.Count;VisualFrameCount=$visualEntries.Count;MediaDurationSeconds=$mediaDuration
        TimeoutSeconds=$effectiveTimeout;TranscriptCoverageRatio=$validation.EndpointCoverageRatio
        ReusedTranscript=$ReuseExistingTranscript.IsPresent;Artifacts=@($artifacts);ResolvedConfiguration=$resolvedPlan
    }
}
