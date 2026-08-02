<#
.SYNOPSIS
Transcribes one local audio or video file into a reusable output folder.
.DESCRIPTION
Finds a Whisper-enabled FFmpeg installation, calculates a conservative timeout from media duration, performs one JSON transcription, and derives readable text, SRT subtitles, metadata, validation, and sampled frames.
.PARAMETER InputPath
Local audio or video file. This is the first positional argument.
.PARAMETER OutputFolder
Optional destination folder. When omitted, video.webm uses video-transcript, then video-transcript_001 and later available suffixes.
.PARAMETER WhisperModelPath
Optional authoritative path to the Whisper transcription model.
.PARAMETER Overwrite
Uses the requested or unsuffixed output folder and replaces only known generated artifacts.
.PARAMETER DryRun
Validates and displays the resolved plan without starting inference or creating the output folder.
.EXAMPLE
.\Invoke-TranscriptOrganizer.ps1 '.\video.webm'
.EXAMPLE
.\Invoke-TranscriptOrganizer.ps1 '.\video.webm' -DryRun
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory,Position=0)][Alias('Source')][string] $InputPath,
    [Parameter()][string] $OutputFolder,
    [Parameter()][string] $WhisperModelPath,
    [Parameter()][switch] $Overwrite,
    [Parameter()][switch] $DryRun
)

# USER-EDITABLE DEFAULT SETTINGS
# Keep custom operational preferences in this one block. The script copies these values for each run.
$defaultSettings = [ordered]@{
    # Null searches project-local, WinGet, PATH, and Program Files candidates. Example override: 'C:\tools\ffmpeg\bin\ffmpeg.exe'.
    FFmpegPath = $null
    # Null prefers ffprobe.exe beside the selected FFmpeg. Example override: 'C:\tools\ffmpeg\bin\ffprobe.exe'.
    FFprobePath = $null
    # 'en' uses the supplied English model; 'auto' asks Whisper to detect language.
    Language = 'en'
    # Audio accumulated before inference. Twenty seconds favors stable segments for recorded talks; five is more responsive.
    QueueSeconds = 20.0
    # True attempts the NVIDIA backend first. Set false for an intentionally CPU-only run.
    UseGpu = $true
    # Zero selects the first GPU. Set one only on a machine whose intended NVIDIA device is index 1.
    GpuDevice = 0
    # False permits operation without a GPU. True makes missing GPU support a hard failure.
    RequireGpu = $false
    # True permits one CPU retry after a specifically classified GPU initialization failure.
    AllowCpuFallback = $true
    # False avoids any VAD-model dependency. Set true only when a compatible VAD model is configured.
    EnableVad = $false
    # Null is correct when VAD is disabled. Example: '.\models\ggml-silero-v6.2.0.bin'.
    VadModelPath = $null
    # Speech probability threshold used only with VAD; 0.5 is the balanced default.
    VadThreshold = 0.5
    # With VAD, speech shorter than 0.2 seconds is ignored as a fragment.
    VadMinimumSpeechSeconds = 0.2
    # With VAD, 0.6 seconds of silence can close a detected speech region.
    VadMinimumSilenceSeconds = 0.6
    # False prevents network model downloads. The current catalog also requires a trusted SHA-256 before any download.
    DownloadMissingModels = $false
    # Selects the first audio stream. Example '0:a:1' selects the second audio stream.
    AudioStream = '0:a:0'
    # Captures one representative frame per 60 seconds for the visual index.
    FrameIntervalSeconds = 60
    # Limits frame generation even for very long recordings; 60 frames bounds time and disk use.
    MaximumFrames = 60
    # Null enables the duration heuristic. Example 28800 forces an eight-hour timeout for every file.
    FixedTimeoutSeconds = $null
    # Automatic timeout allows six times the recording duration for slow CPU processing or fallback.
    TimeoutMultiplier = 6.0
    # Adds 30 minutes for model loading, initialization, and startup overhead.
    TimeoutStartupAllowanceSeconds = 1800
    # Even a short recording receives at least two hours before forced termination.
    MinimumTimeoutSeconds = 7200
    # A file whose duration cannot be read receives a conservative six-hour timeout.
    UnknownDurationTimeoutSeconds = 21600
    # No automatically calculated or configured timeout may exceed 24 hours.
    MaximumTimeoutSeconds = 86400
}

$settings = [ordered]@{}
foreach ($entry in $defaultSettings.GetEnumerator()) { $settings[$entry.Key] = $entry.Value }

$manifest = Join-Path $PSScriptRoot 'module\TranscriptOrganizer.psd1'
Import-Module $manifest -Force -ErrorAction Stop
$configuration = New-TranscriptOrganizerConfiguration -ProjectDirectory $PSScriptRoot -FFmpegPath $settings.FFmpegPath -FFprobePath $settings.FFprobePath
$inputCandidate = if ([IO.Path]::IsPathRooted($InputPath)) { $InputPath } else { Join-Path (Get-Location).Path $InputPath }
$resolvedInputPath = [IO.Path]::GetFullPath($inputCandidate)

$parameters = @{
    InputPath = $resolvedInputPath
    OutputFolder = $OutputFolder
    Configuration = $configuration
    WhisperModelPath = $WhisperModelPath
    Overwrite = $Overwrite
    DryRun = $DryRun
    FrameIntervalSeconds = $settings.FrameIntervalSeconds
    MaximumFrames = $settings.MaximumFrames
    QueueSeconds = $settings.QueueSeconds
    UseGpu = $settings.UseGpu
    GpuDevice = $settings.GpuDevice
    RequireGpu = $settings.RequireGpu
    AllowCpuFallback = $settings.AllowCpuFallback
    EnableVad = $settings.EnableVad
    VadModelPath = $settings.VadModelPath
    VadThreshold = $settings.VadThreshold
    VadMinimumSpeechSeconds = $settings.VadMinimumSpeechSeconds
    VadMinimumSilenceSeconds = $settings.VadMinimumSilenceSeconds
    Language = $settings.Language
    AudioStream = $settings.AudioStream
    DownloadMissingModels = $settings.DownloadMissingModels
    TimeoutMultiplier = $settings.TimeoutMultiplier
    TimeoutStartupAllowanceSeconds = $settings.TimeoutStartupAllowanceSeconds
    MinimumTimeoutSeconds = $settings.MinimumTimeoutSeconds
    UnknownDurationTimeoutSeconds = $settings.UnknownDurationTimeoutSeconds
    MaximumTimeoutSeconds = $settings.MaximumTimeoutSeconds
}
if ($null -ne $settings.FixedTimeoutSeconds) { $parameters.TimeoutSeconds = [int]$settings.FixedTimeoutSeconds }

$result = Export-TranscriptOrganizerCorpus @parameters
$result
