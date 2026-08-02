[CmdletBinding()]
param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()
$passes = [System.Collections.Generic.List[string]]::new()

function Assert-Landing {
    param([bool]$Condition, [string]$Message)
    if ($Condition) { $passes.Add($Message) } else { $failures.Add($Message) }
}

$indexPath = Join-Path $ProjectRoot 'index.html'
Assert-Landing (Test-Path -LiteralPath $indexPath) 'Root index.html exists'
$html = Get-Content -LiteralPath $indexPath -Raw
Assert-Landing ($html.TrimEnd().EndsWith('</html>')) 'Root HTML closes cleanly'
Assert-Landing (([regex]::Matches($html, '<h1(?:\s|>)')).Count -eq 1) 'Root HTML contains exactly one h1'
Assert-Landing ($html -match '<link rel="stylesheet" href="assets/documentation\.css"') 'Root page uses the shared documentation stylesheet'
Assert-Landing ($html -match '<meta name="color-scheme" content="light"') 'Root page declares light-only color scheme'
Assert-Landing ($html -notmatch 'eyebrow|section-num|docs-label|doc-label|class="kicker"') 'Promotional label classes are absent'
Assert-Landing ($html -match '<link rel="icon" href="assets/favicon\.svg"') 'Favicon uses a relative project asset'
Assert-Landing ($html -match '<link rel="canonical" href="https://toys\.awwtools\.com/public/2026-08-01-transcript-organizer-windows/"') 'Canonical URL matches publication URL'
Assert-Landing ($html -match '<meta property="og:image" content="https://toys\.awwtools\.com/public/2026-08-01-transcript-organizer-windows/assets/social-preview\.jpg"') 'Open Graph image uses the required absolute publication URL'
Assert-Landing ($html -match '<meta property="og:image:type" content="image/jpeg"') 'Open Graph image declares JPEG'
Assert-Landing ($html -match '<meta property="og:image:width" content="1200"' -and $html -match '<meta property="og:image:height" content="630"') 'Open Graph dimensions are declared'
Assert-Landing ($html -match '<meta name="twitter:card" content="summary_large_image"') 'Large Twitter/X card metadata exists'

$description = [regex]::Match($html, '<meta name="description" content="([^"]+)"').Groups[1].Value
Assert-Landing ($description.Length -ge 70 -and $description.Length -le 170) 'Project description is concise enough for search previews'

$docBlock = [regex]::Match($html, '<ul class="document-links"[\s\S]*?</ul>').Value
Assert-Landing ($docBlock -match 'href="docs/manual/index\.html"') 'Product manual is linked at the beginning'
Assert-Landing ($docBlock -match 'href="experiments/index\.html"') 'Experiment collection is linked at the beginning'
Assert-Landing ($docBlock -match 'href="dist/transcript-organizer-windows-version-001\.zip"') 'Version 001 distribution download is linked at the beginning'
Assert-Landing ($html -match 'Distribution version 001; PowerShell module version 0\.0\.1') 'Landing page identifies package and module versions'
Assert-Landing ($html -match "pwsh -File \.\\Invoke-TranscriptOrganizer\.ps1 '\.\\video\.webm'") 'Landing page documents the one-argument root launcher'
Assert-Landing ($html -match "pwsh -File \.\\Invoke-TranscriptOrganizer\.ps1 '\.\\video\.webm' -DryRun") 'Landing page documents the non-writing dry run'
Assert-Landing ($html -match 'Local speech-bearing audio or video files') 'Landing page states the local-file-only input boundary'
Assert-Landing ($html -notmatch '(?i)microphone|network input') 'Landing page contains no obsolete live or network input claim'
Assert-Landing ($html -match 'One output folder with JSON evidence, readable text, SRT subtitles, metadata, validation, and sampled frames') 'Landing page describes the all-artifacts output contract'
Assert-Landing ($html -match '\.\\module\\TranscriptOrganizer\.psd1') 'Landing page imports the flattened module path'
Assert-Landing ($html -match 'yt-dlp\.exe -o &quot;|yt-dlp\.exe -o "') 'yt-dlp download example exists'
Assert-Landing ($html -notmatch '-OutputPath|-Format json|-FFmpegPath|-FFprobePath') 'Quick start hides backend and output-file implementation details'
Assert-Landing ($html -match 'video-transcript_001') 'Quick start documents preserved suffixed output folders'

$skillNames = @('2026-08-01_create-faithful-video-companion','2026-08-01_build-researched-video-field-guide','2026-08-01_build-searchable-transcript-navigator')
foreach ($skillName in $skillNames) {
    $skillReference = "prompts/$skillName/SKILL.md"
    Assert-Landing (([regex]::Matches($html, [regex]::Escape(('href="' + $skillReference + '"')))).Count -eq 2) "Landing page links the reusable skill twice: $skillName"
    Assert-Landing (Test-Path -LiteralPath (Join-Path $ProjectRoot $skillReference)) "Reusable skill exists: $skillName"
}
Assert-Landing ($html -match 'Experiments 01|Experiment 01' -and $html -match 'Experiment 02' -and $html -match 'Experiment 10') 'Landing page connects experiments 01, 02, and 10 to reusable skills'

$experimentLinks = [regex]::Matches($html, 'href="experiments/experiment-(?:0[1-9]|10)-[^"]+/index\.html"')
Assert-Landing ($experimentLinks.Count -eq 16) 'Ten result links plus six visual links target experiment HTML'
$uniqueExperimentLinks = @($experimentLinks | ForEach-Object Value | Sort-Object -Unique)
Assert-Landing ($uniqueExperimentLinks.Count -eq 10) 'All ten experiments have a unique relative HTML link'

$localReferences = [regex]::Matches($html, '(?:src|href)="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -notmatch '^(?:https?:|#|mailto:)' }
foreach ($reference in $localReferences) {
    $clean = ($reference -split '#')[0]
    if (-not $clean) { continue }
    Assert-Landing (Test-Path -LiteralPath (Join-Path $ProjectRoot $clean)) "Local reference resolves: $clean"
}

$manifestPath = Join-Path $ProjectRoot 'assets\screenshots\manifest.json'
Assert-Landing (Test-Path -LiteralPath $manifestPath) 'Screenshot manifest exists'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
Assert-Landing ($manifest.Count -eq 6) 'Six experiment screenshots are recorded'
foreach ($entry in $manifest) {
    $assetPath = Join-Path $ProjectRoot "assets\screenshots\$($entry.output)"
    Assert-Landing (Test-Path -LiteralPath $assetPath) "Screenshot exists: $($entry.output)"
    Assert-Landing ([IO.Path]::GetExtension($assetPath) -eq '.jpg') "Screenshot is JPEG: $($entry.output)"
    Assert-Landing ([bool]$entry.alt) "Screenshot has reusable alt text: $($entry.output)"
}

$socialPath = Join-Path $ProjectRoot 'assets\social-preview.jpg'
Assert-Landing (Test-Path -LiteralPath $socialPath) 'Social preview JPEG exists'
$signature = [IO.File]::ReadAllBytes($socialPath)[0..2]
Assert-Landing ($signature[0] -eq 0xFF -and $signature[1] -eq 0xD8 -and $signature[2] -eq 0xFF) 'Social preview has a JPEG file signature'

$browserReportPath = Join-Path $ProjectRoot 'artifacts\landing-page-browser-validation.json'
Assert-Landing (Test-Path -LiteralPath $browserReportPath) 'Browser validation report exists'
if (Test-Path -LiteralPath $browserReportPath) {
    $browserReport = Get-Content -LiteralPath $browserReportPath -Raw | ConvertFrom-Json
    Assert-Landing ($browserReport.headingCount -eq 1) 'Browser sees one primary heading'
    Assert-Landing ($browserReport.experimentLinks -eq 10) 'Browser sees all ten experiment result links'
    Assert-Landing ($browserReport.brokenImages.Count -eq 0) 'Browser reports no broken images'
    Assert-Landing (-not $browserReport.desktopOverflow) 'Desktop page has no horizontal overflow'
    Assert-Landing (-not $browserReport.mobileOverflow) 'Mobile page has no horizontal overflow'
}

[pscustomobject]@{ Passed = $passes.Count; Failed = $failures.Count; Failures = $failures }
if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}
