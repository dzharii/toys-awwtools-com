<#
.SYNOPSIS
Downloads a thumbnail preview without downloading the video.

.DESCRIPTION
Uses yt-dlp with --write-thumbnail and --convert-thumbnails webp to fetch a
lightweight preview image. The script logs each step, verifies the output, and
stops on the first error.

.PARAMETER Url
The YouTube video URL to inspect.

.PARAMETER OutputDir
Directory where the thumbnail image will be written.

.PARAMETER Help
Shows this help text.

.EXAMPLE
.\download-thumbnail.ps1 -Url "https://www.youtube.com/watch?v=abc123" -OutputDir "artifacts\video\thumbnails"

.OUTPUTS
Writes one thumbnail image into the target directory.

.NOTES
Fails fast on invalid input, missing tools, yt-dlp command failures, or when no image file is produced.
#>
param(
    [string]$Url,
    [string]$OutputDir,
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

Write-Log -Level INFO -Message "Downloading thumbnail into $OutputDir"

try {
    Invoke-ExternalCommand -WorkingDirectory $OutputDir -Arguments @(
        "yt-dlp",
        "--skip-download",
        "--write-thumbnail",
        "--convert-thumbnails", "webp",
        "--output", "%(title).200B.%(ext)s",
        "--restrict-filenames",
        $Url
    )

    $thumbnailFiles = Get-ChildItem -LiteralPath $OutputDir -File | Where-Object {
        $_.Extension -in ".webp", ".jpg", ".jpeg", ".png"
    } | Sort-Object Name

    if (-not $thumbnailFiles) {
        Fail "No thumbnail image was downloaded into $OutputDir."
    }

    Write-Log -Level INFO -Message "Downloaded $($thumbnailFiles.Count) thumbnail file(s)."
    Write-Log -Level DEBUG -Message "First thumbnail file: $($thumbnailFiles[0].FullName)"
}
catch {
    Fail "Failed to download the thumbnail. $($_.Exception.Message)"
}
