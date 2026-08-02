[CmdletBinding()]
param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()
$checks = [System.Collections.Generic.List[string]]::new()

function Assert-Output {
    param([bool]$Condition, [string]$Message)
    if ($Condition) { $checks.Add($Message) } else { $failures.Add($Message) }
}

$experimentRoot = Join-Path $ProjectRoot 'experiments'
$corpusRoot = Join-Path $ProjectRoot 'source-extraction\saturation-how-software-fails-at-scale'
$directories = @(Get-ChildItem -LiteralPath $experimentRoot -Directory | Where-Object Name -Match '^experiment-(?:0[1-9]|10)-')
Assert-Output ($directories.Count -eq 10) 'Exactly ten numbered experiment directories exist'

$collectionPath = Join-Path $experimentRoot 'index.html'
Assert-Output (Test-Path -LiteralPath $collectionPath) 'Collection index exists'
if (Test-Path -LiteralPath $collectionPath) {
    $collectionHtml = Get-Content -LiteralPath $collectionPath -Raw
    $collectionLinks = [regex]::Matches($collectionHtml, 'href="(experiment-(?:0[1-9]|10)-[^"]+/index\.html)"')
    Assert-Output ($collectionLinks.Count -eq 10) 'Collection index links all ten experiments'
    foreach ($link in $collectionLinks) {
        Assert-Output (Test-Path -LiteralPath (Join-Path $experimentRoot $link.Groups[1].Value)) "Collection link resolves: $($link.Groups[1].Value)"
    }
}

foreach ($number in 1..10) {
    $id = '{0:D2}' -f $number
    $directory = @($directories | Where-Object Name -Like "experiment-$id-*")
    Assert-Output ($directory.Count -eq 1) "Experiment $id has exactly one directory"
    if ($directory.Count -ne 1) { continue }

    $path = $directory[0].FullName
    $indexPath = Join-Path $path 'index.html'
    $summaryPath = Join-Path $path 'experiment-summary.json'
    $reviewPath = Join-Path $path 'review.md'
    Assert-Output (Test-Path -LiteralPath $indexPath) "Experiment $id has index.html"
    Assert-Output (Test-Path -LiteralPath $summaryPath) "Experiment $id has experiment-summary.json"
    Assert-Output (Test-Path -LiteralPath $reviewPath) "Experiment $id has review.md"
    if (-not (Test-Path -LiteralPath $summaryPath)) { continue }

    try { $summary = Get-Content -LiteralPath $summaryPath -Raw | ConvertFrom-Json } catch { $failures.Add("Experiment $id summary JSON parses: $($_.Exception.Message)"); continue }
    Assert-Output ($summary.experimentId -eq $id) "Experiment $id summary ID matches directory"
    Assert-Output ($summary.outcome -eq 'complete') "Experiment $id records a complete outcome"
    Assert-Output ([bool]$summary.goodEnoughDefinition) "Experiment $id records a good-enough definition"
    Assert-Output ($summary.sourceSegmentCount -eq 1013) "Experiment $id records the complete shared segment count"
    Assert-Output (Test-Path -LiteralPath (Join-Path $path $summary.primaryOutput)) "Experiment $id primary output exists"

    if (Test-Path -LiteralPath $indexPath) {
        $html = Get-Content -LiteralPath $indexPath -Raw
        Assert-Output ($html.TrimEnd().EndsWith('</html>')) "Experiment $id HTML closes cleanly"
        Assert-Output ($html -match '<meta name="viewport"') "Experiment $id declares responsive viewport"
        Assert-Output ($html -notmatch "experiment-(?!$id-)(?:0[1-9]|10)-") "Experiment $id has no sibling experiment references"
        $refs = [regex]::Matches($html, '(?:src|href)="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
        foreach ($ref in $refs) {
            if ($ref -match '^(?:https?:|mailto:|#)') { continue }
            $clean = ($ref -split '#')[0]
            if (-not $clean) { continue }
            Assert-Output (Test-Path -LiteralPath (Join-Path $path $clean)) "Experiment $id local reference resolves: $clean"
        }
    }
}

$relations = Get-Content -LiteralPath (Join-Path $experimentRoot 'experiment-03-concept-map\relations.json') -Raw | ConvertFrom-Json
Assert-Output ($relations.Count -eq 20) 'Experiment 03 has 20 auditable relations'
Assert-Output (@($relations | Where-Object { -not $_.timestamp -or -not $_.evidence }).Count -eq 0) 'Every Experiment 03 relation has timestamp evidence'

$claims = Import-Csv -LiteralPath (Join-Path $experimentRoot 'experiment-08-claim-audit\claim-matrix.csv')
Assert-Output ($claims.Count -eq 13) 'Experiment 08 has 13 audited claims'
Assert-Output (@($claims | Where-Object { -not $_.assumption -or -not $_.challenge -or -not $_.verdict }).Count -eq 0) 'Every Experiment 08 claim has an assumption, challenge, and verdict'

$segmentScript = Get-Content -LiteralPath (Join-Path $experimentRoot 'experiment-10-transcript-navigator\segments.js') -Raw
$segmentJson = $segmentScript -replace '^window\.TRANSCRIPT_SEGMENTS=', '' -replace ';\s*$', ''
$navigatorSegments = $segmentJson | ConvertFrom-Json -NoEnumerate
Assert-Output ($navigatorSegments.Count -eq 1013) 'Experiment 10 embeds all 1013 normalized segments'
Assert-Output (@($navigatorSegments | Where-Object { $_[3] -eq $true }).Count -eq 10) 'Experiment 10 preserves all 10 recovery flags'

$chapters = Get-Content -LiteralPath (Join-Path $experimentRoot 'experiment-10-transcript-navigator\chapters.json') -Raw | ConvertFrom-Json
Assert-Output ($chapters.Count -eq 8) 'Experiment 10 defines eight chapters'
Assert-Output ($chapters[0].start -eq 0 -and $chapters[-1].end -ge 3054) 'Experiment 10 chapter coverage spans the media duration'

$expectedHash = (Get-Content -LiteralPath (Join-Path $corpusRoot 'raw-before-corpus.sha256') -Raw).Trim().ToUpperInvariant()
$actualHash = (Get-FileHash -LiteralPath (Join-Path $corpusRoot 'transcript.raw.jsonl') -Algorithm SHA256).Hash
Assert-Output ($expectedHash -eq $actualHash) 'Raw production transcript hash is unchanged after corpus and experiment generation'

$validation = Get-Content -LiteralPath (Join-Path $corpusRoot 'validation-report.json') -Raw | ConvertFrom-Json
Assert-Output ($validation.Succeeded -eq $true) 'Shared corpus validation report succeeded'
Assert-Output ($validation.SegmentCount -eq 1013) 'Shared corpus validation reports 1013 segments'
Assert-Output ($validation.RecoveredRecordCount -eq 10) 'Shared corpus validation reports 10 recovered malformed-quote records'

[pscustomobject]@{
    Passed = $checks.Count
    Failed = $failures.Count
    Checks = $checks
    Failures = $failures
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}
