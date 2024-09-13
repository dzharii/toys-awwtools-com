$ErrorActionPreference = "Stop"

Add-Type -AssemblyName UIAutomationClient

# Function to find an element by a property
function Get-AutomationElementByName {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name,
        [System.Windows.Automation.AutomationElement]$RootElement = [System.Windows.Automation.AutomationElement]::RootElement
    )

    $condition = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::NameProperty, $Name
    )

    return $RootElement.FindFirst([System.Windows.Automation.TreeScope]::Subtree, $condition)
}

# Function to click the found element
function Click-AutomationElement {
    param(
        [Parameter(Mandatory=$true)]
        [System.Windows.Automation.AutomationElement]$Element
    )

    $invokePattern = $Element.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
    $invokePattern.Invoke()
}

while ($true) { 
    try {
        # Wait for the browser window to be available
        Start-Sleep -Seconds 1

        # Find all windows on the desktop
        $desktop = [System.Windows.Automation.AutomationElement]::RootElement
        $condition = New-Object System.Windows.Automation.PropertyCondition(
            [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
            [System.Windows.Automation.ControlType]::Window
        )
        $windows = $desktop.FindAll([System.Windows.Automation.TreeScope]::Children, $condition)

        $youtubeWindowFound = $false

        # Iterate through each window and check if it contains "YouTube" in its title
        foreach ($window in $windows) {
            $windowTitle = $window.Current.Name
            Write-Host "Checking window: $windowTitle"

            if ($windowTitle -like "*YouTube*") {
                Write-Host "YouTube window found: $windowTitle"

                # Search for the button with the accessibility label added by the bookmarklet
                $button = Get-AutomationElementByName -Name "CustomSkipAdButton" -RootElement $window

                if ($button -eq $null) {
                    Write-Host "Button not found in window: $windowTitle"
                } else {
                    Write-Host "Button found in window: $windowTitle"

                    # Click the button
                    Click-AutomationElement -Element $button

                    Write-Host "Button clicked in window: $windowTitle"
                    $youtubeWindowFound = $true
                    break
                }
            }
        }

        if (-not $youtubeWindowFound) {
            Write-Host "No YouTube windows with the specified button were found."
        }
    } catch {
        Write-Host "An error occurred: $($_.Exception.Message)"
    }
}
