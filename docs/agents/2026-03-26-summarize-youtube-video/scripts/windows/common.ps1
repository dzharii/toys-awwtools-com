Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Shared helpers for the Windows transcript scripts.

$script:ScriptName = if ($PSCommandPath) { Split-Path -Leaf $PSCommandPath } else { "script.ps1" }

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("INFO", "DEBUG", "ERROR")]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"
    $line = "[$timestamp] $Level ${script:ScriptName}: $Message"

    if ($Level -eq "ERROR") {
        [Console]::Error.WriteLine($line)
        return
    }

    Write-Host $line
}

function Fail {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,

        [int]$ExitCode = 1
    )

    Write-Log -Level ERROR -Message $Message
    exit $ExitCode
}

function Test-CommandAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Quote-CommandArgument {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ($Value -match '[\s"]') {
        return '"' + ($Value -replace '"', '`"') + '"'
    }

    return $Value
}

function Format-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    return (($Arguments | ForEach-Object { Quote-CommandArgument -Value $_ }) -join " ")
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Ensure-ParentDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        Ensure-Directory -Path $parent
    }
}

function Ensure-FileExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [string]$Description = "File"
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Fail "$Description was not created: $Path"
    }
}

function Validate-VideoUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    if ([string]::IsNullOrWhiteSpace($Url)) {
        Fail "A video URL is required."
    }

    if ($Url -notmatch '^https?://.+') {
        Fail "Invalid video URL: $Url"
    }
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [string]$WorkingDirectory
    )

    Write-Log -Level DEBUG -Message "Running command: $(Format-Command -Arguments $Arguments)"
    if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
        Write-Log -Level DEBUG -Message "Working directory: $WorkingDirectory"
    }

    try {
        if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
            Push-Location -LiteralPath $WorkingDirectory
        }

        if ($Arguments.Count -eq 1) {
            & $Arguments[0]
        }
        else {
            & $Arguments[0] @($Arguments[1..($Arguments.Count - 1)])
        }

        $exitCode = $LASTEXITCODE
    }
    finally {
        if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
            Pop-Location
        }
    }

    if ($exitCode -ne 0) {
        throw "Command failed with exit code ${exitCode}: $(Format-Command -Arguments $Arguments)"
    }
}

function Invoke-ExternalCommandCapture {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [string]$WorkingDirectory
    )

    Write-Log -Level DEBUG -Message "Running command: $(Format-Command -Arguments $Arguments)"
    if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
        Write-Log -Level DEBUG -Message "Working directory: $WorkingDirectory"
    }

    try {
        if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
            Push-Location -LiteralPath $WorkingDirectory
        }

        if ($Arguments.Count -eq 1) {
            $output = & $Arguments[0] 2>&1
        }
        else {
            $output = & $Arguments[0] @($Arguments[1..($Arguments.Count - 1)]) 2>&1
        }

        $exitCode = $LASTEXITCODE
    }
    finally {
        if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
            Pop-Location
        }
    }

    if ($exitCode -ne 0) {
        throw "Command failed with exit code ${exitCode}: $(Format-Command -Arguments $Arguments)"
    }

    return $output
}

function Ensure-YtDlp {
    if (Test-CommandAvailable -Name "yt-dlp") {
        $version = (& yt-dlp --version | Select-Object -First 1)
        Write-Log -Level INFO -Message "Using yt-dlp $version"
        return
    }

    Write-Log -Level INFO -Message "yt-dlp is not installed. Attempting automatic installation."

    if (-not (Test-CommandAvailable -Name "winget")) {
        Fail "yt-dlp is not installed and winget is unavailable."
    }

    Invoke-ExternalCommand -Arguments @(
        "winget",
        "install",
        "--exact",
        "--id", "yt-dlp.yt-dlp",
        "--accept-source-agreements",
        "--accept-package-agreements"
    )

    if (-not (Test-CommandAvailable -Name "yt-dlp")) {
        Fail "yt-dlp installation completed but the command is still unavailable."
    }

    $installedVersion = (& yt-dlp --version | Select-Object -First 1)
    Write-Log -Level INFO -Message "Installed yt-dlp $installedVersion"
}

function Write-Utf8TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Text
    )

    Ensure-ParentDirectory -Path $Path
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Text, $encoding)
}
