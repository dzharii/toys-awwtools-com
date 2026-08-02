function Invoke-TranscriptOrganizer {
    <#
    .SYNOPSIS
    Executes one validated transcription request.
    .DESCRIPTION
    Resolves prerequisites and models, builds a native FFmpeg argument array, runs at most one GPU attempt and one classified CPU fallback, verifies the output, and returns a structured result.
    .PARAMETER Request
    A request created by New-TranscriptOrganizerRequest.
    .PARAMETER Configuration
    Project configuration created by New-TranscriptOrganizerConfiguration.
    .EXAMPLE
    $request = New-TranscriptOrganizerRequest -InputPath '.\input.webm' -OutputFolder '.\input-transcript'
    Invoke-TranscriptOrganizer -Request $request -Configuration (New-TranscriptOrganizerConfiguration)
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)] $Request,
        [Parameter()] $Configuration = (New-TranscriptOrganizerConfiguration),
        [Parameter()][System.Threading.CancellationToken] $CancellationToken = [System.Threading.CancellationToken]::None
    )
    process {
        $requestId = [guid]::NewGuid().ToString('D')
        $requestOperation = [guid]::NewGuid().ToString('D')
        $started = [datetimeoffset]::UtcNow
        $logPath = Join-Path $Configuration.LogDirectory ("transcript-organizer-{0}.jsonl" -f ([datetime]::UtcNow.ToString('yyyyMMdd')))
        $logFailures = [System.Collections.Generic.List[object]]::new()
        $attempts = [System.Collections.Generic.List[object]]::new()
        $stage = 'RequestValidation'
        $inputPath = [string]$Request.InputPath
        $rawTranscriptPath = $null
        $modelPath = $null
        $vadModelPath = $null
        $ffmpegPath = $null
        $ffmpegVersion = $null
        $requestedGpu = [bool]$Request.UseGpu
        $usedGpu = $false
        $usedFallback = $false
        $lastExitCode = $null

        $emit = {
            param($Level,$EventName,$OperationName,$OperationId,$Outcome,$DurationMs,$Parameters,$Summary,$ErrorValue)
            $eventParameters = @{
                Level=$Level; EventName=$EventName; OperationName=$OperationName; RequestId=$requestId
                OperationId=$OperationId; ParentOperationId=$requestOperation; Outcome=$Outcome
                Parameters=$Parameters; ResultSummary=$Summary; Error=$ErrorValue
            }
            if ($null -ne $DurationMs) { $eventParameters.DurationMs = [double]$DurationMs }
            $event = New-TranscriptOrganizerTelemetryEvent @eventParameters
            if ($Request.DryRun) { return }
            $failure = Write-TranscriptOrganizerSafeLog -Event $event -LogPath $logPath -OriginalError $ErrorValue
            if ($failure) { $logFailures.Add($failure) }
        }

        $executeOperation = {
            param([string]$Name,[hashtable]$Parameters,[scriptblock]$Action)
            $operationId = [guid]::NewGuid().ToString('D')
            $operationStarted = [datetimeoffset]::UtcNow
            & $emit 'Information' "$Name.Start" $Name $operationId 'Started' $null $Parameters $null $null
            try {
                $value = & $Action
                $duration = ([datetimeoffset]::UtcNow - $operationStarted).TotalMilliseconds
                & $emit 'Information' "$Name.Complete" $Name $operationId 'Succeeded' $duration $null @{Succeeded=$true} $null
                $value
            }
            catch {
                $duration = ([datetimeoffset]::UtcNow - $operationStarted).TotalMilliseconds
                $operationError = New-TranscriptOrganizerError -Code 'OperationFailed' -Message $_.Exception.Message -Details @{Operation=$Name} -Exception $_.Exception
                & $emit 'Error' "$Name.Complete" $Name $operationId 'Failed' $duration $null @{Succeeded=$false} $operationError
                throw
            }
        }

        & $emit 'Information' 'Request.Start' 'Request' $requestOperation 'Started' $null @{
            InputPath=$Request.InputPath; OutputFolder=$Request.OutputFolder
            QueueSeconds=$Request.QueueSeconds; UseGpu=$Request.UseGpu; GpuDevice=$Request.GpuDevice
            AllowCpuFallback=$Request.AllowCpuFallback; EnableVad=$Request.EnableVad; DryRun=$Request.DryRun
        } $null $null

        try {
            $requestValidation = Test-TranscriptOrganizerRequestValue -Request $Request
            if (-not $requestValidation.Succeeded) { throw [ArgumentException]::new($requestValidation.Errors -join '; ') }

            $stage = 'RuntimeValidation'
            $runtime = & $executeOperation 'Runtime.Validate' @{} { Test-TranscriptOrganizerRuntime }
            if (-not (Test-TranscriptOrganizerRuntimeResult $runtime).Succeeded) { throw 'Runtime validation returned an invalid payload.' }
            if (-not $runtime.Succeeded) { throw ($runtime.Errors -join [Environment]::NewLine) }

            $stage = 'ExecutableDiscovery'
            $executables = & $executeOperation 'Executable.Resolve' @{FFmpeg=$Configuration.Executables.FFmpeg;FFprobe=$Configuration.Executables.FFprobe} {
                Resolve-TranscriptOrganizerBackend -Configuration $Configuration
            }
            $ffmpegPath = $executables.FFmpegPath
            $ffprobePath = $executables.FFprobePath
            if (-not $executables.Succeeded) { throw "A paired Whisper-enabled FFmpeg and FFprobe installation was not found: $($executables.Reason)" }

            $stage = 'FFmpegVersion'
            $versionResult = & $executeOperation 'FFmpeg.VersionQuery' @{Executable=$ffmpegPath} { Get-TranscriptOrganizerFFmpegVersionInternal -FFmpegPath $ffmpegPath -WorkingDirectory $Configuration.ProjectDirectory }
            if (-not $versionResult.Succeeded) { throw 'FFmpeg version validation failed.' }
            $ffmpegVersion = $versionResult.FirstLine

            $stage = 'FFmpegCapability'
            $capability = & $executeOperation 'FFmpeg.CapabilityQuery' @{Executable=$ffmpegPath;Filter='whisper'} { Get-TranscriptOrganizerCapabilityInternal -FFmpegPath $ffmpegPath -WorkingDirectory $Configuration.ProjectDirectory }
            $capabilityValidation = Test-TranscriptOrganizerCapabilityResult $capability
            if (-not $capabilityValidation.Succeeded) { throw "FFmpeg capability payload was invalid: $($capabilityValidation.Errors -join '; ')" }
            if (-not $capability.Succeeded) { throw 'The installed FFmpeg build does not provide the Whisper filter and required core options.' }
            if ($Request.EnableVad -and -not $capability.HasVadOption) { throw 'VAD was requested, but the installed Whisper filter does not expose vad_model.' }
            if ($Request.MaxLength -gt 0 -and -not $capability.HasMaxLengthOption) { throw 'MaxLength was requested, but the installed Whisper filter does not expose max_len.' }

            $stage = 'InputResolution'
            $resolvedInput = & $executeOperation 'Input.Resolve' @{Source=$Request.InputPath} { Resolve-TranscriptOrganizerInput -Request $Request -Configuration $Configuration }
            $inputPath = $resolvedInput.DisplayPath
            $stage = 'AudioProbe'
            $media = & $executeOperation 'Input.Probe' @{InputPath=$inputPath;Stream=$Request.AudioStream} { Get-TranscriptOrganizerMediaMetadataInternal -FFprobePath $ffprobePath -InputPath $inputPath -WorkingDirectory $Configuration.ProjectDirectory -TimeoutSeconds ([math]::Min(60,$Request.TimeoutSeconds)) }
            if (-not $media.Succeeded) { throw "The input does not contain a readable audio stream: $inputPath" }

            $stage = 'ModelResolution'
            $modelPath = & $executeOperation 'Model.Resolve' @{ExplicitPath=$Request.WhisperModelPath;DownloadAllowed=$Request.DownloadMissingModels} {
                try { Resolve-TranscriptOrganizerModel -Configuration $Configuration -Model $Configuration.RequiredModel -ExplicitPath $Request.WhisperModelPath }
                catch {
                    if (-not $Request.DownloadMissingModels -or $Request.WhisperModelPath) { throw }
                    Install-TranscriptOrganizerModel -Model $Configuration.RequiredModel -DestinationDirectory $Configuration.ModelDirectory
                }
            }
            $stage = 'ModelValidation'
            $modelValidation = & $executeOperation 'Model.Validate' @{ModelPath=$modelPath;MinimumLength=$Configuration.RequiredModel.MinimumLength} { Test-TranscriptOrganizerModelFile -Path $modelPath -MinimumLength $Configuration.RequiredModel.MinimumLength -ExpectedSha256 $Configuration.RequiredModel.Sha256 }
            if (-not (Test-TranscriptOrganizerModelResult $modelValidation).Succeeded) { throw 'Required model validation returned an invalid payload.' }
            if (-not $modelValidation.Succeeded) { throw "The transcription model failed validation: $($modelValidation.Reason)" }

            if ($Request.EnableVad) {
                $stage = 'VadModelResolution'
                $vadModelPath = & $executeOperation 'VadModel.Resolve' @{ExplicitPath=$Request.VadModelPath;DownloadAllowed=$Request.DownloadMissingModels} {
                    try { Resolve-TranscriptOrganizerModel -Configuration $Configuration -Model $Configuration.OptionalModels.Vad -ExplicitPath $Request.VadModelPath -Vad }
                    catch {
                        if (-not $Request.DownloadMissingModels -or $Request.VadModelPath) { throw }
                        Install-TranscriptOrganizerModel -Model $Configuration.OptionalModels.Vad -DestinationDirectory $Configuration.ModelDirectory
                    }
                }
                $stage = 'VadModelValidation'
                $vadValidation = & $executeOperation 'VadModel.Validate' @{VadModelPath=$vadModelPath;MinimumLength=$Configuration.OptionalModels.Vad.MinimumLength} { Test-TranscriptOrganizerModelFile -Path $vadModelPath -MinimumLength $Configuration.OptionalModels.Vad.MinimumLength -ExpectedSha256 $Configuration.OptionalModels.Vad.Sha256 }
                if (-not $vadValidation.Succeeded) { throw "The VAD model failed validation: $($vadValidation.Reason)" }
            }

            $stage = 'OutputResolution'
            $rawTranscriptPath = & $executeOperation 'Output.Resolve' @{OutputFolder=$Request.OutputFolder;Overwrite=$Request.Overwrite} { Resolve-TranscriptOrganizerRawTranscriptOutput -Request $Request -Configuration $Configuration -ResolvedInputPath $inputPath }

            $stage = 'GpuPolicy'
            $gpu = & $executeOperation 'Gpu.Detect' @{Requested=$Request.UseGpu;Device=$Request.GpuDevice} {
                if ($Request.UseGpu) { Get-TranscriptOrganizerNvidiaGpuInternal -Configuration $Configuration } else { [pscustomobject]@{Available=$false;DiagnosticAvailable=$false;Reason='CpuOnly';Devices=@()} }
            }
            $gpuPolicy = Get-TranscriptOrganizerGpuPolicyDecision -UseGpu $Request.UseGpu -RequireGpu $Request.RequireGpu -AllowCpuFallback $Request.AllowCpuFallback -FilterHasGpuOption $capability.HasGpuOption -GpuDetected $gpu.Available
            if (-not $gpuPolicy.Succeeded) { throw ($gpuPolicy.Errors -join '; ') }

            $preprocessing = New-TranscriptOrganizerPreprocessingFilters -AdditionalFilters $Request.PreprocessingFilters
            $buildAttempt = {
                param([bool]$attemptGpu)
                $optionParameters = @{
                    WhisperModelPath=$modelPath; Language=$Request.Language; QueueSeconds=$Request.QueueSeconds
                    UseGpu=$attemptGpu; GpuDevice=$Request.GpuDevice; DestinationPath=$rawTranscriptPath
                    MaxLength=$Request.MaxLength
                }
                if ($Request.EnableVad) {
                    $optionParameters.VadModelPath=$vadModelPath
                    $optionParameters.VadThreshold=$Request.VadThreshold
                    $optionParameters.VadMinimumSpeechSeconds=$Request.VadMinimumSpeechSeconds
                    $optionParameters.VadMinimumSilenceSeconds=$Request.VadMinimumSilenceSeconds
                }
                $options = New-TranscriptOrganizerWhisperOptions @optionParameters
                $filter = New-TranscriptOrganizerFilterExpression -WhisperOptions $options -PreprocessingFilters $preprocessing
                $arguments = New-TranscriptOrganizerFFmpegArguments -InputArguments $resolvedInput.Arguments -FilterExpression $filter -AudioStream $Request.AudioStream
                [pscustomobject]@{ UseGpu=$attemptGpu; Options=$options; FilterExpression=$filter; Arguments=$arguments; DiagnosticCommand=(Format-TranscriptOrganizerDiagnosticCommand -FilePath $ffmpegPath -ArgumentList $arguments) }
            }

            $firstUseGpu = -not $gpuPolicy.StartOnCpu -and $gpuPolicy.AttemptGpu
            $attemptPlan = & $buildAttempt $firstUseGpu
            if ($Request.DryRun) {
                $completed = [datetimeoffset]::UtcNow
                $dryResult = [pscustomobject][ordered]@{
                    Succeeded=$true; DryRun=$true; RequestId=$requestId; InputPath=$inputPath; OutputFolder=(Split-Path -Parent $rawTranscriptPath); RawTranscriptPath=$rawTranscriptPath
                    WhisperModelPath=$modelPath; VadEnabled=[bool]$Request.EnableVad; VadModelPath=$vadModelPath
                    RequestedGpu=$requestedGpu; UsedGpu=$false; UsedCpuFallback=$false; FFmpegPath=$ffmpegPath
                    FFmpegVersion=$ffmpegVersion; FFmpegExitCode=$null; DurationMs=[math]::Round(($completed-$started).TotalMilliseconds,3)
                    Attempts=@(); Arguments=$attemptPlan.Arguments; FilterExpression=$attemptPlan.FilterExpression
                    DiagnosticCommand=$attemptPlan.DiagnosticCommand; LogPath=$logPath; LoggingFailures=$logFailures.ToArray(); Error=$null
                }
                & $emit 'Information' 'Request.Complete' 'Request' $requestOperation 'Succeeded' $dryResult.DurationMs $null @{DryRun=$true;OutputFolder=(Split-Path -Parent $rawTranscriptPath);RawTranscriptPath=$rawTranscriptPath} $null
                return $dryResult
            }

            $stage = 'FFmpegExecution'
            $runAttempt = {
                param($plan,[int]$number)
                $operationId = [guid]::NewGuid().ToString('D')
                & $emit 'Information' 'Process.Start' 'FFmpeg.Execute' $operationId 'Started' $null @{
                    Attempt=$number; Executable=$ffmpegPath; Arguments=$plan.Arguments; DiagnosticCommand=$plan.DiagnosticCommand
                    WorkingDirectory=$Configuration.ProjectDirectory; InputPath=$inputPath; OutputFolder=(Split-Path -Parent $rawTranscriptPath); RawTranscriptPath=$rawTranscriptPath
                    WhisperModelPath=$modelPath; VadModelPath=$vadModelPath; UseGpu=$plan.UseGpu; QueueSeconds=$Request.QueueSeconds
                } $null $null
                $process = Invoke-TranscriptOrganizerProcess -FilePath $ffmpegPath -ArgumentList $plan.Arguments -WorkingDirectory $Configuration.ProjectDirectory -TimeoutSeconds $Request.TimeoutSeconds -CancellationToken $CancellationToken
                $contract = Test-TranscriptOrganizerProcessResult $process
                if (-not $contract.Succeeded) { throw "Process wrapper returned an invalid payload: $($contract.Errors -join '; ')" }
                $summary = [pscustomobject]@{ Attempt=$number; UseGpu=$plan.UseGpu; Succeeded=$process.Succeeded; ExitCode=$process.ExitCode; DurationMs=$process.DurationMs; TimedOut=$process.TimedOut; Cancelled=$process.Cancelled }
                $attempts.Add($summary)
                $outcome = if ($process.Cancelled) {'Cancelled'} elseif ($process.Succeeded) {'Succeeded'} else {'Failed'}
                $level = if ($process.Succeeded) {'Information'} else {'Error'}
                $errorSummary = if ($process.Succeeded) { $null } else { New-TranscriptOrganizerError -Code 'FFmpegExecutionFailed' -Message (($process.StandardError -split '\r?\n' | Select-Object -Last 8) -join [Environment]::NewLine) }
                & $emit $level 'Process.Complete' 'FFmpeg.Execute' $operationId $outcome $process.DurationMs $null $summary $errorSummary
                $process
            }

            $processResult = & $runAttempt $attemptPlan 1
            $usedGpu = $attemptPlan.UseGpu
            if (-not $processResult.Succeeded -and $attemptPlan.UseGpu -and $gpuPolicy.MayFallback -and (Test-TranscriptOrganizerGpuFailure -StandardError $processResult.StandardError)) {
                $usedFallback = $true
                $attemptPlan = & $buildAttempt $false
                $processResult = & $runAttempt $attemptPlan 2
                $usedGpu = $false
            }
            $lastExitCode = $processResult.ExitCode
            if ($processResult.Cancelled) { $stage='Cancelled'; throw 'Transcription was cancelled.' }
            if ($processResult.TimedOut) { $stage='TimedOut'; throw "FFmpeg exceeded the $($Request.TimeoutSeconds)-second timeout." }
            if (-not $processResult.Succeeded) { throw "FFmpeg transcription failed with exit code $($processResult.ExitCode): $($processResult.StandardError)" }

            $stage = 'OutputVerification'
            if (-not (Test-Path -LiteralPath $rawTranscriptPath -PathType Leaf)) { throw "FFmpeg returned exit code zero, but the expected output was not created: $rawTranscriptPath" }
            $outputItem = Get-Item -LiteralPath $rawTranscriptPath
            if ($outputItem.Length -eq 0) { throw "FFmpeg created an empty output artifact: $rawTranscriptPath" }

            $completed = [datetimeoffset]::UtcNow
            $result = [pscustomobject][ordered]@{
                Succeeded=$true; DryRun=$false; RequestId=$requestId; InputPath=$inputPath; OutputFolder=(Split-Path -Parent $rawTranscriptPath); RawTranscriptPath=$rawTranscriptPath
                WhisperModelPath=$modelPath; VadEnabled=[bool]$Request.EnableVad; VadModelPath=$vadModelPath
                RequestedGpu=$requestedGpu; UsedGpu=$usedGpu; UsedCpuFallback=$usedFallback; FFmpegPath=$ffmpegPath
                FFmpegVersion=$ffmpegVersion; FFmpegExitCode=$lastExitCode; DurationMs=[math]::Round(($completed-$started).TotalMilliseconds,3)
                Attempts=$attempts.ToArray(); OutputSizeBytes=[long]$outputItem.Length; Arguments=$attemptPlan.Arguments
                FilterExpression=$attemptPlan.FilterExpression; DiagnosticCommand=$attemptPlan.DiagnosticCommand
                LogPath=$logPath; LoggingFailures=$logFailures.ToArray(); Error=$null
            }
            $resultContract = Test-TranscriptOrganizerTranscriptionResult $result
            if (-not $resultContract.Succeeded) { throw "Transcription result contract failed: $($resultContract.Errors -join '; ')" }
            & $emit 'Information' 'Request.Complete' 'Request' $requestOperation 'Succeeded' $result.DurationMs $null @{OutputFolder=(Split-Path -Parent $rawTranscriptPath);RawTranscriptPath=$rawTranscriptPath;OutputSizeBytes=$outputItem.Length;UsedGpu=$usedGpu;UsedCpuFallback=$usedFallback} $null
            $result
        }
        catch {
            $exception = $_.Exception
            $code = switch ($stage) {
                'RequestValidation' {'InvalidRequest'} 'RuntimeValidation' {'UnsupportedRuntime'}
                'ExecutableDiscovery' { if ($exception.Message -match 'FFprobe') {'FFprobeNotFound'} else {'FFmpegNotFound'} }
                'FFmpegVersion' {'FFmpegExecutionFailed'} 'FFmpegCapability' {'TranscriptionFilterUnavailable'}
                'InputResolution' {'InputNotFound'} 'AudioProbe' {'AudioStreamNotFound'}
                'ModelResolution' {'RequiredModelNotFound'} 'ModelValidation' {'RequiredModelInvalid'}
                'VadModelResolution' {'VadModelNotFound'} 'VadModelValidation' {'VadModelInvalid'}
                'OutputResolution' { if ($exception.Message -match 'already exists') {'OutputExists'} else {'OutputDirectoryUnavailable'} }
                'GpuPolicy' {'GpuUnavailable'} 'Cancelled' {'RequestCancelled'} 'TimedOut' {'ProcessTimedOut'}
                'OutputVerification' {'OutputNotCreated'} default {'FFmpegExecutionFailed'}
            }
            $remediation = switch ($code) {
                'FFmpegNotFound' {'Install a Whisper-enabled FFmpeg build and add ffmpeg.exe to PATH.'}
                'FFprobeNotFound' {'Install FFprobe with FFmpeg and add ffprobe.exe to PATH.'}
                'TranscriptionFilterUnavailable' {'Use an FFmpeg build compiled with --enable-whisper; verify with ffmpeg -hide_banner -help filter=whisper.'}
                'RequiredModelNotFound' {'Place ggml-model-whisper-medium.en-q5_0.bin in the project root or models directory, or provide -WhisperModelPath.'}
                'VadModelNotFound' {'Provide a compatible Silero VAD model or disable VAD.'}
                'OutputExists' {'Choose another output path or enable -Overwrite.'}
                default {$null}
            }
            $errorObject = New-TranscriptOrganizerError -Code $code -Message $exception.Message -Remediation $remediation -Details @{Stage=$stage} -Exception $exception
            $completed = [datetimeoffset]::UtcNow
            $failureResult = [pscustomobject][ordered]@{
                Succeeded=$false; DryRun=[bool]$Request.DryRun; RequestId=$requestId; InputPath=$inputPath; OutputFolder=$(if($rawTranscriptPath){Split-Path -Parent $rawTranscriptPath}else{[string]$Request.OutputFolder}); RawTranscriptPath=$rawTranscriptPath
                WhisperModelPath=$modelPath; VadEnabled=[bool]$Request.EnableVad; VadModelPath=$vadModelPath
                RequestedGpu=$requestedGpu; UsedGpu=$usedGpu; UsedCpuFallback=$usedFallback; FFmpegPath=$ffmpegPath
                FFmpegVersion=$ffmpegVersion; FFmpegExitCode=$lastExitCode; DurationMs=[math]::Round(($completed-$started).TotalMilliseconds,3)
                Attempts=$attempts.ToArray(); Arguments=$null; FilterExpression=$null; DiagnosticCommand=$null
                LogPath=$logPath; LoggingFailures=$logFailures.ToArray(); Error=$errorObject
            }
            & $emit 'Error' 'Request.Complete' 'Request' $requestOperation 'Failed' $failureResult.DurationMs $null @{Stage=$stage;Attempts=$attempts.Count} $errorObject
            $failureResult.LoggingFailures = $logFailures.ToArray()
            $failureResult
        }
    }
}

function Invoke-TranscriptOrganizerBatch {
    <#
    .SYNOPSIS
    Runs transcription requests sequentially.
    .DESCRIPTION
    Processes each request one at a time to respect the target machine's 4 GB GPU memory limit.
    .PARAMETER Request
    One or more validated request objects.
    .EXAMPLE
    $requests | Invoke-TranscriptOrganizerBatch -Configuration $config
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)][object[]] $Request,
        [Parameter()] $Configuration = (New-TranscriptOrganizerConfiguration),
        [Parameter()][switch] $StopOnFailure,
        [Parameter()][System.Threading.CancellationToken] $CancellationToken = [System.Threading.CancellationToken]::None
    )
    begin { $requests = [System.Collections.Generic.List[object]]::new() }
    process { foreach ($item in $Request) { $requests.Add($item) } }
    end {
        foreach ($item in $requests) {
            if ($CancellationToken.IsCancellationRequested) { break }
            $result = Invoke-TranscriptOrganizer -Request $item -Configuration $Configuration -CancellationToken $CancellationToken
            $result
            if ($StopOnFailure -and -not $result.Succeeded) { break }
        }
    }
}
