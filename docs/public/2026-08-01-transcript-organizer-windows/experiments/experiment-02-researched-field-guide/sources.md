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