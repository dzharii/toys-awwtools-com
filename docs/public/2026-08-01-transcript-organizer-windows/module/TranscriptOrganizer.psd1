@{
    RootModule = 'TranscriptOrganizer.psm1'
    ModuleVersion = '0.0.1'
    GUID = '9a611877-79ce-43ae-b7ab-3239889a203d'
    Author = 'Transcript Organizer contributors'
    CompanyName = 'Community'
    Copyright = '(c) 2026 Transcript Organizer contributors'
    Description = 'Validated local FFmpeg Whisper transcription orchestration for Windows PowerShell 7.'
    PowerShellVersion = '7.0'
    CompatiblePSEditions = @('Core')
    FunctionsToExport = @(
        'New-TranscriptOrganizerConfiguration'
        'New-TranscriptOrganizerRequest'
        'Test-TranscriptOrganizerEnvironment'
        'Invoke-TranscriptOrganizer'
        'Invoke-TranscriptOrganizerBatch'
        'Export-TranscriptOrganizerCorpus'
        'Test-TranscriptOrganizerRuntimeResult'
        'Test-TranscriptOrganizerCapabilityResult'
        'Test-TranscriptOrganizerModelResult'
        'Test-TranscriptOrganizerProcessResult'
        'Test-TranscriptOrganizerTranscriptionResult'
        'Test-TranscriptOrganizerTelemetryEvent'
    )
    CmdletsToExport = @()
    VariablesToExport = @()
    AliasesToExport = @()
    PrivateData = @{
        PSData = @{
            Tags = @('Windows', 'FFmpeg', 'Whisper', 'Transcription')
        }
    }
}
