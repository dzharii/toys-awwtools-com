function New-TranscriptOrganizerError {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $Code,
        [Parameter(Mandatory)][string] $Message,
        [Parameter()][string] $Remediation,
        [Parameter()][AllowNull()] $Details,
        [Parameter()][AllowNull()] $Exception
    )
    [pscustomobject][ordered]@{
        Code = $Code
        Message = $Message
        Remediation = $Remediation
        Details = $Details
        ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { $null }
        InnerMessage = if ($Exception) { $Exception.Message } else { $null }
    }
}

function ConvertTo-TranscriptOrganizerSafeValue {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyString()][string] $Value)

    $safe = $Value
    try {
        $uri = [uri]$Value
        if ($uri.IsAbsoluteUri -and $uri.Scheme -in @('http','https')) {
            $builder = [System.UriBuilder]::new($uri)
            if (-not [string]::IsNullOrEmpty($builder.UserName) -or -not [string]::IsNullOrEmpty($builder.Password)) {
                $builder.UserName = '<redacted>'
                $builder.Password = '<redacted>'
            }
            if (-not [string]::IsNullOrEmpty($builder.Query)) {
                $builder.Query = '<redacted-query>'
            }
            $safe = $builder.Uri.AbsoluteUri
        }
    }
    catch {
        $safe = $Value
    }

    $safe = $safe -replace '(?i)(password|passwd|pwd|token|api[_-]?key|authorization)=([^;&\s]+)', '$1=<redacted>'
    $safe = $safe -replace '^(\\\\)([^\\]+)@', '$1<redacted-credential>@'
    $safe
}

function ConvertTo-TranscriptOrganizerSafeObject {
    [CmdletBinding()]
    param([Parameter()][AllowNull()] $Value)
    if ($null -eq $Value) { return $null }
    if ($Value -is [string]) { return ConvertTo-TranscriptOrganizerSafeValue -Value $Value }
    if ($Value -is [System.Collections.IDictionary]) {
        $copy = [ordered]@{}
        foreach ($key in $Value.Keys) {
            if ([string]$key -match '(?i)password|secret|token|authorization|cookie|api.?key') {
                $copy[[string]$key] = '<redacted>'
            }
            else {
                $copy[[string]$key] = ConvertTo-TranscriptOrganizerSafeObject -Value $Value[$key]
            }
        }
        return $copy
    }
    if ($Value -is [System.Collections.IEnumerable] -and $Value -isnot [string]) {
        return @($Value | ForEach-Object { ConvertTo-TranscriptOrganizerSafeObject -Value $_ })
    }
    if ($Value -is [psobject] -and $Value.GetType().Name -eq 'PSCustomObject') {
        $copy = [ordered]@{}
        foreach ($property in $Value.PSObject.Properties) {
            if ($property.Name -match '(?i)password|secret|token|authorization|cookie|api.?key') {
                $copy[$property.Name] = '<redacted>'
            }
            else {
                $copy[$property.Name] = ConvertTo-TranscriptOrganizerSafeObject -Value $property.Value
            }
        }
        return [pscustomobject]$copy
    }
    $Value
}

function New-TranscriptOrganizerTelemetryEvent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][ValidateSet('Debug','Information','Warning','Error')][string] $Level,
        [Parameter(Mandatory)][string] $EventName,
        [Parameter(Mandatory)][string] $OperationName,
        [Parameter(Mandatory)][string] $RequestId,
        [Parameter(Mandatory)][string] $OperationId,
        [Parameter()][string] $ParentOperationId,
        [Parameter(Mandatory)][ValidateSet('Started','Succeeded','Failed','Skipped','Cancelled')][string] $Outcome,
        [Parameter()][Nullable[double]] $DurationMs,
        [Parameter()][AllowNull()] $Parameters,
        [Parameter()][AllowNull()] $ResultSummary,
        [Parameter()][AllowNull()] $Error,
        [Parameter()][datetimeoffset] $TimestampUtc = [datetimeoffset]::UtcNow
    )
    [pscustomobject][ordered]@{
        SchemaVersion = 1
        TimestampUtc = $TimestampUtc.ToString('o')
        Level = $Level
        EventName = $EventName
        OperationName = $OperationName
        RequestId = $RequestId
        OperationId = $OperationId
        ParentOperationId = $ParentOperationId
        Outcome = $Outcome
        DurationMs = $DurationMs
        Parameters = ConvertTo-TranscriptOrganizerSafeObject -Value $Parameters
        ResultSummary = ConvertTo-TranscriptOrganizerSafeObject -Value $ResultSummary
        Error = ConvertTo-TranscriptOrganizerSafeObject -Value $Error
    }
}

function Get-TranscriptOrganizerModelCandidates {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $ProjectDirectory,
        [Parameter(Mandatory)][string] $ModelDirectory,
        [Parameter(Mandatory)][string[]] $FileNames,
        [Parameter()][string] $ExplicitPath
    )
    if ($ExplicitPath) {
        $candidate = if ([IO.Path]::IsPathRooted($ExplicitPath)) { $ExplicitPath } else { Join-Path $ProjectDirectory $ExplicitPath }
        return ,([IO.Path]::GetFullPath($candidate))
    }
    $seen = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $result = [System.Collections.Generic.List[string]]::new()
    foreach ($name in $FileNames) {
        foreach ($directory in @($ProjectDirectory, $ModelDirectory)) {
            $candidate = [IO.Path]::GetFullPath((Join-Path $directory $name))
            if ($seen.Add($candidate)) { $result.Add($candidate) }
        }
    }
    $result.ToArray()
}

function Get-TranscriptOrganizerAutomaticTimeoutSeconds {
    <#
    Six times the media duration plus 30 minutes is deliberately conservative for model startup,
    slower CPUs, long queues, and a possible GPU-to-CPU fallback. Known files receive at least two
    hours and no automatic request can run longer than 24 hours.
    #>
    [CmdletBinding()]
    param(
        [Parameter()][Nullable[double]] $MediaDurationSeconds,
        [Parameter()][ValidateRange(1,100)][double] $Multiplier = 6,
        [Parameter()][ValidateRange(0,86400)][int] $StartupAllowanceSeconds = 1800,
        [Parameter()][ValidateRange(1,86400)][int] $MinimumSeconds = 7200,
        [Parameter()][ValidateRange(1,86400)][int] $UnknownDurationSeconds = 21600,
        [Parameter()][ValidateRange(1,86400)][int] $MaximumSeconds = 86400
    )
    if ($MinimumSeconds -gt $MaximumSeconds) { throw 'MinimumSeconds cannot exceed MaximumSeconds.' }
    $known = $null -ne $MediaDurationSeconds -and [double]::IsFinite([double]$MediaDurationSeconds) -and [double]$MediaDurationSeconds -gt 0
    $candidate = if ($known) { [math]::Ceiling(([double]$MediaDurationSeconds * $Multiplier) + $StartupAllowanceSeconds) } else { $UnknownDurationSeconds }
    [int][math]::Min($MaximumSeconds, [math]::Max($MinimumSeconds, $candidate))
}

function ConvertTo-TranscriptOrganizerFilterValue {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyString()][string] $Value)
    $placeholder = '__TRANSCRIPT_ORGANIZER_ESCAPED_COLON__'
    $normalized = $Value.Replace('\:', $placeholder).Replace('\', '/').Replace($placeholder, '\:')
    $normalized = [regex]::Replace($normalized, '(?<!\\):', '\:')
    $normalized = [regex]::Replace($normalized, "(?<!\\)'", "\'")
    $normalized
}

function New-TranscriptOrganizerPreprocessingFilters {
    [CmdletBinding()]
    param([Parameter()][string[]] $AdditionalFilters = @())
    $filters = [System.Collections.Generic.List[string]]::new()
    foreach ($filter in $AdditionalFilters) {
        if (-not [string]::IsNullOrWhiteSpace($filter)) { $filters.Add($filter.Trim()) }
    }
    $filters.Add('aformat=sample_fmts=fltp:sample_rates=16000:channel_layouts=mono')
    $filters.ToArray()
}

function New-TranscriptOrganizerWhisperOptions {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $WhisperModelPath,
        [Parameter(Mandatory)][ValidateSet('en','auto')][string] $Language,
        [Parameter(Mandatory)][double] $QueueSeconds,
        [Parameter(Mandatory)][bool] $UseGpu,
        [Parameter(Mandatory)][int] $GpuDevice,
        [Parameter(Mandatory)][string] $DestinationPath,
        [Parameter()][int] $MaxLength = 0,
        [Parameter()][string] $VadModelPath,
        [Parameter()][double] $VadThreshold = 0.5,
        [Parameter()][double] $VadMinimumSpeechSeconds = 0.2,
        [Parameter()][double] $VadMinimumSilenceSeconds = 0.6
    )
    $culture = [Globalization.CultureInfo]::InvariantCulture
    $escapedModelPath = ConvertTo-TranscriptOrganizerFilterValue -Value $WhisperModelPath
    $escapedDestinationPath = ConvertTo-TranscriptOrganizerFilterValue -Value $DestinationPath
    $options = [ordered]@{
        model = "'$escapedModelPath'"
        language = $Language
        queue = $QueueSeconds.ToString($culture)
        use_gpu = $UseGpu.ToString().ToLowerInvariant()
        gpu_device = $GpuDevice.ToString($culture)
        destination = "'$escapedDestinationPath'"
        format = 'json'
    }
    if ($MaxLength -gt 0) { $options.max_len = $MaxLength.ToString($culture) }
    if ($VadModelPath) {
        $escapedVadModelPath = ConvertTo-TranscriptOrganizerFilterValue -Value $VadModelPath
        $options.vad_model = "'$escapedVadModelPath'"
        $options.vad_threshold = $VadThreshold.ToString($culture)
        $options.vad_min_speech_duration = $VadMinimumSpeechSeconds.ToString($culture)
        $options.vad_min_silence_duration = $VadMinimumSilenceSeconds.ToString($culture)
    }
    $options
}

function New-TranscriptOrganizerFilterExpression {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][System.Collections.IDictionary] $WhisperOptions,
        [Parameter()][string[]] $PreprocessingFilters = @()
    )
    $optionText = @($WhisperOptions.GetEnumerator() | ForEach-Object { '{0}={1}' -f $_.Key, $_.Value }) -join ':'
    @($PreprocessingFilters | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) + "whisper=$optionText" -join ','
}

function New-TranscriptOrganizerFFmpegArguments {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string[]] $InputArguments,
        [Parameter(Mandatory)][string] $FilterExpression,
        [Parameter()][string] $AudioStream = '0:a:0',
        [Parameter()][ValidateSet('quiet','panic','fatal','error','warning','info','verbose','debug','trace')][string] $LogLevel = 'warning'
    )
    $arguments = [System.Collections.Generic.List[string]]::new()
    foreach ($value in @('-hide_banner','-nostdin','-loglevel',$LogLevel)) { $arguments.Add($value) }
    foreach ($value in $InputArguments) { $arguments.Add($value) }
    foreach ($value in @('-map',$AudioStream,'-vn','-af',$FilterExpression,'-f','null','NUL')) { $arguments.Add($value) }
    $arguments.ToArray()
}

function Format-TranscriptOrganizerDiagnosticCommand {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string] $FilePath, [Parameter(Mandatory)][AllowEmptyString()][string[]] $ArgumentList)
    $format = {
        param([string]$value)
        $safe = ConvertTo-TranscriptOrganizerSafeValue -Value $value
        if ($safe.Length -eq 0) { return '""' }
        if ($safe -match '[\s"]') { return '"' + $safe.Replace('"','\"') + '"' }
        $safe
    }
    (@(& $format $FilePath) + @($ArgumentList | ForEach-Object { & $format $_ })) -join ' '
}

function Test-TranscriptOrganizerGpuFailure {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyString()][string] $StandardError)
    if ($StandardError -match '(?i)(invalid model|failed to load model|no such file|permission denied|option not found|no such filter|output.*exists)') { return $false }
    $StandardError -match '(?i)(cuda[^\r\n]*(failed|error|out of memory|initializ)|failed to (initialize|load)[^\r\n]*(gpu|device|backend)|gpu[^\r\n]*(out of memory|initializ|unavailable)|ggml_cuda|cublas)'
}

function Get-TranscriptOrganizerGpuPolicyDecision {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][bool] $UseGpu,
        [Parameter(Mandatory)][bool] $RequireGpu,
        [Parameter(Mandatory)][bool] $AllowCpuFallback,
        [Parameter(Mandatory)][bool] $FilterHasGpuOption,
        [Parameter(Mandatory)][bool] $GpuDetected
    )
    $errors = [System.Collections.Generic.List[string]]::new()
    if ($RequireGpu -and -not $UseGpu) { $errors.Add('RequireGpu cannot be used when UseGpu is false.') }
    if ($RequireGpu -and $AllowCpuFallback) { $errors.Add('RequireGpu and AllowCpuFallback cannot both be enabled.') }
    if ($UseGpu -and -not $FilterHasGpuOption -and ($RequireGpu -or -not $AllowCpuFallback)) { $errors.Add('The installed Whisper filter does not expose use_gpu.') }
    [pscustomobject][ordered]@{
        Succeeded = $errors.Count -eq 0
        Errors = $errors.ToArray()
        AttemptGpu = $UseGpu -and $FilterHasGpuOption -and ($GpuDetected -or -not $RequireGpu)
        StartOnCpu = -not $UseGpu -or ($UseGpu -and -not $FilterHasGpuOption -and $AllowCpuFallback)
        MayFallback = $UseGpu -and $AllowCpuFallback
    }
}

function ConvertFrom-TranscriptOrganizerWhisperHelp {
    [CmdletBinding()]
    param([Parameter(Mandatory)][int] $ExitCode, [Parameter()][AllowEmptyString()][string] $Output = '')
    $has = { param($name) $Output -match "(?im)^\s*$([regex]::Escape($name))\s+" }
    $hasFilter = $ExitCode -eq 0 -and $Output -match '(?im)^\s*Filter\s+whisper\b'
    [pscustomobject][ordered]@{
        Succeeded = $hasFilter -and (& $has 'model') -and (& $has 'language') -and (& $has 'queue') -and (& $has 'destination') -and (& $has 'format')
        HasFilter = [bool]$hasFilter
        HasModelOption = [bool](& $has 'model')
        HasLanguageOption = [bool](& $has 'language')
        HasQueueOption = [bool](& $has 'queue')
        HasDestinationOption = [bool](& $has 'destination')
        HasFormatOption = [bool](& $has 'format')
        HasGpuOption = [bool](& $has 'use_gpu')
        HasGpuDeviceOption = [bool](& $has 'gpu_device')
        HasVadOption = [bool](& $has 'vad_model')
        HasMaxLengthOption = [bool](& $has 'max_len')
        ExitCode = $ExitCode
        Output = $Output
    }
}

function Test-TranscriptOrganizerRequestValue {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Request)
    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($name in @('InputPath','OutputFolder','Language','QueueSeconds','UseGpu','GpuDevice','EnableVad','AllowCpuFallback','RequireGpu','Overwrite','TimeoutSeconds')) {
        if ($null -eq $Request.PSObject.Properties[$name]) { $errors.Add("Missing request property '$name'.") }
    }
    if ($errors.Count -eq 0) {
        if ([string]::IsNullOrWhiteSpace([string]$Request.InputPath)) { $errors.Add('InputPath is required.') }
        if ([string]::IsNullOrWhiteSpace([string]$Request.OutputFolder)) { $errors.Add('OutputFolder is required.') }
        if ($Request.Language -notin @('en','auto')) { $errors.Add('Language is unsupported.') }
        if ([double]$Request.QueueSeconds -lt 0.1 -or [double]$Request.QueueSeconds -gt 3600) { $errors.Add('QueueSeconds must be between 0.1 and 3600.') }
        if ([int]$Request.GpuDevice -lt 0) { $errors.Add('GpuDevice cannot be negative.') }
        if ($Request.RequireGpu -and -not $Request.UseGpu) { $errors.Add('RequireGpu cannot be used when UseGpu is false.') }
        if ($Request.RequireGpu -and $Request.AllowCpuFallback) { $errors.Add('RequireGpu and AllowCpuFallback cannot both be enabled.') }
        if (-not $Request.EnableVad -and $Request.VadModelPath) { $errors.Add('VadModelPath requires EnableVad.') }
        if ($Request.VadThreshold -lt 0 -or $Request.VadThreshold -gt 1) { $errors.Add('VadThreshold must be between zero and one.') }
        if ([int]$Request.TimeoutSeconds -lt 1 -or [int]$Request.TimeoutSeconds -gt 86400) { $errors.Add('TimeoutSeconds must be between 1 and 86400.') }
    }
    [pscustomobject][ordered]@{ Succeeded = $errors.Count -eq 0; Errors = $errors.ToArray(); Contract = 'Request' }
}

function ConvertFrom-TranscriptOrganizerJsonLines {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][AllowEmptyCollection()][string[]] $Lines,
        [Parameter()][switch] $RecoverBackendTextQuotes
    )
    $segments = [System.Collections.Generic.List[object]]::new()
    $lineNumber = 0
    foreach ($line in $Lines) {
        $lineNumber++
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $recovered = $false
        try { $record = $line | ConvertFrom-Json -ErrorAction Stop }
        catch {
            $strictError = $_.Exception.Message
            if ($RecoverBackendTextQuotes -and $line -match '^\{"start":(?<start>\d+),"end":(?<end>\d+),"text":"(?<text>.*)"\}$') {
                $record = [pscustomobject]@{start=[long]$Matches.start;end=[long]$Matches.end;text=$Matches.text}
                $recovered = $true
            }
            else { throw "Transcript JSONL line $lineNumber is invalid JSON: $strictError" }
        }
        foreach ($name in @('start','end','text')) {
            if ($null -eq $record.PSObject.Properties[$name]) { throw "Transcript JSONL line $lineNumber is missing '$name'." }
        }
        $start = [long]$record.start
        $end = [long]$record.end
        if ($start -lt 0 -or $end -lt $start) { throw "Transcript JSONL line $lineNumber has an invalid time range." }
        $text = ([string]$record.text).Trim()
        if ([string]::IsNullOrWhiteSpace($text)) { continue }
        $segments.Add([pscustomobject][ordered]@{
            Index = $segments.Count + 1
            StartMilliseconds = $start
            EndMilliseconds = $end
            StartSeconds = [math]::Round($start / 1000.0, 3)
            EndSeconds = [math]::Round($end / 1000.0, 3)
            DurationMilliseconds = $end - $start
            Text = $text
            SourceLineNumber = $lineNumber
            RecoveredFromMalformedJson = $recovered
        })
    }
    $segments.ToArray()
}

function ConvertTo-TranscriptOrganizerSrtTimestamp {
    [CmdletBinding()]
    param([Parameter(Mandatory)][ValidateRange(0,[long]::MaxValue)][long] $Milliseconds)
    $span = [timespan]::FromMilliseconds($Milliseconds)
    '{0:D2}:{1:D2}:{2:D2},{3:D3}' -f [long][math]::Floor($span.TotalHours),$span.Minutes,$span.Seconds,$span.Milliseconds
}

function ConvertTo-TranscriptOrganizerSrt {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyCollection()][object[]] $Segments)
    $blocks = foreach ($segment in $Segments) {
        $start = ConvertTo-TranscriptOrganizerSrtTimestamp -Milliseconds $segment.StartMilliseconds
        $end = ConvertTo-TranscriptOrganizerSrtTimestamp -Milliseconds $segment.EndMilliseconds
        '{0}{1}{2} --> {3}{1}{4}' -f $segment.Index,[Environment]::NewLine,$start,$end,$segment.Text
    }
    $blocks -join ([Environment]::NewLine + [Environment]::NewLine)
}

function ConvertTo-TranscriptOrganizerReadableText {
    [CmdletBinding()]
    param([Parameter(Mandatory)][AllowEmptyCollection()][object[]] $Segments)
    @($Segments | ForEach-Object {
        $timestamp = ConvertTo-TranscriptOrganizerSrtTimestamp -Milliseconds $_.StartMilliseconds
        '[{0}] {1}' -f $timestamp.Replace(',', '.'),$_.Text
    }) -join [Environment]::NewLine
}

function Get-TranscriptOrganizerTimelineStatistics {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][ValidateNotNullOrEmpty()][object[]] $Segments,
        [Parameter()][ValidateRange(1,[long]::MaxValue)][long] $LargeGapThresholdMilliseconds = 5000
    )
    $gapCount = 0
    $overlapCount = 0
    $totalGap = [long]0
    $totalOverlap = [long]0
    $covered = [long]0
    $largeGaps = [System.Collections.Generic.List[object]]::new()
    $rangeStart = [long]$Segments[0].StartMilliseconds
    $rangeEnd = [long]$Segments[0].EndMilliseconds
    for ($index=1; $index -lt $Segments.Count; $index++) {
        $start = [long]$Segments[$index].StartMilliseconds
        $end = [long]$Segments[$index].EndMilliseconds
        if ($start -gt $rangeEnd) {
            $gap = $start - $rangeEnd
            $gapCount++
            $totalGap += $gap
            if ($gap -ge $LargeGapThresholdMilliseconds) {
                $largeGaps.Add([pscustomobject][ordered]@{AfterSegment=$index;StartMilliseconds=$rangeEnd;EndMilliseconds=$start;DurationMilliseconds=$gap})
            }
            $covered += $rangeEnd - $rangeStart
            $rangeStart = $start
            $rangeEnd = $end
        }
        else {
            if ($start -lt $rangeEnd) {
                $overlapCount++
                $totalOverlap += [math]::Min($rangeEnd - $start,$end - $start)
            }
            if ($end -gt $rangeEnd) { $rangeEnd = $end }
        }
    }
    $covered += $rangeEnd - $rangeStart
    [pscustomobject][ordered]@{
        FirstTimestampMilliseconds = [long]$Segments[0].StartMilliseconds
        LastTimestampMilliseconds = [long]$Segments[-1].EndMilliseconds
        CoveredMilliseconds = $covered
        GapCount = $gapCount
        TotalGapMilliseconds = $totalGap
        OverlapCount = $overlapCount
        TotalOverlapMilliseconds = $totalOverlap
        LargeGapThresholdMilliseconds = $LargeGapThresholdMilliseconds
        LargeGaps = $largeGaps.ToArray()
    }
}

function New-TranscriptOrganizerCorpusManifestValue {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $SourceId,
        [Parameter(Mandatory)][string] $InputPath,
        [Parameter(Mandatory)][double] $MediaDurationSeconds,
        [Parameter(Mandatory)][int] $SegmentCount,
        [Parameter(Mandatory)][object[]] $Artifacts,
        [Parameter(Mandatory)][string] $FFmpegVersion,
        [Parameter(Mandatory)][string] $WhisperModelPath,
        [Parameter(Mandatory)][bool] $UsedGpu,
        [Parameter(Mandatory)][bool] $UsedCpuFallback,
        [Parameter(Mandatory)][datetimeoffset] $CreatedAtUtc
    )
    [pscustomobject][ordered]@{
        SchemaVersion = 1
        SourceId = $SourceId
        InputPath = $InputPath
        MediaDurationSeconds = $MediaDurationSeconds
        SegmentCount = $SegmentCount
        Backend = [pscustomobject][ordered]@{
            FFmpegVersion = $FFmpegVersion
            WhisperModelPath = $WhisperModelPath
            UsedGpu = $UsedGpu
            UsedCpuFallback = $UsedCpuFallback
        }
        Artifacts = @($Artifacts)
        CreatedAtUtc = $CreatedAtUtc.ToString('o')
    }
}
