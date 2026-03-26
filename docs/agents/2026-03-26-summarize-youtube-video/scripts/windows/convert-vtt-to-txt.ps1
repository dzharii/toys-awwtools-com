<#
.SYNOPSIS
Converts a VTT subtitle file into cleaned plain text.

.DESCRIPTION
Removes WEBVTT headers, cue timing rows, inline timestamp tags, remaining
markup tags, blank lines, and adjacent repeated subtitle lines. The output
matches the cleaning behavior used by the legacy helper being replaced.

.PARAMETER InputPath
The source VTT subtitle file.

.PARAMETER OutputPath
The TXT file to write. Defaults to InputPath + ".txt".

.PARAMETER Help
Shows this help text.

.EXAMPLE
.\convert-vtt-to-txt.ps1 -InputPath "artifacts\video\subtitles\sample.en.vtt"

.EXAMPLE
.\convert-vtt-to-txt.ps1 -InputPath "artifacts\video\subtitles\sample.en.vtt" -OutputPath "artifacts\video\subtitles\sample.en.vtt.txt"

.OUTPUTS
Writes a cleaned UTF-8 transcript text file.

.NOTES
Fails fast on missing input files, conversion errors, or file-write errors.
#>
param(
    [string]$InputPath,
    [string]$OutputPath,
    [switch]$Help
)

. (Join-Path $PSScriptRoot "common.ps1")
$script:ScriptName = Split-Path -Leaf $PSCommandPath

if ($Help) {
    Get-Help -Detailed $PSCommandPath
    exit 0
}

if ([string]::IsNullOrWhiteSpace($InputPath)) {
    Fail "The -InputPath parameter is required. Run with -Help for usage."
}

if (-not (Test-Path -LiteralPath $InputPath -PathType Leaf)) {
    Fail "Input VTT file does not exist: $InputPath"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = "$InputPath.txt"
}

Ensure-ParentDirectory -Path $OutputPath
Write-Log -Level INFO -Message "Cleaning transcript from $InputPath"
Write-Log -Level DEBUG -Message "Writing cleaned transcript to $OutputPath"

try {
    $cleanedLines = New-Object System.Collections.Generic.List[string]
    $previousLine = ""

    foreach ($line in Get-Content -LiteralPath $InputPath) {
        if ($line -match "^(WEBVTT|Kind:|Language:)") {
            continue
        }

        $text = [regex]::Replace($line, "\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}.*", "")
        $text = [regex]::Replace($text, "<\d{2}:\d{2}:\d{2}\.\d{3}>|<.*?>", "")
        $text = $text.Trim()

        if ($text -and $text -ne $previousLine) {
            $cleanedLines.Add($text)
            $previousLine = $text
        }
    }

    Write-Utf8TextFile -Path $OutputPath -Text (($cleanedLines | ForEach-Object { "$_" }) -join [Environment]::NewLine)
    Ensure-FileExists -Path $OutputPath -Description "Cleaned transcript"
    Write-Log -Level INFO -Message "Cleaned transcript written to $OutputPath"
}
catch {
    Fail "Failed to convert VTT to TXT. $($_.Exception.Message)"
}
