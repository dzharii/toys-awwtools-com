<#
.SYNOPSIS
Assembles the final markdown summary document.

.DESCRIPTION
Writes the final markdown report using the exact report structure required by
this agent: a video link line, a thumbnail blockquote, and the summary body
inserted verbatim without headings or wrappers.

.PARAMETER VideoUrl
Canonical or input video URL for the markdown link.

.PARAMETER VideoTitle
Human-readable video title.

.PARAMETER ThumbnailPath
Thumbnail path to embed in markdown. Relative paths are checked relative to the
output file directory.

.PARAMETER SummaryFile
Plain-text summary file to insert verbatim.

.PARAMETER Output
Markdown file to write.

.PARAMETER Help
Shows this help text.

.EXAMPLE
.\write-summary-markdown.ps1 -VideoUrl "https://www.youtube.com/watch?v=abc123" -VideoTitle "Example Video" -ThumbnailPath "./thumbnails/example.webp" -SummaryFile "artifacts\video\summary.txt" -Output "artifacts\video\2026-03-26 Example Video.md"

.OUTPUTS
Writes the final markdown report.

.NOTES
Fails fast on missing input files, invalid output paths, or write failures.
#>
param(
    [string]$VideoUrl,
    [string]$VideoTitle,
    [string]$ThumbnailPath,
    [string]$SummaryFile,
    [string]$Output,
    [switch]$Help
)

. (Join-Path $PSScriptRoot "common.ps1")
$script:ScriptName = Split-Path -Leaf $PSCommandPath

if ($Help) {
    Get-Help -Detailed $PSCommandPath
    exit 0
}

if ([string]::IsNullOrWhiteSpace($VideoUrl)) {
    Fail "The -VideoUrl parameter is required. Run with -Help for usage."
}

if ([string]::IsNullOrWhiteSpace($VideoTitle)) {
    Fail "The -VideoTitle parameter is required. Run with -Help for usage."
}

if ([string]::IsNullOrWhiteSpace($ThumbnailPath)) {
    Fail "The -ThumbnailPath parameter is required. Run with -Help for usage."
}

if ([string]::IsNullOrWhiteSpace($SummaryFile)) {
    Fail "The -SummaryFile parameter is required. Run with -Help for usage."
}

if ([string]::IsNullOrWhiteSpace($Output)) {
    Fail "The -Output parameter is required. Run with -Help for usage."
}

Validate-VideoUrl -Url $VideoUrl

if (-not (Test-Path -LiteralPath $SummaryFile -PathType Leaf)) {
    Fail "Summary file does not exist: $SummaryFile"
}

Ensure-ParentDirectory -Path $Output

$outputDirectory = Split-Path -Parent $Output
if ([string]::IsNullOrWhiteSpace($outputDirectory)) {
    $outputDirectory = (Get-Location).Path
}

$thumbnailCheckPath = if ([System.IO.Path]::IsPathRooted($ThumbnailPath)) {
    $ThumbnailPath
}
else {
    Join-Path $outputDirectory $ThumbnailPath
}

if (-not (Test-Path -LiteralPath $thumbnailCheckPath -PathType Leaf)) {
    Fail "Thumbnail path does not resolve to a file: $ThumbnailPath"
}

$markdownThumbnailPath = $ThumbnailPath -replace '\\', '/'

Write-Log -Level INFO -Message "Writing markdown report to $Output"
Write-Log -Level DEBUG -Message "Using summary file $SummaryFile"
Write-Log -Level DEBUG -Message "Using thumbnail path $markdownThumbnailPath"

try {
    $summaryText = Get-Content -LiteralPath $SummaryFile -Raw
    $markdownLines = @(
        "[$VideoTitle]($VideoUrl)",
        "",
        "> ![Thumbnail]($markdownThumbnailPath)",
        "",
        $summaryText
    )

    Write-Utf8TextFile -Path $Output -Text ($markdownLines -join [Environment]::NewLine)
    Ensure-FileExists -Path $Output -Description "Markdown report"
    Write-Log -Level INFO -Message "Markdown report written to $Output"
}
catch {
    Fail "Failed to write the markdown report. $($_.Exception.Message)"
}
