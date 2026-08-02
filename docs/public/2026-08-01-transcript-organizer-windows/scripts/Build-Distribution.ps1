[CmdletBinding()]
param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectPath = (Resolve-Path -LiteralPath $ProjectRoot).Path
$distRoot = Join-Path $projectPath 'dist'
$packageVersion = '001'
$moduleVersion = '0.0.1'
$packageName = "transcript-organizer-windows-version-$packageVersion"
$packagePath = Join-Path $distRoot $packageName
$zipPath = Join-Path $distRoot "$packageName.zip"
$hashPath = "$zipPath.sha256"

# Every repository file permitted in the end-user package is named here.
# Build, test, experiment, screenshot, and dependency-management scripts are deliberately absent.
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

New-Item -ItemType Directory -Path $distRoot -Force | Out-Null
$resolvedDist = (Resolve-Path -LiteralPath $distRoot).Path.TrimEnd('\')
$legacyName = 'transcript-organizer-windows'
$replacementTargets = @(
    $packagePath
    $zipPath
    $hashPath
    (Join-Path $distRoot $legacyName)
    (Join-Path $distRoot "$legacyName.zip")
    (Join-Path $distRoot "$legacyName.zip.sha256")
)

foreach ($target in $replacementTargets) {
    if (-not (Test-Path -LiteralPath $target)) { continue }
    $resolvedTarget = (Resolve-Path -LiteralPath $target).Path
    if (-not $resolvedTarget.StartsWith($resolvedDist + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to replace an artifact outside the distribution directory: $resolvedTarget"
    }
    Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}

New-Item -ItemType Directory -Path $packagePath -Force | Out-Null
foreach ($relativePath in $applicationFileAllowList) {
    $sourcePath = Join-Path $projectPath $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Allow-listed application file does not exist: $relativePath"
    }
    $destinationPath = Join-Path $packagePath $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
}

$packagedManualPath = Join-Path $packagePath 'docs\manual\index.html'
$manual = [IO.File]::ReadAllText($packagedManualPath)
$manual = $manual.Replace('<a href="../../index.html">Project overview</a>', '<a href="../../README.md">Package README</a>')
$manual = $manual.Replace('<a href="../../experiments/index.html">Experiment results</a>', '<a href="../../README.md">Package contents</a>')
$manual = $manual.Replace('<a href="../../dist/transcript-organizer-windows-version-001.zip">Download version 001</a>', '<a href="../../README.md">Version 001</a>')
$manual = $manual.Replace('<a href="../../index.html">Overview and quick start</a>', '<a href="../../README.md">Package quick start</a>')
$manual = $manual.Replace('<a href="../../experiments/index.html">Experiment collection</a>', '<a href="../../README.md">Package contents</a>')
$manual = $manual.Replace('<a href="../../dist/transcript-organizer-windows-version-001.zip">Download version 001</a>', '<a href="../../README.md">Version 001</a>')
$manual = $manual.Replace('<a href="../../experiments/index.html">Experiments</a>', '<a href="../../README.md">Package contents</a>')
$manual = $manual.Replace('href="../../prompts/2026-08-01_create-faithful-video-companion/SKILL.md"', 'href="https://toys.awwtools.com/public/2026-08-01-transcript-organizer-windows/prompts/2026-08-01_create-faithful-video-companion/SKILL.md"')
$manual = $manual.Replace('href="../../prompts/2026-08-01_build-researched-video-field-guide/SKILL.md"', 'href="https://toys.awwtools.com/public/2026-08-01-transcript-organizer-windows/prompts/2026-08-01_build-researched-video-field-guide/SKILL.md"')
$manual = $manual.Replace('href="../../prompts/2026-08-01_build-searchable-transcript-navigator/SKILL.md"', 'href="https://toys.awwtools.com/public/2026-08-01-transcript-organizer-windows/prompts/2026-08-01_build-searchable-transcript-navigator/SKILL.md"')
[IO.File]::WriteAllText($packagedManualPath, $manual, [Text.UTF8Encoding]::new($false))

$readme = @'
# Transcript Organizer for Windows — version 001

This distribution contains only the Transcript Organizer application, its PowerShell module, and runtime documentation. Repository build, test, experiment, screenshot, and development scripts are not included.

## Requirements

- Windows 10 or Windows 11 x64
- PowerShell 7 or later
- FFmpeg and FFprobe, with FFmpeg compiled with the `whisper` filter
- `ggml-model-whisper-medium.en-q5_0.bin` in this directory or the `models\` directory.

## First run

Open PowerShell 7 in this directory:

    pwsh -File .\Invoke-TranscriptOrganizer.ps1 '.\video.webm' -DryRun
    pwsh -File .\Invoke-TranscriptOrganizer.ps1 '.\video.webm'

The first run creates `video-transcript`. Later runs preserve it and create `video-transcript_001`, `_002`, and later available suffixes. Every folder contains JSON evidence, readable text, SRT subtitles, metadata, validation, and sampled frames.

Open `docs\manual\index.html` for configuration, explicit FFmpeg paths, corpus export, VAD, batching, and troubleshooting.

## Package contents

- `Invoke-TranscriptOrganizer.ps1`: one-argument local-file command-line entry point and editable defaults.
- `module\`: PowerShell module version 0.0.1.
- `docs\`: local user manual and error reference.
- `assets\`: local styles and favicon required by the manual.
- `distribution-manifest.json`: byte counts and SHA-256 hashes for this package.

## Package boundaries

FFmpeg, FFprobe, Whisper models, media, project tests, experiments, reusable agent skills, and repository maintenance scripts are not redistributed. Obtain third-party dependencies from sources you trust and validate FFmpeg support with:

    ffmpeg -hide_banner -help filter=whisper
'@
[IO.File]::WriteAllText((Join-Path $packagePath 'README.md'), $readme, [Text.UTF8Encoding]::new($false))

$files = Get-ChildItem -LiteralPath $packagePath -Recurse -File | Sort-Object FullName
$manifest = [ordered]@{
    package = $packageName
    packageVersion = $packageVersion
    moduleVersion = $moduleVersion
    builtAtUtc = [DateTimeOffset]::UtcNow.ToString('o')
    platform = 'Windows x64'
    runtime = 'PowerShell 7+'
    sourceAllowList = @($applicationFileAllowList | ForEach-Object { $_.Replace('\', '/') })
    generatedFiles = @('README.md', 'distribution-manifest.json')
    excluded = @('Repository maintenance scripts', 'tests', 'experiments', 'reusable agent skill prompts', 'FFmpeg and FFprobe binaries', 'Whisper model files', 'media', 'source extraction data', 'development artifacts')
    files = @($files | ForEach-Object {
        [ordered]@{
            path = [IO.Path]::GetRelativePath($packagePath, $_.FullName).Replace('\', '/')
            bytes = $_.Length
            sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        }
    })
}
[IO.File]::WriteAllText((Join-Path $packagePath 'distribution-manifest.json'), ($manifest | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))

Compress-Archive -LiteralPath $packagePath -DestinationPath $zipPath -CompressionLevel Optimal
$zipHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
[IO.File]::WriteAllText($hashPath, "$zipHash  $packageName.zip`r`n", [Text.UTF8Encoding]::new($false))

[pscustomobject]@{
    PackageVersion = $packageVersion
    ModuleVersion = $moduleVersion
    PackageDirectory = $packagePath
    ZipPath = $zipPath
    ZipBytes = (Get-Item -LiteralPath $zipPath).Length
    ZipSha256 = $zipHash
    FileCount = (Get-ChildItem -LiteralPath $packagePath -Recurse -File).Count
}
