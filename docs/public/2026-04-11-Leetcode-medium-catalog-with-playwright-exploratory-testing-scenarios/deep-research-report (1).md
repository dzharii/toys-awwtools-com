# Medium LeetCode Problem Research for Moving Beyond Easy

A00  
## Scope and selection criteria

This research targets "on-ramp" Medium problems: problems that are Medium because they require a real technique (not just coding), but are still fast to parse and typically hinge on one dominant idea (BFS/DFS traversal template, two pointers, backtracking skeleton, or a small DP recurrence) rather than a long chain of tricks. The goal is to maximize practice of core routines (linked list pointer navigation, BFS/DFS, backtracking, introductory DP) while minimizing time lost deciphering problem statements. citeturn9view0turn11view0

A practical implication is that canonical problems that "factor into" many other problems tend to be the best transition targets. The Blind 75 author explicitly frames many other problems as combinations (or "mashes") of techniques from a smaller set of foundational questions, which is exactly the property you want when trying to graduate from Easy to Medium efficiently. citeturn9view0

For BFS/DFS specifically, the selection emphasizes problems that naturally map to shortest-path or connected-components framing (grids, mazes, reachability), because those statements are usually easier to understand quickly than abstract graph theory prompts, while still building reusable traversal habits. Community and pattern writeups repeatedly highlight BFS/DFS as a dominant building block across a large fraction of tree/graph/matrix problems. citeturn1search13turn0search37

B00  
## Sources and methodology

This report synthesizes curated lists and community recommendations with three goals: (1) Medium-only emphasis, (2) explicit coverage of the patterns you named (linked lists, DFS/BFS, backtracking, DP, two pointers), and (3) inclusion of newer "tail" problems that still have clean statements.

Primary source sets were chosen because they are curated (not random), have recency signals, and are widely referenced in interview prep discussions:

The most heavily weighted backbone is the "Best practice questions" schedule from entity["organization","Tech Interview Handbook","coding interview handbook site"] by entity["people","Yangshun Tay","blind 75 author"]. It provides a structured plan, explicitly labels difficulty per question, and was last updated on April 5, 2026, which makes it useful for a "more recent, less stale than decade-old lists" constraint. citeturn9view0

For breadth and pattern coverage, I used the LeetCode Patterns dataset maintained by entity["people","Sean Prashad","leetcode patterns creator"] and published via entity["company","GitHub","code hosting platform"]. The repository rationale is explicitly pattern-first ("grouped under their respective subtopic") and the dataset provides machine-readable fields including difficulty, pattern tags, and an update timestamp (showing a refreshed snapshot as of 2026-04-05). citeturn11view0turn17view0

To keep the DP portion grounded in beginner-friendly Mediums, I incorporated a LeetCode Discuss "Dynamic Programming Interview Preparation Sheet" that lists many of the standard DP ramp problems and marks which are Medium. citeturn21view0

To deliberately surface newer Mediums (higher problem numbers) that still look like "clean statement, clean technique," I used the "LeetCode in Kotlin" index because it exposes problem numbers and difficulty labels inline, and it tags a number of modern graph/grid Mediums (many tied to the LeetCode 75 graph modules). citeturn19view0turn20view1turn20view3turn20view4

Finally, to validate "interesting" in the sense of community preference (not just interview frequency), I cross-checked common favorites mentioned in threads on entity["company","Reddit","social news site"] and writeups on entity["company","Medium","publishing platform"], mainly as a sanity check that certain problems (for example "Number of Islands" and "Letter Combinations of a Phone Number") are repeatedly experienced as high-signal learning problems rather than purely grindy exercises. citeturn2search11turn0search22

Contextual note: NeetCode 150 is another major community default list and explicitly reports its own difficulty breakdown (101 Medium problems). I am not using it as the main enumerated dataset here because its page is not as readily extractable into a Medium-only list in the same way as the sources above, but its difficulty distribution is a useful corroboration that there is a large "Medium core" worth focusing on. citeturn7view0

C00  
## Core on-ramp sequence of Medium problems

The sequence below is intentionally biased toward fast-to-read prompts, high reuse of templates, and problems that show up repeatedly across curated sets. The ordering is designed to feel like a gradual slope: first, Mediums that are mostly "one invariant"; then pointer-heavy linked lists; then BFS/DFS on trees; then BFS/DFS on grids and graphs (including several newer ones); then backtracking and DP starters.

| Phase | Problem | Primary technique | Why it is a good transition medium |
| --- | --- | --- | --- |
| Warm-up mediums | Longest Substring Without Repeating Characters | Sliding window | Classic transition problem: one invariant, one moving window. |
| Warm-up mediums | Longest Repeating Character Replacement | Sliding window | Same window muscle, but requires a tighter invariant and counting. |
| Warm-up mediums | Product of Array Except Self | Prefix/suffix products | Forces you to think in passes; no fancy DS, just careful bookkeeping. |
| Warm-up mediums | Container With Most Water | Two pointers | A clean, intuitive proof-style two-pointer problem. |
| Warm-up mediums | 3Sum | Sorting + two pointers | First real 'reduce to 2Sum' medium; teaches duplicate handling cleanly. |
| Warm-up mediums | Group Anagrams | Hashing buckets | Fast to understand; good practice with canonicalization. |
| Warm-up mediums | Merge Intervals | Sorting + sweep | Readable statement; teaches 'sort then merge' routine. |
| Warm-up mediums | Sort Colors | Two pointers | Short but deep: in-place partitioning and pointer invariants. |
| Linked lists | Add Two Numbers | Linked list iteration | Straightforward, but tests pointer hygiene and carry handling. |
| Linked lists | Remove Nth Node From End of List | Two pointers | A perfect 'one-pass with offset pointer' pattern. |
| Linked lists | Linked List Cycle II | Floyd's cycle | Great mental model shift: detection vs locating the cycle start. |
| Linked lists | Swap Nodes in Pairs | Pointer rewiring | Small scope pointer rewiring, low cognitive load. |
| Linked lists | Odd Even Linked List | Pointer partitioning | Readable transformation with stable relative order. |
| Linked lists | Reorder List | Two pointers + reverse | First 'compose routines' linked list medium without a weird story. |
| Trees | Binary Tree Level Order Traversal | BFS queue | The 'hello world' BFS on trees; reusable template. |
| Trees | Binary Tree Right Side View | BFS by level | Small twist on level order; good for edge-case thinking. |
| Trees | Binary Tree Zigzag Level Order Traversal | BFS by level | Same BFS core, adds alternating direction state. |
| Trees | Validate Binary Search Tree | DFS with bounds | A crisp statement with a common pitfall; teaches invariants. |
| Trees | Lowest Common Ancestor of a Binary Tree | DFS postorder | Classic recursion: bubble up signals from children. |
| Trees | Kth Smallest Element in a BST | Inorder traversal | Connects BST property to inorder; great for confidence. |
| Trees | Construct Binary Tree from Preorder and Inorder Traversal | Recursion + indices | Slightly longer but predictable; teaches indexing discipline. |
| Trees | All Nodes Distance K in Binary Tree | Graph transform + BFS | Bridges trees to graphs in a controlled way. |
| Graphs | Number of Islands | DFS/BFS on grid | Canonical connected-components problem; easiest doorway to grid DFS/BFS. |
| Graphs | Rotting Oranges | Multi-source BFS | Very visual and naturally level-based; great BFS intuition builder. |
| Graphs | 01 Matrix | Multi-source BFS | Same multi-source idea; reinforces distance-to-nearest pattern. |
| Graphs | Shortest Path in Binary Matrix | BFS shortest path | Simple shortest path in unweighted grid; clear win for BFS. |
| Graphs | Nearest Exit from Entrance in Maze | BFS shortest path | A clean maze problem that stays medium but approachable. |
| Graphs | Keys and Rooms | DFS/BFS traversal | Graph reachability without heavy graph theory. |
| Graphs | Number of Provinces | DFS/BFS or Union-Find | Connected components on adjacency matrix; good for practice. |
| Graphs | Clone Graph | DFS/BFS + hashmap | Teaches visited-map patterns and graph copying. |
| Graphs | Course Schedule | Topo sort / cycle detection | Entry-level directed graph reasoning; clear practical framing. |
| Graphs | Course Schedule II | Topo sort | Same core, adds reconstruction of order. |
| Graphs | Open the Lock | BFS implicit graph | Shortest path with state generation; surprisingly readable. |
| Graphs | Minimum Genetic Mutation | BFS implicit graph | Similar to Open the Lock but with string states; good practice. |
| Graphs | Reorder Routes to Make All Paths Lead to the City Zero | DFS/BFS | Newer-style graph traversal with direction bookkeeping. |
| Backtracking | Letter Combinations of a Phone Number | Backtracking | Very clear statement; ideal for learning recursion tree structure. |
| Backtracking | Generate Parentheses | Backtracking | Classic constraint-building; teaches pruning and invariants. |
| Backtracking | Subsets | Backtracking / bitmask | A gentle way to write template backtracking and iterate choices. |
| Backtracking | Permutations | Backtracking | Another template staple; choice + undo pattern. |
| Backtracking | Combination Sum | Backtracking | Adds 'reuse' and target tracking; still readable. |
| Backtracking | Palindrome Partitioning | Backtracking + DP-ish memo | A slightly richer recursion with a natural decomposition. |
| Dynamic programming | House Robber | 1D DP | Probably the cleanest 'pick vs skip' recurrence. |
| Dynamic programming | Coin Change | 1D DP | Classic min DP; also works as BFS mental model. |
| Dynamic programming | Unique Paths | 2D DP | Grid DP with very simple recurrence. |
| Dynamic programming | Longest Increasing Subsequence | 1D DP / binary search | Important pattern; start with DP first, then optimize. |
| Dynamic programming | Partition Equal Subset Sum | 0/1 knapsack DP | Your first real subset-sum DP; still manageable at medium. |
| Dynamic programming | Word Break | DP on string | Great transition from recursion to DP with memo/tabulation. |
| Dynamic programming | Target Sum | DP with transforms | A bit trickier but very rewarding once you see the subset-sum mapping. |

This sequence is compiled primarily from the Tech Interview Handbook "best practice questions" Medium set, the LeetCode Patterns Medium dataset, and the DP study guide, with the newer graph/grid additions cross-verified as Medium by the LeetCode in Kotlin index. citeturn9view0turn17view0turn21view0turn19view0turn20view1turn20view3turn20view4

D00  
## Extended catalog of Medium problems by pattern cluster

The catalog below is intended to be broad rather than minimal: it lists all Medium problems from the LeetCode Patterns dataset (111 Mediums) plus a small set of highly recommended graph/grid and DP Mediums that are often used as BFS/DFS ramps but are not in that dataset snapshot. The "Starter" marker is a heuristic flag (high repetition in curated sets and relatively bounded complexity), meant to help you pick quickly when you do not want to spend an hour. citeturn17view0turn11view0

| Cluster | Problem | Key patterns | Starter |
| --- | --- | --- | --- |
| Backtracking | Generate Parentheses | String, Dynamic Programming, Backtracking | Yes |
| Backtracking | Letter Combinations of a Phone Number | Hash Table, String, Backtracking | Yes |
| Backtracking | Permutations | Array, Backtracking | Yes |
| Backtracking | Subsets | Array, Backtracking, Bit Manipulation | Yes |
| Backtracking | Palindrome Partitioning | String, Dynamic Programming, Backtracking |  |
| Backtracking | Combination Sum | Array, Backtracking |  |
| Backtracking | Permutations II | Array, Backtracking |  |
| Backtracking | Combinations | Backtracking |  |
| Backtracking | Combination Sum II | Array, Backtracking |  |
| Backtracking | Partition to K Equal Sum Subsets | Array, Dynamic Programming, Backtracking, Bit Manipulation, Memoization, Bitmask |  |
| Backtracking | Subsets II | Array, Backtracking, Bit Manipulation |  |
| Backtracking | Combination Sum IV | Array, Dynamic Programming |  |
| Backtracking | Combination Sum III | Array, Backtracking |  |
| Backtracking | Word Search | Array, String, Backtracking, Matrix |  |
| Backtracking | Letter Case Permutation | String, Backtracking, Bit Manipulation |  |
| Backtracking | Generalized Abbreviation | String, Backtracking, Bit Manipulation |  |
| Dynamic programming | Longest Palindromic Substring | Two Pointers, String, Dynamic Programming | Yes |
| Dynamic programming | Maximum Subarray | Array, Divide and Conquer, Dynamic Programming | Yes |
| Dynamic programming | House Robber | Array, Dynamic Programming | Yes |
| Dynamic programming | Jump Game | Array, Dynamic Programming, Greedy | Yes |
| Dynamic programming | Maximum Product Subarray | Array, Dynamic Programming | Yes |
| Dynamic programming | Coin Change | Array, Dynamic Programming, Breadth-First Search | Yes |
| Dynamic programming | Longest Increasing Subsequence | Array, Binary Search, Dynamic Programming | Yes |
| Dynamic programming | Palindromic Substrings | Two Pointers, String, Dynamic Programming | Yes |
| Dynamic programming | Best Time to Buy and Sell Stock with Cooldown | Array, Dynamic Programming |  |
| Dynamic programming | Unique Paths | Math, Dynamic Programming, Combinatorics |  |
| Dynamic programming | Decode Ways | String, Dynamic Programming |  |
| Dynamic programming | Word Break | Hash Table, String, Dynamic Programming, Trie, Memoization |  |
| Dynamic programming | Target Sum | Array, Dynamic Programming, Backtracking |  |
| Dynamic programming | Partition Equal Subset Sum | Array, Dynamic Programming |  |
| Dynamic programming | Delete Operation for Two Strings | String, Dynamic Programming |  |
| Dynamic programming | Longest Common Subsequence | String, Dynamic Programming |  |
| Dynamic programming | Longest Line of Consecutive One in Matrix | Array, Dynamic Programming, Matrix |  |
| Dynamic programming | Longest Common Subsequence (Harder Variants) |  |  |
| Dynamic programming | Stone Game | Array, Math, Dynamic Programming, Game Theory |  |
| Dynamic programming | Minimum Path Sum in Grid |  |  |
| Dynamic programming | Arithmetic Slices | Array, Dynamic Programming |  |
| Dynamic programming | Jump Game II (#45) | Greedy/DP; min jumps | Yes |
| Dynamic programming | Edit Distance (#72) | 2D DP (string), classic recurrence | Yes |
| Graphs and grids | Number of Islands | Array, Depth-First Search, Breadth-First Search, Union-Find, Matrix | Yes |
| Graphs and grids | Course Schedule | Depth-First Search, Breadth-First Search, Graph Theory, Topological Sort | Yes |
| Graphs and grids | Course Schedule II | Depth-First Search, Breadth-First Search, Graph Theory, Topological Sort | Yes |
| Graphs and grids | Clone Graph | Hash Table, Depth-First Search, Breadth-First Search, Graph Theory |  |
| Graphs and grids | Pacific Atlantic Water Flow | Array, Depth-First Search, Breadth-First Search, Matrix |  |
| Graphs and grids | All Nodes Distance K in Binary Tree | Hash Table, Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Binary Tree Level Order Traversal | Tree, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Binary Tree Zigzag Level Order Traversal | Tree, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Binary Tree Right Side View | Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Binary Tree Level Order Traversal II | Tree, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Maximum Width of Binary Tree | Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Graphs and grids | Nearest Exit from Entrance in Maze (#1926) | BFS shortest path, matrix | Yes |
| Graphs and grids | Keys and Rooms (#841) | DFS/BFS reachability | Yes |
| Graphs and grids | Number of Provinces (#547) | DFS/BFS components, Union-Find | Yes |
| Graphs and grids | Open the Lock (#752) | BFS implicit graph, visited set | Yes |
| Graphs and grids | Minimum Genetic Mutation (#433) | BFS implicit graph, visited set | Yes |
| Graphs and grids | Rotting Oranges (#994) | BFS (multi-source), matrix | Yes |
| Graphs and grids | 01 Matrix (#542) | BFS (multi-source), matrix | Yes |
| Graphs and grids | Shortest Path in Binary Matrix (#1091) | BFS shortest path, matrix | Yes |
| Graphs and grids | As Far from Land as Possible (#1162) | BFS (multi-source), matrix | Yes |
| Graphs and grids | Shortest Bridge (#934) | DFS island mark + BFS expansion | Yes |
| Graphs and grids | Shortest Path with Alternating Colors (#1129) | BFS with state (color), visited | Yes |
| Graphs and grids | Reorder Routes to Make All Paths Lead to the City Zero (#1466) | DFS/BFS with edge direction bookkeeping | Yes |
| Graphs and grids | All Paths From Source to Target (#797) | DFS/backtracking on DAG | Yes |
| Graphs and grids | Minimum Number of Vertices to Reach All Nodes (#1557) | Graph indegree reasoning | Yes |
| Graphs and grids | Number of Operations to Make Network Connected (#1319) | DFS/BFS components, Union-Find | Yes |
| Graphs and grids | Snakes and Ladders (#909) | BFS shortest path, board | Yes |
| Linked lists | Add Two Numbers | Linked List, Math, Recursion | Yes |
| Linked lists | Remove Nth Node From End of List | Linked List, Two Pointers | Yes |
| Linked lists | Linked List Cycle II | Hash Table, Linked List, Two Pointers |  |
| Linked lists | Reorder List | Linked List, Two Pointers, Stack, Recursion |  |
| Linked lists | Odd Even Linked List | Linked List |  |
| Linked lists | Swap Nodes in Pairs | Recursion, Linked List |  |
| Linked lists | Rotate List | Linked List, Two Pointers |  |
| Linked lists | Add Two Numbers II | Linked List, Math, Stack |  |
| Linked lists | Linked List in Binary Tree | Depth-First Search, Breadth-First Search, Tree, Binary Tree, Linked List |  |
| Other core mediums | Longest Substring Without Repeating Characters | Hash Table, String, Sliding Window | Yes |
| Other core mediums | Merge Intervals | Array, Sorting | Yes |
| Other core mediums | Container With Most Water | Array, Two Pointers, Greedy | Yes |
| Other core mediums | 3Sum | Array, Two Pointers, Sorting | Yes |
| Other core mediums | Top K Frequent Elements | Array, Hash Table, Divide and Conquer, Sorting, Heap (Priority Queue), Bucket Sort, Counting, Quickselect |  |
| Other core mediums | Longest Consecutive Sequence | Array, Hash Table, Union-Find |  |
| Other core mediums | Search in Rotated Sorted Array | Array, Binary Search |  |
| Other core mediums | Kth Largest Element in an Array | Array, Divide and Conquer, Sorting, Heap (Priority Queue), Quickselect |  |
| Other core mediums | Find Peak Element | Array, Binary Search |  |
| Other core mediums | Gas Station | Array, Greedy |  |
| Other core mediums | Spiral Matrix | Array, Matrix, Simulation |  |
| Other core mediums | Sort Colors | Array, Two Pointers, Sorting |  |
| Other core mediums | Meeting Rooms II | Array, Two Pointers, Sorting, Heap (Priority Queue), Prefix Sum |  |
| Other core mediums | Product of Array Except Self | Array, Prefix Sum |  |
| Other core mediums | Group Anagrams | Array, Hash Table, String, Sorting |  |
| Trees | Lowest Common Ancestor of a Binary Tree | Tree, Depth-First Search, Binary Tree | Yes |
| Trees | Construct Binary Tree from Preorder and Inorder Traversal | Array, Hash Table, Divide and Conquer, Tree, Binary Tree |  |
| Trees | Kth Smallest Element in a BST | Tree, Depth-First Search, Binary Search Tree, Binary Tree |  |
| Trees | Validate Binary Search Tree | Tree, Depth-First Search, Binary Search Tree, Binary Tree |  |
| Trees | Lowest Common Ancestor of a Binary Search Tree | Tree, Depth-First Search, Binary Search Tree, Binary Tree |  |
| Trees | Maximum Binary Tree | Array, Divide and Conquer, Stack, Tree, Monotonic Stack, Binary Tree |  |
| Trees | Flatten a Multilevel Doubly Linked List | Linked List, Depth-First Search, Doubly-Linked List |  |
| Trees | Convert BST to Greater Tree | Tree, Depth-First Search, Binary Search Tree, Binary Tree |  |
| Trees | Populating Next Right Pointers in Each Node | Linked List, Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Trees | Populating Next Right Pointers in Each Node II | Linked List, Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Trees | Construct Binary Tree from Inorder and Postorder Traversal | Array, Hash Table, Divide and Conquer, Tree, Binary Tree |  |
| Trees | Binary Tree Level Order Traversal (alt) | Tree, Breadth-First Search, Binary Tree |  |
| Trees | Binary Tree Right Side View (alt) | Tree, Depth-First Search, Breadth-First Search, Binary Tree |  |
| Trees | Binary Tree Zigzag Level Order Traversal (alt) | Tree, Breadth-First Search, Binary Tree |  |
| Two pointers and sliding window | Longest Repeating Character Replacement | Hash Table, String, Sliding Window | Yes |
| Two pointers and sliding window | Minimum Size Subarray Sum | Array, Binary Search, Prefix Sum, Sliding Window |  |
| Two pointers and sliding window | 3Sum Closest | Array, Two Pointers, Sorting |  |
| Two pointers and sliding window | 4Sum | Array, Two Pointers, Sorting |  |
| Two pointers and sliding window | Find Minimum in Rotated Sorted Array | Array, Binary Search |  |
| Two pointers and sliding window | Find the Duplicate Number | Array, Two Pointers, Binary Search, Bit Manipulation |  |
| Two pointers and sliding window | Longest Substring with At Most Two Distinct Characters | Hash Table, String, Sliding Window |  |
| Two pointers and sliding window | Minimum Window Substring (excluded, Hard) |  |  |
| Two pointers and sliding window | Reverse Words in a String | Two Pointers, String |  |
| Two pointers and sliding window | Sort Colors (alt) | Array, Two Pointers, Sorting |  |
| Two pointers and sliding window | Container With Most Water (alt) | Array, Two Pointers, Greedy |  |
| Two pointers and sliding window | Longest Palindromic Substring (alt) | Two Pointers, String, Dynamic Programming |  |
| Two pointers and sliding window | Palindromic Substrings (alt) | Two Pointers, String, Dynamic Programming |  |
| Two pointers and sliding window | Remove Nth Node From End of List (alt) | Linked List, Two Pointers |  |

This catalog is grounded in the LeetCode Patterns dataset snapshot (updated 2026-04-05) plus specific graph/grid and DP Mediums cross-listed with difficulty labels in the LeetCode in Kotlin index and the DP interview prep sheet. citeturn17view0turn19view0turn20view1turn20view3turn20view4turn21view0

E00  
## Recent and under-discussed Medium gems

If you want "tail-of-the-list" Mediums that still have clean, quickly understandable statements, some of the best candidates are newer graph/grid problems that are explicitly tagged into the LeetCode 75 graph modules in modern study sequences (which is a strong signal that they are meant to be teachable, not just contest puzzles). citeturn20view1turn20view3turn20view4

A particularly good modern BFS trio (all clearly labeled Medium in that index) is: "Nearest Exit from Entrance in Maze" (#1926), "Rotting Oranges" (#994), and "01 Matrix" (#542). They share a common "level-based shortest distance" idea, but differ enough in constraints that you actually learn the reusable template rather than memorizing one solution. citeturn20view4turn19view0turn20view1

For a newer "graph DFS/BFS with bookkeeping" problem that stays readable, "Reorder Routes to Make All Paths Lead to the City Zero" (#1466) is a strong pick: it is a traversal problem, but the twist (edge directions and how many need to flip) is concrete and does not require advanced graph theory vocabulary. citeturn20view1

For modern connected-components practice that is closer to real system/network language, "Number of Operations to Make Network Connected" (#1319) is a good alternative to the older-sounding "provinces" framing: it still trains the same DFS/BFS or Union-Find core, but with a more "network connectivity" story. citeturn20view3

If you want a "graph reachability" problem that feels almost too simple to be Medium (which is exactly what you want during the transition), "Keys and Rooms" (#841) is excellent because it reduces to "can you visit all nodes from node 0" with a minimal amount of setup. citeturn20view3

F00  
## How to use this research to avoid one-hour Medium attempts

A consistent theme across curated plans and community experience posts is that progress comes less from attempting infinite random problems and more from repeatedly applying the same small set of patterns, then writing down what triggered the pattern and what pitfalls you hit. That is exactly why the Tech Interview Handbook schedule and LeetCode Patterns are pattern- and routine-oriented rather than purely chronological lists. citeturn9view0turn11view0

A concrete workflow that fits your "do not spend an hour on one Medium" constraint is to timebox the first attempt and treat each problem as "template practice with a twist." The Tech Interview Handbook explicitly recommends treating practice like a real interview and checking thoroughly before submitting, including manually coming up with test cases. citeturn9view0

A complementary community tactic is "notes-first reinforcement": one interview experience writeup advises writing notes for every interesting problem (time/space, strategy, and why it works) to ingrain the pattern, and also calls out "Number of Islands" specifically as a warm-up BFS/DFS Medium because so many variants reduce to the same traversal template. citeturn22view0

For DP in particular, using a curated DP ramp list prevents the common failure mode of jumping straight into high-cognitive-load DP. The DP study guide explicitly labels a set of introductory DP Mediums (for example House Robber, Coin Change, Unique Paths, Partition Equal Subset Sum, Target Sum, and Longest Common Subsequence), which can be treated as the "minimum viable DP set" before you touch harder families. citeturn21view0