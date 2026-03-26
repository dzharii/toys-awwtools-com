<#
.SYNOPSIS
Fetches YouTube metadata without downloading video media.

.DESCRIPTION
Uses yt-dlp with --skip-download and --dump-single-json to write metadata
for a single YouTube URL into a JSON file. The script logs each major step,
stops on the first error, and creates parent directories for the output file.

.PARAMETER Url
The YouTube video URL to inspect.

.PARAMETER Output
The JSON file path to write.

.PARAMETER Help
Shows this help text.

.EXAMPLE
.\get-video-metadata.ps1 -Url "https://www.youtube.com/watch?v=abc123" -Output "artifacts\video\metadata.json"

.OUTPUTS
Writes a metadata JSON file to the requested path.

.NOTES
Fails fast on invalid input, missing tools, yt-dlp command failures, or file-write errors.
#>
param(
    [string]$Url,
    [string]$Output,
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

if ([string]::IsNullOrWhiteSpace($Output)) {
    Fail "The -Output parameter is required. Run with -Help for usage."
}

Validate-VideoUrl -Url $Url
Ensure-YtDlp
Ensure-ParentDirectory -Path $Output

Write-Log -Level INFO -Message "Writing metadata to $Output"

try {
    $metadataJson = Invoke-ExternalCommandCapture -Arguments @(
        "yt-dlp",
        "--dump-single-json",
        "--no-warn",
        "--skip-download",
        $Url
    )

    Write-Utf8TextFile -Path $Output -Text (($metadataJson | ForEach-Object { "$_" }) -join [Environment]::NewLine)
    Ensure-FileExists -Path $Output -Description "Metadata JSON"
    Write-Log -Level INFO -Message "Metadata JSON written to $Output"
}
catch {
    Fail "Failed to fetch metadata. $($_.Exception.Message)"
}
