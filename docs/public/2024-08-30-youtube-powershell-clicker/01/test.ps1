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

# Wait for the browser window to be available
Start-Sleep -Seconds 4

# Find the browser window (assuming it's the active window with "YouTube" in the title)
$desktop = [System.Windows.Automation.AutomationElement]::RootElement
$condition = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
    [System.Windows.Automation.ControlType]::Window
)
$window = $desktop.FindFirst([System.Windows.Automation.TreeScope]::Children, $condition)

if ($window -eq $null) {
    Write-Output "Browser window not found"
    exit
}


Write-Output "Browser window found"

$windowTitle = $window.Current.Name
Write-Output "Browser window found: $windowTitle"

# Search for the button with the accessibility label added by the bookmarklet
$button = Get-AutomationElementByName -Name "CustomSkipAdButton" -RootElement $window

if ($button -eq $null) {
    Write-Output "Button not found"
    exit
}

Write-Output "Button found"

# Click the button
Click-AutomationElement -Element $button

Write-Output "Button clicked"