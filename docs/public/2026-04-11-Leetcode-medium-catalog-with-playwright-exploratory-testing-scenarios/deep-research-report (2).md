# Research-backed curation of approachable Medium LeetCode problems

A00
## Scope and curation criteria

This curation is constrained to the problem list you supplied (problem IDs 2167 through 3893), and focuses only on entries marked "Med." in that list. The output is intentionally "what, not how": it gives orientation, pattern focus, and progression value, while avoiding solving recipes or spoiler-level guidance.

To make the curation decision-grade (not just a random shortlist), the filter emphasizes three properties that align with your stated goal of building a high-quality decision system:

Clarity: problems whose core task can be understood quickly from the statement, with complexity coming from reasoning rather than decoding wording.

Transfer value: problems that reinforce reusable pattern families (linked lists, DFS/BFS, graph traversal, tree traversal, two pointers, sliding window, backtracking, and approachable dynamic programming) rather than one-off gimmicks.

Approachability: problems that are "real Medium" but not disguised Hard. Two quantitative proxies are used as signals, not as absolute truth. First is acceptance rate (from your list snapshot). Second is contest-derived problem rating from the community-maintained "zerotrac" dataset, which computes relative difficulty using an Elo-style model and maximum-likelihood estimation on weekly/biweekly contest solve data. citeturn3view0

These signals fit well with the practical advice from LeetCode competitive-practice guidance: LeetCode does not publish official per-problem ratings, but ratings (where available) can help you choose problems near your current level, rather than oscillating between trivial and demoralizing. citeturn9view0

B00
## Decision-system signals that reduce wasted time

A "next problem" decision system works best when it is not only a catalog, but also a scheduler and a discriminator: it helps you choose the next task that strengthens pattern recognition, not just completion count.

Two learning-science effects are directly relevant to your goals of building reliable pattern knowledge and avoiding random Medium churn:

Retrieval practice: actively recalling and applying knowledge (testing yourself via problem solving) improves long-term retention more than passive review. citeturn10search19turn10search7

Distributed, spaced practice: spreading practice across time tends to outperform massed repetition, and meta-analytic work finds robust benefits of spacing. citeturn10search1turn10search12

Interleaving: mixing different kinds of problems (instead of doing 10 of the same type in a row) improves your ability to choose the right strategy for a new prompt, which is exactly what "pattern recognition" means in practice. citeturn10search22turn10search6

Operationally, this means your curation system should do more than tag problems. It should support controlled interleaving across core families (sliding window, BFS/DFS, DSU, binary search on answer) and schedule returns to a family after a delay. The LeetCode practice guide you referenced also highlights these families as foundational (basic data structures, recursion, BFS/DFS, DP, greedy, binary search). citeturn9view0

For your topic pages and "after solving" references, the best-fit public explanations tend to be pattern-focused sources like CP Algorithms and USACO Guide, which provide technique explanations separate from any specific LeetCode solution. citeturn13search14turn13search3turn13search4turn13search1turn13search0

C00
## Curated catalog of high-signal Medium problems

All items below are Medium problems from your supplied list. "Z-rating" refers to zerotrac's contest-derived rating where available (n/a means not present in that dataset). citeturn3view0

**Linked list navigation and pointer discipline**

These are especially good for your "Easy to Medium" transition because they reward careful invariants (sentinels, rewiring, segment boundaries) without requiring exotic theory.

| ID | Problem | Main pattern focus | Why it earns a slot | Signals from your list |
|---:|---|---|---|---|
| 2181 | Merge Nodes in Between Zeros | Single-pass list segmentation | Clear statement with natural "segment" boundaries; great for building confidence in list traversal and output construction | 89.7% acc, Z 1333 |
| 2487 | Remove Nodes From Linked List | Forward vs future comparison | Teaches a common linked-list theme: decisions that depend on what comes later; strong practice for rewiring without leaks | 74.9% acc, Z 1455 |
| 2674 | Split a Circular Linked List | Circular list invariants | Circularity is a classic interview landmine; this is a contained, readable way to practice it | 77.5% acc, Z n/a |
| 2807 | Insert Greatest Common Divisors in Linked List | In-place insertion | Clean "insert between nodes" exercise; reinforces safe pointer updates and iteration order discipline | 91.4% acc, Z 1279 |
| 2816 | Double a Number Represented as a Linked List | Carry propagation | Lightweight but real: handling carry across nodes (and possible new head) without turning the list into an array | 61.2% acc, Z 1394 |
| 3217 | Delete Nodes From Linked List Present in Array | Sentinel + membership structure | Combines list deletion correctness with a standard membership structure; very transferable | 69.5% acc, Z 1342 |
| 3294 | Convert Doubly Linked List to Array II | Doubly-linked traversal | Useful practice for prev/next correctness and careful iteration in a structure people use less often than singly-linked lists | 82.6% acc, Z n/a |

**Tree traversal and tree-to-array thinking**

These are chosen to cover the tree "core loop": build, traverse, aggregate, and apply per-level logic. They also create a clean bridge into graph thinking (trees as graphs, parent pointers).

| ID | Problem | Main pattern focus | Why it earns a slot | Signals from your list |
|---:|---|---|---|---|
| 2196 | Create Binary Tree From Descriptions | Build + root detection | Excellent "construct from relations" exercise; directly transferable to graph building and dependency modeling | 81.7% acc, Z 1644 |
| 2265 | Count Nodes Equal to Average of Subtree | Postorder aggregation | Teaches subtree aggregation as a reusable tool (sum, count, min/max); very readable and rewarding | 86.8% acc, Z 1473 |
| 2385 | Amount of Time for Binary Tree to Be Infected | Tree distances | Natural bridge from trees to BFS layering and distance concepts, without being statement-confusing | 65.3% acc, Z 1711 |
| 2415 | Reverse Odd Levels of Binary Tree | Level-order traversal | Clean level-based transformation; reinforces "per-level" thinking and traversal hygiene | 86.7% acc, Z 1431 |
| 2471 | Minimum Number of Operations to Sort a Binary Tree by Level | BFS levels + array reasoning | A strong combo problem: tree traversal to gather structure, then methodical work per level | 74.2% acc, Z 1635 |
| 2583 | Kth Largest Sum in a Binary Tree | Level aggregation + selection | Teaches the common workflow of deriving per-level metrics and selecting among them | 59.0% acc, Z 1374 |
| 2641 | Cousins in Binary Tree II | Sibling and level context | Practice for "node value depends on its neighborhood" across a level, without degenerate edge-case traps | 75.8% acc, Z 1677 |
| 3157 | Find the Level of Tree with Minimum Sum | Straight level scan | Short and confidence-building; good as a warm-up before heavier level-order problems | 69.6% acc, Z n/a |
| 3319 | K-th Largest Perfect Subtree Size in Binary Tree | Subtree classification | Good step toward "subtree property checks"; encourages clean return values and structural reasoning | 62.2% acc, Z 1603 |
| 3787 | Find Diameter Endpoints of a Tree | Tree diameter intuition | Teaches a foundational tree metric (diameter endpoints) that reappears in many forms | 68.7% acc, Z n/a |

**Graph and grid traversal, connectivity, and components**

These are picked to cover: traversal with constraints, connectivity counting, component reasoning, and reachability queries. Union-Find is explicitly relevant here as a core "common DS" technique. citeturn13search1

| ID | Problem | Main pattern focus | Why it earns a slot | Signals from your list |
|---:|---|---|---|---|
| 2192 | All Ancestors of a Node in a Directed Acyclic Graph | DAG reachability | High transfer value for DAG reasoning; the task is conceptually clean and reinforces directional reachability | 62.1% acc, Z 1788 |
| 2257 | Count Unguarded Cells in the Grid | Grid line-of-sight logic | A readable grid problem that rewards systematic marking and careful boundaries | 69.0% acc, Z 1709 |
| 2304 | Minimum Path Cost in a Grid | Grid DP | Good entry point for grid-based DP transitions without heavy constraint trickery | 68.0% acc, Z 1658 |
| 2316 | Count Unreachable Pairs of Nodes in an Undirected Graph | Components and counting | Highly educational: component sizes and cross-component pair counting is a staple idea | 49.9% acc, Z 1604 |
| 2359 | Find Closest Node to Given Two Nodes | Special graph structure | Teaches reasoning on directed graphs with constrained structure; often clearer than general shortest-path problems | 53.0% acc, Z 1715 |
| 2368 | Reachable Nodes With Restrictions | Traversal with forbidden nodes | Clean constrained traversal; reinforces "visited + constraints" discipline | 60.3% acc, Z 1477 |
| 2492 | Minimum Score of a Path Between Two Cities | Path property aggregation | A good "graph traversal plus path metric" problem that avoids heavy shortest-path formalism | 58.7% acc, Z 1680 |
| 2658 | Maximum Number of Fish in a Grid | Grid components | Classic connected-component extraction in a friendly package | 70.5% acc, Z 1490 |
| 2685 | Count the Number of Complete Components | Component validation | Good for converting component membership into a structural check, which is a common next step after basic DFS/BFS | 77.8% acc, Z 1769 |
| 3532 | Path Existence Queries in a Graph I | Connectivity queries | Good step into "many queries, one graph" thinking; a natural place to practice DSU or offline connectivity patterns | 55.3% acc, Z 1659 |

**Sliding window, two pointers, and prefix-style counting**

These are the backbone for "approachable Mediums" because they reuse a small set of mental templates in many variants. Sliding window is expressly about advancing endpoints monotonically while maintaining a condition. citeturn13search3

Prefix sums and difference arrays cover a large set of "range update / range query / best split point" problems and are especially good for "what, not how" learning because the concept generalizes cleanly. citeturn13search5turn13search2

| ID | Problem | Main pattern focus | Why it earns a slot | Signals from your list |
|---:|---|---|---|---|
| 2348 | Number of Zero-Filled Subarrays | Run counting | Simple to understand, surprisingly transferable; excellent warm-up Medium | 70.1% acc, Z 1316 |
| 2381 | Shifting Letters II | Difference array mindset | A very reusable "range updates then prefix collapse" pattern, without needing advanced math | 53.6% acc, Z 1793 |
| 2401 | Longest Nice Subarray | Constraint window with bitwise state | Great practice for maintaining a window invariant when the constraint is not a sum | 64.8% acc, Z 1750 |
| 2419 | Longest Subarray With Maximum Bitwise AND | Bitwise property + runs | A good example of using algebraic/bit properties to simplify a subarray question | 65.4% acc, Z 1496 |
| 2461 | Maximum Sum of Distinct Subarrays With Length K | Fixed-size window | Clean "fixed window + distinctness" practice; transferable to many interview variants | 42.9% acc, Z 1553 |
| 2483 | Minimum Penalty for a Shop | Best split point | Premium "prefix reasoning" problem: the logic is crisp and the insight generalizes | 71.2% acc, Z 1495 |
| 2537 | Count the Number of Good Subarrays | Variable window counting | Teaches a common move: count subarrays satisfying a frequency threshold efficiently | 65.9% acc, Z 1892 |
| 2606 | Find the Substring With Maximum Cost | Prefix scoring | Good bridge from character mapping to subarray scoring, with clear objective | 57.9% acc, Z 1422 |
| 2762 | Continuous Subarrays | Window with max-min constraint | Strong pattern practice for maintaining window feasibility under range constraints | 57.9% acc, Z 1940 |
| 2799 | Count Complete Subarrays in an Array | Distinctness constraints | A practical distinct-count window pattern; easy to miscount, good to learn carefully | 76.0% acc, Z 1398 |
| 2958 | Length of Longest Subarray With at Most K Frequency | Window frequency caps | Very transferable to real interview prompts; worth mastering as a template | 56.5% acc, Z 1535 |
| 2962 | Count Subarrays Where Max Element Appears at Least K Times | Counting by positions | Good for learning to count without enumerating, while staying statement-clear | 62.4% acc, Z 1701 |
| 3076 | Shortest Uncommon Substring in an Array | Candidate filtering | Useful "generate candidates and discard fast" thinking; more about rigor than trickery | 50.3% acc, Z 1635 |
| 3084 | Count Substrings Starting and Ending with Given Character | Combinational counting | Great example of turning a string condition into counting positions; high payoff per effort | 50.0% acc, Z 1324 |
| 3101 | Count Alternating Subarrays | Streak compression | A clean run-based counting pattern that generalizes to other alternation problems | 57.4% acc, Z 1405 |
| 3254 | Find the Power of K-Size Subarrays I | Window validation | Useful for checking a local property across fixed windows systematically | 62.1% acc, Z 1267 |
| 3325 | Count Substrings With K-Frequency Characters I | Window + threshold | A solid threshold-based substring counter, good for sharpening window bookkeeping | 55.8% acc, Z 1455 |
| 3719 | Longest Balanced Subarray I | Prefix-difference | Classic "balance" problem; strongly transferable to many 0/1 and parity variants | 65.6% acc, Z 1467 |
| 3737 | Count Subarrays With Majority Element I | Majority counting | Builds intuition about majority constraints without being a hard theorem-heavy problem | 65.5% acc, Z 1423 |
| 3804 | Number of Centered Subarrays | Symmetry counting | A nice change of pace: still prefix-based thinking, but with a symmetric constraint | 67.1% acc, Z 1393 |

**Greedy, heaps, binary search on answer, and approachable DP/backtracking**

Binary search on the answer is a core interview technique when a feasibility predicate is monotonic. citeturn13search4turn13search0

| ID | Problem | Main pattern focus | Why it earns a slot | Signals from your list |
|---:|---|---|---|---|
| 2171 | Removing Minimum Number of Magic Beans | Greedy via sorting | Teaches "choose a target baseline" thinking; clear objective and reusable sorting logic | 44.5% acc, Z 1748 |
| 2187 | Minimum Time to Complete Trips | Binary search on monotonic time | One of the cleanest "binary search on answer" representatives; high transfer value | 39.6% acc, Z 1641 |
| 2208 | Minimum Operations to Halve Array Sum | Priority queue greedy | Great for learning "always take best next operation" with a heap, a core DS | 50.1% acc, Z 1550 |
| 2212 | Maximum Points in an Archery Competition | Backtracking or knapsack-style choice | Good introduction to structured exploration under constraints; fun and motivating for many learners | 51.4% acc, Z 1869 |
| 2225 | Find Players With Zero or One Losses | Hash counting | Efficient counting with clean output formatting; fast, satisfying Medium | 72.5% acc, Z 1316 |
| 2226 | Maximum Candies Allocated to K Children | Binary search on capacity | Another strong monotonic-search example; helps cement the technique | 49.9% acc, Z 1646 |
| 2244 | Minimum Rounds to Complete All Tasks | Greedy with frequency constraints | High value for interview-style reasoning about grouping constraints | 63.3% acc, Z 1601 |
| 2279 | Maximum Bags With Full Capacity of Rocks | Greedy fill ordering | Simple story, meaningful greedy reasoning; confidence-building | 68.0% acc, Z 1249 |
| 2294 | Partition Array Such That Maximum Difference Is K | Sorting + windowing | Very readable; converts into a clean "group after sorting" pattern | 81.8% acc, Z 1416 |
| 2300 | Successful Pairs of Spells and Potions | Sorting + binary search | A canonical "sort one side, query the other" pattern | 49.5% acc, Z 1477 |
| 2352 | Equal Row and Column Pairs | Hashing structured data | Great for practicing robust hashing/encoding of arrays and matrix reasoning | 70.9% acc, Z 1286 |
| 2375 | Construct Smallest Number From DI String | Constructive constraints | Strong constructiveness practice: translating local constraints into a globally valid object | 85.6% acc, Z 1642 |
| 2405 | Optimal Partition of String | Greedy partitioning | Teaches "cut when you must" partition logic; very transferable | 78.4% acc, Z 1801 |
| 2406 | Divide Intervals Into Minimum Number of Groups | Sweep line / resource counting | A classic interval overlap pattern (similar to meeting rooms), high interview relevance | 63.6% acc, Z 1812 |
| 2462 | Total Cost to Hire K Workers | Heaps + boundary management | A meaningful heap exercise that feels like real engineering selection logic | 43.6% acc, Z 1764 |
| 2466 | Count Ways To Build Good Strings | 1D DP counting | Approachable DP with a clear recurrence idea; good for easing into DP | 58.9% acc, Z 1694 |
| 2594 | Minimum Time to Repair Cars | Binary search on answer | Strong monotonic-search reinforcement; good stepping stone to harder scheduling problems | 59.6% acc, Z 1915 |
| 2638 | Count the Number of K-Free Subsets | Backtracking with constraints | Good practice for constraint-based subset construction without excessive statement noise | 47.3% acc, Z n/a |

D00
## Stretch-but-worth-it set and deprioritized traps

The next set contains Mediums that can still be excellent, but are more likely to feel "contest-y", edge-case heavy, or simply harder than the rest of the catalog. These are best treated as optional branching steps in your decision system.

| ID | Problem | Why it can be worth it | Caution signal |
|---:|---|---|---|
| 2271 | Maximum White Tiles Covered by a Carpet | High-value interval coverage pattern; strong two pointers and boundary math practice | 35.8% acc, Z 2022 |
| 2326 | Spiral Matrix IV | Fun integration problem combining iteration discipline with data structure consumption | Simulation can be tedious if you dislike bookkeeping |
| 2349 | Design a Number Container System | Excellent "design + invariants" practice with standard data structures | Design prompts can drift into implementation detail overload |
| 2353 | Design a Food Rating System | Practical ordered-structure design problem; good for robust API thinking | Requires careful consistency across updates |
| 2542 | Maximum Subsequence Score | Strong greedy-plus-heap style challenge with real bite | Z 2056 (often feels like hard-medium) |
| 2597 | The Number of Beautiful Subsets | Rich backtracking/constraint reasoning; can be very educational | Z 2023 (harder end of Medium) |
| 2762 | Continuous Subarrays | Excellent window invariant practice | Z 1940 (can be surprisingly subtle) |
| 2812 | Find the Safest Path in a Grid | Great grid traversal with a meaningful objective | Z 2154 (very likely to feel like "stretch") |
| 2850 | Minimum Moves to Spread Stones Over Grid | Interesting state/transition thinking on grids | Z 2001 and can be implementation-heavy |
| 2865 | Beautiful Towers I | Good monotonic-structure intuition builder | 44.5% acc; can be subtle without prior monotonic-stack comfort |
| 3604 | Minimum Time to Reach Destination in Directed Graph | Good directed-graph shortest-path style thinking | Borderline difficulty; can demand careful modeling |
| 3650 | Minimum Cost Path with Edge Reversals | Strong graph modeling problem | Can be non-obvious; treat as a stretch graph exercise |

The following are the kinds of Mediums that are disproportionately likely to feel like "learn little, suffer a lot" for your specific goal. In a decision system, these belong on a blocklist or "only if needed for a specific gap" list.

| ID | Problem | Why deprioritize for your goal | Caution signal |
|---:|---|---|---|
| 2202 | Maximize the Topmost Element After K Moves | Known for brittle, special-case reasoning around exact move counts; more casework than pattern growth | Problem framing requires "exactly k moves". citeturn11search0 Edge-case branching is prominent in many writeups. citeturn11search15 |
| 2572 | Count the Number of Square-Free Subsets | Bitmask-heavy DP flavor; high cognitive load relative to "common DS" payoff | 26.5% acc, Z 2420 |
| 2741 | Special Permutations | Often turns into heavy state counting; can feel like machinery more than insight | 29.5% acc, Z 2021 |
| 3291 | Minimum Number of Valid Strings to Form Target I | String construction constraints can become technical and brittle | 21.8% acc, Z 2082 |
| 3302 | Find the Lexicographically Smallest Valid Sequence | Lexicographic constraint problems are frequently detail-heavy | 21.8% acc, Z 2474 |
| 3458 | Select K Disjoint Special Substrings | Disjointness constraints can become intricate; high risk of annoyance | 19.2% acc, Z 2221 |
| 3552 | Grid Teleportation Traversal | Teleport rules often create "rule parsing" pain | 23.5% acc, Z 2036 |
| 3664 | Two-Letter Card Game | Low-acceptance contest-style problem; likely not a clean pattern builder | 12.6% acc, Z 2158 |
| 3670 | Maximum Product of Two Integers With No Common Bits | Bit tricks dominate; fewer reusable insights for your target families | 15.2% acc, Z 2234 |
| 3854 | Minimum Operations to Make Array Parity Alternating | Can become constraint-casework heavy | 16.8% acc, Z 2095 |
| 3891 | Minimum Increase to Maximize Special Indices | Index-case complexity can outweigh learning | 18.8% acc, Z n/a |
| 3566 | Partition Array into Two Equal Product Subsets | Product constraints can push you into niche handling | 35.1% acc, Z 1459 |

E00
## How this becomes a personal, non-spoiling decision system

A static decision tool becomes "high quality" when it enables three actions quickly: choose, learn, and revisit.

Choose: each problem card should expose just enough metadata to decide "is this a good next attempt for my current state". In practice, the most decision-relevant fields are: concept family tags (multiple), difficulty tier within Medium (your acceptance snapshot plus zerotrac rating where available), and a short "why it is worth it" description that names the transferable pattern without giving the method. Zerotrac explicitly frames its rating output as relative difficulty estimation from contest performance (Elo-style plus MLE) and publishes raw rating data that can be integrated into such a system. citeturn3view0

Learn: topic pages should teach patterns independent of any one LeetCode problem. For the families you care about, the most stable structure is: definition of the pattern, invariants to maintain, typical failure modes, and a small set of micro-examples that do not match any curated problem instance. For technical references, CP Algorithms and USACO Guide provide broadly reusable technique explanations (binary search including "binary search on monotonic functions", DSU/union-find, and sliding window/two pointers). citeturn13search14turn13search4turn13search1turn13search3

Revisit: your system should schedule review attempts across time and across categories. Retrieval practice research supports the idea that solving (and re-solving, with time gaps) builds stronger long-term memory than simply reading solutions or summaries. citeturn10search19turn10search7 Spacing effects support deliberate return after delays, rather than bingeing one topic once. citeturn10search1turn10search12 Interleaving supports mixing problem types so you learn to discriminate which tool applies, not just execute a tool you already chose. citeturn10search22turn10search6

For grounding in local reference material, a practical approach is to store, per curated problem, a pointer to local artifacts: your own notes, your accepted solution file path, and the relevant topic page in your wiki section. If you keep a local multi-language reference repository, projects like doocs "LeetCode Wiki" illustrate how a consistent, per-problem directory structure can support lookup after solving; it is also actively maintained over time. citeturn2search2turn2search8