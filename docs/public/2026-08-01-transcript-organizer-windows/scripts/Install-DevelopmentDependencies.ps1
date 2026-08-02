[CmdletBinding()]
param([Parameter()][ValidateSet('5.7.1')][string] $PesterVersion='5.7.1')

$root = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $root 'tools'
$destination = Join-Path $tools 'Pester'
$null = New-Item -ItemType Directory -Path $tools -Force
Save-Module -Name Pester -RequiredVersion $PesterVersion -Path $tools -Repository PSGallery -Force -ErrorAction Stop
Write-Host "Pester $PesterVersion was saved under $destination."
