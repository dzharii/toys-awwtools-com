$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$configuration = if ($env:CONFIGURATION) { $env:CONFIGURATION } else { "Release" }
$framework = if ($env:FRAMEWORK) { $env:FRAMEWORK } else { "net10.0" }
$port = if ($env:PORT) { [int]$env:PORT } else { 7443 }
$attempts = if ($env:ATTEMPTS) { [int]$env:ATTEMPTS } else { 5 }
$pollDelayMs = if ($env:POLL_DELAY_MS) { [int]$env:POLL_DELAY_MS } else { 50 }
$appDll = Join-Path $root "bin\$configuration\$framework\LocalFastUi.dll"
$url = "https://localhost:$port/api/ping"

dotnet build (Join-Path $root "LocalFastUi.csproj") -c $configuration | Out-Null

if (-not (Test-Path $appDll)) {
    throw "Built app not found at $appDll"
}

$results = New-Object System.Collections.Generic.List[int]
$process = $null

try {
    for ($attempt = 1; $attempt -le $attempts; $attempt++) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
            $process.WaitForExit()
        }

        $start = [System.Diagnostics.Stopwatch]::StartNew()
        $process = Start-Process dotnet -ArgumentList "`"$appDll`"" -PassThru -WindowStyle Hidden

        while ($true) {
            try {
                & curl.exe --silent --insecure --output NUL $url | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    break
                }
            } catch {
            }

            if ($process.HasExited) {
                throw "Application exited before responding on attempt $attempt."
            }

            Start-Sleep -Milliseconds $pollDelayMs
        }

        $start.Stop()
        $elapsed = [int][Math]::Round($start.Elapsed.TotalMilliseconds)
        $results.Add($elapsed)
        "Attempt $attempt: $elapsed ms"
    }
}
finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit()
    }
}

$average = [int][Math]::Round(($results | Measure-Object -Average).Average)
$minimum = ($results | Measure-Object -Minimum).Minimum
$maximum = ($results | Measure-Object -Maximum).Maximum

"Average: $average ms"
"Min: $minimum ms"
"Max: $maximum ms"
