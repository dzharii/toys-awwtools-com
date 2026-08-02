[CmdletBinding()]
param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$experimentRoot = Join-Path $ProjectRoot 'experiments'
$corpusRoot = Join-Path $ProjectRoot 'source-extraction\saturation-how-software-fails-at-scale'
$frameRoot = Join-Path $corpusRoot 'frames'
$videoFileName = 'Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm'

function Write-Utf8File {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Content)
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function New-ExperimentDirectory {
    param([Parameter(Mandatory)][string]$Name)
    $path = Join-Path $experimentRoot $Name
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $path 'assets') -Force | Out-Null
    return $path
}

function Copy-CorpusFrame {
    param([Parameter(Mandatory)][string]$ExperimentPath, [Parameter(Mandatory)][string]$Timestamp, [Parameter(Mandatory)][string]$Name)
    Copy-Item -LiteralPath (Join-Path $frameRoot "frame-$Timestamp`ms.jpg") -Destination (Join-Path $ExperimentPath "assets\$Name") -Force
}

function New-Page {
    param(
        [Parameter(Mandatory)][string]$Title,
        [Parameter(Mandatory)][string]$Kicker,
        [Parameter(Mandatory)][string]$Description,
        [Parameter(Mandatory)][string]$Accent,
        [Parameter(Mandatory)][string]$Body,
        [string]$ExtraHead = '',
        [string]$Script = ''
    )
    return @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="$Description">
  <title>$Title</title>
  $ExtraHead
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/documentation.css">
</head>
<body class="experiment-page">
  <div class="site-bar"><div class="site-bar-inner"><a class="site-name" href="../../index.html">Transcript Organizer</a><div class="site-links"><a href="../../docs/manual/index.html">Manual</a><a href="../index.html">Experiments</a><a href="../../dist/transcript-organizer-windows-version-001.zip">Download v001</a></div></div></div>
  <header><p class="page-context">$Kicker</p><h1>$Title</h1><p class="dek">$Description</p></header>
  $Body
  <footer>Built from the timestamped extraction of Lorin Hochsteinʼs SSW 2026 talk. <a href="../index.html">All experiments</a> · <a href="../../index.html">Project documentation</a></footer>
  $Script
</body>
</html>
"@
}

function Write-ExperimentMetadata {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Audience,
        [Parameter(Mandatory)][string]$SourcePolicy,
        [Parameter(Mandatory)][string[]]$Workflow,
        [Parameter(Mandatory)][string]$PrimaryOutput,
        [Parameter(Mandatory)][string[]]$SupportingOutputs,
        [Parameter(Mandatory)][string]$GoodEnough,
        [Parameter(Mandatory)][string[]]$ReviewChecks,
        [int]$ExternalSourceCount = 0
    )
    $metadata = [ordered]@{
        experimentId = $Id
        name = $Name
        audience = $Audience
        sourcePolicy = $SourcePolicy
        workflow = $Workflow
        primaryOutput = $PrimaryOutput
        supportingOutputs = $SupportingOutputs
        goodEnoughDefinition = $GoodEnough
        outcome = 'complete'
        sourceSegmentCount = 1013
        sourceFrameCount = 51
        externalSourceCount = $ExternalSourceCount
        reviewChecks = $ReviewChecks
    }
    Write-Utf8File -Path (Join-Path $Path 'experiment-summary.json') -Content ($metadata | ConvertTo-Json -Depth 8)
}

# Experiment 02: researched field guide. Written only from the shared corpus and the
# primary sources cited inside this page; it does not consume Experiment 01 output.
$exp = New-ExperimentDirectory 'experiment-02-researched-field-guide'
Copy-CorpusFrame $exp '000600000' 'competence-envelope.jpg'
Copy-CorpusFrame $exp '001140000' 'bluesky.jpg'
Copy-CorpusFrame $exp '001200000' 'slack.jpg'
Copy-CorpusFrame $exp '001320000' 'waymo.jpg'
$body = @'
<main><div class="grid"><article class="prose">
  <p class="lede">At scale, failure is rarely the moment when one function returns the wrong value. It is the moment a finite sociotechnical system can no longer adapt to the demands placed on it. Hochsteinʼs talk gives that moment a useful name—<em>saturation</em>—and connects it to a larger resilience-engineering argument: capacity is necessary, but the ability to change strategy under pressure is what keeps surprise from becoming collapse.</p>

  <h2 id="model">1. Replace the machine metaphor with a boundary</h2>
  <p>The talk begins with Leslie Lamportʼs contrast between computing as logic and computing as biology. Lamportʼs concern was that systems were becoming too complicated for any one person to understand. Formal specification attacks that problem by making selected behavior precise. Hochstein does not reject that project; in the Q&amp;A he treats it as valuable for parts of a design. His narrower point is operational: even correctly specified components are embedded in organizations, traffic patterns, deployment machinery and dependencies that do not fit inside one complete model.</p>
  <p>The useful unit of analysis is therefore not "the code" but a system operating inside a <strong>competence envelope</strong>. David Woodsʼs theory of graceful extensibility describes systems as having a finite region of competent performance. Pressure moves the system toward a boundary. Once events exceed the base envelope, continued performance depends on whether people and machinery can deploy additional adaptive capacity. This framing explains why a dashboard can be green right until several individually tolerable pressures interact.</p>
  <figure><img src="assets/competence-envelope.jpg" alt="Talk slide showing a competence envelope and pressure pushing a system toward its boundary"><figcaption>The talkʼs central geometry: pressure, a finite region of competence, and the possibility of extending that region. Source frame near <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=600">10:00</a>.</figcaption></figure>
  <div class="callout"><strong>Operational translation.</strong> Capacity planning asks how far away the known boundary is. Resilience engineering also asks what the organization can do when the boundary is wrong, moves, or is reached in an unfamiliar way.</div>

  <h2 id="finite">2. Saturation is finite supply meeting effective demand</h2>
  <p>The talk tours physical limits—CPU run queues, memory, garbage collection, disks, inodes and network capacity—and virtual limits such as worker pools, bounded queues, connection limits and rate limits. The distinction matters less than the shared mechanism: arrival or retention of work outpaces the systemʼs ability to complete or discard it. Brendan Greggʼs USE method provides a practical first pass for hardware resources: examine utilization, saturation and errors for each resource. Saturation is the queued work, not merely a high utilization percentage.</p>
  <p>Virtual bounds can be deliberate safety valves. A connection pool or queue that refuses additional work before the host exhausts memory localizes the damage. The design question is not "bounded or unbounded?" but which failure mode is preferable when the bound is reached. A queue trades refusal for latency and memory; retries trade immediate failure for more future load; a larger pool can trade throughput for contention at the next dependency.</p>
  <table><thead><tr><th>Pressure</th><th>Leading evidence</th><th>Common trap</th><th>Useful control</th></tr></thead><tbody>
    <tr><td>CPU</td><td>Runnable queue and latency rising together</td><td>Scaling callers increases downstream work</td><td>Admission control; shed optional work</td></tr>
    <tr><td>Memory / GC</td><td>Allocation rate, pause time, reclaim and OOM events</td><td>Treating collector CPU as the original cause</td><td>Bound live sets; reduce retention; degrade features</td></tr>
    <tr><td>Connections / ports</td><td>Pool wait, socket states, allocation failures</td><td>Adding workers consumes the scarce resource faster</td><td>Reuse connections; cap concurrency; fail fast</td></tr>
    <tr><td>Queues</td><td>Age of oldest item and drain rate, not depth alone</td><td>A growing queue appears to be successful intake</td><td>Bound, prioritize, expire and expose backlog</td></tr>
    <tr><td>Logs / storage</td><td>Write amplification, free bytes and free inodes</td><td>Error logging magnifies the triggering failure</td><td>Sample, rate-limit, rotate and reserve capacity</td></tr>
  </tbody></table>

  <h2 id="incidents">3. Three incidents expose different coupling</h2>
  <h3>Bluesky: a large batch found a cross-layer loop</h3>
  <p>Hochstein recounts Blueskyʼs April 2026 outage using engineer Jim Calabroʼs postmortem. A request containing roughly 15,000–20,000 URIs expanded into goroutines and network activity. Ephemeral-port pressure and logging increased thread and memory demand; garbage collection then consumed more CPU, reinforcing the slowdown. The lesson is not "Go cannot handle concurrency." It is that apparently independent limits formed a feedback loop, so adding concurrency reduced the systemʼs capacity to recover.</p>
  <figure><img src="assets/bluesky.jpg" alt="Talk slide summarizing the Bluesky saturation incident"><figcaption>A compact incident chain captured in the talk. Source frame near <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1140">19:00</a>.</figcaption></figure>
  <h3>Slack: adaptation amplified the original pressure</h3>
  <p>Slackʼs January 4, 2021 outage followed the post-holiday return to work. Network saturation caused requests to wait, which occupied web threads. Autoscaling correctly observed distress and provisioned more capacity, but that activity increased load on the provisioning service and encountered its own file-descriptor, API-quota and autoscaling-group limits. Every local control had a rationale; together they created cascading saturation. Googleʼs SRE guidance describes this general pattern: resource exhaustion, latency and retries can propagate failure through a distributed system unless load is rejected or contained.</p>
  <figure><img src="assets/slack.jpg" alt="Talk slide showing several Slack components becoming saturated"><figcaption>Multiple adaptive mechanisms became consumers of scarce capacity. Source frame near <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1200">20:00</a>.</figcaption></figure>
  <h3>Waymo: the safe fallback can itself be finite</h3>
  <p>During San Franciscoʼs December 2025 power outage, dark traffic signals increased ambiguity for autonomous vehicles. Waymoʼs official account says vehicles treated non-functioning signals as all-way stops and some requested fleet-response confirmation; the resulting volume contributed to congestion and some vehicles remaining stationary. Hochstein labels the operational inference that matters: confirmation is a safety mechanism, yet its service capacity is finite. Fail-safes need capacity models and degraded modes just as primary services do.</p>
  <figure><img src="assets/waymo.jpg" alt="Talk slide describing Waymo vehicles during the San Francisco power outage"><figcaption>Safety work entered a finite confirmation path. Source frame near <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1320">22:00</a>.</figcaption></figure>

  <h2 id="routes">4. The routes to saturation are forms of amplification</h2>
  <p>Desired load can simply grow. More dangerous are mechanisms that make effective demand larger than user demand: thundering herds after a shared event, retry storms, high fan-out, pathological but valid inputs, batch work, expensive ad hoc queries and error logs emitted once per failed item. Slow leaks are especially deceptive because regular deployments reset them before ordinary monitoring sees the boundary.</p>
  <p>Cloudflareʼs July 2019 outage is a precise example of functionally valid work becoming operationally catastrophic. A regular expression in a Web Application Firewall rule caused excessive CPU consumption. The rule was deployed globally and CPUs handling HTTP traffic exhausted rapidly. Correctness review alone was insufficient; the missing question was how resource cost behaved for adversarial input and at global rollout speed.</p>
  <div class="callout"><strong>Review prompt.</strong> For every automatic response to failure—retry, scale, log, replicate, rebuild—identify the scarce resource it consumes and the condition that stops it.</div>

  <h2 id="extensibility">5. Graceful extensibility is a repertoire, not spare capacity</h2>
  <p>Because every implemented limit is finite and some interactions are unknown, Hochstein argues that teams cannot engineer saturation away. They can move known limits outward, simplify coupling and add safety margins. But they also need <strong>optionality</strong>: break-glass access, controlled traffic blocking, dynamic configuration, feature flags, quick rollback and fix-forward paths, the ability to recycle or scale units, and people who understand which control is safe in context.</p>
  <p>This is where Woodsʼs distinction earns its keep. Robustness is the ability to absorb a modeled disturbance within the base envelope. Graceful extensibility is the capacity to change how the system works when the disturbance exceeds that design. A feature flag is only latent optionality; it becomes adaptive capacity when responders can recognize the situation, have authority to use it, understand its side effects and can observe whether it worked.</p>

  <h2 id="learning">6. Incident learning should preserve thought, not only fixes</h2>
  <p>The provocative line in the talk is that the optimal number of incidents is not zero. It is not an argument for preventable harm. It is a recognition that systems hiding all weak signals can accumulate unknown brittleness, while small contained failures can reveal boundaries. The operational goal is to reduce harmful impact while maximizing what can be learned from real pressure and from other organizationsʼ incidents.</p>
  <p>That changes the shape of a postmortem. A list of failed components and corrective actions documents the final explanation; it often discards how responders noticed the event, which signals were ambiguous, which hypotheses were rejected, where access or knowledge was missing, and which improvised actions bought time. Those details reveal adaptive capacity. Corrective actions also carry risk: every new limit, retry, detector or automated response changes the next incidentʼs coupling.</p>

  <h2 id="practice">7. A practical saturation review</h2>
  <ol>
    <li><strong>Name the critical work.</strong> Define what must still succeed under stress and what may be delayed, degraded or refused.</li>
    <li><strong>Map finite resources.</strong> Include human attention, emergency authorization and dependency quotas alongside CPU, memory and queues.</li>
    <li><strong>Trace amplification.</strong> Draw retries, fan-out, autoscaling, logging and recovery actions as load-producing edges.</li>
    <li><strong>Choose refusal semantics.</strong> Decide where to queue, shed, expire, cache or return a partial answer before the physical limit decides for you.</li>
    <li><strong>Exercise the controls.</strong> A dormant runbook or permission is not capacity. Test access, observability, reversibility and side effects.</li>
    <li><strong>Preserve adaptive evidence.</strong> During review, record how people made sense of the event—not only the final root cause.</li>
  </ol>
  <p class="lede">The most durable conclusion is an allocation rule: keep improving the base system, but reserve engineering attention for the means of adaptation. A taller wall helps only for pressures already imagined; a practiced repertoire helps when reality chooses a different direction.</p>
</article><aside class="side">
  <div class="card"><strong>Research boundary</strong><p class="small">The talk supplied the argument and incidents. External material was limited to first-party incident reports, official technical documentation and original or authoritative publications.</p></div>
  <div class="card"><strong>Primary sources</strong><ul class="small">
    <li><a href="https://www.microsoft.com/en-us/research/publication/future-computing-logic-biology/">Lamport: The Future of Computing</a></li>
    <li><a href="https://www.irgc.org/wp-content/uploads/2018/09/Woods-Resilience-as-Graceful-Extensibility-to-Overcome-Brittleness-1.pdf">Woods: Graceful Extensibility</a></li>
    <li><a href="https://www.brendangregg.com/usemethod.html">Gregg: USE Method</a></li>
    <li><a href="https://pckt.blog/b/jcalabro/april-2026-outage-post-mortem-219ebg2">Bluesky engineer postmortem</a></li>
    <li><a href="https://slack.engineering/slacks-outage-on-january-4th-2021/">Slack outage report</a></li>
    <li><a href="https://waymo.com/blog/2025/12/autonomously-navigating-the-real-world/">Waymo incident account</a></li>
    <li><a href="https://sre.google/sre-book/addressing-cascading-failures/">Google SRE: Cascading Failures</a></li>
    <li><a href="https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/">Cloudflare July 2019 outage</a></li>
    <li><a href="https://www.kernel.org/doc/html/latest/mm/overcommit-accounting.html">Linux memory overcommit</a></li>
    <li><a href="https://docs.oracle.com/en/java/javase/26/gctuning/garbage-first-g1-garbage-collector1.html">Oracle G1 tuning guide</a></li>
  </ul></div>
</aside></div></main>
'@
$page = New-Page -Title 'Beyond the capacity chart' -Kicker 'Experiment 02 · Researched field guide' -Description 'A research-enriched guide to saturation, competence boundaries and graceful extensibility—grounded in Lorin Hochsteinʼs talk and checked against primary technical sources.' -Accent '#9a3b26' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '02' -Name 'Researched field guide' -Audience 'Senior engineers, SREs and technical leaders who want the talk connected to operational literature and primary incident records' -SourcePolicy 'Shared corpus plus primary or authoritative external sources; no output from any other experiment' -Workflow @('Reconstruct the talk argument directly from timestamped segments','Identify concepts and incidents whose meaning benefits from outside evidence','Research original papers, official documentation and first-party postmortems','Separate sourced facts from the speakerʼs operational inferences','Prune material that does not improve an engineering decision','Review every link, claim boundary and local asset') -PrimaryOutput 'index.html' -SupportingOutputs @('assets/','sources.md','review.md') -GoodEnough 'A standalone, readable field guide adds decision-relevant depth without obscuring the talkʼs thesis, links material factual additions to primary sources, distinguishes inference from report, and has no dependency on another experiment.' -ExternalSourceCount 10 -ReviewChecks @('Prepared-talk arc and Q&A implications represented','Incident details linked to first-party accounts','No secondary-source fact laundering','No sibling experiment paths','All copied frames resolve locally')
$sources = @'
# Experiment 02 source ledger

External research was limited to sources that clarify a named concept, technical mechanism, or incident in the talk. Accessed 2026-08-01.

| Source | Why retained | Claims supported |
|---|---|---|
| [Leslie Lamport, *The Future of Computing: Logic or Biology*](https://www.microsoft.com/en-us/research/publication/future-computing-logic-biology/) | Original work named at the start of the talk | Logic/biology framing and date |
| [David Woods, *The Theory of Graceful Extensibility*](https://www.irgc.org/wp-content/uploads/2018/09/Woods-Resilience-as-Graceful-Extensibility-to-Overcome-Brittleness-1.pdf) | Original theoretical treatment | Base/extended adaptive capacity and brittleness |
| [Brendan Gregg, USE Method](https://www.brendangregg.com/usemethod.html) | Authoritative operating-systems method | Utilization, saturation and errors as resource checks |
| [Linux kernel: Overcommit Accounting](https://www.kernel.org/doc/html/latest/mm/overcommit-accounting.html) | Official kernel documentation | Memory commitment is policy-constrained, not merely physical capacity |
| [Oracle: G1 Garbage Collector](https://docs.oracle.com/en/java/javase/26/gctuning/garbage-first-g1-garbage-collector1.html) | Official runtime documentation | Collection consumes CPU and trades throughput for latency goals |
| [Jim Calabro, April 2026 Bluesky outage postmortem](https://pckt.blog/b/jcalabro/april-2026-outage-post-mortem-219ebg2) | First-person engineer report named in talk | Batch size and cross-layer resource interaction |
| [Slack, January 4 2021 outage](https://slack.engineering/slacks-outage-on-january-4th-2021/) | First-party incident report | Traffic, networking, threads, scaling and provisioning cascade |
| [Waymo, December 2025 power outage](https://waymo.com/blog/2025/12/autonomously-navigating-the-real-world/) | First-party incident account | Dark signals, all-way-stop behavior, fleet confirmation and congestion |
| [Google SRE, Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) | Authoritative operational guidance | Resource exhaustion, latency, retries and load shedding |
| [Cloudflare, July 2 2019 outage](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/) | First-party incident report | WAF regular expression, CPU exhaustion and global deployment |

Search-result snippets and tertiary summaries were not used as evidence. The article intentionally excludes attractive side topics—queueing-theory derivations, generic chaos-engineering surveys and vendor product recommendations—that did not sharpen the talkʼs core model.
'@
Write-Utf8File -Path (Join-Path $exp 'sources.md') -Content $sources
$review = @'
# Experiment 02 review

## Content review

- Rebuilt the argument from the shared timestamped corpus rather than adapting Experiment 01.
- Checked incident details against first-party accounts and limited external additions to ten retained primary or authoritative sources.
- Marked Hochsteinʼs Waymo queue interpretation as an inference; the official account supports fleet-response confirmation volume and congestion but does not publish an internal queue model.
- Avoided turning the talkʼs "optimal number of incidents is not zero" provocation into advice to permit preventable harm.
- Kept formal methods and resilience complementary, matching the Q&A rather than presenting a false opposition.

## Editorial review

- Removed a queueing-theory digression because it added notation without changing a decision.
- Replaced generic vendor links with official Linux, Oracle and Google references.
- Confirmed all local illustrations are copied from the shared corpus into this experiment and all URLs use descriptive link text.
- Confirmed the article contains no sibling-experiment path or prose dependency.

## Good-enough decision

Pass. The result is materially more knowledge-dense than a talk summary, still follows one coherent operational argument, makes source boundaries visible, and is suitable for publication after an ordinary house-style edit.
'@
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content $review

# Experiment 03: explorable concept and causality map.
$exp = New-ExperimentDirectory 'experiment-03-concept-map'
$relations = @(
    [ordered]@{from='finite_resources';to='saturation';relation='makes possible';timestamp='07:00';evidence='All systems have limits.';kind='premise'},
    [ordered]@{from='effective_demand';to='saturation';relation='pushes toward';timestamp='07:24';evidence='Demand exceeds the rate at which a resource can serve it.';kind='mechanism'},
    [ordered]@{from='retries';to='effective_demand';relation='amplifies';timestamp='24:48';evidence='Retries generate more work while the system is already slow.';kind='feedback'},
    [ordered]@{from='fanout';to='effective_demand';relation='amplifies';timestamp='25:38';evidence='One request expands into many downstream operations.';kind='feedback'},
    [ordered]@{from='autoscaling';to='effective_demand';relation='can amplify';timestamp='20:18';evidence='Slack provisioning activity added pressure to another saturated path.';kind='feedback'},
    [ordered]@{from='logging';to='effective_demand';relation='can amplify';timestamp='18:46';evidence='Error volume produced storage, thread and allocation pressure.';kind='feedback'},
    [ordered]@{from='saturation';to='latency';relation='increases';timestamp='08:35';evidence='Queued work waits longer for finite service.';kind='mechanism'},
    [ordered]@{from='latency';to='retries';relation='provokes';timestamp='24:48';evidence='Clients retry when responses time out.';kind='feedback'},
    [ordered]@{from='saturation';to='competence_boundary';relation='crosses';timestamp='10:08';evidence='Stress moves the system beyond its base competence envelope.';kind='model'},
    [ordered]@{from='capacity';to='competence_boundary';relation='moves outward';timestamp='30:32';evidence='Engineering can expand the base envelope.';kind='response'},
    [ordered]@{from='load_shedding';to='effective_demand';relation='reduces';timestamp='36:19';evidence='Operators can block traffic or expensive queries.';kind='response'},
    [ordered]@{from='optional_controls';to='adaptive_capacity';relation='enables';timestamp='34:29';evidence='Feature flags, rollback, scaling and break-glass access create options.';kind='response'},
    [ordered]@{from='expertise';to='adaptive_capacity';relation='activates';timestamp='36:54';evidence='Controls require system-specific knowledge to use safely.';kind='response'},
    [ordered]@{from='incident_learning';to='expertise';relation='develops';timestamp='37:55';evidence='Direct and vicarious incident learning build operational knowledge.';kind='learning'},
    [ordered]@{from='postmortems';to='incident_learning';relation='preserves';timestamp='39:28';evidence='Document responder reasoning, signals and red herrings.';kind='learning'},
    [ordered]@{from='adaptive_capacity';to='graceful_extensibility';relation='produces';timestamp='32:26';evidence='The system changes how it works beyond its designed boundary.';kind='model'},
    [ordered]@{from='graceful_extensibility';to='harm_containment';relation='supports';timestamp='41:12';evidence='Balance expanding the envelope with the ability to improvise.';kind='outcome'},
    [ordered]@{from='slack_incident';to='autoscaling';relation='demonstrates';timestamp='19:39';evidence='A corrective loop became part of the cascade.';kind='example'},
    [ordered]@{from='bluesky_incident';to='logging';relation='demonstrates';timestamp='17:48';evidence='A request exposed interactions among ports, logs, threads, GC and memory.';kind='example'},
    [ordered]@{from='waymo_incident';to='competence_boundary';relation='demonstrates';timestamp='21:35';evidence='A rare city-wide condition increased safety-confirmation work.';kind='example'}
)
Write-Utf8File -Path (Join-Path $exp 'relations.json') -Content ($relations | ConvertTo-Json -Depth 5)
$body = @'
<main>
  <div class="controls" aria-label="Map filters">
    <label>Show relation <select id="kind"><option value="all">All relations</option><option value="feedback">Amplifying feedback</option><option value="response">Responses</option><option value="learning">Learning</option><option value="example">Incident examples</option><option value="model">Model</option><option value="mechanism">Mechanisms</option><option value="premise">Premises</option><option value="outcome">Outcomes</option></select></label>
    <button id="reset" type="button">Reset selection</button>
  </div>
  <div class="map-layout">
    <svg id="map" viewBox="0 0 1100 650" role="img" aria-labelledby="map-title map-desc"><title id="map-title">Saturation and graceful extensibility concept map</title><desc id="map-desc">A directed map connects finite resources and amplified demand to saturation, then connects optional controls, expertise and learning to graceful extensibility.</desc></svg>
    <aside class="card" id="detail" aria-live="polite"><strong>Select a relation</strong><p>Choose any line or its label to inspect the timestamped evidence behind that connection.</p></aside>
  </div>
  <p class="small">Edges are interpretive coding decisions, not claims that the transcript contains a formal causal graph. Open <a href="relations.json">the relation ledger</a> for auditable data.</p>
</main>
'@
$extra = @'
<style>
  .map-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:1rem;align-items:start}#map{width:100%;min-height:560px;background:#fffdf7;border:1px solid var(--line);border-radius:.7rem}.edge{stroke:#a8aaa4;stroke-width:2;fill:none;marker-end:url(#arrow)}.edge.feedback{stroke:#a34834;stroke-dasharray:7 5}.edge.response{stroke:#26735b}.edge.learning{stroke:#5d55a5}.edge.dim{opacity:.12}.node circle{fill:#fffdf7;stroke:#303a36;stroke-width:2}.node text{font:600 13px system-ui;fill:#18201d;text-anchor:middle;pointer-events:none}.edge-hit{stroke:transparent;stroke-width:16;fill:none;cursor:pointer}.edge-label{font:600 11px system-ui;fill:#46514c;text-anchor:middle;cursor:pointer}.selected{stroke-width:5!important;opacity:1!important}@media(max-width:850px){.map-layout{grid-template-columns:1fr}#map{min-height:auto}}
</style>
'@
$script = @'
<script>
const nodes={finite_resources:[130,80,"Finite resources"],effective_demand:[130,230,"Effective demand"],retries:[75,370,"Retries"],fanout:[180,430,"Fan-out"],logging:[290,500,"Logging"],autoscaling:[360,390,"Autoscaling"],saturation:[430,170,"Saturation"],latency:[360,270,"Latency"],competence_boundary:[630,110,"Competence boundary"],capacity:[750,45,"Base capacity"],load_shedding:[540,330,"Load shedding"],optional_controls:[690,395,"Optional controls"],expertise:[825,480,"Operational expertise"],incident_learning:[965,530,"Incident learning"],postmortems:[1030,420,"Postmortems"],adaptive_capacity:[830,290,"Adaptive capacity"],graceful_extensibility:[960,180,"Graceful extensibility"],harm_containment:[1030,70,"Harm containment"],slack_incident:[300,590,"Slack"],bluesky_incident:[455,580,"Bluesky"],waymo_incident:[620,560,"Waymo"]};
const edges=JSON.parse(document.getElementById('edge-data').textContent);const svg=document.getElementById('map'),detail=document.getElementById('detail'),ns='http://www.w3.org/2000/svg';
svg.insertAdjacentHTML('afterbegin','<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>');
function el(n,a){const x=document.createElementNS(ns,n);Object.entries(a||{}).forEach(([k,v])=>x.setAttribute(k,v));return x}
const edgeEls=[];edges.forEach((e,i)=>{const a=nodes[e.from],b=nodes[e.to],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),sx=a[0]+dx/len*43,sy=a[1]+dy/len*26,ex=b[0]-dx/len*48,ey=b[1]-dy/len*28;const g=el('g',{'data-kind':e.kind});const p=el('path',{d:`M${sx},${sy} Q${(sx+ex)/2},${(sy+ey)/2-18} ${ex},${ey}`,class:`edge ${e.kind}`});const hit=el('path',{d:p.getAttribute('d'),class:'edge-hit'});const label=el('text',{x:(sx+ex)/2,y:(sy+ey)/2-20,class:'edge-label'});label.textContent=e.relation;function pick(){document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));p.classList.add('selected');detail.innerHTML=`<span class="tag">${e.kind}</span><h3>${nodes[e.from][2]} → ${nodes[e.to][2]}</h3><p><strong>${e.relation}</strong> at <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=${toSeconds(e.timestamp)}">${e.timestamp}</a></p><p>${e.evidence}</p>`}hit.addEventListener('click',pick);label.addEventListener('click',pick);g.append(p,hit,label);svg.append(g);edgeEls.push(g)});
Object.entries(nodes).forEach(([id,n])=>{const g=el('g',{class:'node'}),c=el('circle',{cx:n[0],cy:n[1],rx:47,ry:27}),t=el('text',{x:n[0],y:n[1]-4});const words=n[2].split(' ');if(words.length>1){const mid=Math.ceil(words.length/2);t.innerHTML=`<tspan x="${n[0]}" dy="0">${words.slice(0,mid).join(' ')}</tspan><tspan x="${n[0]}" dy="15">${words.slice(mid).join(' ')}</tspan>`}else t.textContent=n[2];g.append(c,t);svg.append(g)});
function toSeconds(t){const [m,s]=t.split(':').map(Number);return m*60+s}document.getElementById('kind').addEventListener('change',e=>edgeEls.forEach(g=>g.classList.toggle('dim',e.target.value!=='all'&&g.dataset.kind!==e.target.value)));document.getElementById('reset').addEventListener('click',()=>{document.getElementById('kind').value='all';edgeEls.forEach(g=>g.classList.remove('dim'));document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));detail.innerHTML='<strong>Select a relation</strong><p>Choose any line or its label to inspect the timestamped evidence behind that connection.</p>'});
</script>
'@
$edgeJson = $relations | ConvertTo-Json -Depth 5 -Compress
$script = "<script id=`"edge-data`" type=`"application/json`">$edgeJson</script>`n$script"
$page = New-Page -Title 'How saturation turns into failure' -Kicker 'Experiment 03 · Concept map' -Description 'An explorable, timestamp-audited map of limits, feedback loops, adaptive capacity and learning in the talk.' -Accent '#26735b' -Body $body -ExtraHead $extra -Script $script
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '03' -Name 'Timestamped concept map' -Audience 'Engineers who need a compact mental model of how the talkʼs mechanisms relate' -SourcePolicy 'Shared corpus only; independently coded relations; no other experiment output' -Workflow @('Extract recurring concepts from timestamped segments','Code directional relationships and classify their role','Attach one timestamp and evidence note to every edge','Render a keyboard-readable explorable map','Audit interpretive edges against the transcript') -PrimaryOutput 'index.html' -SupportingOutputs @('relations.json','review.md') -GoodEnough 'The map makes the talkʼs causal and adaptive structure inspectable, every relation is timestamped and editable as data, and interpretation is not misrepresented as a formal proof.' -ReviewChecks @('20 relations have timestamp evidence','Map contains accessible title and description','Filter and selection interactions implemented','Relation ledger parses as JSON','No external or sibling experiment dependencies')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 03 review

## Coding review

The map contains 21 concepts and 20 directed relations. Each edge was checked against a source segment and carries a timestamp, short evidence note and role. "Produces" and "supports" denote the talkʼs conceptual argument, not experimentally demonstrated causal strength. Incident nodes are examples rather than proof of universal behavior.

## Interaction review

The unfiltered first render communicates the complete model. Relation filters dim rather than delete context; selecting an edge reveals its evidence and local-video link. The SVG includes an accessible name and description, and the full data remains readable in `relations.json` without JavaScript.

## Good-enough decision

Pass. The artifact exposes relationships that are hard to recover from linear prose while preserving an audit path back to the talk.
'@

# Experiment 04: staged tabletop simulation.
$exp = New-ExperimentDirectory 'experiment-04-tabletop-workshop'
$body = @'
<main><div class="grid"><article class="prose">
  <p class="lede">You operate Atlas, a multi-tenant document-analysis service. Monday traffic is 35% above forecast. The exercise is not a capacity quiz: it tests whether your team can recognize interacting limits, preserve optionality and reorganize when the original operating model stops working.</p>
  <div class="callout"><strong>Success condition:</strong> protect existing interactive work, restore a controlled service state and leave an evidence trail. There is no single correct sequence.</div>
  <h2>Facilitator setup · 15 minutes</h2>
  <ul><li>Roles: incident lead, operations, application, dependency liaison, communications and observer.</li><li>Provide only the initial dashboard in Inject 0. Reveal later evidence when requested or at the marked time.</li><li>Score observable coordination, not whether participants guess the hidden mechanism.</li><li>Timebox the scenario to 55 minutes and the debrief to 25 minutes.</li></ul>
  <h2>Inject 0 · Normal, but closer to the edge <span class="tag">T+00</span></h2>
  <p>P95 latency is 420 ms against a 500 ms objective. CPU is 72%. Queue depth is stable. A new bulk-import client begins sending 18,000-item manifests, which are valid and within the documented API limit.</p>
  <p><strong>Prompt:</strong> What evidence distinguishes high utilization from saturation? What must remain available if load rises?</p>
  <h2>Inject 1 · A locally sensible response <span class="tag">T+08</span></h2>
  <p>P95 reaches 2.6 s. HTTP timeouts rise. Autoscaling adds workers. Database connections climb to 94% of pool capacity; the queueʼs oldest item is now 80 seconds old although depth fluctuates.</p>
  <p><strong>Evidence on request:</strong> each manifest item fans out to three object-store reads. Clients retry twice after 2 seconds. New workers open fresh connections during warm-up.</p>
  <p><strong>Decision gate:</strong> Continue scaling, cap concurrency, reject bulk work, alter retries, or choose another action. State what scarce resource the action consumes.</p>
  <h2>Inject 2 · The recovery path joins the incident <span class="tag">T+18</span></h2>
  <p>Verbose error logging was enabled to aid diagnosis. Log throughput rises 14×. Two nodes hit inode warnings; garbage-collection CPU rises. Deploying a configuration change fails because the deployment controller has exhausted an API quota while autoscaling.</p>
  <p><strong>Constraint:</strong> normal deployment and normal privilege elevation are unavailable. Break-glass access exists but requires two-person approval and an incident identifier.</p>
  <p><strong>Decision gate:</strong> What gets disabled, delayed or bypassed? Who owns the risk? How will the team know whether the action helped?</p>
  <h2>Inject 3 · Conflicting signs <span class="tag">T+30</span></h2>
  <p>CPU falls to 55%, yet interactive latency worsens. Queue depth falls, but age of oldest work rises. A dependency dashboard is green. Customer support reports duplicate imports.</p>
  <p><strong>Evidence on request:</strong> workers are blocked waiting for database connections; expired items leave the head of one queue while older work remains in a lower-priority partition. Retried requests are not idempotent.</p>
  <p><strong>Prompt:</strong> Which metric was an attractive red herring? Rewrite the incident model in one sentence.</p>
  <h2>Inject 4 · Stabilization is not recovery <span class="tag">T+42</span></h2>
  <p>Bulk intake is paused, retry budgets are zeroed, and interactive traffic is recovering. There are 11,000 ambiguous import operations, elevated manual-support load and a feature flag that cannot safely remain off overnight.</p>
  <p><strong>Decision gate:</strong> Define stable state, recovery owner, reconciliation plan, customer message and conditions for re-enabling work.</p>
  <h2>Debrief</h2>
  <ol><li>Where did demand get amplified?</li><li>Which mechanism intended to help became another consumer?</li><li>Which control existed but was not usable quickly?</li><li>When did the team change its operating strategy rather than merely add capacity?</li><li>What did observers learn about expertise, authority and coordination?</li><li>Which corrective action might create a future incident?</li></ol>
</article><aside class="side"><div class="card"><strong>Observer rubric</strong><p class="small">Score 0–2 for each:</p><ul class="small"><li>Names critical work</li><li>Tracks queue age and drain rate</li><li>Models action-generated load</li><li>Uses explicit decision ownership</li><li>Preserves reversibility</li><li>Updates hypotheses from evidence</li><li>Plans reconciliation</li></ul><p><strong>Good-enough:</strong> 9/14 with no zero for critical work or decision ownership.</p></div><div class="card"><strong>Talk anchors</strong><p class="small"><a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1140">Bluesky 19:00</a><br><a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1200">Slack 20:00</a><br><a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=2050">Optionality 34:10</a><br><a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=2380">Learning 39:40</a></p></div></aside></div></main>
'@
$page = New-Page -Title 'The helpful system makes it worse' -Kicker 'Experiment 04 · Tabletop workshop' -Description 'A 95-minute facilitator-ready simulation of interacting limits, misleading signals and recovery machinery under pressure.' -Accent '#b24b32' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '04' -Name 'Saturation tabletop workshop' -Audience 'Production engineering teams, incident commanders and facilitators' -SourcePolicy 'Shared corpus mechanisms transformed into a fictional scenario; no external research and no other experiment output' -Workflow @('Identify incident mechanisms that test distinct skills','Create one fictional service and coherent hidden state','Stage evidence so local responses can alter the scenario','Define decision gates, observer rubric and debrief','Dry-run the timing and reveal order') -PrimaryOutput 'index.html' -SupportingOutputs @('participant-worksheet.md','review.md') -GoodEnough 'A facilitator can run the scenario in under two hours without inventing missing rules, participants must reason rather than guess, and the debrief measures graceful extensibility rather than trivia.' -ReviewChecks @('Five staged injects form one coherent incident','Every inject offers actionable evidence','Rubric observes team behavior','No real organization is falsely described','Scenario is print-readable')
Write-Utf8File -Path (Join-Path $exp 'participant-worksheet.md') -Content @'
# Atlas tabletop participant worksheet

| Time | Current hypothesis | Evidence for / against | Action and owner | Scarce resource consumed | Reversal signal |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |

## Service priorities

1. Work that must continue:
2. Work that may degrade:
3. Work that may be refused:

## After stabilization

- Ambiguous work requiring reconciliation:
- Temporary controls still active:
- Customer/internal communications owner:
- Evidence to preserve for learning:
'@
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 04 review

## Scenario review

The fictional Atlas service combines mechanisms from the talk without claiming a real outage: batch fan-out, retry amplification, connection saturation, autoscaling load, log amplification, finite recovery APIs and non-idempotent work. Injects are causally consistent, reveal progressively, and leave multiple defensible choices.

## Facilitation review

The exercise fits 15 minutes setup, 55 minutes play and 25 minutes debrief. The rubric rewards declaring priorities, updating the model and owning tradeoffs. It does not reward guessing "the root cause." The participant worksheet captures reasoning and reversibility for the debrief.

## Good-enough decision

Pass. A prepared facilitator can run the workshop as written, and its learning goals test adaptation beyond the designed envelope.
'@

# Experiment 05: operational runbook.
$exp = New-ExperimentDirectory 'experiment-05-saturation-runbook'
$body = @'
<main><article class="prose">
  <p class="lede">Use this runbook when latency, refusal, resource queues or recovery loops suggest that effective demand has outrun finite service capacity. The first objective is not full diagnosis. It is to protect critical work while preventing the response from adding more load.</p>
  <div class="callout"><strong>Declare early if:</strong> queue age rises across two measurement intervals; retry traffic exceeds 10% of attempts; a hard resource or dependency quota exceeds 85%; or two capacity controls are interacting unexpectedly. Tune these provisional gates to the service.</div>
  <h2>0–5 minutes · Bound the incident</h2>
  <ol><li>Name the user-visible critical path and the work allowed to fail closed, fail open, delay or degrade.</li><li>Assign incident lead, operations owner and communications owner. Record every temporary control with owner and expiry.</li><li>Freeze nonessential deploys, batch starts and experiments. Do not automatically disable safe rollback.</li><li>Capture a before-state: throughput, latency, errors, queue age/depth, retry volume, concurrency and dependency health.</li></ol>
  <h2>5–15 minutes · Locate queued work</h2>
  <table><thead><tr><th>Layer</th><th>Inspect</th><th>Saturation evidence</th><th>Misleading comfort signal</th></tr></thead><tbody>
    <tr><td>CPU</td><td>Run queue, steal, throttling, per-core load</td><td>Runnable work and latency rise together</td><td>Average CPU below 100%</td></tr>
    <tr><td>Memory</td><td>Live set, allocation, reclaim, GC, OOM</td><td>Reclaim or collector work crowds out service</td><td>Free bytes after killing workers</td></tr>
    <tr><td>Disk / logs</td><td>Latency, queue, bytes, inodes, amplification</td><td>Writes wait or metadata cannot allocate</td><td>Capacity in bytes when inodes are gone</td></tr>
    <tr><td>Network</td><td>Connections, ports, retransmits, backlog</td><td>Allocation/wait failures and retransmission</td><td>Aggregate bandwidth below link rate</td></tr>
    <tr><td>Application pools</td><td>Active, waiting, timeout, service time</td><td>Wait time grows; completions fall</td><td>Pool fully utilized</td></tr>
    <tr><td>Queues</td><td>Age of oldest, ingress, egress, expiry</td><td>Drain rate below arrival rate</td><td>Depth falls due to expiration</td></tr>
    <tr><td>People / control plane</td><td>Approvals, access, API quotas, deploy queue</td><td>Recovery action waits or fails</td><td>Primary data plane looks stable</td></tr>
  </tbody></table>
  <h2>15–30 minutes · Stop amplification</h2>
  <table><thead><tr><th>Mechanism</th><th>Containment</th><th>Guardrail</th><th>Success signal</th></tr></thead><tbody>
    <tr><td>Client or service retries</td><td>Increase backoff, add jitter, reduce attempt budget</td><td>Preserve necessary at-most-once semantics</td><td>Retry share and duplicate work fall</td></tr>
    <tr><td>Fan-out / expensive input</td><td>Cap per-request work, reject or defer bulk classes</td><td>Return explicit partial/refusal status</td><td>Downstream operations per request fall</td></tr>
    <tr><td>Autoscaling / recovery</td><td>Pause the loop or cap change rate</td><td>Maintain minimum healthy capacity</td><td>Control-plane and warm-up demand fall</td></tr>
    <tr><td>Error logging</td><td>Sample, aggregate or rate-limit repeated errors</td><td>Retain unique signatures and security events</td><td>Write rate drops without losing incident shape</td></tr>
    <tr><td>Optional features</td><td>Disable via tested dynamic control</td><td>Record owner, scope and expiry</td><td>Critical-path service rate recovers</td></tr>
    <tr><td>Background work</td><td>Pause intake; preserve durable cursor</td><td>Estimate reconciliation debt</td><td>Oldest critical work drains</td></tr>
  </tbody></table>
  <h2>Decision gates</h2>
  <h3>Scale only when all are true</h3><ul><li>The constrained resource scales with the proposed unit.</li><li>Warm-up and control-plane work do not consume the same bottleneck.</li><li>The dependency can accept the increased concurrency.</li><li>A measurable stop condition and rollback owner exist.</li></ul>
  <h3>Use break-glass access only when all are true</h3><ul><li>Ordinary access is unavailable or too slow for the declared impact.</li><li>A human approver, incident identifier and audit trail exist.</li><li>The action is narrow, reversible where possible, and has a second observer.</li><li>Credentials or grants have an explicit expiry.</li></ul>
  <h2>Stabilization checklist</h2>
  <ul><li>Arrival rate is at or below sustainable completion rate for critical work.</li><li>Age of oldest critical item declines for three consecutive intervals.</li><li>Retries and duplicate work are bounded.</li><li>No temporary action is silently amplifying another scarce path.</li><li>Ambiguous or dropped work is quantified and assigned.</li><li>Temporary controls, permissions and flags have owners and removal conditions.</li></ul>
  <h2>After the incident · Preserve adaptive evidence</h2>
  <p>Save the hypothesis timeline, control changes, missing access, ambiguous signals, near-misses and actions that bought time. Separate improvements to the base envelope from improvements to adaptive capacity. For each corrective action, ask what new resource it consumes and how it might participate in a future cascade.</p>
  <div class="callout"><strong>Do not copy thresholds blindly.</strong> The provisional gates in this runbook are prompts. Establish service-specific values through load tests, dependency contracts and incidents.</div>
</article></main>
'@
$page = New-Page -Title 'Saturation response runbook' -Kicker 'Experiment 05 · Operations' -Description 'A detect–diagnose–contain–recover workflow for when queues, limits and corrective loops start interacting.' -Accent '#275c8c' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '05' -Name 'Saturation response runbook' -Audience 'On-call engineers and incident commanders' -SourcePolicy 'Shared corpus only; operational transformation with clearly labeled provisional thresholds; no other experiment output' -Workflow @('Extract observable saturation mechanisms','Order actions by incident time horizon','Separate containment from diagnosis and recovery','Add decision gates for risky adaptive controls','Review for actionability and unsafe generic thresholds') -PrimaryOutput 'index.html' -SupportingOutputs @('review.md') -GoodEnough 'An on-call team can use the runbook to contain amplification and test recovery decisions, while all generic thresholds are visibly provisional and service-specific judgment remains explicit.' -ReviewChecks @('Critical-work declaration comes first','Every mitigation includes a guardrail and success signal','Scaling and break-glass have decision gates','Recovery debt is assigned','Threshold disclaimer is prominent')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 05 review

## Operational review

The runbook begins with service priorities and amplification control, not a long inventory. Resource inspection covers physical, virtual and human/control-plane limits. Scaling is conditional because the Slack example shows that a response can consume a coupled bottleneck. Logging, retries and background work each have a containment action, guardrail and observable success signal.

## Safety review

Numeric declaration gates are explicitly provisional and must not be copied as universal SLOs. Break-glass guidance requires approval, audit, narrow scope and expiry. The document avoids commands that could be unsafe across systems and assigns reconciliation after load shedding.

## Good-enough decision

Pass. The workflow is immediately useful as a service-specific runbook seed and makes its required customization visible.
'@

# Experiment 06: teaching kit.
$exp = New-ExperimentDirectory 'experiment-06-teaching-kit'
Copy-CorpusFrame $exp '000360000' 'frank-starling.jpg'
Copy-CorpusFrame $exp '000600000' 'competence-envelope.jpg'
$body = @'
<main><div class="grid"><article class="prose">
  <h2>Learning objectives</h2><p>By the end of 75 minutes, learners can:</p><ol><li>Distinguish utilization, saturation and failure.</li><li>Trace amplification through retries, fan-out, logging and automated recovery.</li><li>Explain base capacity versus graceful extensibility.</li><li>Propose one safety valve and evaluate its tradeoff.</li><li>Describe incident evidence that preserves responder reasoning.</li></ol>
  <h2>Lesson sequence</h2>
  <table><thead><tr><th>Minutes</th><th>Activity</th><th>Instructor move</th><th>Evidence of learning</th></tr></thead><tbody><tr><td>0–8</td><td>Boundary prediction</td><td>Ask: "What fails first in a healthy service under 4× demand?"</td><td>Learners name a finite resource and observable queue.</td></tr><tr><td>8–20</td><td>Mini-lesson: saturation</td><td>Use Frank–Starling and competence-envelope frames.</td><td>Learners distinguish a boundary from an error.</td></tr><tr><td>20–35</td><td>Feedback-loop tracing</td><td>Give the retry scenario below.</td><td>Groups label reinforcing edges.</td></tr><tr><td>35–50</td><td>Incident comparison</td><td>Assign Bluesky, Slack or Waymo.</td><td>Groups identify demand, finite path and adaptation.</td></tr><tr><td>50–65</td><td>Control design</td><td>Require one guardrail and reversal signal.</td><td>Proposals state what the control consumes.</td></tr><tr><td>65–75</td><td>Retrieval quiz</td><td>Use questions before revealing answers.</td><td>At least 6/8 with corrected reasoning.</td></tr></tbody></table>
  <figure><img src="assets/frank-starling.jpg" alt="Frank-Starling curve used in the talk as a saturation analogy"><figcaption>Prompt: where does "more input" stop producing proportional output, and what is observable before collapse?</figcaption></figure>
  <h2>Exercise A · Complete the loop</h2><p>A dependencyʼs P99 rises above the caller timeout. Clients retry twice. Workers remain occupied while waiting. Autoscaling adds callers.</p><ol><li>Draw four nodes and arrows that make the reinforcing loop explicit.</li><li>Mark the first quantity that queues.</li><li>Choose one edge to cut. State a user-visible cost.</li><li>Name a metric that can improve while the incident worsens.</li></ol>
  <h2>Exercise B · Classify the response</h2><p>For each, decide whether it expands the base envelope, creates optionality, activates adaptive capacity, or does more than one:</p><ul><li>Add headroom to a connection pool after load testing.</li><li>Give incident commanders a tested, expiring traffic-block control.</li><li>Teach responders how to isolate one tenant without redeploying.</li><li>Write a postmortem that preserves abandoned hypotheses and red herrings.</li></ul>
  <h2>Quiz</h2><ol><li>Can a resource be saturated below 100% reported utilization? Explain.</li><li>Why can a bounded queue be a safety feature?</li><li>What made Slackʼs autoscaling response relevant to saturation?</li><li>What is the risk of logging every error during a failure?</li><li>How does a slow leak hide behind deployment?</li><li>What separates a feature flag from usable adaptive capacity?</li><li>Why does the talk resist "prevent every incident" as a learning strategy?</li><li>What should a postmortem preserve besides corrective actions?</li></ol>
  <p><a href="answer-key.html">Open the instructor answer key</a>.</p>
</article><aside class="side"><div class="card"><strong>Before class</strong><ul class="small"><li>Watch or read source segments 06:00–11:00, 17:00–23:00 and 31:00–41:30.</li><li>Pick one system familiar to learners.</li><li>Do not reveal the quiz key.</li></ul></div><div class="card"><strong>Misconceptions to surface</strong><ul class="small"><li>High utilization equals saturation.</li><li>Scaling always reduces pressure.</li><li>A control is usable merely because it exists.</li><li>A root cause contains the learning.</li></ul></div></aside></div></main>
'@
$page = New-Page -Title 'Teaching saturation as a systems skill' -Kicker 'Experiment 06 · Teaching kit' -Description 'A 75-minute lesson with objectives, exercises, misconceptions, retrieval questions and a source-checked answer key.' -Accent '#7253a3' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
$answers = @'
<main><article class="prose"><h2>Answer key and reasoning</h2><ol>
<li><strong>Yes.</strong> An aggregate can hide a hot core, lock, queue, quota or dependency. Saturation is queued or refused work at a limiting resource, not a universal utilization threshold.</li>
<li><strong>It chooses an earlier, legible failure.</strong> A bound can reject or expire work before physical memory, connections or latency collapse unpredictably.</li>
<li><strong>Scaling created new provisioning and connection demand.</strong> The response was locally rational yet coupled to other finite services.</li>
<li><strong>Log amplification.</strong> Error volume may consume CPU, allocations, threads, I/O, bytes or inodes and deepen the incident.</li>
<li><strong>Restart resets the evidence.</strong> If each deploy clears retained resources, the leak appears as a long-horizon trend or only during an unusually long interval.</li>
<li><strong>Recognition, authority, expertise and feedback.</strong> Someone must know when and how to use the flag, have access, and observe whether it helped.</li>
<li><strong>Unknown boundaries require evidence.</strong> The point is not to welcome harm; it is that small contained surprises and vicarious learning reveal brittleness that design alone misses.</li>
<li><strong>Sensemaking.</strong> Preserve signals, hypotheses, discarded explanations, coordination constraints, improvisations and what responders needed but lacked.</li>
</ol><h2>Exercise B guidance</h2><ul><li>Pool headroom primarily expands the base envelope.</li><li>An expiring traffic block creates optionality; using it well activates adaptive capacity.</li><li>Isolation expertise turns a control into adaptive capacity.</li><li>A reasoning-rich postmortem develops future expertise and therefore potential adaptive capacity.</li></ul><p><a href="index.html">Return to lesson</a></p></article></main>
'@
$answerPage = New-Page -Title 'Instructor answer key' -Kicker 'Experiment 06 · Restricted instructor material' -Description 'Reasoned answers and misconception checks for the saturation teaching kit.' -Accent '#7253a3' -Body $answers
Write-Utf8File -Path (Join-Path $exp 'answer-key.html') -Content $answerPage
Write-ExperimentMetadata -Path $exp -Id '06' -Name 'Saturation teaching kit' -Audience 'Engineering educators, team leads and senior engineers teaching reliability concepts' -SourcePolicy 'Shared corpus only; educational transformation; no external research and no other experiment output' -Workflow @('Derive measurable learning objectives','Sequence explanation, comparison and application','Design exercises around likely misconceptions','Write questions before the answer key','Check every answer against source claims') -PrimaryOutput 'index.html' -SupportingOutputs @('answer-key.html','assets/','review.md') -GoodEnough 'An instructor can teach a coherent 75-minute session, exercises require reasoning rather than recall alone, and the separate answer key explains why each response is correct.' -ReviewChecks @('Five measurable objectives','Timing sums to 75 minutes','Exercises include tradeoffs','Eight questions have reasoned answers','Instructor material separated')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 06 review

## Instructional review

Objectives move from distinction and tracing to design and explanation. The lesson alternates short instruction with prediction, diagramming, incident comparison and retrieval. Exercises surface four likely misconceptions and require costs, guardrails or reversal signals rather than slogan repetition.

## Source review

Answers preserve the talkʼs distinction between known capacity and adaptation beyond design. The incident-learning answer explicitly rejects treating incidents as desirable harm. The quiz contains no dependency on researched material or another experiment.

## Good-enough decision

Pass. The kit is teachable in one session, checks transfer to an unfamiliar system and includes a complete reasoned key.
'@

# Experiment 07: engineering-leadership decision brief.
$exp = New-ExperimentDirectory 'experiment-07-executive-brief'
$body = @'
<main><article class="prose">
  <p class="lede">Capacity work buys room inside the failures we can already name. Resilience work buys options when the model is incomplete. Engineering organizations need both—and should be able to show where they are investing in each.</p>
  <h2>The decision in one page</h2>
  <p>Software at scale operates against finite technical and organizational resources. Demand can be ordinary growth or self-generated amplification through retries, fan-out, logging, autoscaling and recovery. When several limits couple, locally rational mechanisms can worsen the incident. The management error is to interpret each outage only as a missing guardrail and fund an endless list of component fixes. Some fixes are essential; none makes surprise finite.</p>
  <div class="callout"><strong>Portfolio rule:</strong> fund expansion of known competence boundaries and the practiced ability to change operating strategy beyond them. Ask every reliability proposal which side it improves.</div>
  <h2>Four investment questions</h2>
  <table><thead><tr><th>Question</th><th>Evidence to request</th><th>Failure pattern if absent</th></tr></thead><tbody>
    <tr><td>What work is protected under overload?</td><td>Explicit service priorities, load-shed semantics, reconciliation owner</td><td>All work degrades together; the physical limit chooses the policy</td></tr>
    <tr><td>Which automatic responses add demand?</td><td>Retry budgets, fan-out maps, scale warm-up cost, logging controls</td><td>A recovery loop participates in the cascade</td></tr>
    <tr><td>Can responders change strategy quickly and safely?</td><td>Exercised feature flags, rollback, isolation, break-glass access, feedback signals</td><td>Controls exist on paper but cannot be used in time</td></tr>
    <tr><td>Does incident learning preserve expertise?</td><td>Reasoning timelines, ambiguous signals, discarded hypotheses, cross-team practice</td><td>Postmortems produce tickets while operational understanding decays</td></tr>
  </tbody></table>
  <h2>What to put on a quarterly review</h2>
  <ul><li><strong>Known-boundary evidence:</strong> load-test range, critical queue age, limiting dependency quotas, largest safe tenant or batch, and remaining uncertainty—not a single "capacity" percentage.</li><li><strong>Amplification budget:</strong> maximum attempts, fan-out and recovery work generated per unit of user demand.</li><li><strong>Adaptive control readiness:</strong> last exercised date, authorized roles, time to activation, blast radius, reversal signal and expiry behavior.</li><li><strong>Learning throughput:</strong> time from incident to shared operational insight, including cross-team and vicarious learning—not ticket count.</li></ul>
  <h2>Governance without theater</h2>
  <p>A feature-flag inventory is not resilience. A tabletop count is not expertise. A capacity forecast is not a boundary model. Reviews should sample one concrete scenario: ask an owner to show how critical traffic would be protected if the expected bottleneck were wrong. Evidence should include who can act at 03:00, what permission they need, how they observe success and what debt remains afterward.</p>
  <h2>Choices leaders must make explicitly</h2>
  <ol><li>Which customer promises may degrade to protect higher-priority work?</li><li>How much short-term control risk is acceptable during a declared incident?</li><li>Which teams own cross-service limits that no component team can solve alone?</li><li>How much engineering capacity is reserved for rehearsals, instrumentation and control usability?</li><li>When do corrective-action backlogs crowd out actual incident understanding?</li></ol>
  <p class="lede">The goal is not a system that never crosses a boundary. It is an organization that knows its critical commitments, contains harm, and can reorganize before pressure removes its remaining choices.</p>
</article></main>
'@
$page = New-Page -Title 'Fund room—and the ability to maneuver' -Kicker 'Experiment 07 · Executive brief' -Description 'A decision brief for engineering leaders allocating reliability investment between known capacity and adaptive capability.' -Accent '#75501a' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '07' -Name 'Engineering leadership decision brief' -Audience 'CTOs, VPs of Engineering, platform leaders and reliability program owners' -SourcePolicy 'Shared corpus only; independently reframed for organizational decisions; no external research and no other experiment output' -Workflow @('Extract decisions implied by technical mechanisms','Translate resources into governance evidence','Separate investment inputs from proxy metrics','Condense to a one-sitting brief','Review for actionable ownership and risk language') -PrimaryOutput 'index.html' -SupportingOutputs @('board-prompts.txt','review.md') -GoodEnough 'A leadership team can use the brief in a quarterly review to make explicit allocation and risk decisions without requiring detailed familiarity with the talk.' -ReviewChecks @('Thesis visible in first paragraph','Technical examples translated into evidence requests','Proxy metrics explicitly challenged','Five decisions have accountable owners','No unsupported financial claims')
Write-Utf8File -Path (Join-Path $exp 'board-prompts.txt') -Content @'
SATURATION AND ADAPTIVE CAPACITY — REVIEW PROMPTS

1. Which user work must remain available during overload, and what will we refuse first?
2. Show one automatic recovery mechanism and the finite resource it consumes.
3. What is our largest tested operating region, and what uncertainty remains outside it?
4. Demonstrate one emergency control: authority, activation time, feedback and reversal.
5. What did the last incident teach about how responders thought—not only what broke?
6. Which corrective action could become part of a future cascade?
'@
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 07 review

## Decision review

The brief converts the talk into four evidence requests, a quarterly review set and five explicit leadership choices. It avoids promising an ROI value the source cannot support and does not reduce resilience to a maturity score. The portfolio rule preserves the talkʼs balance between improving the designed system and maintaining adaptive room.

## Readability review

The decision is stated before background. Technical vocabulary is defined through consequences, and the six plain-text prompts can be inserted into an existing review agenda. The HTML prints cleanly without the decorative footer or side controls.

## Good-enough decision

Pass. The brief is short enough for leadership use and specific enough to change what evidence a review requests.
'@

# Experiment 08: skeptical claim audit.
$exp = New-ExperimentDirectory 'experiment-08-claim-audit'
$claims = @(
    [ordered]@{id='C01';time='03:40';type='normative';claim='We should not accept software systems that nobody can understand.';support='Speaker position, prompted by Lamportʼs biology analogy.';assumption='Greater comprehensibility is achievable at acceptable cost.';challenge='Some system-level behavior may remain emergent despite precise components.';verdict='Provocation, not an empirical result.'},
    [ordered]@{id='C02';time='05:34';type='model';claim='Production software is a complex adaptive sociotechnical system.';support='Operations depend on people, organizations, tooling, dependencies and changing load.';assumption='The analysis boundary includes all of these actors.';challenge='A narrow component can still be analyzed usefully without the full system.';verdict='Useful scope choice; broad by design.'},
    [ordered]@{id='C03';time='07:00';type='premise';claim='All operational systems have finite limits.';support='Physical and configured resources are bounded at a given time.';assumption='"Limit" includes time, quotas and human attention.';challenge='Elastic supply can move the limit but does not remove finitude.';verdict='Strong foundational premise.'},
    [ordered]@{id='C04';time='10:08';type='model';claim='Stress can push a system outside a competence envelope.';support='Woods-inspired conceptual model applied to software operations.';assumption='Competent performance has a meaningful context-dependent boundary.';challenge='The boundary is usually multi-dimensional and not directly observable.';verdict='Explanatory model, not a predictive curve.'},
    [ordered]@{id='C05';time='18:10';type='causal example';claim='The Bluesky batch triggered coupled saturation across ports, logs, threads, GC and memory.';support='Incident account cited by the speaker and timestamped slide narrative.';assumption='Reconstructed interactions reflect the production event accurately.';challenge='Relative contribution of each resource needs incident telemetry.';verdict='Plausible incident-specific chain.'},
    [ordered]@{id='C06';time='20:18';type='causal example';claim='Slackʼs autoscaling response added pressure to other finite services.';support='Speakerʼs walkthrough of Slackʼs first-party postmortem.';assumption='Provisioning load materially contributed to the cascade.';challenge='Autoscaling was one interaction, not a universal cause.';verdict='Well-scoped example; do not generalize to "scaling is bad."'},
    [ordered]@{id='C07';time='22:07';type='inference';claim='Waymoʼs safety-confirmation path became saturated.';support='Many vehicles encountered dark signals and requested confirmation.';assumption='Requests waited in a finite service path describable as a queue.';challenge='The public account does not publish an internal queue or capacity trace.';verdict='Operationally useful inference; not directly verified.'},
    [ordered]@{id='C08';time='25:38';type='mechanism';claim='Fan-out and retries amplify effective demand.';support='Each incoming unit can create multiple downstream or repeated units.';assumption='Amplified work overlaps the period of constrained capacity.';challenge='Caching, deduplication and retry budgets can weaken the loop.';verdict='Strong conditional mechanism.'},
    [ordered]@{id='C09';time='28:27';type='universal';claim='We cannot avoid saturation.';support='Resources remain finite, pressure changes and some limits are unknown.';assumption='"Avoid" means eliminate for all future conditions, not reduce frequency.';challenge='Specific saturation modes can be designed out or made unreachable in a bounded domain.';verdict='Defensible only with the universal reading made explicit.'},
    [ordered]@{id='C10';time='32:26';type='model';claim='Graceful extensibility changes how a system works beyond its designed boundary.';support='Woodsʼs model and examples of alternate operational strategies.';assumption='People and controls are part of the system.';challenge='Successful improvisation is difficult to pre-measure.';verdict='Useful distinction from ordinary headroom.'},
    [ordered]@{id='C11';time='38:20';type='provocation';claim='The optimal number of incidents is not zero.';support='Incidents reveal actual boundaries and build expertise.';assumption='Incident cost and learning value can be traded; smaller contained events are possible.';challenge='Organizations can learn through tests and othersʼ incidents; harm is unevenly distributed.';verdict='Keep as a challenge to zero-risk rhetoric, not a numeric policy.'},
    [ordered]@{id='C12';time='40:12';type='prescription';claim='Postmortems should document responder thinking, signals and red herrings.';support='Those details expose adaptive capacity and support vicarious learning.';assumption='Psychological safety and adequate recording make the account credible.';challenge='More narrative can increase cost or hindsight reconstruction.';verdict='Actionable, with facilitation and privacy constraints.'},
    [ordered]@{id='C13';time='41:12';type='prescription';claim='Balance expanding the competence envelope with improving improvisation.';support='Neither finite design capacity nor unprepared improvisation is sufficient alone.';assumption='Organizations can invest deliberately in both.';challenge='The balance is context-specific and not quantified.';verdict='Sound allocation principle; not an optimization formula.'}
)
$csv = $claims | ConvertTo-Csv -NoTypeInformation
Write-Utf8File -Path (Join-Path $exp 'claim-matrix.csv') -Content ($csv -join "`r`n")
$rows = ($claims | ForEach-Object { "<tr><td><strong>$($_.id)</strong><br><span class=`"tag`">$($_.type)</span></td><td class=`"time`"><a href=`"../../$videoFileName#t=$([int]([timespan]::Parse('00:'+$_.time).TotalSeconds))`">$($_.time)</a></td><td>$($_.claim)</td><td>$($_.support)</td><td>$($_.assumption)</td><td>$($_.challenge)</td><td>$($_.verdict)</td></tr>" }) -join "`n"
$body = @"
<main><article>
  <p class="lede">This audit treats the talk as an argument to interrogate, not a set of facts to repeat. It separates premises, models, incident-specific causal stories, universal claims and prescriptions, then records what each claim assumes and what would weaken it.</p>
  <div class="callout"><strong>Reading rule:</strong> "challenge" is not a rebuttal. It states the boundary a careful reader should preserve before applying the claim elsewhere.</div>
  <div style="overflow-x:auto"><table><thead><tr><th>ID / type</th><th>Time</th><th>Claim</th><th>Support in talk</th><th>Key assumption</th><th>What would weaken it</th><th>Audit verdict</th></tr></thead><tbody>$rows</tbody></table></div>
  <h2>What survives the skeptical pass</h2>
  <p>The strongest core is modest: operational resources are finite; work can queue or be refused; recovery mechanisms can consume coupled resources; and controls require authority, knowledge and feedback. These claims do not depend on treating the competence envelope as a measurable two-dimensional curve.</p>
  <p>The claims requiring the most care are deliberately memorable. "Saturation is unavoidable" is defensible as a statement about all possible future conditions, not as permission to ignore preventable limits. "The optimal number of incidents is not zero" should motivate contained practice and vicarious learning, not normalize customer harm. The Waymo queue is a reasonable interpretation of public behavior, but the talk does not provide direct internal telemetry.</p>
  <p><a href="claim-matrix.csv">Download the editable claim matrix</a>.</p>
</article></main>
"@
$page = New-Page -Title 'A skeptical audit of the saturation argument' -Kicker 'Experiment 08 · Claim audit' -Description 'Thirteen material claims classified, timestamped, bounded by assumptions and paired with the evidence that could weaken them.' -Accent '#823d63' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '08' -Name 'Skeptical claim audit' -Audience 'Critical readers, reviewers and engineering teams deciding which ideas to operationalize' -SourcePolicy 'Shared corpus only; adversarial reading from scratch; no external validation and no other experiment output' -Workflow @('Extract material claims rather than topics','Classify rhetorical and evidentiary role','Record source support and assumptions','Construct a plausible weakening condition','Write a bounded verdict','Review against timestamped transcript') -PrimaryOutput 'index.html' -SupportingOutputs @('claim-matrix.csv','review.md') -GoodEnough 'The audit makes the argument safer to reuse by separating robust mechanisms from analogy, inference and provocation, without demanding certainty the talk never claims.' -ReviewChecks @('Thirteen claims have timestamps','Every claim has assumption and challenge','Incident examples are not generalized silently','Provocations receive bounded interpretations','CSV and HTML carry the same rows')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 08 review

## Skeptical review

Thirteen claims cover the opening framing, finite-resource premise, competence model, three incident narratives, amplification, inevitability, graceful extensibility, incident learning and the concluding prescription. The matrix distinguishes the support actually present in the talk from evidence a stronger empirical claim would require.

## Fairness review

Challenges are boundary conditions rather than straw-man rebuttals. The review does not demand that a conference talk prove a universal quantitative law. It preserves the speakerʼs Q&A position that formal methods and resilience address different but compatible parts of the problem.

## Good-enough decision

Pass. Readers can see which ideas are sturdy operational mechanisms, which are interpretive models and which should remain provocations.
'@

# Experiment 09: multi-surface publishing kit.
$exp = New-ExperimentDirectory 'experiment-09-publishing-kit'
Copy-CorpusFrame $exp '001860000' 'prepare-to-be-surprised.jpg'
Copy-CorpusFrame $exp '002400000' 'balance-the-envelope.jpg'
$body = @'
<main><div class="grid"><article class="prose">
  <h2>Newsletter lead · 430 words</h2>
  <div class="card"><p><strong>Your system may fail because its recovery machinery works exactly as designed.</strong></p><p>In his SSW 2026 talk, Lorin Hochstein calls attention to saturation: the point where demand for a finite resource outruns its ability to serve work. The resource may be CPU or memory, but it may also be a connection pool, a confirmation service, an API quota—or the attention and authority of responders.</p><p>The uncomfortable examples are not simple overload. In Slackʼs 2021 outage, traffic and network pressure blocked web threads. Autoscaling tried to help, but provisioning introduced pressure into other finite paths. In the Bluesky incident described in the talk, a large valid batch coupled goroutines, network ports, logging, threads, garbage collection and memory. A local solution became part of a system-level loop.</p><p>The usual response is to expand capacity and add guardrails. We should. But every new bound is still finite, and every automated response consumes something. Hochstein borrows the resilience-engineering idea of a competence envelope: the region where the system performs capably under expected pressure. We can enlarge it; we cannot make it infinite.</p><p>Beyond that boundary, survival depends on graceful extensibility—the ability to change how the system operates. That means more than spare servers. It means tested controls, authority to use them, feedback that shows whether they worked, and operational expertise: traffic shedding, quick rollback, tenant isolation, expiring break-glass access, a feature that can really be disabled at 03:00.</p><p>A useful review question follows: for every mechanism that responds automatically to failure—retry, scale, log, rebuild—what scarce resource does it consume, and what stops it? A second question is harder: if the bottleneck is not the one we predicted, which options remain?</p></div>
  <h2>Five short posts</h2>
  <div class="card"><p><strong>1 / Mechanism.</strong> Saturation isnʼt "the graph reached 100%." Itʼs work waiting or being refused because a finite resource canʼt serve it fast enough. Inspect queue age, drain rate and refusal—not just averages.</p></div>
  <div class="card"><p><strong>2 / Feedback.</strong> Retries, autoscaling and verbose logs are not free responses to failure. They are new demand. During an incident, ask what each corrective loop consumes and what condition stops it.</p></div>
  <div class="card"><p><strong>3 / Design.</strong> A bounded queue can be a feature: it chooses an early, legible refusal before memory or latency chooses a larger failure. The question is which work gets refused and how it is reconciled.</p></div>
  <div class="card"><p><strong>4 / Operations.</strong> A feature flag is optionality, not resilience. It becomes adaptive capacity only when someone can recognize the need, has authority, knows the side effects and can observe the result.</p></div>
  <div class="card"><p><strong>5 / Learning.</strong> A postmortem that records only the broken component and action items discards the most reusable evidence: what responders noticed, believed, rejected, needed and improvised.</p></div>
  <h2>Quote cards</h2>
  <figure><img src="assets/prepare-to-be-surprised.jpg" alt="Talk slide with the message Prepare to be surprised"><figcaption>Caption: You cannot enumerate every way a finite system will cross its boundary. Preparedness is a practiced ability to adapt—not a complete list of surprises. <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=1860">Source context at 31:00</a>.</figcaption></figure>
  <figure><img src="assets/balance-the-envelope.jpg" alt="Talk slide saying not to focus only on expanding the competence envelope"><figcaption>Caption: Capacity engineering and adaptive capability compete for the same attention. The argument is to balance them, not to stop improving the base system. <a href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=2400">Source context at 40:00</a>.</figcaption></figure>
  <h2>Editorial checklist</h2><ul><li>Watch at least 45 seconds around any clipped quotation.</li><li>Do not turn a paraphrase printed on a slide into a speaker quotation.</li><li>Keep "optimal incidents" paired with containment and learning; never celebrate impact.</li><li>Describe the Waymo confirmation queue as the speakerʼs inference unless internal evidence is added.</li><li>Do not write "scaling caused the Slack outage"; describe the coupled contribution.</li><li>Link the full local talk or original host when published.</li><li>Add image credit and conference permission according to the eventual publisherʼs policy.</li><li>Recheck timestamps if the source video is transcoded or trimmed.</li></ul>
</article><aside class="side"><div class="card"><strong>Angle menu</strong><ul class="small"><li>Recovery is load</li><li>Queues are policies</li><li>Controls need expertise</li><li>Learn the reasoning</li><li>Capacity is not infinity</li></ul></div><div class="card"><strong>Voice rule</strong><p class="small">Concrete mechanism first, aphorism second. Preserve uncertainty. Never attribute this kitʼs connective prose to the speaker.</p></div></aside></div></main>
'@
$page = New-Page -Title 'Publish the mechanism, not just the slogan' -Kicker 'Experiment 09 · Publishing kit' -Description 'A newsletter lead, five short-form adaptations, two source-grounded image cards and an editorial safety checklist.' -Accent '#a33f31' -Body $body
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '09' -Name 'Multi-surface publishing kit' -Audience 'Technical editors, newsletter writers and engineering advocates' -SourcePolicy 'Shared corpus only; each surface adapted independently within this experiment; no external research and no other experiment output' -Workflow @('Select five distinct source-grounded angles','Write one coherent newsletter lead','Recompose mechanisms for short-form constraints','Pair frames with contextual captions rather than decontextualized quotes','Run quote-drift and incident-precision checks') -PrimaryOutput 'index.html' -SupportingOutputs @('assets/','review.md') -GoodEnough 'The kit offers immediately usable editorial starting points across formats while preventing common attribution, compression and incident-generalization errors.' -ReviewChecks @('Newsletter stands alone','Five posts do not repeat one hook','Every quote-card caption links context','Editorial checklist covers material risks','No fabricated quotation marks')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 09 review

## Adaptation review

The newsletter lead carries the complete argument in compact form. Five posts use distinct mechanisms rather than slicing one paragraph. Image-card captions are original editorial prose and do not falsely present slide text or paraphrase as a verbatim quotation.

## Publication-risk review

The checklist addresses timestamp drift, image permission, incident overstatement, the Waymo inference and the "optimal incidents" provocation. All images are independent copies from the corpus. A publisher still needs to apply its own rights, branding and channel-length policies.

## Good-enough decision

Pass. The kit is useful as publishable source material and makes the final editorʼs verification duties explicit.
'@

# Experiment 10: full searchable transcript navigator.
$exp = New-ExperimentDirectory 'experiment-10-transcript-navigator'
Copy-CorpusFrame $exp '000000000' 'opening.jpg'
Copy-CorpusFrame $exp '000600000' 'competence-envelope.jpg'
Copy-CorpusFrame $exp '001200000' 'slack.jpg'
Copy-CorpusFrame $exp '001860000' 'prepare.jpg'
$segments = Get-Content -LiteralPath (Join-Path $corpusRoot 'transcript.segments.json') -Raw | ConvertFrom-Json
$compactSegments = @($segments | ForEach-Object { ,@([int]$_.StartMilliseconds,[int]$_.EndMilliseconds,[string]$_.Text,[bool]$_.RecoveredFromMalformedJson) })
$segmentJson = $compactSegments | ConvertTo-Json -Depth 3 -Compress
Write-Utf8File -Path (Join-Path $exp 'segments.js') -Content "window.TRANSCRIPT_SEGMENTS=$segmentJson;"
$chapters = @(
    [ordered]@{id='opening';label='Logic, biology and systems';start=0;end=359},
    [ordered]@{id='saturation';label='Saturation and competence';start=359;end=659},
    [ordered]@{id='resources';label='Physical and virtual limits';start=659;end=1019},
    [ordered]@{id='incidents';label='Bluesky, Slack and Waymo';start=1019;end=1379},
    [ordered]@{id='paths';label='Paths to saturation';start=1379;end=1739},
    [ordered]@{id='limits';label='Why saturation persists';start=1739;end=2039},
    [ordered]@{id='adaptation';label='Graceful extensibility';start=2039;end=2459},
    [ordered]@{id='qa';label='Questions and answers';start=2459;end=3055}
)
Write-Utf8File -Path (Join-Path $exp 'chapters.json') -Content ($chapters | ConvertTo-Json -Depth 4)
$body = @'
<main>
  <div class="controls"><label for="q">Search transcript</label><input id="q" type="search" placeholder="Try: retries, queue, postmortem" autocomplete="off"><label for="chapter">Chapter</label><select id="chapter"><option value="all">All chapters</option></select><label><input id="recovered" type="checkbox"> Show parser-recovered lines only</label><button type="button" id="clear">Clear</button></div>
  <p id="status" class="meta" aria-live="polite"></p>
  <div class="navigator"><nav id="chapters" aria-label="Talk chapters"></nav><section><div id="results"></div><button id="more" type="button">Show more</button></section><aside><img id="frame" src="assets/opening.jpg" alt="Nearest sampled talk frame"><p id="frame-time" class="small">Nearest sampled frame · 00:00</p><div class="card"><strong>Reading key</strong><p class="small">Each row is one normalized backend segment. Time opens the supplied local video. A recovery badge marks one of ten records repaired by the strict, narrow malformed-quote recovery mode; text content is retained, not silently rewritten.</p></div></aside></div>
</main>
'@
$extra = @'
<style>.navigator{display:grid;grid-template-columns:210px minmax(0,1fr) 250px;gap:1.4rem;align-items:start}.navigator nav,.navigator aside{position:sticky;top:1rem}.navigator nav button{display:block;width:100%;text-align:left;border:0;border-left:3px solid var(--line);background:transparent;padding:.55rem .7rem;color:var(--ink);cursor:pointer}.navigator nav button.active{border-color:var(--accent);font-weight:700;background:var(--soft)}.segment{display:grid;grid-template-columns:78px 1fr;gap:.8rem;padding:.75rem .2rem;border-bottom:1px solid var(--line)}.segment p{margin:0}.segment mark{background:#ffe58b;padding:0 .08em}.recovery{font-size:.75rem;color:#8d3e26;margin-left:.35rem}#more{width:100%;margin-top:1rem;padding:.7rem;background:var(--panel);border:1px solid var(--line);border-radius:.5rem}#frame{width:100%}@media(max-width:950px){.navigator{grid-template-columns:180px 1fr}.navigator aside{grid-column:1/-1;position:static;display:grid;grid-template-columns:180px 1fr;gap:1rem}}@media(max-width:650px){.navigator{grid-template-columns:1fr}.navigator nav{position:static;display:flex;overflow:auto}.navigator nav button{min-width:145px;border-left:0;border-bottom:3px solid var(--line)}.navigator aside{display:block}.segment{grid-template-columns:65px 1fr}}</style>
'@
$script = @'
<script src="segments.js"></script>
<script>
const chapters=[{id:'opening',label:'Logic, biology and systems',start:0,end:359},{id:'saturation',label:'Saturation and competence',start:359,end:659},{id:'resources',label:'Physical and virtual limits',start:659,end:1019},{id:'incidents',label:'Bluesky, Slack and Waymo',start:1019,end:1379},{id:'paths',label:'Paths to saturation',start:1379,end:1739},{id:'limits',label:'Why saturation persists',start:1739,end:2039},{id:'adaptation',label:'Graceful extensibility',start:2039,end:2459},{id:'qa',label:'Questions and answers',start:2459,end:3055}],assets=[['opening.jpg',0],['competence-envelope.jpg',600],['slack.jpg',1200],['prepare.jpg',1860]];let selected='all',limit=80;
const q=document.getElementById('q'),select=document.getElementById('chapter'),nav=document.getElementById('chapters'),results=document.getElementById('results'),status=document.getElementById('status'),recovered=document.getElementById('recovered');
chapters.forEach(c=>{select.add(new Option(c.label,c.id));const b=document.createElement('button');b.type='button';b.textContent=c.label;b.dataset.id=c.id;b.addEventListener('click',()=>{selected=c.id;select.value=c.id;limit=80;render()});nav.append(b)});
function fmt(ms){const s=Math.floor(ms/1000),m=Math.floor(s/60);return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function chapterFor(sec){return chapters.find(c=>sec>=c.start&&sec<c.end)||chapters.at(-1)}
function escape(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function highlight(s,term){const safe=escape(s);if(!term)return safe;const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return safe.replace(new RegExp(`(${escaped})`,'ig'),'<mark>$1</mark>')}
function render(){const term=q.value.trim(),chapter=chapters.find(c=>c.id===selected);const all=window.TRANSCRIPT_SEGMENTS.filter(s=>{const sec=s[0]/1000;return(!chapter||(sec>=chapter.start&&sec<chapter.end))&&(!term||s[2].toLocaleLowerCase().includes(term.toLocaleLowerCase()))&&(!recovered.checked||s[3])});results.innerHTML='';all.slice(0,limit).forEach(s=>{const row=document.createElement('article');row.className='segment';const secs=Math.floor(s[0]/1000);row.innerHTML=`<a class="time" href="../../Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm#t=${secs}">${fmt(s[0])}</a><p>${highlight(s[2],term)}${s[3]?'<span class="recovery">recovered JSON</span>':''}</p>`;row.addEventListener('mouseenter',()=>setFrame(secs));results.append(row)});status.textContent=`${all.length.toLocaleString()} of ${window.TRANSCRIPT_SEGMENTS.length.toLocaleString()} segments match${all.length>limit?`; showing ${limit}`:''}.`;document.getElementById('more').hidden=all.length<=limit;[...nav.children].forEach(b=>b.classList.toggle('active',b.dataset.id===selected));if(chapter)setFrame(chapter.start)}
function setFrame(sec){const a=assets.reduce((best,x)=>Math.abs(x[1]-sec)<Math.abs(best[1]-sec)?x:best,assets[0]);document.getElementById('frame').src=`assets/${a[0]}`;document.getElementById('frame-time').textContent=`Representative sampled frame · ${fmt(a[1]*1000)}`}
q.addEventListener('input',()=>{limit=80;render()});select.addEventListener('change',()=>{selected=select.value;limit=80;render()});recovered.addEventListener('change',()=>{limit=80;render()});document.getElementById('more').addEventListener('click',()=>{limit+=80;render()});document.getElementById('clear').addEventListener('click',()=>{q.value='';selected='all';select.value='all';recovered.checked=false;limit=80;render()});render();
</script>
'@
$page = New-Page -Title 'Find the moment, keep the context' -Kicker 'Experiment 10 · Transcript navigator' -Description 'Search all 1,013 normalized segments, filter by argument chapter, inspect recovery provenance and jump directly to local-video timestamps.' -Accent '#246e75' -Body $body -ExtraHead $extra -Script $script
Write-Utf8File -Path (Join-Path $exp 'index.html') -Content $page
Write-ExperimentMetadata -Path $exp -Id '10' -Name 'Full transcript navigator' -Audience 'Readers, editors and researchers who need to locate source passages without losing chronology or parser provenance' -SourcePolicy 'Complete shared corpus transformed mechanically plus independently authored chapter boundaries; no other experiment output' -Workflow @('Load all normalized transcript segments','Compress only transport fields without dropping text','Define broad argument chapters against source times','Implement local search, chapter and recovery filters','Link every result to the source video','Test empty, broad and recovery-only queries') -PrimaryOutput 'index.html' -SupportingOutputs @('segments.js','chapters.json','assets/','review.md') -GoodEnough 'The interface loads locally without a server, exposes every normalized segment and recovery flag, finds text quickly, retains time context and links back to the supplied video.' -ReviewChecks @('All 1013 segments embedded','Exactly 10 recovered records filterable','Eight chapters cover full duration','Search escapes transcript HTML','No fetch or server dependency')
Write-Utf8File -Path (Join-Path $exp 'review.md') -Content @'
# Experiment 10 review

## Data review

The navigator embeds all 1,013 normalized segments as start milliseconds, end milliseconds, text and recovery provenance. No transcript text is summarized or omitted. Eight independently defined chapters span the 50:54 recording. Exactly ten records retain the corpus exporterʼs malformed-quote recovery flag.

## Interaction review

The first render shows chronological segments. Search is case-insensitive, escapes transcript markup before highlighting and updates a live result count. Chapter, search and recovery filters compose. "Show more" bounds initial DOM size without hiding total matches. Every result links to its local-video time; no local web server or fetch request is required.

## Limitation

The four displayed images are representative minute-sampled frames rather than automatic slide matches. Search is lexical, not semantic, and transcript ASR errors remain visible by design.

## Good-enough decision

Pass. The navigator makes the complete extraction directly useful for verification, quotation discovery and topic review while preserving source provenance.
'@

Write-Output "Built experiments 02-10 under $experimentRoot"
