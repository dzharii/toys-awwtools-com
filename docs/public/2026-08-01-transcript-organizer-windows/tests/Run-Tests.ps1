[CmdletBinding()]
param([Parameter()][switch] $CI)

$root = Split-Path -Parent $PSScriptRoot
$projectPester = Get-ChildItem -LiteralPath (Join-Path $root 'tools\Pester') -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
if ($projectPester) {
    Import-Module (Join-Path $projectPester.FullName 'Pester.psd1') -Force
}
$pester = Get-Module Pester | Sort-Object Version -Descending | Select-Object -First 1
if (-not $pester) {
    $pester = Get-Module -ListAvailable Pester | Sort-Object Version -Descending | Select-Object -First 1
}
if (-not $pester -or $pester.Version -lt [version]'5.5.0') {
    throw 'Pester 5.5 or later is required. Run scripts/Install-DevelopmentDependencies.ps1.'
}

$resultDirectory = Join-Path $root 'artifacts\test-results'
$coverageDirectory = Join-Path $root 'artifacts\coverage'
$null = New-Item -ItemType Directory -Path $resultDirectory,$coverageDirectory -Force
$configuration = New-PesterConfiguration
$configuration.Run.Path = Join-Path $root 'tests'
$configuration.Run.PassThru = $true
$configuration.Output.Verbosity = if ($CI) { 'Detailed' } else { 'Normal' }
$configuration.TestResult.Enabled = $true
$configuration.TestResult.OutputPath = Join-Path $resultDirectory 'pester-results.xml'
$configuration.CodeCoverage.Enabled = $true
$configuration.CodeCoverage.Path = @(
    (Join-Path $root 'module\TranscriptOrganizer.psm1')
    (Join-Path $root 'module\Private\*.ps1')
    (Join-Path $root 'module\Public\*.ps1')
)
$configuration.CodeCoverage.OutputPath = Join-Path $coverageDirectory 'coverage.xml'
$configuration.CodeCoverage.OutputFormat = 'JaCoCo'
$result = Invoke-Pester -Configuration $configuration
if ($result.Result -ne 'Passed') { exit 1 }
