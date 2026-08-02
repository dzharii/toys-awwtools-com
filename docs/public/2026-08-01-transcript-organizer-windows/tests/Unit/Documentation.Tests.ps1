$discoveryRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Import-Module (Join-Path $discoveryRoot 'module\TranscriptOrganizer.psd1') -Force

BeforeAll {
    $script:Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $script:ManualPath = Join-Path $script:Root 'docs\manual\index.html'
    $script:ManifestPath = Join-Path $script:Root 'module\TranscriptOrganizer.psd1'
    $script:Manual = Get-Content -LiteralPath $script:ManualPath -Raw
}

Describe 'Static manual accuracy and accessibility' {
    It 'contains exactly one primary heading and a skip link' {
        ([regex]::Matches($script:Manual, '(?i)<h1\b')).Count | Should -Be 1
        $script:Manual | Should -Match 'class="skip"[^>]+href="#content"'
        $script:Manual | Should -Match '<main id="content">'
    }

    It 'contains no prohibited standalone word' {
        $script:Manual | Should -Not -Match '(?i)\bbelow\b'
    }

    It 'uses no remote assets or external hyperlinks' {
        $script:Manual | Should -Not -Match '(?i)(src|href)\s*=\s*["'']https?://'
        $script:Manual | Should -Not -Match '(?i)@import\s+url|url\(\s*["'']?https?://'
    }

    It 'has no backtick line continuation in examples' {
        $script:Manual | Should -Not -Match '`\s*(\r?\n)'
    }

    It 'references implemented public commands' {
        foreach ($command in @('New-TranscriptOrganizerConfiguration','New-TranscriptOrganizerRequest','Test-TranscriptOrganizerEnvironment','Invoke-TranscriptOrganizer','Invoke-TranscriptOrganizerBatch','Export-TranscriptOrganizerCorpus')) {
            $script:Manual | Should -Match ([regex]::Escape($command))
            Get-Command $command -Module TranscriptOrganizer | Should -Not -BeNullOrEmpty
        }
    }

    It 'uses valid local navigation targets' {
        $ids = @([regex]::Matches($script:Manual, '(?i)\bid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
        $targets = @([regex]::Matches($script:Manual, '(?i)href="#([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
        foreach ($target in $targets) { $ids | Should -Contain $target }
    }

    It 'links the three reusable workflow skills' {
        foreach ($skillName in @('2026-08-01_create-faithful-video-companion','2026-08-01_build-researched-video-field-guide','2026-08-01_build-searchable-transcript-navigator')) {
            $relativePath = "../../prompts/$skillName/SKILL.md"
            $script:Manual | Should -Match ([regex]::Escape(('href="' + $relativePath + '"')))
            Join-Path (Split-Path -Parent $script:ManualPath) $relativePath | Should -Exist
        }
    }

    It 'gives every exported command help synopsis text' {
        foreach ($command in Get-Command -Module TranscriptOrganizer) {
            (Get-Help $command.Name).Synopsis | Should -Not -BeNullOrEmpty
        }
    }
}

Describe 'Reusable agent skill packages' {
    BeforeAll {
        $script:SkillFolders = @(
            '2026-08-01_create-faithful-video-companion',
            '2026-08-01_build-researched-video-field-guide',
            '2026-08-01_build-searchable-transcript-navigator'
        )
        $script:RequiredSkillTerms = @(
            'corpus-manifest.json','media-metadata.json','transcript.raw.jsonl','transcript.segments.json',
            'transcript.txt','transcript.srt','transcription-result.json','validation-report.json','visual-index.json',
            'StartMilliseconds','EndMilliseconds','SourceLineNumber','RecoveredFromMalformedJson',
            '<source-stem>-transcript','workflow-summary.json','review.md','Definition of done'
        )
    }

    It 'contains exactly the three dated self-contained skills' {
        $folders = @(Get-ChildItem -LiteralPath (Join-Path $script:Root 'prompts') -Directory | Select-Object -ExpandProperty Name | Sort-Object)
        $folders | Should -Be @($script:SkillFolders | Sort-Object)
    }

    It 'provides valid metadata and the complete corpus contract in every skill' {
        foreach ($folderName in $script:SkillFolders) {
            $folder = Join-Path $script:Root "prompts\$folderName"
            $skillPath = Join-Path $folder 'SKILL.md'
            $agentPath = Join-Path $folder 'agents\openai.yaml'
            $skillPath | Should -Exist
            $agentPath | Should -Exist
            $skill = Get-Content -LiteralPath $skillPath -Raw
            $agent = Get-Content -LiteralPath $agentPath -Raw
            $name = [regex]::Match($skill, '(?m)^name:\s*(.+)$').Groups[1].Value.Trim()
            $name | Should -Match '^[a-z0-9-]{1,64}$'
            $agent | Should -Match ([regex]::Escape("Use `$$name"))
            $skill | Should -Not -Match 'TODO|D:\\2026-videos|experiment-0[12]|experiment-10'
            (Get-Content -LiteralPath $skillPath).Count | Should -BeLessThan 500
            foreach ($term in $script:RequiredSkillTerms) { $skill | Should -Match ([regex]::Escape($term)) }
        }
    }
}

Describe 'Repository source policy' {
    It 'contains no Invoke-Expression or direct process Start outside the wrapper' {
        $files = Get-ChildItem (Join-Path $script:Root 'module') -Recurse -File -Include '*.ps1','*.psm1'
        $source = $files | Get-Content -Raw
        ($source -join [Environment]::NewLine) | Should -Not -Match 'Invoke-Expression'
        $starts = @($files | Select-String -Pattern '\.Start\(\)')
        $starts.Count | Should -Be 1
        $starts[0].Path | Should -Be (Join-Path $script:Root 'module\Private\20.IO.ps1')
    }

    It 'contains no PowerShell backtick line continuation' {
        $sourceFiles = Get-ChildItem (Join-Path $script:Root 'module'),(Join-Path $script:Root 'scripts'),(Join-Path $script:Root 'tests'),(Join-Path $script:Root 'Invoke-TranscriptOrganizer.ps1') -Recurse -File -Include '*.ps1','*.psm1'
        foreach ($file in $sourceFiles) { (Get-Content $file.FullName -Raw) | Should -Not -Match '`\s*(\r?\n)' }
    }

    It 'contains the required implementation artifacts' {
        foreach ($path in @('README.md','module\TranscriptOrganizer.psd1','docs\manual\index.html','docs\implementation-checklist.md','docs\coding-agent-report.md','tests\Run-Tests.ps1')) {
            Join-Path $script:Root $path | Should -Exist
        }
    }
}

Describe 'Additional model and payload boundaries' {
    InModuleScope TranscriptOrganizer {
        It 'rejects missing and truncated models' {
            $missing = Test-TranscriptOrganizerModelFile -Path (Join-Path $TestDrive 'missing.bin') -MinimumLength 10
            $missing.Reason | Should -Be 'FileNotFound'
            [IO.File]::WriteAllBytes((Join-Path $TestDrive 'small.bin'), [byte[]](1,2,3))
            $small = Test-TranscriptOrganizerModelFile -Path (Join-Path $TestDrive 'small.bin') -MinimumLength 10
            $small.Reason | Should -Be 'FileTooSmall'
        }

        It 'validates a known model fixture hash and rejects mismatch' {
            $path = Join-Path $TestDrive 'model.bin'
            [IO.File]::WriteAllText($path, 'fixture')
            $hash = (Get-FileHash $path -Algorithm SHA256).Hash
            (Test-TranscriptOrganizerModelFile -Path $path -MinimumLength 1 -ExpectedSha256 $hash).Succeeded | Should -BeTrue
            (Test-TranscriptOrganizerModelFile -Path $path -MinimumLength 1 -ExpectedSha256 ('0' * 64)).Reason | Should -Be 'HashMismatch'
        }

        It 'rejects malformed transcription fallback state' {
            $value = [pscustomobject]@{Succeeded=$false;DryRun=$false;RequestId='id';InputPath='a';OutputFolder='b';RawTranscriptPath='b\transcript.raw.jsonl';WhisperModelPath='m';VadEnabled=$false;VadModelPath=$null;RequestedGpu=$false;UsedGpu=$false;UsedCpuFallback=$true;FFmpegPath='f';FFmpegVersion='v';FFmpegExitCode=1;DurationMs=1;Attempts=@();Error=[pscustomobject]@{Code='x'}}
            (Test-TranscriptOrganizerTranscriptionResult $value).Succeeded | Should -BeFalse
        }

        It 'rejects null, missing, and invalid contract values' {
            (Test-TranscriptOrganizerRuntimeResult $null).Succeeded | Should -BeFalse
            (Test-TranscriptOrganizerCapabilityResult ([pscustomobject]@{})).Succeeded | Should -BeFalse
            $model = [pscustomobject]@{Succeeded='yes';Reason='Unknown';Path='x';Length=-1;HashValidated='no'}
            (Test-TranscriptOrganizerModelResult $model).Succeeded | Should -BeFalse
            $process = [pscustomobject]@{Succeeded=$true;Cancelled=$true;TimedOut=$false;FilePath='x';Arguments=@();WorkingDirectory='x';ExitCode=0;StandardOutput='';StandardError='';StartedAtUtc=[datetimeoffset]::UtcNow;CompletedAtUtc=[datetimeoffset]::UtcNow;DurationMs=-1}
            (Test-TranscriptOrganizerProcessResult $process).Succeeded | Should -BeFalse
            $event = [pscustomobject]@{SchemaVersion=1;TimestampUtc='x';Level='Trace';EventName='x';OperationName='x';RequestId='x';OperationId='x';Outcome='Unknown';DurationMs=-1;Parameters=@{};ResultSummary=$null;Error=$null}
            (Test-TranscriptOrganizerTelemetryEvent $event).Succeeded | Should -BeFalse
        }

        It 'refuses automatic model download without a trusted hash before network access' {
            $model = [pscustomobject]@{Id='test';FileName='test.bin';Uri='https://example.invalid/test.bin';Sha256=$null;MinimumLength=1}
            { Install-TranscriptOrganizerModel -Model $model -DestinationDirectory $TestDrive } | Should -Throw '*trusted SHA-256*'
            Join-Path $TestDrive 'test.bin' | Should -Not -Exist
        }
    }
}
