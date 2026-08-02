function New-TranscriptOrganizerConfiguration {
    <#
    .SYNOPSIS
    Creates normalized Transcript Organizer configuration.
    .DESCRIPTION
    Returns target-machine defaults and project-relative model, log, and artifact locations.
    .PARAMETER ProjectDirectory
    Project root used to resolve relative paths.
    .EXAMPLE
    $config = New-TranscriptOrganizerConfiguration -ProjectDirectory 'D:\2026-videos'
    #>
    [CmdletBinding()]
    param(
        [Parameter()][string] $ProjectDirectory = (Get-Location).Path,
        [Parameter()][AllowNull()][string] $FFmpegPath,
        [Parameter()][AllowNull()][string] $FFprobePath
    )
    $project = [IO.Path]::GetFullPath($ProjectDirectory)
    [pscustomobject][ordered]@{
        ProjectDirectory = $project
        ModelDirectory = Join-Path $project 'models'
        LogDirectory = Join-Path $project 'artifacts\logs'
        TestResultsDirectory = Join-Path $project 'artifacts\test-results'
        Executables = [ordered]@{ PowerShell='pwsh'; FFmpeg=$FFmpegPath; FFprobe=$FFprobePath; WinGet='winget'; NvidiaSmi='nvidia-smi' }
        RequiredModel = [pscustomobject][ordered]@{
            Id='medium.en-q5_0'
            FileName='ggml-model-whisper-medium.en-q5_0.bin'
            CanonicalFileName='ggml-medium.en-q5_0.bin'
            CompatibleFileNames=@('ggml-medium.en-q5_0.bin')
            Uri='https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.en-q5_0.bin?download=true'
            Sha256=$null
            MinimumLength=[long]100MB
            Required=$true
        }
        OptionalModels = [pscustomobject][ordered]@{
            Vad = [pscustomobject][ordered]@{
                Id='silero'
                FileName='ggml-silero-v6.2.0.bin'
                CompatibleFileNames=@('ggml-silero-v5.1.2.bin')
                Uri=$null
                Sha256=$null
                MinimumLength=[long]100KB
                Required=$false
            }
        }
        Defaults = [pscustomobject][ordered]@{
            Language='en'; QueueSeconds=20.0; UseGpu=$true; GpuDevice=0
            EnableVad=$false; VadThreshold=0.5; VadMinimumSpeechSeconds=0.2; VadMinimumSilenceSeconds=0.6
            AllowCpuFallback=$true; DownloadMissingModels=$false; MaxConcurrency=1
            TimeoutMultiplier=6.0; TimeoutStartupAllowanceSeconds=1800; MinimumTimeoutSeconds=7200
            UnknownDurationTimeoutSeconds=21600; MaximumTimeoutSeconds=86400
        }
        RedactPaths = $false
        LogLevel = 'Information'
    }
}

function New-TranscriptOrganizerRequest {
    <#
    .SYNOPSIS
    Creates and validates a transcription request.
    .DESCRIPTION
    Builds a deterministic request for one local media file and an output folder.
    .PARAMETER InputPath
    Local audio or video file path.
    .PARAMETER OutputFolder
    Folder that receives the raw JSON transcript and derived artifacts.
    .PARAMETER WhisperModelPath
    Optional authoritative path to the Whisper transcription model.
    .PARAMETER DryRun
    Performs prerequisite and argument validation without starting transcription.
    .EXAMPLE
    New-TranscriptOrganizerRequest -InputPath '.\input.webm' -OutputFolder '.\input-transcript'
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][Alias('Source')][string] $InputPath,
        [Parameter(Mandatory)][string] $OutputFolder,
        [Parameter()][string] $WhisperModelPath,
        [Parameter()][ValidateSet('en','auto')][string] $Language = 'en',
        [Parameter()][ValidateRange(0.1,3600)][double] $QueueSeconds = 20,
        [Parameter()][bool] $UseGpu = $true,
        [Parameter()][ValidateRange(0,[int]::MaxValue)][int] $GpuDevice = 0,
        [Parameter()][switch] $EnableVad,
        [Parameter()][string] $VadModelPath,
        [Parameter()][ValidateRange(0.0,1.0)][double] $VadThreshold = 0.5,
        [Parameter()][ValidateRange(0.0,60.0)][double] $VadMinimumSpeechSeconds = 0.2,
        [Parameter()][ValidateRange(0.0,60.0)][double] $VadMinimumSilenceSeconds = 0.6,
        [Parameter()][string[]] $PreprocessingFilter = @(),
        [Parameter()][ValidateRange(0,10000)][int] $MaxLength = 0,
        [Parameter()][switch] $DownloadMissingModels,
        [Parameter()][switch] $RequireGpu,
        [Parameter()][bool] $AllowCpuFallback = $true,
        [Parameter()][switch] $Overwrite,
        [Parameter()][switch] $DryRun,
        [Parameter()][ValidateRange(1,86400)][int] $TimeoutSeconds = 21600,
        [Parameter()][string] $AudioStream = '0:a:0'
    )
    $request = [pscustomobject][ordered]@{
        InputPath=$InputPath; OutputFolder=$OutputFolder; WhisperModelPath=$WhisperModelPath
        Language=$Language; QueueSeconds=$QueueSeconds; UseGpu=$UseGpu; GpuDevice=$GpuDevice
        EnableVad=$EnableVad.IsPresent; VadModelPath=$VadModelPath; VadThreshold=$VadThreshold
        VadMinimumSpeechSeconds=$VadMinimumSpeechSeconds; VadMinimumSilenceSeconds=$VadMinimumSilenceSeconds
        PreprocessingFilters=@($PreprocessingFilter); MaxLength=$MaxLength
        DownloadMissingModels=$DownloadMissingModels.IsPresent; RequireGpu=$RequireGpu.IsPresent
        AllowCpuFallback=$AllowCpuFallback; Overwrite=$Overwrite.IsPresent; DryRun=$DryRun.IsPresent
        TimeoutSeconds=$TimeoutSeconds; AudioStream=$AudioStream
    }
    $validation = Test-TranscriptOrganizerRequestValue -Request $request
    if (-not $validation.Succeeded) { throw [ArgumentException]::new($validation.Errors -join [Environment]::NewLine) }
    $request
}

function Test-TranscriptOrganizerEnvironment {
    <#
    .SYNOPSIS
    Checks runtime, FFmpeg, FFprobe, Whisper-filter, model, and GPU readiness.
    .DESCRIPTION
    Inspects prerequisites without starting a transcription operation.
    .PARAMETER Configuration
    Configuration to inspect.
    .PARAMETER IncludeModel
    Also resolves and validates the configured required model.
    .EXAMPLE
    Test-TranscriptOrganizerEnvironment -Configuration (New-TranscriptOrganizerConfiguration) -IncludeModel
    #>
    [CmdletBinding()]
    param(
        [Parameter()] $Configuration = (New-TranscriptOrganizerConfiguration),
        [Parameter()][switch] $IncludeModel
    )
    $runtime = Test-TranscriptOrganizerRuntime
    $backend = Resolve-TranscriptOrganizerBackend -Configuration $Configuration
    $ffmpeg = $backend.FFmpegPath
    $ffprobe = $backend.FFprobePath
    $version = if ($ffmpeg) { Get-TranscriptOrganizerFFmpegVersionInternal -FFmpegPath $ffmpeg -WorkingDirectory $Configuration.ProjectDirectory } else { $null }
    $capability = if ($ffmpeg) { Get-TranscriptOrganizerCapabilityInternal -FFmpegPath $ffmpeg -WorkingDirectory $Configuration.ProjectDirectory } else { $null }
    $gpu = Get-TranscriptOrganizerNvidiaGpuInternal -Configuration $Configuration
    $model = $null
    if ($IncludeModel) {
        try {
            $path = Resolve-TranscriptOrganizerModel -Configuration $Configuration -Model $Configuration.RequiredModel
            $model = Test-TranscriptOrganizerModelFile -Path $path -MinimumLength $Configuration.RequiredModel.MinimumLength -ExpectedSha256 $Configuration.RequiredModel.Sha256
        }
        catch {
            $model = [pscustomobject][ordered]@{ Succeeded=$false; Reason='FileNotFound'; Path=$null; Length=[long]0; HashValidated=$false; ExpectedSha256=$null; ActualSha256=$null }
        }
    }
    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($item in $runtime.Errors) { $errors.Add($item) }
    if (-not $ffmpeg) { $errors.Add('FFmpeg was not found. Install a Windows build compiled with whisper.cpp support.') }
    if (-not $ffprobe) { $errors.Add('FFprobe was not found. Install it with FFmpeg and add it to PATH.') }
    if ($ffmpeg -and -not $version.Succeeded) { $errors.Add('FFmpeg could not report its version.') }
    if ($capability -and -not $capability.Succeeded) { $errors.Add('The installed FFmpeg build does not provide the required Whisper filter and core options.') }
    if ($IncludeModel -and -not $model.Succeeded) { $errors.Add('The required transcription model was not found or failed validation.') }
    [pscustomobject][ordered]@{
        Succeeded=$errors.Count -eq 0; Errors=$errors.ToArray(); Runtime=$runtime; FFmpegPath=$ffmpeg; FFprobePath=$ffprobe
        FFmpegVersion=$version; Capability=$capability; Gpu=$gpu; Model=$model
    }
}
