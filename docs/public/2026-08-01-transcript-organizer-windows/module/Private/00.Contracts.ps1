function New-TranscriptOrganizerContractValidation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string] $Contract,
        [Parameter(Mandatory)][AllowNull()] $Value,
        [Parameter(Mandatory)][string[]] $RequiredProperties,
        [Parameter()][scriptblock] $Invariant
    )

    $errors = [System.Collections.Generic.List[string]]::new()
    if ($null -eq $Value) {
        $errors.Add('Value must not be null.')
    }
    else {
        foreach ($name in $RequiredProperties) {
            if ($null -eq $Value.PSObject.Properties[$name]) {
                $errors.Add("Missing required property '$name'.")
            }
        }
        if ($Invariant -and $errors.Count -eq 0) {
            foreach ($message in @(& $Invariant $Value)) {
                if (-not [string]::IsNullOrWhiteSpace([string]$message)) {
                    $errors.Add([string]$message)
                }
            }
        }
    }

    [pscustomobject][ordered]@{
        Succeeded = $errors.Count -eq 0
        Errors = $errors.ToArray()
        Contract = $Contract
    }
}

function Test-TranscriptOrganizerRuntimeResult {
    <# .SYNOPSIS Validates a runtime-result payload. .DESCRIPTION Returns contract errors without performing I/O. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'RuntimeResult' -Value $Value -RequiredProperties @(
            'Succeeded', 'Errors', 'Version', 'Edition', 'Is64BitProcess', 'IsWindows'
        ) -Invariant {
            param($item)
            if ($item.Succeeded -isnot [bool]) { 'Succeeded must be Boolean.' }
            if ($item.Errors -isnot [array]) { 'Errors must be an array.' }
            if ($item.Succeeded -and @($item.Errors).Count -ne 0) { 'A successful runtime result cannot contain errors.' }
            if (-not $item.Succeeded -and @($item.Errors).Count -eq 0) { 'A failed runtime result must contain an error.' }
            if ($item.Is64BitProcess -isnot [bool]) { 'Is64BitProcess must be Boolean.' }
            if ($item.IsWindows -isnot [bool]) { 'IsWindows must be Boolean.' }
        }
    }
}

function Test-TranscriptOrganizerCapabilityResult {
    <# .SYNOPSIS Validates an FFmpeg capability payload. .DESCRIPTION Returns contract errors without starting FFmpeg. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'CapabilityResult' -Value $Value -RequiredProperties @(
            'Succeeded', 'HasFilter', 'HasModelOption', 'HasLanguageOption', 'HasQueueOption',
            'HasDestinationOption', 'HasFormatOption', 'HasGpuOption', 'HasGpuDeviceOption',
            'HasVadOption', 'HasMaxLengthOption', 'ExitCode', 'Output'
        ) -Invariant {
            param($item)
            if ($item.Succeeded -isnot [bool]) { 'Succeeded must be Boolean.' }
            if ($item.ExitCode -isnot [int]) { 'ExitCode must be Int32.' }
            $required = @('HasFilter','HasModelOption','HasLanguageOption','HasQueueOption','HasDestinationOption','HasFormatOption')
            if ($item.Succeeded -and ($required | Where-Object { -not $item.$_ })) { 'Successful capability results require every core option.' }
        }
    }
}

function Test-TranscriptOrganizerModelResult {
    <# .SYNOPSIS Validates a model-result payload. .DESCRIPTION Returns model contract errors without reading a model. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'ModelResult' -Value $Value -RequiredProperties @(
            'Succeeded', 'Reason', 'Path', 'Length', 'HashValidated'
        ) -Invariant {
            param($item)
            if ($item.Succeeded -isnot [bool]) { 'Succeeded must be Boolean.' }
            if ($item.Reason -notin @('Valid','FileNotFound','FileTooSmall','HashMismatch','HashRequired','ReadFailed')) { 'Reason is unsupported.' }
            if ([long]$item.Length -lt 0) { 'Length cannot be negative.' }
            if ($item.HashValidated -isnot [bool]) { 'HashValidated must be Boolean.' }
        }
    }
}

function Test-TranscriptOrganizerProcessResult {
    <# .SYNOPSIS Validates a native-process result payload. .DESCRIPTION Checks process state and duration invariants. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'ProcessResult' -Value $Value -RequiredProperties @(
            'Succeeded', 'Cancelled', 'TimedOut', 'FilePath', 'Arguments', 'WorkingDirectory',
            'ExitCode', 'StandardOutput', 'StandardError', 'StartedAtUtc', 'CompletedAtUtc', 'DurationMs'
        ) -Invariant {
            param($item)
            if ($item.Succeeded -isnot [bool]) { 'Succeeded must be Boolean.' }
            if ($item.Cancelled -isnot [bool] -or $item.TimedOut -isnot [bool]) { 'Cancellation flags must be Boolean.' }
            if ([double]$item.DurationMs -lt 0) { 'DurationMs cannot be negative.' }
            if ($item.Succeeded -and $item.ExitCode -ne 0) { 'Successful process results require exit code zero.' }
            if ($item.Cancelled -and $item.Succeeded) { 'A cancelled process cannot succeed.' }
        }
    }
}

function Test-TranscriptOrganizerTranscriptionResult {
    <# .SYNOPSIS Validates a transcription result payload. .DESCRIPTION Checks success, output, VAD, GPU, and fallback invariants. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'TranscriptionResult' -Value $Value -RequiredProperties @(
            'Succeeded', 'DryRun', 'RequestId', 'InputPath', 'OutputFolder', 'RawTranscriptPath', 'WhisperModelPath',
            'VadEnabled', 'VadModelPath', 'RequestedGpu', 'UsedGpu', 'UsedCpuFallback',
            'FFmpegPath', 'FFmpegVersion', 'FFmpegExitCode', 'DurationMs', 'Attempts', 'Error'
        ) -Invariant {
            param($item)
            if ($item.Succeeded -isnot [bool] -or $item.DryRun -isnot [bool]) { 'State flags must be Boolean.' }
            if ([double]$item.DurationMs -lt 0) { 'DurationMs cannot be negative.' }
            if ($item.Succeeded -and [string]::IsNullOrWhiteSpace([string]$item.OutputFolder)) { 'Successful transcription requires an output folder.' }
            if ($item.Succeeded -and [string]::IsNullOrWhiteSpace([string]$item.RawTranscriptPath)) { 'Successful transcription requires a raw transcript path.' }
            if (-not $item.VadEnabled -and $null -ne $item.VadModelPath) { 'VadModelPath must be null when VAD is disabled.' }
            if ($item.UsedCpuFallback -and -not $item.RequestedGpu) { 'CPU fallback requires a GPU attempt.' }
            if ($item.UsedCpuFallback -and @($item.Attempts).Count -ne 2) { 'CPU fallback requires exactly two attempts.' }
            if ($item.Succeeded -and $null -ne $item.Error) { 'Successful results cannot contain Error.' }
            if (-not $item.Succeeded -and $null -eq $item.Error) { 'Failed results require Error.' }
        }
    }
}

function Test-TranscriptOrganizerTelemetryEvent {
    <# .SYNOPSIS Validates a structured telemetry event. .DESCRIPTION Checks required fields, enumerations, duration, and redaction. #>
    [CmdletBinding()]
    param([Parameter(Mandatory, ValueFromPipeline)][AllowNull()] $Value)
    process {
        New-TranscriptOrganizerContractValidation -Contract 'TelemetryEvent' -Value $Value -RequiredProperties @(
            'SchemaVersion', 'TimestampUtc', 'Level', 'EventName', 'OperationName', 'RequestId',
            'OperationId', 'Outcome', 'DurationMs', 'Parameters', 'ResultSummary', 'Error'
        ) -Invariant {
            param($item)
            if ($item.Level -notin @('Debug','Information','Warning','Error')) { 'Level is unsupported.' }
            if ($item.Outcome -notin @('Started','Succeeded','Failed','Skipped','Cancelled')) { 'Outcome is unsupported.' }
            if ($null -ne $item.DurationMs -and [double]$item.DurationMs -lt 0) { 'DurationMs cannot be negative.' }
            $serialized = $item | ConvertTo-Json -Depth 10 -Compress
            if ($serialized -match '(?i)"(password|authorization|cookie|api[_-]?key)"\s*:\s*"(?!<redacted>)') { 'Telemetry may contain a credential-bearing property.' }
        }
    }
}
