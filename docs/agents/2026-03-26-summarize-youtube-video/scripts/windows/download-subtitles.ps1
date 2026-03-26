<#
.SYNOPSIS
Downloads subtitles in VTT format without downloading the video.

.DESCRIPTION
Uses yt-dlp to fetch manual English subtitles when available and English
auto-generated subtitles as a fallback. The script writes subtitle files into
the requested directory, logs command execution, and stops on the first error.

.PARAMETER Url
The YouTube video URL to inspect.

.PARAMETER OutputDir
Directory where subtitle files will be written.

.PARAMETER Language
Subtitle language selector passed to yt-dlp.
Defaults to en.*.

.PARAMETER Help
Shows this help text.

.EXAMPLE
.\download-subtitles.ps1 -Url "https://www.youtube.com/watch?v=abc123" -OutputDir "artifacts\video\subtitles"

.EXAMPLE
.\download-subtitles.ps1 -Url "https://www.youtube.com/watch?v=abc123" -OutputDir "artifacts\video\subtitles" -Language "en.*"

.OUTPUTS
Writes one or more VTT files into the target directory.

.NOTES
Fails fast on invalid input, missing tools, yt-dlp command failures, or when no VTT output is produced.
#>
param(
    [string]$Url,
    [string]$OutputDir,
    [string]$Language = "en.*",
    [switch]$Help
)

. (Join-Path $PSScriptRoot "common.ps1")
$script:ScriptName = Split-Path -Leaf $PSCommandPath

if ($Help) {
    Get-Help -Detailed $PSCommandPath
    exit 0
}

if ([string]::IsNullOrWhiteSpace($Url)) {
    Fail "The -Url parameter is required. Run with -Help for usage."
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    Fail "The -OutputDir parameter is required. Run with -Help for usage."
}

Validate-VideoUrl -Url $Url
Ensure-YtDlp
Ensure-Directory -Path $OutputDir

Write-Log -Level INFO -Message "Downloading subtitles into $OutputDir"

try {
    Invoke-ExternalCommand -WorkingDirectory $OutputDir -Arguments @(
        "yt-dlp",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", $Language,
        "--convert-subs", "vtt",
        "--output", "%(title).200B.%(ext)s",
        "--restrict-filenames",
        $Url
    )

    $vttFiles = Get-ChildItem -LiteralPath $OutputDir -Filter *.vtt -File | Sort-Object Name
    if (-not $vttFiles) {
        Fail "No VTT subtitles were downloaded into $OutputDir."
    }

    Write-Log -Level INFO -Message "Downloaded $($vttFiles.Count) subtitle file(s)."
    Write-Log -Level DEBUG -Message "First subtitle file: $($vttFiles[0].FullName)"
}
catch {
    Fail "Failed to download subtitles. $($_.Exception.Message)"
}
