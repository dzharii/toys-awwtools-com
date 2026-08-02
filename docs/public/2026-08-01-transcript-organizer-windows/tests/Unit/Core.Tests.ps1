$script:Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$script:ManifestPath = Join-Path $script:Root 'module\TranscriptOrganizer.psd1'
Import-Module $script:ManifestPath -Force

Describe 'Module and public configuration' {
    It 'imports the manifest and exports only the documented commands' {
        $expected = @(
            'Export-TranscriptOrganizerCorpus','Invoke-TranscriptOrganizer','Invoke-TranscriptOrganizerBatch',
            'New-TranscriptOrganizerConfiguration','New-TranscriptOrganizerRequest','Test-TranscriptOrganizerCapabilityResult',
            'Test-TranscriptOrganizerEnvironment','Test-TranscriptOrganizerModelResult','Test-TranscriptOrganizerProcessResult',
            'Test-TranscriptOrganizerRuntimeResult','Test-TranscriptOrganizerTelemetryEvent','Test-TranscriptOrganizerTranscriptionResult'
        )
        @(Get-Command -Module TranscriptOrganizer).Name | Sort-Object | Should -Be ($expected | Sort-Object)
    }

    It 'uses target-machine-safe defaults' {
        $configuration = New-TranscriptOrganizerConfiguration -ProjectDirectory $TestDrive
        $configuration.ProjectDirectory | Should -Be ([IO.Path]::GetFullPath($TestDrive))
        $configuration.RequiredModel.FileName | Should -Be 'ggml-model-whisper-medium.en-q5_0.bin'
        $configuration.Defaults.Language | Should -Be 'en'
        $configuration.Defaults.QueueSeconds | Should -Be 20
        $configuration.Defaults.UseGpu | Should -BeTrue
        $configuration.Defaults.AllowCpuFallback | Should -BeTrue
        $configuration.Defaults.EnableVad | Should -BeFalse
        $configuration.Defaults.MaxConcurrency | Should -Be 1
        $configuration.Defaults.TimeoutMultiplier | Should -Be 6
        $configuration.Defaults.MaximumTimeoutSeconds | Should -Be 86400
        $configuration.Executables.FFmpeg | Should -BeNullOrEmpty
    }

    It 'accepts authoritative explicit FFmpeg paths' {
        $configuration = New-TranscriptOrganizerConfiguration -ProjectDirectory $TestDrive -FFmpegPath 'C:\tools\ffmpeg.exe' -FFprobePath 'C:\tools\ffprobe.exe'
        $configuration.Executables.FFmpeg | Should -Be 'C:\tools\ffmpeg.exe'
        $configuration.Executables.FFprobe | Should -Be 'C:\tools\ffprobe.exe'
    }

    It 'exposes only the five product launcher parameters' {
        $root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
        $parameters = (Get-Command -Name (Join-Path $root 'Invoke-TranscriptOrganizer.ps1')).Parameters
        foreach ($name in @('InputPath','OutputFolder','WhisperModelPath','Overwrite','DryRun')) { $parameters.ContainsKey($name) | Should -BeTrue }
        foreach ($name in @('InputKind','OutputPath','Format','ModelPath','QueueSeconds','TimeoutSeconds','InputDurationSeconds','Check','ListInputDevices','FFmpegPath','FFprobePath')) { $parameters.ContainsKey($name) | Should -BeFalse }
    }

    It 'creates a file-only folder-oriented request' {
        $request = New-TranscriptOrganizerRequest -InputPath 'input.webm' -OutputFolder 'input-transcript' -WhisperModelPath 'model.bin'
        $request.OutputFolder | Should -Be 'input-transcript'
        $request.WhisperModelPath | Should -Be 'model.bin'
        $request.AllowCpuFallback | Should -BeTrue
        $request.PSObject.Properties.Name | Should -Not -Contain 'Format'
        $request.PSObject.Properties.Name | Should -Not -Contain 'InputKind'
        $request.PSObject.Properties.Name | Should -Not -Contain 'InputDurationSeconds'
    }

    It 'rejects contradictory GPU policy' {
        { New-TranscriptOrganizerRequest -InputPath 'input.webm' -OutputFolder out -RequireGpu -AllowCpuFallback $true } | Should -Throw
        { New-TranscriptOrganizerRequest -InputPath 'input.webm' -OutputFolder out -RequireGpu -UseGpu $false -AllowCpuFallback $false } | Should -Throw
    }

    It 'does not let VAD-only paths silently enable VAD' {
        { New-TranscriptOrganizerRequest -InputPath 'input.webm' -OutputFolder out -VadModelPath 'vad.bin' } | Should -Throw
    }
}

Describe 'Pure builders and policies' {
    InModuleScope TranscriptOrganizer {
        It 'generates the exact main-model search order and removes duplicates' {
            $project = 'C:\work'
            $items = Get-TranscriptOrganizerModelCandidates -ProjectDirectory $project -ModelDirectory 'C:\work\models' -FileNames @('project.bin','canonical.bin','PROJECT.bin')
            $items | Should -Be @('C:\work\project.bin','C:\work\models\project.bin','C:\work\canonical.bin','C:\work\models\canonical.bin')
        }

        It 'treats an explicit model path as the only candidate' {
            $items = Get-TranscriptOrganizerModelCandidates -ProjectDirectory 'C:\work' -ModelDirectory 'C:\work\models' -FileNames @('a.bin') -ExplicitPath '.\chosen.bin'
            $items | Should -Be @('C:\work\chosen.bin')
        }

        It 'calculates conservative duration-based timeouts' {
            Get-TranscriptOrganizerAutomaticTimeoutSeconds -MediaDurationSeconds 3054.128 | Should -Be 20125
            Get-TranscriptOrganizerAutomaticTimeoutSeconds -MediaDurationSeconds 2 | Should -Be 7200
            Get-TranscriptOrganizerAutomaticTimeoutSeconds -MediaDurationSeconds 20000 | Should -Be 86400
            Get-TranscriptOrganizerAutomaticTimeoutSeconds -MediaDurationSeconds $null | Should -Be 21600
        }

        It 'allocates deterministic sibling output folder suffixes' {
            $input = Join-Path $TestDrive 'video.webm'
            [IO.File]::WriteAllText($input,'fixture')
            $base = Join-Path $TestDrive 'video-transcript'
            New-Item -ItemType Directory -Path $base | Out-Null
            New-Item -ItemType Directory -Path ($base + '_001') | Out-Null
            Resolve-TranscriptOrganizerOutputFolderPath -InputPath $input -WorkingDirectory $TestDrive | Should -Be ($base + '_002')
            Resolve-TranscriptOrganizerOutputFolderPath -InputPath $input -WorkingDirectory $TestDrive -Overwrite | Should -Be $base
        }

        It 'escapes representative Windows filter paths exactly once' {
            ConvertTo-TranscriptOrganizerFilterValue -Value "C:\Project Files\user's\model.bin" | Should -Be "C\:/Project Files/user\'s/model.bin"
            ConvertTo-TranscriptOrganizerFilterValue -Value 'C\:/already/model.bin' | Should -Be 'C\:/already/model.bin'
        }

        It 'builds deterministic options without VAD by default' {
            $options = New-TranscriptOrganizerWhisperOptions -WhisperModelPath 'C:\m.bin' -Language en -QueueSeconds 10.5 -UseGpu $true -GpuDevice 0 -DestinationPath 'C:\out file.jsonl'
            @($options.Keys) | Should -Be @('model','language','queue','use_gpu','gpu_device','destination','format')
            $options.queue | Should -Be '10.5'
            $options.use_gpu | Should -Be 'true'
            $options.model | Should -Be "'C\:/m.bin'"
            $options.destination | Should -Be "'C\:/out file.jsonl'"
            $options.Contains('vad_model') | Should -BeFalse
        }

        It 'adds VAD and max length options only when supplied' {
            $options = New-TranscriptOrganizerWhisperOptions -WhisperModelPath 'm.bin' -Language en -QueueSeconds 10 -UseGpu $false -GpuDevice 0 -DestinationPath 'o.jsonl' -MaxLength 42 -VadModelPath 'v.bin' -VadThreshold 0.4 -VadMinimumSpeechSeconds 0.2 -VadMinimumSilenceSeconds 0.8
            @($options.Keys) | Should -Be @('model','language','queue','use_gpu','gpu_device','destination','format','max_len','vad_model','vad_threshold','vad_min_speech_duration','vad_min_silence_duration')
            $options.vad_threshold | Should -Be '0.4'
            $options.vad_min_silence_duration | Should -Be '0.8'
        }

        It 'preserves preprocessing order and appends Whisper' {
            $pre = New-TranscriptOrganizerPreprocessingFilters -AdditionalFilters @('highpass=f=80','lowpass=f=8000')
            $pre | Should -Be @('highpass=f=80','lowpass=f=8000','aformat=sample_fmts=fltp:sample_rates=16000:channel_layouts=mono')
            $options = [ordered]@{model='m.bin';format='text'}
            New-TranscriptOrganizerFilterExpression -WhisperOptions $options -PreprocessingFilters $pre | Should -Be 'highpass=f=80,lowpass=f=8000,aformat=sample_fmts=fltp:sample_rates=16000:channel_layouts=mono,whisper=model=m.bin:format=text'
        }

        It 'builds native argument boundaries without truncating the input' {
            $arguments = New-TranscriptOrganizerFFmpegArguments -InputArguments @('-i','C:\input files\a.webm') -FilterExpression 'whisper=model=a:destination=b'
            $arguments | Should -Not -Contain '-t'
            $arguments[($arguments.IndexOf('-i')+1)] | Should -Be 'C:\input files\a.webm'
            $arguments[($arguments.IndexOf('-af')+1)] | Should -Be 'whisper=model=a:destination=b'
            $arguments[-1] | Should -Be 'NUL'
        }

        It 'formats a diagnostic command without changing argument execution' {
            $text = Format-TranscriptOrganizerDiagnosticCommand -FilePath 'C:\Program Files\ffmpeg.exe' -ArgumentList @('-i','C:\a b.wav','','token=secret')
            $text | Should -Match '^"C:\\Program Files\\ffmpeg.exe"'
            $text | Should -Match '"C:\\a b.wav"'
            $text | Should -Match '""'
            $text | Should -Not -Match 'secret'
        }

        It 'classifies only recognized GPU initialization failures' {
            Test-TranscriptOrganizerGpuFailure -StandardError 'CUDA failed to initialize device' | Should -BeTrue
            Test-TranscriptOrganizerGpuFailure -StandardError 'ggml_cuda: out of memory' | Should -BeTrue
            Test-TranscriptOrganizerGpuFailure -StandardError 'failed to load model: CUDA-model.bin' | Should -BeFalse
            Test-TranscriptOrganizerGpuFailure -StandardError 'output file already exists' | Should -BeFalse
        }

        It 'selects CPU-only and preferred policies deterministically' {
            $cpu = Get-TranscriptOrganizerGpuPolicyDecision -UseGpu $false -RequireGpu $false -AllowCpuFallback $false -FilterHasGpuOption $true -GpuDetected $true
            $cpu.StartOnCpu | Should -BeTrue
            $cpu.AttemptGpu | Should -BeFalse
            $preferred = Get-TranscriptOrganizerGpuPolicyDecision -UseGpu $true -RequireGpu $false -AllowCpuFallback $true -FilterHasGpuOption $true -GpuDetected $false
            $preferred.AttemptGpu | Should -BeTrue
            $preferred.MayFallback | Should -BeTrue
        }
    }
}

Describe 'Capability parsing, contracts, and telemetry' {
    InModuleScope TranscriptOrganizer {
        BeforeAll {
            $script:HelpText = @'
Filter whisper
  model             <string>
  language          <string>
  queue             <duration>
  destination       <string>
  format            <string>
  use_gpu           <boolean>
  gpu_device        <int>
  vad_model         <string>
  max_len           <int>
'@
        }

        It 'parses required and optional filter capabilities' {
            $result = ConvertFrom-TranscriptOrganizerWhisperHelp -ExitCode 0 -Output $script:HelpText
            $result.Succeeded | Should -BeTrue
            $result.HasGpuOption | Should -BeTrue
            $result.HasVadOption | Should -BeTrue
            (Test-TranscriptOrganizerCapabilityResult $result).Succeeded | Should -BeTrue
        }

        It 'rejects malformed capability output' {
            $result = ConvertFrom-TranscriptOrganizerWhisperHelp -ExitCode 0 -Output 'Filter whisper'
            $result.Succeeded | Should -BeFalse
        }

        It 'validates success and failure runtime invariants' {
            $valid = [pscustomobject]@{Succeeded=$true;Errors=@();Version=[version]'7.4';Edition='Core';Is64BitProcess=$true;IsWindows=$true}
            (Test-TranscriptOrganizerRuntimeResult $valid).Succeeded | Should -BeTrue
            $valid.Errors = @('contradiction')
            (Test-TranscriptOrganizerRuntimeResult $valid).Succeeded | Should -BeFalse
        }

        It 'rejects process exit-code drift' {
            $process = [pscustomobject]@{Succeeded=$true;Cancelled=$false;TimedOut=$false;FilePath='x';Arguments=@();WorkingDirectory='C:\';ExitCode=1;StandardOutput='';StandardError='';StartedAtUtc=[datetimeoffset]::UtcNow;CompletedAtUtc=[datetimeoffset]::UtcNow;DurationMs=1}
            (Test-TranscriptOrganizerProcessResult $process).Succeeded | Should -BeFalse
        }

        It 'redacts credentials and query strings in telemetry' {
            $event = New-TranscriptOrganizerTelemetryEvent -Level Information -EventName Test -OperationName Test -RequestId id -OperationId op -Outcome Started -Parameters @{Uri='https://user:pass@example.test/a?token=abc';Password='open-sesame'}
            $json = $event | ConvertTo-Json -Depth 10 -Compress
            $json | Should -Not -Match 'user:pass|abc|open-sesame'
            $json | Should -Match '<redacted'
            (Test-TranscriptOrganizerTelemetryEvent $event).Succeeded | Should -BeTrue
        }
    }
}

Describe 'Shared corpus transformations' {
    InModuleScope TranscriptOrganizer {
        BeforeAll {
            $script:CorpusLines = @(
                '{"start":7,"end":3367,"text":" First segment "}',
                '{"start":3367,"end":5567,"text":"Second segment"}'
            )
        }

        It 'normalizes independent JSON Lines with millisecond relationships' {
            $segments = ConvertFrom-TranscriptOrganizerJsonLines -Lines $script:CorpusLines
            $segments.Count | Should -Be 2
            $segments[0].Index | Should -Be 1
            $segments[0].StartMilliseconds | Should -Be 7
            $segments[0].DurationMilliseconds | Should -Be 3360
            $segments[0].Text | Should -Be 'First segment'
        }

        It 'rejects malformed JSON Lines and invalid ranges' {
            { ConvertFrom-TranscriptOrganizerJsonLines -Lines @('{bad') } | Should -Throw '*line 1*invalid JSON*'
            { ConvertFrom-TranscriptOrganizerJsonLines -Lines @('{"start":9,"end":2,"text":"bad"}') } | Should -Throw '*invalid time range*'
        }

        It 'recovers only the exact FFmpeg record shape when explicitly enabled' {
            $quoted = '{"start":10,"end":20,"text":"He said, "hello"."}'
            { ConvertFrom-TranscriptOrganizerJsonLines -Lines @($quoted) } | Should -Throw '*invalid JSON*'
            $segments = ConvertFrom-TranscriptOrganizerJsonLines -Lines @($quoted) -RecoverBackendTextQuotes
            $segments[0].Text | Should -Be 'He said, "hello".'
            $segments[0].SourceLineNumber | Should -Be 1
            $segments[0].RecoveredFromMalformedJson | Should -BeTrue
            { ConvertFrom-TranscriptOrganizerJsonLines -Lines @('{"start":1,"oops":"broken"}') -RecoverBackendTextQuotes } | Should -Throw "*missing 'end'*"
        }

        It 'derives readable text and valid SRT without retranscription' {
            $segments = ConvertFrom-TranscriptOrganizerJsonLines -Lines $script:CorpusLines
            ConvertTo-TranscriptOrganizerReadableText -Segments $segments | Should -Match '^\[00:00:00\.007\] First segment'
            $srt = ConvertTo-TranscriptOrganizerSrt -Segments $segments
            $srt | Should -Match '00:00:00,007 --> 00:00:03,367'
            $srt | Should -Match 'Second segment'
        }

        It 'constructs a deterministic corpus manifest contract' {
            $manifest = New-TranscriptOrganizerCorpusManifestValue -SourceId talk -InputPath 'D:\talk.webm' -MediaDurationSeconds 10 -SegmentCount 2 -Artifacts @([pscustomobject]@{RelativePath='transcript.txt'}) -FFmpegVersion '8.1.2' -WhisperModelPath 'model.bin' -UsedGpu $true -UsedCpuFallback $false -CreatedAtUtc ([datetimeoffset]'2026-08-01T00:00:00Z')
            $manifest.SchemaVersion | Should -Be 1
            $manifest.SegmentCount | Should -Be 2
            $manifest.Backend.UsedGpu | Should -BeTrue
            $manifest.Backend.WhisperModelPath | Should -Be 'model.bin'
            $manifest.CreatedAtUtc | Should -Be '2026-08-01T00:00:00.0000000+00:00'
        }

        It 'measures union coverage, gaps, overlaps, and large gaps' {
            $segments = ConvertFrom-TranscriptOrganizerJsonLines -Lines @(
                '{"start":0,"end":1000,"text":"one"}',
                '{"start":900,"end":1500,"text":"two"}',
                '{"start":7000,"end":8000,"text":"three"}'
            )
            $stats = Get-TranscriptOrganizerTimelineStatistics -Segments $segments -LargeGapThresholdMilliseconds 5000
            $stats.CoveredMilliseconds | Should -Be 2500
            $stats.OverlapCount | Should -Be 1
            $stats.TotalOverlapMilliseconds | Should -Be 100
            $stats.GapCount | Should -Be 1
            $stats.TotalGapMilliseconds | Should -Be 5500
            $stats.LargeGaps.Count | Should -Be 1
        }
    }
}
