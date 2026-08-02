function Test-TranscriptOrganizerRuntime {
    [CmdletBinding()]
    param()
    $errors = [System.Collections.Generic.List[string]]::new()
    $isWindowsValue = [bool]$IsWindows
    if (-not $isWindowsValue) { $errors.Add('Transcript Organizer supports Windows only.') }
    if ($PSVersionTable.PSEdition -ne 'Core') { $errors.Add('PowerShell Core is required. Run the application with pwsh.exe.') }
    if ($PSVersionTable.PSVersion -lt [version]'7.0') { $errors.Add("PowerShell 7 or later is required. Current version: $($PSVersionTable.PSVersion).") }
    if (-not [Environment]::Is64BitProcess) { $errors.Add('A 64-bit PowerShell process is required.') }
    [pscustomobject][ordered]@{
        Succeeded = $errors.Count -eq 0
        Errors = $errors.ToArray()
        Version = $PSVersionTable.PSVersion
        Edition = $PSVersionTable.PSEdition
        Is64BitProcess = [Environment]::Is64BitProcess
        IsWindows = $isWindowsValue
    }
}

function Resolve-TranscriptOrganizerCommand {
    [CmdletBinding()]
    param([Parameter()][AllowNull()][string] $Name)
    if ([string]::IsNullOrWhiteSpace($Name)) { return $null }
    if ([IO.Path]::IsPathRooted($Name)) {
        if (Test-Path -LiteralPath $Name -PathType Leaf) { return [IO.Path]::GetFullPath($Name) }
        return $null
    }
    $command = Get-Command -Name $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($command) { [IO.Path]::GetFullPath($command.Source) }
}

function Resolve-TranscriptOrganizerBackend {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Configuration)

    $configuredFFmpeg = [string]$Configuration.Executables.FFmpeg
    $configuredFFprobe = [string]$Configuration.Executables.FFprobe
    if (-not [string]::IsNullOrWhiteSpace($configuredFFmpeg)) {
        $ffmpeg = Resolve-TranscriptOrganizerCommand -Name $configuredFFmpeg
        if (-not $ffmpeg) { return [pscustomobject]@{ Succeeded=$false; FFmpegPath=$null; FFprobePath=$null; Reason='ConfiguredFFmpegNotFound'; Candidates=@($configuredFFmpeg) } }
        $ffprobe = if ($configuredFFprobe) { Resolve-TranscriptOrganizerCommand -Name $configuredFFprobe } else { Resolve-TranscriptOrganizerCommand -Name (Join-Path (Split-Path -Parent $ffmpeg) 'ffprobe.exe') }
        return [pscustomobject]@{ Succeeded=[bool]$ffprobe; FFmpegPath=$ffmpeg; FFprobePath=$ffprobe; Reason=$(if($ffprobe){'Explicit'}else{'ConfiguredFFprobeNotFound'}); Candidates=@($ffmpeg) }
    }

    $candidates = [System.Collections.Generic.List[string]]::new()
    foreach ($relative in @('ffmpeg.exe','ffmpeg\bin\ffmpeg.exe','tools\ffmpeg\bin\ffmpeg.exe')) {
        $candidate = Join-Path $Configuration.ProjectDirectory $relative
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { $candidates.Add([IO.Path]::GetFullPath($candidate)) }
    }
    $wingetRoot = if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages' } else { $null }
    if ($wingetRoot -and (Test-Path -LiteralPath $wingetRoot -PathType Container)) {
        $packages = @(Get-ChildItem -LiteralPath $wingetRoot -Directory -Filter 'Gyan.FFmpeg*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending)
        foreach ($package in $packages) {
            foreach ($candidate in @(Get-ChildItem -LiteralPath $package.FullName -File -Filter 'ffmpeg.exe' -Recurse -ErrorAction SilentlyContinue | Sort-Object FullName -Descending)) {
                $candidates.Add($candidate.FullName)
            }
        }
    }
    foreach ($command in @(Get-Command -Name 'ffmpeg' -CommandType Application -All -ErrorAction SilentlyContinue)) { $candidates.Add($command.Source) }
    if ($env:ProgramFiles) {
        foreach ($relative in @('ffmpeg\bin\ffmpeg.exe','FFmpeg\bin\ffmpeg.exe')) {
            $candidate = Join-Path $env:ProgramFiles $relative
            if (Test-Path -LiteralPath $candidate -PathType Leaf) { $candidates.Add($candidate) }
        }
    }

    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $examined = [System.Collections.Generic.List[string]]::new()
    foreach ($candidate in $candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        $ffmpeg = [IO.Path]::GetFullPath($candidate)
        if (-not $seen.Add($ffmpeg) -or -not (Test-Path -LiteralPath $ffmpeg -PathType Leaf)) { continue }
        $examined.Add($ffmpeg)
        $ffprobe = if ($configuredFFprobe) { Resolve-TranscriptOrganizerCommand -Name $configuredFFprobe } else { Resolve-TranscriptOrganizerCommand -Name (Join-Path (Split-Path -Parent $ffmpeg) 'ffprobe.exe') }
        if (-not $ffprobe) { continue }
        $version = Get-TranscriptOrganizerFFmpegVersionInternal -FFmpegPath $ffmpeg -WorkingDirectory $Configuration.ProjectDirectory
        if (-not $version.Succeeded) { continue }
        $capability = Get-TranscriptOrganizerCapabilityInternal -FFmpegPath $ffmpeg -WorkingDirectory $Configuration.ProjectDirectory
        if ($capability.Succeeded) {
            return [pscustomobject]@{ Succeeded=$true; FFmpegPath=$ffmpeg; FFprobePath=$ffprobe; Reason='AutomaticWhisperBackend'; Candidates=$examined.ToArray(); Version=$version; Capability=$capability }
        }
    }
    [pscustomobject]@{ Succeeded=$false; FFmpegPath=$null; FFprobePath=$null; Reason='WhisperBackendNotFound'; Candidates=$examined.ToArray() }
}

function Invoke-TranscriptOrganizerProcess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $FilePath,
        [Parameter(Mandatory)][string[]] $ArgumentList,
        [Parameter(Mandatory)][string] $WorkingDirectory,
        [Parameter()][ValidateRange(1,86400)][int] $TimeoutSeconds = 3600,
        [Parameter()][System.Threading.CancellationToken] $CancellationToken = [System.Threading.CancellationToken]::None
    )
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FilePath
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true
    foreach ($argument in $ArgumentList) { $startInfo.ArgumentList.Add($argument) }

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $started = [datetimeoffset]::UtcNow
    $stdout = ''
    $stderr = ''
    $cancelled = $false
    $timedOut = $false
    $exitCode = -1
    try {
        if (-not $process.Start()) { throw "Failed to start process: $FilePath" }
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        while (-not $process.WaitForExit(100)) {
            if ($CancellationToken.IsCancellationRequested) { $cancelled = $true; break }
            if (([datetimeoffset]::UtcNow - $started).TotalSeconds -ge $TimeoutSeconds) { $timedOut = $true; break }
        }
        if ($cancelled -or $timedOut) {
            try { $process.Kill($true) } catch { Write-Verbose "Process-tree termination reported: $($_.Exception.Message)" }
            $process.WaitForExit(5000) | Out-Null
        }
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()
        if ($process.HasExited) { $exitCode = $process.ExitCode }
    }
    catch {
        $stderr = $_.Exception.Message
    }
    finally {
        $completed = [datetimeoffset]::UtcNow
        $process.Dispose()
    }
    [pscustomobject][ordered]@{
        Succeeded = -not $cancelled -and -not $timedOut -and $exitCode -eq 0
        Cancelled = $cancelled
        TimedOut = $timedOut
        FilePath = $FilePath
        Arguments = @($ArgumentList)
        WorkingDirectory = $WorkingDirectory
        ExitCode = [int]$exitCode
        StandardOutput = [string]$stdout
        StandardError = [string]$stderr
        StartedAtUtc = $started
        CompletedAtUtc = $completed
        DurationMs = [math]::Round(($completed - $started).TotalMilliseconds, 3)
    }
}

function Write-TranscriptOrganizerLog {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Event, [Parameter(Mandatory)][string] $LogPath)
    $validation = Test-TranscriptOrganizerTelemetryEvent -Value $Event
    if (-not $validation.Succeeded) { throw "Invalid telemetry event: $($validation.Errors -join '; ')" }
    $directory = Split-Path -Parent $LogPath
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) { $null = New-Item -ItemType Directory -Path $directory -Force }
    $line = $Event | ConvertTo-Json -Depth 12 -Compress
    [IO.File]::AppendAllText($LogPath, $line + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
}

function Write-TranscriptOrganizerSafeLog {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Event, [Parameter(Mandatory)][string] $LogPath, [Parameter()][AllowNull()] $OriginalError)
    try { Write-TranscriptOrganizerLog -Event $Event -LogPath $LogPath; return $null }
    catch {
        $message = "Transcript Organizer could not write its log '$LogPath': $($_.Exception.Message)"
        Write-Warning $message
        [pscustomobject]@{ Message = $message; OriginalErrorPreserved = $null -ne $OriginalError }
    }
}

function Test-TranscriptOrganizerModelFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $Path,
        [Parameter()][long] $MinimumLength = 1MB,
        [Parameter()][string] $ExpectedSha256,
        [Parameter()][switch] $RequireHash
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return [pscustomobject][ordered]@{ Succeeded=$false; Reason='FileNotFound'; Path=$Path; Length=[long]0; HashValidated=$false; ExpectedSha256=$ExpectedSha256; ActualSha256=$null }
    }
    try { $item = Get-Item -LiteralPath $Path -ErrorAction Stop }
    catch { return [pscustomobject][ordered]@{ Succeeded=$false; Reason='ReadFailed'; Path=$Path; Length=[long]0; HashValidated=$false; ExpectedSha256=$ExpectedSha256; ActualSha256=$null } }
    if ($item.Length -lt $MinimumLength) {
        return [pscustomobject][ordered]@{ Succeeded=$false; Reason='FileTooSmall'; Path=$Path; Length=[long]$item.Length; HashValidated=$false; ExpectedSha256=$ExpectedSha256; ActualSha256=$null }
    }
    if ($RequireHash -and [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
        return [pscustomobject][ordered]@{ Succeeded=$false; Reason='HashRequired'; Path=$Path; Length=[long]$item.Length; HashValidated=$false; ExpectedSha256=$null; ActualSha256=$null }
    }
    $actual = $null
    if ($ExpectedSha256) {
        $actual = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $ExpectedSha256.ToLowerInvariant()) {
            return [pscustomobject][ordered]@{ Succeeded=$false; Reason='HashMismatch'; Path=$Path; Length=[long]$item.Length; HashValidated=$true; ExpectedSha256=$ExpectedSha256.ToLowerInvariant(); ActualSha256=$actual }
        }
    }
    [pscustomobject][ordered]@{ Succeeded=$true; Reason='Valid'; Path=[IO.Path]::GetFullPath($Path); Length=[long]$item.Length; HashValidated=[bool]$ExpectedSha256; ExpectedSha256=$ExpectedSha256; ActualSha256=$actual }
}

function Resolve-TranscriptOrganizerModel {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] $Configuration,
        [Parameter(Mandatory)] $Model,
        [Parameter()][string] $ExplicitPath,
        [Parameter()][switch] $Vad
    )
    $names = @($Model.FileName) + @($Model.CompatibleFileNames | Where-Object { $_ })
    $candidates = @(Get-TranscriptOrganizerModelCandidates -ProjectDirectory $Configuration.ProjectDirectory -ModelDirectory $Configuration.ModelDirectory -FileNames $names -ExplicitPath $ExplicitPath)
    if ($ExplicitPath) {
        if (-not (Test-Path -LiteralPath $candidates[0] -PathType Leaf)) {
            $kind = if ($Vad) { 'VAD model' } else { 'transcription model' }
            throw "The explicitly requested $kind does not exist: $($candidates[0])"
        }
        return $candidates[0]
    }
    foreach ($candidate in $candidates) { if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate } }
    $label = if ($Vad) { 'VAD model' } else { 'required transcription model' }
    throw "The $label was not found. Searched: $($candidates -join '; ')"
}

function Install-TranscriptOrganizerModel {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Model, [Parameter(Mandatory)][string] $DestinationDirectory, [Parameter()][switch] $Force)
    if (-not $Model.Uri) { throw "No download URI is configured for model '$($Model.Id)'." }
    if (-not $Model.Sha256) { throw "A trusted SHA-256 is required before model '$($Model.Id)' can be downloaded automatically." }
    if (-not (Test-Path -LiteralPath $DestinationDirectory -PathType Container)) { $null = New-Item -ItemType Directory -Path $DestinationDirectory -Force }
    $destination = Join-Path $DestinationDirectory $Model.FileName
    $temporary = "$destination.$([guid]::NewGuid().ToString('N')).download"
    if ((Test-Path -LiteralPath $destination) -and -not $Force) { throw "The destination model already exists: $destination" }
    try {
        Invoke-WebRequest -Uri $Model.Uri -OutFile $temporary -MaximumRetryCount 0 -ErrorAction Stop
        $validation = Test-TranscriptOrganizerModelFile -Path $temporary -MinimumLength $Model.MinimumLength -ExpectedSha256 $Model.Sha256 -RequireHash
        if (-not $validation.Succeeded) { throw "Downloaded model validation failed: $($validation.Reason)" }
        Move-Item -LiteralPath $temporary -Destination $destination -Force
        [IO.Path]::GetFullPath($destination)
    }
    finally {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue }
    }
}

function Resolve-TranscriptOrganizerInput {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Request, [Parameter(Mandatory)] $Configuration)
    $candidate = if ([IO.Path]::IsPathRooted($Request.InputPath)) { $Request.InputPath } else { Join-Path $Configuration.ProjectDirectory $Request.InputPath }
    $path = [IO.Path]::GetFullPath($candidate)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Input media file does not exist: $path" }
    [pscustomobject]@{ DisplayPath=$path; Arguments=@('-i',$path); RequiresProbe=$true }
}

function Get-TranscriptOrganizerMediaMetadataInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string] $FFprobePath, [Parameter(Mandatory)][string] $InputPath, [Parameter(Mandatory)][string] $WorkingDirectory, [Parameter()][int] $TimeoutSeconds=60)
    $arguments = @('-v','error','-show_format','-show_streams','-of','json',$InputPath)
    $process = Invoke-TranscriptOrganizerProcess -FilePath $FFprobePath -ArgumentList $arguments -WorkingDirectory $WorkingDirectory -TimeoutSeconds $TimeoutSeconds
    if (-not $process.Succeeded) { return [pscustomobject]@{Succeeded=$false;HasAudio=$false;DurationSeconds=$null;Metadata=$null;Process=$process} }
    try { $metadata = $process.StandardOutput | ConvertFrom-Json -ErrorAction Stop } catch { return [pscustomobject]@{Succeeded=$false;HasAudio=$false;DurationSeconds=$null;Metadata=$null;Process=$process} }
    $hasAudio = @($metadata.streams | Where-Object codec_type -eq 'audio').Count -gt 0
    $duration = $null
    if ($metadata.format -and $metadata.format.duration) {
        $parsed = 0.0
        if ([double]::TryParse([string]$metadata.format.duration, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$parsed) -and $parsed -gt 0) { $duration = $parsed }
    }
    [pscustomobject]@{Succeeded=$hasAudio;HasAudio=$hasAudio;DurationSeconds=$duration;Metadata=$metadata;Process=$process}
}

function Resolve-TranscriptOrganizerOutputFolderPath {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $InputPath,
        [Parameter()][string] $OutputFolder,
        [Parameter(Mandatory)][string] $WorkingDirectory,
        [Parameter()][switch] $Overwrite
    )
    if ($OutputFolder) {
        $candidate = if ([IO.Path]::IsPathRooted($OutputFolder)) { $OutputFolder } else { Join-Path $WorkingDirectory $OutputFolder }
        return [IO.Path]::GetFullPath($candidate)
    }
    $base = Join-Path ([IO.Path]::GetDirectoryName($InputPath)) ([IO.Path]::GetFileNameWithoutExtension($InputPath) + '-transcript')
    $base = [IO.Path]::GetFullPath($base)
    if ($Overwrite -or -not (Test-Path -LiteralPath $base)) { return $base }
    for ($suffix = 1; $suffix -lt [int]::MaxValue; $suffix++) {
        $candidate = '{0}_{1:D3}' -f $base,$suffix
        if (-not (Test-Path -LiteralPath $candidate)) { return $candidate }
    }
    throw "No available output-folder suffix could be allocated for: $base"
}

function Test-TranscriptOrganizerAudioStream {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string] $FFprobePath, [Parameter(Mandatory)][string] $InputPath, [Parameter(Mandatory)][string] $WorkingDirectory, [Parameter()][int] $TimeoutSeconds=30)
    $arguments = @('-v','error','-select_streams','a:0','-show_entries','stream=index','-of','csv=p=0',$InputPath)
    $process = Invoke-TranscriptOrganizerProcess -FilePath $FFprobePath -ArgumentList $arguments -WorkingDirectory $WorkingDirectory -TimeoutSeconds $TimeoutSeconds
    [pscustomobject][ordered]@{ Succeeded=$process.Succeeded -and -not [string]::IsNullOrWhiteSpace($process.StandardOutput); ExitCode=$process.ExitCode; Output=$process.StandardOutput; StandardError=$process.StandardError; Process=$process }
}

function Resolve-TranscriptOrganizerRawTranscriptOutput {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Request, [Parameter(Mandatory)] $Configuration, [Parameter(Mandatory)][string] $ResolvedInputPath)
    $folder = if ([IO.Path]::IsPathRooted($Request.OutputFolder)) { [IO.Path]::GetFullPath($Request.OutputFolder) } else { [IO.Path]::GetFullPath((Join-Path $Configuration.ProjectDirectory $Request.OutputFolder)) }
    $path = Join-Path $folder 'transcript.raw.jsonl'
    $directory = Split-Path -Parent $path
    if (-not $Request.DryRun -and -not (Test-Path -LiteralPath $directory -PathType Container)) { $null = New-Item -ItemType Directory -Path $directory -Force }
    if ((Test-Path -LiteralPath $path) -and -not $Request.Overwrite) { throw "Output already exists. Use -Overwrite to replace it: $path" }
    $writeDirectory = if (Test-Path -LiteralPath $directory -PathType Container) { $directory } else { Split-Path -Parent $directory }
    $probe = Join-Path $writeDirectory ".transcript-organizer-write-test-$([guid]::NewGuid().ToString('N')).tmp"
    try { [IO.File]::WriteAllText($probe, 'test') }
    catch { throw "The output directory is not writable: $directory" }
    finally { Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue }
    $path
}

function Get-TranscriptOrganizerNvidiaGpuInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory)] $Configuration)
    $path = Resolve-TranscriptOrganizerCommand -Name $Configuration.Executables.NvidiaSmi
    if (-not $path) { return [pscustomobject]@{ Available=$false; DiagnosticAvailable=$false; Reason='NvidiaSmiNotFound'; Devices=@() } }
    $arguments = @('--query-gpu=index,name,memory.total,driver_version','--format=csv,noheader,nounits')
    $result = Invoke-TranscriptOrganizerProcess -FilePath $path -ArgumentList $arguments -WorkingDirectory $Configuration.ProjectDirectory -TimeoutSeconds 15
    if (-not $result.Succeeded) { return [pscustomobject]@{ Available=$false; DiagnosticAvailable=$true; Reason='NvidiaSmiFailed'; Devices=@(); Process=$result } }
    $devices = @($result.StandardOutput -split '\r?\n' | Where-Object { $_ } | ForEach-Object {
        $parts = $_ -split ',\s*'
        [pscustomobject]@{ Index=[int]$parts[0]; Name=$parts[1]; MemoryMiB=[int]$parts[2]; DriverVersion=$parts[3] }
    })
    [pscustomobject]@{ Available=$devices.Count -gt 0; DiagnosticAvailable=$true; Reason='Available'; Devices=$devices }
}

function Get-TranscriptOrganizerFFmpegVersionInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string] $FFmpegPath, [Parameter(Mandatory)][string] $WorkingDirectory)
    $result = Invoke-TranscriptOrganizerProcess -FilePath $FFmpegPath -ArgumentList @('-hide_banner','-version') -WorkingDirectory $WorkingDirectory -TimeoutSeconds 30
    [pscustomobject]@{ Succeeded=$result.Succeeded; FirstLine=($result.StandardOutput -split '\r?\n' | Select-Object -First 1); FullOutput=$result.StandardOutput; Process=$result }
}

function Get-TranscriptOrganizerCapabilityInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string] $FFmpegPath, [Parameter(Mandatory)][string] $WorkingDirectory)
    $result = Invoke-TranscriptOrganizerProcess -FilePath $FFmpegPath -ArgumentList @('-hide_banner','-help','filter=whisper') -WorkingDirectory $WorkingDirectory -TimeoutSeconds 30
    $text = @($result.StandardOutput,$result.StandardError) -join [Environment]::NewLine
    ConvertFrom-TranscriptOrganizerWhisperHelp -ExitCode $result.ExitCode -Output $text
}
