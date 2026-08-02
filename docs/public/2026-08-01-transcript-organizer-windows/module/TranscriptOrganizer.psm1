Set-StrictMode -Version Latest

$privateScripts = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'Private') -Filter '*.ps1' -File | Sort-Object Name
$publicScripts = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'Public') -Filter '*.ps1' -File | Sort-Object Name

foreach ($script in @($privateScripts) + @($publicScripts)) {
    . $script.FullName
}

Export-ModuleMember -Function @(
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
