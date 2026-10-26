# Add-Project.ps1
# Place beside index.html and rss.xml in docs/. Run from docs/public/<project-folder>/.
# Compatible with Windows PowerShell 5.1 and PowerShell 7+.

[CmdletBinding()]
param(
    [string]$ProjectPath = (Get-Location).ProviderPath,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$siteRoot = $PSScriptRoot
$indexPath = Join-Path $siteRoot 'index.html'
$rssPath = Join-Path $siteRoot 'rss.xml'
$publicPath = Join-Path $siteRoot 'public'
$siteUrl = 'https://toys.awwtools.com'
$culture = [Globalization.CultureInfo]::InvariantCulture

function Show-Rule {
    Write-Host ('  ' + ('-' * 74)) -ForegroundColor DarkGray
}

function Show-Heading([string]$title, [string]$subtitle) {
    Write-Host ''
    Show-Rule
    Write-Host ('  ' + $title.ToUpperInvariant()) -ForegroundColor Cyan
    if ($subtitle) { Write-Host ('  ' + $subtitle) -ForegroundColor DarkGray }
    Show-Rule
}

function Show-Note([string]$label, [string]$value) {
    Write-Host ('  {0,-17}' -f ($label + ':')) -NoNewline -ForegroundColor DarkGray
    Write-Host $value -ForegroundColor White
}

# Drafts live outside the repository. Only answers affecting published output are stored.
$script:draft = @{}
$script:draftPath = $null
$script:currentStyle = 'general'
$script:activeFile = ''

function Set-DraftValue([string]$key, [string]$value) {
    if (-not $script:draftPath) { return }
    $script:draft[$key] = $value
    Save-Draft
}

function Save-Draft {
    if (-not $script:draftPath -or $script:draft.Count -eq 0) { return }
    $json = ConvertTo-Json -InputObject $script:draft -Depth 6
    $temp = $script:draftPath + '.tmp'
    try {
        [IO.File]::WriteAllText($temp, $json, [Text.UTF8Encoding]::new($false))
        Move-Item -LiteralPath $temp -Destination $script:draftPath -Force
    } finally {
        if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
    }
}

function Initialize-Draft([string]$projectDir) {
    $normalized = [IO.Path]::GetFullPath($projectDir).TrimEnd([char[]]@('/', '\')).ToLowerInvariant()
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $bytes = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($normalized))
    } finally { $sha.Dispose() }
    $key = ([BitConverter]::ToString($bytes)).Replace('-', '').Substring(0, 24).ToLowerInvariant()
    $script:draftPath = Join-Path ([IO.Path]::GetTempPath()) ('add-project-' + $key + '.json')
    if (Test-Path -LiteralPath $script:draftPath) {
        try {
            $saved = Get-Content -LiteralPath $script:draftPath -Raw -Encoding UTF8 | ConvertFrom-Json
            foreach ($property in $saved.PSObject.Properties) {
                $script:draft[$property.Name] = [string]$property.Value
            }
            Show-Note 'Recovered draft' $script:draftPath
        } catch {
            throw ('Cannot read saved draft: ' + $script:draftPath + '. ' + $_.Exception.Message)
        }
    } else {
        Show-Note 'Draft location' $script:draftPath
    }
}

function Get-Context([string]$file, [string]$token) {
    $lines = [IO.File]::ReadAllLines($file)
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i].Contains($token)) {
            $start = [Math]::Max(0, $i - 1)
            $end = [Math]::Min($lines.Length - 1, $i + 1)
            $result = @()
            for ($j = $start; $j -le $end; $j++) {
                $result += ('  {0,4}: {1}' -f ($j + 1), $lines[$j].TrimEnd())
            }
            return ($result -join [Environment]::NewLine)
        }
    }
    return '  Expected text not found: ' + $token
}

function Assert-Preflight([string]$category, [string]$markerKey, [string]$projectName, [datetime]$projectDate) {
    Show-Heading 'Preflight validation' 'Checking existing files and insertion points before requesting content.'
    $html = Get-Document $indexPath
    $rss = Get-Document $rssPath
    $script:activeFile = $indexPath
    $escapedName = [regex]::Escape((Escape-Xml $projectName))
    if ([regex]::IsMatch($html.Text, 'data-project="' + $escapedName + '"', 'IgnoreCase')) {
        throw ('Duplicate HTML project: ' + $projectName + '. Remove it or use a different folder.')
    }
    $htmlTest = Update-Html $html.Text $html.Newline $category $markerKey '<li class="project-item"></li>'
    $script:activeFile = $rssPath
    $url = $siteUrl + '/public/' + (Encode-Path $projectName) + '/'
    if ($rss.Text.Contains($url)) { throw ('Duplicate RSS project URL: ' + $url) }
    $rssTest = Update-Rss $rss.Text $rss.Newline $projectDate '<item></item>'
    # Verify the existing feed is XML and that the tested insertion also leaves valid XML.
    foreach ($content in @($rss.Text, $rssTest)) {
        $doc = [xml]$content
        if (-not $doc.rss.channel) { throw 'RSS must contain an rss/channel element.' }
    }
    $script:activeFile = ''
    Show-Note 'HTML' 'OK: section and insertion point'
    Show-Note 'RSS' 'OK: date, marker, chronology, and XML'
    Show-Note 'Project' 'OK: not already published'
    return [pscustomobject]@{ Html = $html; Rss = $rss }
}

function Ask-Choice([string]$question, [string[]]$allowed, [string]$default) {
    while ($true) {
        Write-Host ('  ' + $question) -ForegroundColor Yellow
        $answer = (Read-Host '  >').Trim().ToUpperInvariant()
        if (-not $answer) { $answer = $default }
        if ($allowed -contains $answer) { return $answer }
        Write-Host ('  Choose: ' + ($allowed -join ', ')) -ForegroundColor Red
    }
}

function Ask-Text([string]$name, [string]$hint, [string]$example, [string]$default = '') {
    $key = 'field:' + $script:currentStyle + ':' + $name
    if ($script:draft -and $script:draft.ContainsKey($key)) { $default = [string]$script:draft[$key] }
    while ($true) {
        Write-Host ''
        Write-Host ('  ' + $name) -ForegroundColor Yellow
        Write-Host ('    Hint:    ' + $hint) -ForegroundColor DarkGray
        Write-Host ('    Example: ' + $example) -ForegroundColor DarkCyan
        if ($default) {
            Write-Host ('    Default: ' + $default) -ForegroundColor DarkGray
        }
        $answer = (Read-Host '    >').Trim()
        if (-not $answer) { $answer = $default }
        if ($answer) {
            $answer = $answer.Trim().TrimEnd('.')
            Set-DraftValue $key $answer
            return $answer
        }
        Write-Host '    This field is required.' -ForegroundColor Red
    }
}

function Show-TemplateMenu {
    Show-Heading 'Description styles' 'Choose a writing structure. Each includes an example and guided questions.'
    $items = @(
        @('1', 'PURPOSE + FUNCTION', 'What it is, what it does, and why it is useful.',
          'A [tool] that [action] to [benefit].',
          'A browser-based tool that formats and validates JSON to make structured data easier to inspect.'),
        @('2', 'PROBLEM + SOLUTION', 'Who needs it, what problem they have, and how it helps.',
          'Helps [audience] [solve problem] by [approach].',
          'Helps developers inspect messy JSON by validating syntax and formatting the result.'),
        @('3', 'INPUT + PROCESSING + OUTPUT', 'What goes in, what happens, and what comes out.',
          'Takes [input], [operation], and produces [output].',
          'Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version.'),
        @('4', 'FEATURES + TECHNOLOGY', 'Implementation stack and the most notable capabilities.',
          'A [tool] built with [technology], featuring [feature 1] and [feature 2].',
          'A browser-based JSON utility built with vanilla JavaScript, featuring syntax validation and readable formatting.'),
        @('5', 'STRUCTURED PROJECT PROFILE', 'Intended audience, core workflow, and distinguishing detail.',
          'A [tool] for [audience/purpose], providing [workflow] through [detail].',
          'A browser-based utility for developers inspecting JSON data, providing syntax validation and formatting through a lightweight interface.')
    )
    foreach ($item in $items) {
        Write-Host ('  [' + $item[0] + '] ' + $item[1]) -ForegroundColor Green
        Write-Host ('      ' + $item[2]) -ForegroundColor White
        Write-Host ('      Pattern: ' + $item[3]) -ForegroundColor DarkGray
        Write-Host ('      Example: ' + $item[4]) -ForegroundColor DarkCyan
        Write-Host ''
    }
}

function Get-Description([string]$style) {
    Show-Heading ('Style ' + $style) 'Answer using short phrases, not full sentences. Examples appear at each step.'
    switch ($style) {
        '1' {
            $type = Ask-Text 'Project type' 'A noun phrase naming the tool or application.' 'browser-based tool'
            $action = Ask-Text 'Main action' 'A verb phrase describing the main functionality (no subject).' 'formats and validates JSON'
            $benefit = Ask-Text 'Purpose or benefit' 'A verb phrase that naturally follows the word "to".' 'make structured data easier to inspect'
            return ('A {0} that {1} to {2}.' -f $type, $action, $benefit)
        }
        '2' {
            $audience = Ask-Text 'Audience' 'Who uses it? A plural noun or phrase.' 'developers'
            $problem = Ask-Text 'Task or problem' 'What they want to do; follows the audience directly.' 'inspect messy JSON'
            $approach = Ask-Text 'Solution approach' 'An -ing phrase describing how the tool helps.' 'validating syntax and formatting the result'
            return ('Helps {0} {1} by {2}.' -f $audience, $problem, $approach)
        }
        '3' {
            $inputValue = Ask-Text 'Input' 'The information or material the user provides.' 'pasted JSON'
            $operation = Ask-Text 'Processing step' 'A present-tense verb phrase, e.g. "checks it".' 'checks it for syntax errors'
            $outputValue = Ask-Text 'Output' 'A noun phrase describing the resulting artifact.' 'a readable formatted version'
            return ('Takes {0}, {1}, and produces {2}.' -f $inputValue, $operation, $outputValue)
        }
        '4' {
            $type = Ask-Text 'Project type' 'A noun phrase naming the utility.' 'browser-based JSON utility'
            $technology = Ask-Text 'Technology' 'Mention only technologies that matter to understanding the project.' 'vanilla JavaScript'
            $firstFeature = Ask-Text 'Primary feature' 'A compact noun phrase describing the most important feature.' 'syntax validation'
            $secondFeature = Ask-Text 'Secondary feature' 'Another noun phrase, ideally a distinct capability.' 'readable formatting'
            return ('A {0} built with {1}, featuring {2} and {3}.' -f $type, $technology, $firstFeature, $secondFeature)
        }
        '5' {
            $type = Ask-Text 'Project type' 'What kind of application is this?' 'browser-based utility'
            $audience = Ask-Text 'Purpose or audience' 'A noun phrase that follows "for".' 'developers inspecting JSON data'
            $workflow = Ask-Text 'Core workflow' 'What the application actually enables.' 'syntax validation and readable formatting'
            $detail = Ask-Text 'Distinguishing detail' 'A noun phrase following "through" (an interface, method, or approach).' 'a lightweight interface'
            return ('A {0} for {1}, providing {2} through {3}.' -f $type, $audience, $workflow, $detail)
        }
    }
    throw 'Unknown description style.'
}

function Escape-Xml([string]$value) {
    return [Security.SecurityElement]::Escape($value)
}

function Encode-Path([string]$path) {
    $segments = $path.Split('/')
    return (($segments | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/')
}

function Get-Document([string]$path) {
    $bytes = [IO.File]::ReadAllBytes($path)
    $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191)
    $offset = 0
    if ($bom) { $offset = 3 }
    $codec = [Text.UTF8Encoding]::new($false, $true)
    $text = $codec.GetString($bytes, $offset, $bytes.Length - $offset)
    $newline = "`n"
    if ($text.Contains("`r`n")) { $newline = "`r`n" }
    return [pscustomobject]@{ Text = $text; Newline = $newline; HasBom = $bom }
}

function Put-Document([string]$path, [string]$content, [bool]$bom) {
    $codec = [Text.UTF8Encoding]::new($bom)
    [IO.File]::WriteAllText($path, $content, $codec)
}

function Require-SingleMatch([string]$content, [string]$expression, [string]$label) {
    $matches = [regex]::Matches($content, $expression)
    if ($matches.Count -ne 1) {
        throw ('Expected exactly one ' + $label + ', found ' + $matches.Count + '. Check the corresponding element or comment marker in the file. No files were changed.')
    }
    return $matches[0]
}

function Get-ProjectDate([string]$folder) {
    if ($folder -match '^(\d{4}-\d{2}-\d{2})-.+') {
        return [datetime]::ParseExact($Matches[1], 'yyyy-MM-dd', $culture)
    }
    throw 'Project folder must be named YYYY-MM-DD-project-name.'
}

function Get-RssDate([string]$item) {
    $dateMatch = Require-SingleMatch $item '<pubDate>([^<]+)</pubDate>' 'RSS item pubDate'
    return [datetime]::ParseExact($dateMatch.Groups[1].Value.Trim(),
        "ddd, dd MMM yyyy HH:mm:ss 'GMT'", $culture)
}

function Format-RssDate([datetime]$date) {
    return $date.Date.AddHours(12).ToString("ddd, dd MMM yyyy HH:mm:ss 'GMT'", $culture)
}

function Confirm-Project([string]$initialPath) {
    while ($true) {
        $item = Get-Item -LiteralPath $initialPath -ErrorAction Stop
        if (-not $item.PSIsContainer) { throw 'Project path must be a directory.' }
        $projectParent = [IO.Path]::GetFullPath($item.Parent.FullName).TrimEnd([char[]]@('/', '\'))
        $expectedParent = [IO.Path]::GetFullPath($publicPath).TrimEnd([char[]]@('/', '\'))
        if (-not [string]::Equals($projectParent, $expectedParent, [StringComparison]::OrdinalIgnoreCase)) {
            throw ('The project folder must be directly under ' + $publicPath + '. Current: ' + $item.FullName)
        }
        $null = Get-ProjectDate $item.Name
        Show-Heading 'Project folder' 'The current working directory is the suggested project.'
        Show-Note 'Project' $item.Name
        Show-Note 'Folder' $item.FullName
        Show-Note 'Script folder' $siteRoot
        $answer = Ask-Choice 'Use this folder? [Y] Yes   [C] Choose another folder   [Q] Quit' @('Y', 'C', 'Q') 'Y'
        if ($answer -eq 'Y') { return $item }
        if ($answer -eq 'Q') { throw 'Cancelled; no files changed.' }
        $replacement = Ask-Text 'Project folder name' 'Name of an EXISTING folder directly inside docs/public.' '2026-10-23-alter-ego'
        if ($replacement -match '[/\\]' -or $replacement -eq '.' -or $replacement -eq '..') {
            Write-Host '  Enter a folder name, not a path.' -ForegroundColor Red
            continue
        }
        $replacementPath = Join-Path $publicPath $replacement
        if (-not (Test-Path -LiteralPath $replacementPath -PathType Container)) {
            Write-Host ('  Folder does not exist: ' + $replacementPath) -ForegroundColor Red
            continue
        }
        $initialPath = $replacementPath
    }
}

function Get-Landing([string]$projectDir, [string]$readmeName, [string]$rootHref,
                     [bool]$allowMissingReadme) {
    $candidate = $readmeName
    if (Test-Path -LiteralPath (Join-Path $projectDir 'index.html') -PathType Leaf) {
        $candidate = './'
    } elseif (Test-Path -LiteralPath (Join-Path $projectDir 'dist/index.html') -PathType Leaf) {
        $candidate = 'dist/'
    } elseif (Test-Path -LiteralPath (Join-Path $projectDir 'demo/index.html') -PathType Leaf) {
        $candidate = 'demo/'
    }

    if ($script:draft.ContainsKey('landingPath')) { $candidate = $script:draft['landingPath'] }
    while ($true) {
        Show-Heading 'Landing page' 'Choose where the main project link points.'
        Show-Note 'Suggested path' $candidate
        Write-Host '  Examples: ./ (root index.html), dist/ (built app), demo/, readme.md' -ForegroundColor DarkCyan
        Write-Host '  Enter a path relative to this project, or press Enter for the suggestion.' -ForegroundColor DarkGray
        $chosen = (Read-Host '  Path').Trim()
        if (-not $chosen) { $chosen = $candidate }
        $chosen = $chosen.Replace('\', '/').Trim()
        if ($chosen -eq '.' -or $chosen -eq './') { $chosen = '' }
        if ($chosen.StartsWith('./')) { $chosen = $chosen.Substring(2) }
        if ($chosen.StartsWith('/') -or $chosen.Contains(':') -or $chosen.Contains('?') -or $chosen.Contains('#')) {
            Write-Host '  Enter a relative path without URL parameters.' -ForegroundColor Red
            continue
        }
        $parts = @($chosen.Split('/') | Where-Object { $_ -ne '' })
        if ($parts -contains '..' -or $parts -contains '.') {
            Write-Host '  Parent-path and dot segments are not allowed.' -ForegroundColor Red
            continue
        }
        $relative = $parts -join '/'
        $absolute = $projectDir
        if ($relative) { $absolute = Join-Path $projectDir ($relative.Replace('/', [IO.Path]::DirectorySeparatorChar)) }

        if (Test-Path -LiteralPath $absolute -PathType Container) {
            if (-not (Test-Path -LiteralPath (Join-Path $absolute 'index.html') -PathType Leaf)) {
                Write-Host '  This directory has no index.html. Choose an HTML file or README instead.' -ForegroundColor Red
                continue
            }
            $encoded = ''
            if ($relative) { $encoded = (Encode-Path $relative) + '/' }
            Set-DraftValue 'landingPath' $(if ($relative) { $relative + '/' } else { './' })
            return [pscustomobject]@{ Href = $rootHref + $encoded; PreviewHref = $rootHref + $encoded }
        }

        if ((Test-Path -LiteralPath $absolute -PathType Leaf) -or
            ($allowMissingReadme -and $relative -ceq $readmeName)) {
            $encoded = Encode-Path $relative
            $preview = ''
            if ($relative -match '(^|/)index\.html$') {
                $directory = $relative.Substring(0, $relative.Length - 'index.html'.Length)
                $preview = $rootHref + (Encode-Path $directory.TrimEnd('/'))
                if (-not $preview.EndsWith('/')) { $preview += '/' }
            }
            Set-DraftValue 'landingPath' $relative
            return [pscustomobject]@{ Href = $rootHref + $encoded; PreviewHref = $preview }
        }
        Write-Host ('  Path does not exist: ' + $absolute) -ForegroundColor Red
    }
}

function Update-Html([string]$source, [string]$newline, [string]$category,
                     [string]$markerKey, [string]$newItem) {
    $sectionPattern = '(?s)<section\b[^>]*class="project-section"[^>]*>\s*<h1>\s*' +
                      [regex]::Escape($category) + '\s*</h1>\s*<ul\b[^>]*class="project-list"[^>]*>(?<body>.*?)' +
                      '(?<close>^[ \t]*</ul>)'
    $sectionMatches = [regex]::Matches($source, $sectionPattern, [Text.RegularExpressions.RegexOptions]::Multiline)
    if ($sectionMatches.Count -ne 1) { throw ('Expected exactly one project section named ' + $category + ' in index.html, found ' + $sectionMatches.Count + '. Check its <section>, <h1>, and <ul class="project-list"> markup.') }
    $marker = '<!-- ADD-PROJECT:' + $markerKey + ' -->'
    $allMarkers = [regex]::Matches($source, [regex]::Escape($marker))
    if ($allMarkers.Count -gt 1) { throw ('Duplicate HTML marker: ' + $marker) }
    if ($allMarkers.Count -eq 0) {
        $close = $sectionMatches[0].Groups['close']
        $source = $source.Insert($close.Index, ('                    ' + $marker + $newline))
    }

    $sectionMatches = [regex]::Matches($source, $sectionPattern, [Text.RegularExpressions.RegexOptions]::Multiline)
    $section = $sectionMatches[0]
    $markerMatch = Require-SingleMatch $source ([regex]::Escape($marker)) ('HTML marker ' + $marker)
    if ($markerMatch.Index -lt $section.Groups['body'].Index -or
        $markerMatch.Index -ge $section.Groups['close'].Index) {
        throw ('HTML marker appears outside the ' + $category + ' list.')
    }
    $lineStart = $source.LastIndexOf($newline, [Math]::Max(0, $markerMatch.Index - 1))
    if ($lineStart -lt 0) { $lineStart = 0 } else { $lineStart += $newline.Length }
    $indent = $source.Substring($lineStart, $markerMatch.Index - $lineStart)
    if ($indent -notmatch '^[ \t]*$') { throw 'HTML marker must be alone on an indented line.' }
    $indentedItem = $newItem.Replace($newline, $newline + $indent)
    return $source.Insert($markerMatch.Index, $indentedItem + $newline + $indent)
}

function Update-Rss([string]$source, [string]$newline, [datetime]$newDate,
                    [string]$newItem) {
    $datePattern = '(?m)^(?<indent>[ \t]*)<lastBuildDate>[^<]*</lastBuildDate>[ \t]*\r?$'
    $dateNode = Require-SingleMatch $source $datePattern 'RSS lastBuildDate'
    $marker = '<!-- ADD-PROJECT:RSS -->'
    $markerMatches = [regex]::Matches($source, [regex]::Escape($marker))
    if ($markerMatches.Count -gt 1) { throw 'Duplicate RSS insertion marker.' }
    if ($markerMatches.Count -eq 0) {
        $source = $source.Insert($dateNode.Index + $dateNode.Length,
                                 $newline + '    ' + $marker)
    }

    $itemPattern = '(?ms)^[ \t]*<item>[ \t]*\r?\n.*?^[ \t]*</item>[ \t]*(?:\r?\n)?'
    $existing = [regex]::Matches($source, $itemPattern)
    $lastDate = $newDate
    $insertion = -1
    $previousDate = $null
    foreach ($item in $existing) {
        $date = Get-RssDate $item.Value
        if ($null -ne $previousDate -and $date -gt $previousDate) {
            throw 'Existing RSS items are not newest-first; correct their order before publishing.'
        }
        $previousDate = $date
        if ($date -gt $lastDate) { $lastDate = $date }
        if ($insertion -lt 0 -and $date.Date -lt $newDate.Date) { $insertion = $item.Index }
    }

    $markerLine = Require-SingleMatch $source '(?m)^[ \t]*<!-- ADD-PROJECT:RSS -->[ \t]*\r?\n' 'RSS insertion marker line'
    $firstItemIndex = $source.IndexOf('<item>')
    if ($firstItemIndex -ge 0 -and $markerLine.Index -gt $firstItemIndex) {
        throw 'RSS insertion marker must be before the first <item>.'
    }
    if ($markerLine.Index -lt $source.IndexOf('<lastBuildDate>')) {
        throw 'RSS insertion marker must follow <lastBuildDate>.'
    }
    if ($insertion -lt 0) {
        if ($existing.Count -eq 0) {
            $insertion = $markerLine.Index + $markerLine.Length
        } elseif ($newDate.Date -ge (Get-RssDate $existing[0].Value).Date) {
            $insertion = $markerLine.Index + $markerLine.Length
        } else {
            $last = $existing[$existing.Count - 1]
            $insertion = $last.Index + $last.Length
        }
    }
    $source = $source.Insert($insertion, $newItem + $newline)
    $replacement = '<lastBuildDate>' + (Format-RssDate $lastDate) + '</lastBuildDate>'
    $source = [regex]::Replace($source, '(?m)<lastBuildDate>[^<]*</lastBuildDate>', $replacement)
    return $source
}

try {
    foreach ($path in @($indexPath, $rssPath, $publicPath)) {
        if (-not (Test-Path -LiteralPath $path)) {
            throw ('Required repository path not found: ' + $path)
        }
    }

    Show-Heading 'Add Project' 'Interactive publisher for index.html and rss.xml  |  No parser or external modules'
    $project = Confirm-Project $ProjectPath
    $projectName = $project.Name
    $projectDate = Get-ProjectDate $projectName
    Initialize-Draft $project.FullName

    Show-Heading 'Category' 'Choose the target section in index.html (and the RSS category).'
    $categories = @('Toys', 'Games', 'Docs', 'Browser Extensions', 'Experiments')
    for ($i = 0; $i -lt $categories.Count; $i++) {
        Write-Host ('    [{0}] {1}' -f ($i + 1), $categories[$i]) -ForegroundColor White
    }
    $sectionDefault = '1'
    if ($script:draft.ContainsKey('category') -and $categories -contains $script:draft['category']) {
        $sectionDefault = [string]([array]::IndexOf($categories, $script:draft['category']) + 1)
    }
    $sectionChoice = Ask-Choice ('Section number [default: ' + $sectionDefault + ']') @('1', '2', '3', '4', '5', 'Q') $sectionDefault
    if ($sectionChoice -eq 'Q') { throw 'Cancelled; no files changed.' }
    $category = $categories[[int]$sectionChoice - 1]
    $markerKeys = @('TOYS', 'GAMES', 'DOCS', 'BROWSER-EXTENSIONS', 'EXPERIMENTS')
    $markerKey = $markerKeys[[int]$sectionChoice - 1]
    Set-DraftValue 'category' $category

    $preflight = Assert-Preflight $category $markerKey $projectName $projectDate
    $script:currentStyle = 'general'
    $title = Ask-Text 'Display title' 'Shown as the index link and RSS title. Enter to use the folder name.' 'JSON Formatter' $projectName

    while ($true) {
        Show-TemplateMenu
        $styleDefault = '1'
        if ($script:draft.ContainsKey('style') -and $script:draft['style'] -match '^[1-5]$') { $styleDefault = $script:draft['style'] }
        $style = Ask-Choice ('Description style [1-5] [default: ' + $styleDefault + '] [Q] Quit') @('1', '2', '3', '4', '5', 'Q') $styleDefault
        if ($style -eq 'Q') { throw 'Cancelled; no files changed.' }
        if ($script:draft.ContainsKey('style') -and $script:draft['style'] -ne $style) { $null = $script:draft.Remove('finalDescription') }
        Set-DraftValue 'style' $style
        $script:currentStyle = 'style-' + $style
        while ($true) {
            $description = Get-Description $style
            $description = [regex]::Replace($description.Trim(), '\s+', ' ')
            if ($script:draft.ContainsKey('finalDescription') -and $script:draft['style'] -eq $style) {
                $description = $script:draft['finalDescription']
            }
            Show-Heading 'Description preview' 'This exact sentence will be used in both index.html and rss.xml.'
            Write-Host ('  ' + $description) -ForegroundColor Green
            Write-Host ''
            $decision = Ask-Choice '[A] Accept   [E] Edit complete sentence   [R] Retry style   [T] Change style   [Q] Quit' @('A', 'E', 'R', 'T', 'Q') 'A'
            if ($decision -eq 'A') { Set-DraftValue 'finalDescription' $description; break }
            if ($decision -eq 'Q') { throw 'Cancelled; no files changed.' }
            if ($decision -eq 'T') { break }
            if ($decision -eq 'E') {
                $script:currentStyle = 'final-style-' + $style
                $description = Ask-Text 'Final one-sentence description' 'Rewrite or paste the exact sentence you want to publish.' 'A tool that validates JSON and displays readable results.' $description
                $description = [regex]::Replace($description.Trim(), '\s+', ' ')
                if ($description -notmatch '[.!?]$') { $description += '.' }
                Show-Note 'Final description' $description
                $ok = Ask-Choice 'Use this description? [Y/n]' @('Y', 'N') 'Y'
                if ($ok -eq 'Y') { Set-DraftValue 'finalDescription' $description; $decision = 'A'; break }
            }
        }
        if ($decision -eq 'A') { break }
    }

    $readme = 'readme.md'
    $readmeExists = Test-Path -LiteralPath (Join-Path $project.FullName $readme) -PathType Leaf
    if (-not $readmeExists) {
        $readme = 'README.md'
        $readmeExists = Test-Path -LiteralPath (Join-Path $project.FullName $readme) -PathType Leaf
    }
    $createReadme = $false
    if (-not $readmeExists) {
        Show-Heading 'README missing' 'Every published project needs a README for the preview panel.'
        Write-Host '  No readme.md or README.md was found in the project folder.' -ForegroundColor Yellow
        $answer = Ask-Choice 'Create readme.md containing the title and description? [Y] Yes   [Q] Quit' @('Y', 'Q') 'Y'
        if ($answer -eq 'Q') { throw 'Cancelled; no files changed.' }
        $readme = 'readme.md'
        $createReadme = $true
    }

    $rootHref = '/public/' + (Encode-Path $projectName) + '/'
    $landing = Get-Landing $project.FullName $readme $rootHref $createReadme
    $escapedTitle = Escape-Xml $title
    $escapedName = Escape-Xml $projectName
    $escapedDescription = Escape-Xml $description
    $escapedLanding = Escape-Xml $landing.Href
    $escapedReadmeHref = Escape-Xml ($rootHref + (Encode-Path $readme))
    $previewAttribute = ''
    if ($landing.PreviewHref) { $previewAttribute = ' data-index-href="' + (Escape-Xml $landing.PreviewHref) + '"' }

    $indexDoc = Get-Document $indexPath
    $rssDoc = Get-Document $rssPath
    if ($indexDoc.Text -cne $preflight.Html.Text -or $rssDoc.Text -cne $preflight.Rss.Text) {
        throw 'index.html or rss.xml changed since preflight. Restart to validate the current versions.'
    }
    $existingHtmlCount = [regex]::Matches($indexDoc.Text, '<li class="project-item"').Count
    $existingRssCount = [regex]::Matches($rssDoc.Text, '<item>').Count
    if ($existingHtmlCount -ne $existingRssCount) {
        Write-Host ''
        Write-Host ("  Note: existing HTML/RSS counts differ ({0} vs {1})." -f $existingHtmlCount, $existingRssCount) -ForegroundColor Yellow
        Write-Host '  Existing entries will not be changed or reconciled.' -ForegroundColor DarkGray
    }
    if ([regex]::IsMatch($indexDoc.Text,
            'data-project="' + [regex]::Escape($escapedName) + '"',
            [Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
        throw ('This project is already in index.html: ' + $projectName)
    }
    if ($rssDoc.Text.Contains($siteUrl + $rootHref)) {
        throw ('This project already has an RSS entry: ' + $projectName)
    }

    $htmlEntry = @(
        ('<li class="project-item" data-project="' + $escapedName + '"' + $previewAttribute + '>'),
        ('    <a class="project-link" href="' + $escapedLanding + '">' + $escapedTitle + '</a>'),
        ('    <p class="item-desc">' + $escapedDescription + '</p>'),
        ('    <p class="item-links"><a class="readme-link" href="' + $escapedReadmeHref + '">' + (Escape-Xml $readme) + '</a></p>'),
        '</li>'
    ) -join $indexDoc.Newline

    $absoluteUrl = $siteUrl + $landing.Href
    $escapedUrl = Escape-Xml $absoluteUrl
    $rssEntry = @(
        '    <item>',
        ('      <title>' + $escapedTitle + '</title>'),
        ('      <link>' + $escapedUrl + '</link>'),
        ('      <guid isPermaLink="true">' + $escapedUrl + '</guid>'),
        ('      <pubDate>' + (Format-RssDate $projectDate) + '</pubDate>'),
        ('      <category>' + (Escape-Xml $category) + '</category>'),
        ('      <description>' + $escapedDescription + '</description>'),
        '    </item>'
    ) -join $rssDoc.Newline

    $script:activeFile = $indexPath
    $newHtml = Update-Html $indexDoc.Text $indexDoc.Newline $category $markerKey $htmlEntry
    $script:activeFile = $rssPath
    $newRss = Update-Rss $rssDoc.Text $rssDoc.Newline $projectDate $rssEntry

    $script:activeFile = ''
    Show-Heading 'Review changes' 'No files have been modified yet.'
    Show-Note 'Project' $projectName
    Show-Note 'Title' $title
    Show-Note 'Category' $category
    Show-Note 'Description style' $style
    Show-Note 'Published URL' $absoluteUrl
    Show-Note 'RSS date' (Format-RssDate $projectDate)
    Show-Note 'README' $(if ($createReadme) { 'Create readme.md' } else { $readme })
    Write-Host ''
    Write-Host '  index.html insertion:' -ForegroundColor Cyan
    Write-Host ("    " + ($htmlEntry -replace "`r?`n", "`n    ")) -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  rss.xml insertion:' -ForegroundColor Cyan
    Write-Host ("    " + ($rssEntry -replace "`r?`n", "`n    ")) -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  HTML insertion uses a section marker. RSS insertion is date-sorted.' -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Host ''
        Write-Host '  DRY RUN: no files written.' -ForegroundColor Yellow
        return
    }
    $answer = Ask-Choice 'Publish these changes? [Y] Yes   [N] Cancel' @('Y', 'N') 'N'
    if ($answer -ne 'Y') {
        Write-Host '  Cancelled. No files changed.' -ForegroundColor Yellow
        return
    }

    # Prepare both files before overwriting them. Git provides version history.
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $tempIndex = Join-Path $siteRoot ('.index.' + $stamp + '.tmp')
    $tempRss = Join-Path $siteRoot ('.rss.' + $stamp + '.tmp')
    try {
        Put-Document $tempIndex $newHtml $indexDoc.HasBom
        Put-Document $tempRss $newRss $rssDoc.HasBom
        [IO.File]::Copy($tempIndex, $indexPath, $true)
        [IO.File]::Copy($tempRss, $rssPath, $true)
        if ($createReadme) {
            $readmeText = '# ' + $title + $indexDoc.Newline + $indexDoc.Newline + $description + $indexDoc.Newline
            Put-Document (Join-Path $project.FullName $readme) $readmeText $false
        }
    } finally {
        if (Test-Path -LiteralPath $tempIndex) { Remove-Item -LiteralPath $tempIndex -Force }
        if (Test-Path -LiteralPath $tempRss) { Remove-Item -LiteralPath $tempRss -Force }
    }

    Show-Heading 'Published' 'Both index.html and rss.xml were updated.'
    Show-Note 'HTML marker' ('ADD-PROJECT:' + $markerKey)
    Show-Note 'RSS marker' 'ADD-PROJECT:RSS'
    Write-Host '  Review the diff with git diff before committing.' -ForegroundColor Green
 } catch {
    Write-Host ''
    $message = $_.Exception.Message
    if ($script:activeFile -and (Test-Path -LiteralPath $script:activeFile)) {
        Write-Host ('  File: ' + $script:activeFile) -ForegroundColor Yellow
        $token = if ($script:activeFile -eq $rssPath) { 'lastBuildDate' } else { '<h1>' }
        Write-Host (Get-Context $script:activeFile $token) -ForegroundColor DarkGray
    }
    if ($message.StartsWith('Cancelled')) {
        Write-Host ('  ' + $message) -ForegroundColor Yellow
        return
    }
    Write-Host ('  ERROR: ' + $message) -ForegroundColor Red
    throw
} finally {
    # Keep drafts on both success and failure; technical confirmations are excluded.
    Save-Draft
}
