[CmdletBinding()]
param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$failures = [Collections.Generic.List[string]]::new()
$passes = [Collections.Generic.List[string]]::new()

function Assert-Package([bool]$Condition, [string]$Message) {
    if ($Condition) { $passes.Add($Message) } else { $failures.Add($Message) }
}

$packageVersion = '001'
$moduleVersion = '0.0.1'
$packageName = "transcript-organizer-windows-version-$packageVersion"
$distRoot = Join-Path $ProjectRoot 'dist'
$packagePath = Join-Path $distRoot $packageName
$zipPath = Join-Path $distRoot "$packageName.zip"
$hashPath = "$zipPath.sha256"
$applicationFileAllowList = @(
    'Invoke-TranscriptOrganizer.ps1'
    'module\TranscriptOrganizer.psd1'
    'module\TranscriptOrganizer.psm1'
    'module\Private\00.Contracts.ps1'
    'module\Private\10.Pure.ps1'
    'module\Private\20.IO.ps1'
    'module\Public\00.Api.ps1'
    'module\Public\10.Invoke.ps1'
    'module\Public\20.Corpus.ps1'
    'docs\manual\index.html'
    'docs\error-codes.md'
    'assets\documentation.css'
    'assets\favicon.svg'
)
$generatedFiles = @('README.md', 'distribution-manifest.json')
$expectedFiles = @($applicationFileAllowList + $generatedFiles | Sort-Object)

Assert-Package (Test-Path -LiteralPath $packagePath -PathType Container) 'Version 001 distribution directory exists'
Assert-Package (Test-Path -LiteralPath $zipPath -PathType Leaf) 'Version 001 distribution ZIP exists'
Assert-Package (Test-Path -LiteralPath $hashPath -PathType Leaf) 'Version 001 ZIP checksum exists'
Assert-Package (-not (Test-Path -LiteralPath (Join-Path $distRoot 'transcript-organizer-windows'))) 'Legacy unversioned distribution directory is absent'
Assert-Package (-not (Test-Path -LiteralPath (Join-Path $distRoot 'transcript-organizer-windows.zip'))) 'Legacy unversioned ZIP is absent'

$actualFiles = @()
if (Test-Path -LiteralPath $packagePath) {
    $actualFiles = @(Get-ChildItem -LiteralPath $packagePath -Recurse -File | ForEach-Object {
        [IO.Path]::GetRelativePath($packagePath, $_.FullName)
    } | Sort-Object)
}
$inventoryDifference = @(Compare-Object -ReferenceObject $expectedFiles -DifferenceObject $actualFiles)
Assert-Package ($inventoryDifference.Count -eq 0) 'Package inventory equals the explicit application allow list plus generated metadata'
foreach ($relativePath in $expectedFiles) {
    Assert-Package ($actualFiles -contains $relativePath) "Allowed package file exists: $relativePath"
}

$repositoryOnlyNames = @(
    'Build-Distribution.ps1'
    'Build-SaturationExperiments.ps1'
    'Install-DevelopmentDependencies.ps1'
    'Test-Distribution.ps1'
    'Test-ExperimentOutputs.ps1'
    'Test-ProjectLandingPage.ps1'
    'Capture-ProjectScreenshots.cjs'
    'Review-StaticSite.cjs'
    'PROJECT-README.md'
)
foreach ($name in $repositoryOnlyNames) {
    Assert-Package (@(Get-ChildItem -LiteralPath $packagePath -Recurse -File -Filter $name -ErrorAction SilentlyContinue).Count -eq 0) "Repository-only file is excluded: $name"
}
foreach ($directory in @('scripts', 'src', 'tests', 'experiments', 'prompts', 'artifacts', 'source-extraction')) {
    Assert-Package (-not (Test-Path -LiteralPath (Join-Path $packagePath $directory))) "Repository-only directory is excluded: $directory"
}

$prohibited = @(Get-ChildItem -LiteralPath $packagePath -Recurse -File | Where-Object { $_.Extension -in @('.webm','.mp4','.wav','.bin','.exe') })
Assert-Package ($prohibited.Count -eq 0) 'Distribution excludes media, models, and native executables'

$moduleManifest = Import-PowerShellDataFile -LiteralPath (Join-Path $packagePath 'module\TranscriptOrganizer.psd1')
Assert-Package ($moduleManifest.ModuleVersion -eq $moduleVersion) 'PowerShell module version is 0.0.1'
$launcher = Get-Content -LiteralPath (Join-Path $packagePath 'Invoke-TranscriptOrganizer.ps1') -Raw
Assert-Package ($launcher -match "module\\TranscriptOrganizer\.psd1") 'Root launcher imports the flattened module path'
Assert-Package ($launcher -notmatch 'src\\|scripts\\Invoke-TranscriptOrganizer') 'Root launcher contains no obsolete application paths'
$launcherCommand = Get-Command -Name (Join-Path $packagePath 'Invoke-TranscriptOrganizer.ps1')
foreach ($parameter in @('InputPath','OutputFolder','WhisperModelPath','Overwrite','DryRun')) {
    Assert-Package ($launcherCommand.Parameters.ContainsKey($parameter)) "Launcher exposes required parameter: $parameter"
}
foreach ($parameter in @('InputKind','OutputPath','Format','ModelPath','QueueSeconds','TimeoutSeconds','InputDurationSeconds','Check','ListInputDevices','FFmpegPath','FFprobePath')) {
    Assert-Package (-not $launcherCommand.Parameters.ContainsKey($parameter)) "Launcher hides obsolete or configured parameter: $parameter"
}
Assert-Package ($launcher -match 'USER-EDITABLE DEFAULT SETTINGS') 'Launcher contains one visible editable defaults block'
$packageReadme = Get-Content -LiteralPath (Join-Path $packagePath 'README.md') -Raw
Assert-Package ($packageReadme -match 'version 001') 'Package README identifies version 001'
Assert-Package ($packageReadme -match "pwsh -File \.\\Invoke-TranscriptOrganizer\.ps1 '\.\\video\.webm'") 'Package README documents the one-argument root launcher'
Assert-Package ($packageReadme -match 'video-transcript_001') 'Package README documents preserved suffixed output folders'
$packagedManual = Get-Content -LiteralPath (Join-Path $packagePath 'docs\manual\index.html') -Raw
Assert-Package ($packagedManual -notmatch '\.\./\.\./(?:index\.html|experiments/|dist/)') 'Packaged manual contains no links to omitted publication files'
Assert-Package ($packagedManual -match 'href="\.\./\.\./README\.md"') 'Packaged manual links to its local package README'
foreach ($skillName in @('2026-08-01_create-faithful-video-companion','2026-08-01_build-researched-video-field-guide','2026-08-01_build-searchable-transcript-navigator')) {
    Assert-Package ($packagedManual -match "https://toys\.awwtools\.com/public/2026-08-01-transcript-organizer-windows/prompts/$skillName/SKILL\.md") "Packaged manual links to the published skill: $skillName"
}

$manifestPath = Join-Path $packagePath 'distribution-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
Assert-Package ($manifest.package -eq $packageName) 'Distribution manifest records the versioned package name'
Assert-Package ($manifest.packageVersion -eq $packageVersion) 'Distribution manifest records package version 001'
Assert-Package ($manifest.moduleVersion -eq $moduleVersion) 'Distribution manifest records module version 0.0.1'
$expectedSourceList = @($applicationFileAllowList | ForEach-Object { $_.Replace('\', '/') } | Sort-Object)
$manifestSourceList = @($manifest.sourceAllowList | Sort-Object)
Assert-Package (@(Compare-Object $expectedSourceList $manifestSourceList).Count -eq 0) 'Manifest source allow list matches the build contract'
Assert-Package (@(Compare-Object @('README.md','distribution-manifest.json') @($manifest.generatedFiles | Sort-Object)).Count -eq 0) 'Manifest identifies only the two generated files'

$manifestPayloadFiles = @($expectedFiles | Where-Object { $_ -ne 'distribution-manifest.json' } | ForEach-Object { $_.Replace('\', '/') } | Sort-Object)
$recordedPayloadFiles = @($manifest.files.path | Sort-Object)
Assert-Package (@(Compare-Object $manifestPayloadFiles $recordedPayloadFiles).Count -eq 0) 'Manifest hash inventory covers every non-self-referential package payload'
foreach ($entry in $manifest.files) {
    $filePath = Join-Path $packagePath ($entry.path.Replace('/', '\'))
    Assert-Package (Test-Path -LiteralPath $filePath) "Manifest path exists: $($entry.path)"
    if (Test-Path -LiteralPath $filePath) {
        Assert-Package ((Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash -eq $entry.sha256) "Manifest hash matches: $($entry.path)"
    }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $archiveFiles = @($archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName.Replace('\', '/') } | Sort-Object)
    $expectedArchiveFiles = @($expectedFiles | ForEach-Object { "$packageName/$($_.Replace('\', '/'))" } | Sort-Object)
    Assert-Package (@(Compare-Object $expectedArchiveFiles $archiveFiles).Count -eq 0) 'ZIP contains the exact package inventory under one versioned top-level directory'
    Assert-Package (@($archiveFiles | Where-Object { $_ -match '\.\.|^[\\/]' }).Count -eq 0) 'ZIP contains no unsafe paths'
} finally {
    $archive.Dispose()
}

$expectedHash = ((Get-Content -LiteralPath $hashPath -Raw).Trim() -split '\s+')[0]
$actualHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
Assert-Package ($expectedHash -eq $actualHash) 'ZIP checksum sidecar matches the archive'

[pscustomobject]@{ Passed = $passes.Count; Failed = $failures.Count; Failures = $failures }
if ($failures.Count) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}
