BeforeAll {
    $script:Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $script:ManifestPath = Join-Path $script:Root 'module\TranscriptOrganizer.psd1'
    Import-Module $script:ManifestPath -Force
    $script:PreferredBin = 'C:\Users\home\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin'
    $script:PreferredFFmpeg = Join-Path $script:PreferredBin 'ffmpeg.exe'
    $script:PreferredFFprobe = Join-Path $script:PreferredBin 'ffprobe.exe'
    $script:Configuration = if ((Test-Path -LiteralPath $script:PreferredFFmpeg) -and (Test-Path -LiteralPath $script:PreferredFFprobe)) {
        New-TranscriptOrganizerConfiguration -ProjectDirectory $script:Root -FFmpegPath $script:PreferredFFmpeg -FFprobePath $script:PreferredFFprobe
    }
    else {
        New-TranscriptOrganizerConfiguration -ProjectDirectory $script:Root
    }
}

Describe 'Bounded integration boundaries' {
    It 'validates the real runtime payload' {
        InModuleScope TranscriptOrganizer {
            $runtime = Test-TranscriptOrganizerRuntime
            $runtime.Succeeded | Should -BeTrue
            (Test-TranscriptOrganizerRuntimeResult $runtime).Succeeded | Should -BeTrue
        }
    }

    It 'captures stdout, stderr, exit code, and duration from one harmless process' {
        InModuleScope TranscriptOrganizer -Parameters @{WorkingDirectory=$script:Root} {
            $result = Invoke-TranscriptOrganizerProcess -FilePath (Join-Path $PSHOME 'pwsh.exe') -ArgumentList @('-NoProfile','-Command','[Console]::Out.Write("out"); [Console]::Error.Write("err"); exit 7') -WorkingDirectory $WorkingDirectory -TimeoutSeconds 10
            $result.ExitCode | Should -Be 7
            $result.StandardOutput | Should -Be 'out'
            $result.StandardError | Should -Be 'err'
            $result.DurationMs | Should -BeGreaterThan 0
            (Test-TranscriptOrganizerProcessResult $result).Succeeded | Should -BeTrue
        }
    }

    It 'terminates a bounded process at its timeout' {
        InModuleScope TranscriptOrganizer -Parameters @{WorkingDirectory=$script:Root} {
            $result = Invoke-TranscriptOrganizerProcess -FilePath (Join-Path $PSHOME 'pwsh.exe') -ArgumentList @('-NoProfile','-Command','Start-Sleep -Seconds 5') -WorkingDirectory $WorkingDirectory -TimeoutSeconds 1
            $result.Succeeded | Should -BeFalse
            $result.TimedOut | Should -BeTrue
            $result.DurationMs | Should -BeLessThan 5000
        }
    }

    It 'reports real FFmpeg infrastructure precisely' {
        $environment = Test-TranscriptOrganizerEnvironment -Configuration $script:Configuration -IncludeModel
        $environment.FFmpegPath | Should -Not -BeNullOrEmpty
        $environment.FFprobePath | Should -Not -BeNullOrEmpty
        $environment.FFmpegVersion.FirstLine | Should -Match '^ffmpeg version'
        $environment.Model.Succeeded | Should -BeTrue
        if (-not $environment.Capability.Succeeded) {
            $environment.Errors | Should -Contain 'The installed FFmpeg build does not provide the required Whisper filter and core options.'
        }
    }

    It 'probes a two-second generated audio fixture and rejects a no-audio fixture' {
        $ffmpeg = $script:Configuration.Executables.FFmpeg
        $resolved = if (Test-Path -LiteralPath $ffmpeg -PathType Leaf) { [pscustomobject]@{Source=(Resolve-Path -LiteralPath $ffmpeg).Path} } else { Get-Command $ffmpeg -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1 }
        if (-not $resolved) { Set-ItResult -Skipped -Because 'FFmpeg is unavailable.'; return }
        $audioPath = Join-Path $TestDrive 'speech fixture.wav'
        $videoPath = Join-Path $TestDrive 'silent fixture.mp4'
        InModuleScope TranscriptOrganizer -Parameters @{Exe=$resolved.Source;Probe=$script:Configuration.Executables.FFprobe;Wd=$TestDrive;Audio=$audioPath;Video=$videoPath} {
            $audioCreate = Invoke-TranscriptOrganizerProcess -FilePath $Exe -ArgumentList @('-hide_banner','-nostdin','-loglevel','error','-f','lavfi','-i','sine=frequency=440:duration=2','-y',$Audio) -WorkingDirectory $Wd -TimeoutSeconds 15
            $videoCreate = Invoke-TranscriptOrganizerProcess -FilePath $Exe -ArgumentList @('-hide_banner','-nostdin','-loglevel','error','-f','lavfi','-i','color=c=black:s=160x120:d=2','-an','-y',$Video) -WorkingDirectory $Wd -TimeoutSeconds 15
            $audioCreate.Succeeded | Should -BeTrue
            $videoCreate.Succeeded | Should -BeTrue
            $probe = Resolve-TranscriptOrganizerCommand -Name $Probe
            (Test-TranscriptOrganizerAudioStream -FFprobePath $probe -InputPath $Audio -WorkingDirectory $Wd -TimeoutSeconds 10).Succeeded | Should -BeTrue
            (Test-TranscriptOrganizerAudioStream -FFprobePath $probe -InputPath $Video -WorkingDirectory $Wd -TimeoutSeconds 10).Succeeded | Should -BeFalse
        }
    }

    It 'exports a reusable corpus with metadata, subtitles, frames, and validation' {
        $ffmpeg = $script:Configuration.Executables.FFmpeg
        $resolved = if (Test-Path -LiteralPath $ffmpeg -PathType Leaf) { (Resolve-Path -LiteralPath $ffmpeg).Path } else { (Get-Command $ffmpeg -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1).Source }
        if (-not $resolved) { Set-ItResult -Skipped -Because 'FFmpeg is unavailable.'; return }
        $mediaPath = Join-Path $TestDrive 'corpus-fixture.mp4'
        $corpusPath = Join-Path $TestDrive 'corpus'
        $null = New-Item -ItemType Directory -Path $corpusPath -Force
        InModuleScope TranscriptOrganizer -Parameters @{Exe=$resolved;Wd=$TestDrive;Media=$mediaPath} {
            $created = Invoke-TranscriptOrganizerProcess -FilePath $Exe -ArgumentList @('-hide_banner','-nostdin','-loglevel','error','-f','lavfi','-i','color=c=navy:s=320x180:d=6','-f','lavfi','-i','sine=frequency=440:duration=6','-shortest','-y',$Media) -WorkingDirectory $Wd -TimeoutSeconds 20
            $created.Succeeded | Should -BeTrue
        }
        @(
            '{"start":0,"end":900,"text":"Capacity is finite."}',
            '{"start":900,"end":5900,"text":"Queues reveal saturation."}'
        ) | Set-Content -LiteralPath (Join-Path $corpusPath 'transcript.raw.jsonl') -Encoding utf8
        $result = Export-TranscriptOrganizerCorpus -InputPath $mediaPath -OutputFolder $corpusPath -Configuration $script:Configuration -ReuseExistingTranscript -Overwrite -FrameIntervalSeconds 5 -MaximumFrames 1 -TimeoutSeconds 30
        $result.Succeeded | Should -BeTrue
        $result.SegmentCount | Should -Be 2
        $result.VisualFrameCount | Should -Be 1
        foreach ($relativePath in @(
            'transcript.raw.jsonl',
            'transcript.segments.json',
            'transcript.txt',
            'transcript.srt',
            'media-metadata.json',
            'visual-index.json',
            'validation-report.json',
            'corpus-manifest.json'
        )) {
            Test-Path -LiteralPath (Join-Path $corpusPath $relativePath) -PathType Leaf | Should -BeTrue
        }
        (Get-Content -LiteralPath (Join-Path $corpusPath 'validation-report.json') -Raw | ConvertFrom-Json).Succeeded | Should -BeTrue
        (Get-Content -LiteralPath (Join-Path $corpusPath 'transcript.srt') -Raw) | Should -Match '00:00:00,900'
        Test-Path -LiteralPath (Join-Path $corpusPath 'frames\frame-000000000ms.jpg') | Should -BeTrue
    }

    It 'runs a bounded real file-only dry-run without creating output' {
        $outputFolder = Join-Path $TestDrive 'smoke-transcript'
        $launcher = Join-Path $script:Root 'Invoke-TranscriptOrganizer.ps1'
        $inputPath = Join-Path $script:Root 'Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm'
        $result = & $launcher $inputPath -OutputFolder $outputFolder -DryRun
        if ($result.Succeeded) {
            $result.DryRun | Should -BeTrue
            $result.ResolvedConfiguration.FFmpegPath | Should -Match 'ffmpeg\.exe$'
            $result.ResolvedConfiguration.FFprobePath | Should -Match 'ffprobe\.exe$'
            $result.TimeoutSeconds | Should -Be 20125
            $result.Transcription.Arguments | Should -Not -Contain '-t'
            $inputIndex = [array]::IndexOf($result.Transcription.Arguments,'-i')
            $inputIndex | Should -BeGreaterOrEqual 0
            $result.Transcription.Arguments[$inputIndex + 1] | Should -Be $inputPath
            Test-Path -LiteralPath $outputFolder | Should -BeFalse
        }
        else {
            $result.Error.Code | Should -Be 'TranscriptionFilterUnavailable'
        }
    }
}
