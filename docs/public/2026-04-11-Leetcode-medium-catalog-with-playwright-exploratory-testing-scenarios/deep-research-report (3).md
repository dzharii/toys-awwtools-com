# Educational materials for the curated Medium problem themes

F00
## Source selection methodology and constraints

This library is curated for the concept families covered by your selected Medium set: linked list pointer navigation; DFS/BFS across trees, graphs, and grids; connected components, DSU, and reachability; two pointers and sliding window; prefix sums and difference arrays; bitwise invariants; greedy with sorting; heaps and priority queues; binary search on monotonic predicates; interval overlap via sweep line; and approachable DP and backtracking. citeturn4search17turn1search30turn3search19

The focus is intentionally "approach education, not problem solutions." Resources were preferred when they (a) teach reusable patterns, (b) use visuals or interactive animations where possible, and (c) stay technique-level rather than walking through specific LeetCode solutions. citeturn8search6turn0search8turn3search3turn7search22

To keep this usable as a reference library (and not a repetitive dump), each link below is unique, and multi-topic resources are positioned so you can reuse them across multiple problem families without re-reading near-identical content. citeturn3search3turn7search22turn3search37

G00
## Cornerstone ecosystems that stay coherent across all topics

| Resource | What it is best for in your curriculum | Why it fits your "high-signal" bar |
|---|---|---|
| [VisuAlgo](https://visualgo.net/) | Interactive visual intuition for core DS and algorithms (lists, heaps, DFS/BFS, DSU, recursion, bit operations) | Strong visual/step-by-step emphasis designed for learning DS and algorithms, not for teaching a specific platform's answers citeturn8search6turn1search9turn0search7 |
| [Data Structure Visualizations - Algorithm Visualizations](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html) | A second, complementary interactive visualizer (especially helpful for BFS, heaps, DSU) | Very direct "watch the structure change" learning style; complements VisuAlgo with alternate interaction designs citeturn0search1turn0search8turn8search7 |
| [USACO Guide](https://usaco.guide/) | Pattern-first written modules for two pointers, prefix sums, flood fill, trees, DSU, DP, etc | Consistent pedagogical structure and curated modules; useful as a technique wiki that is not tied to LeetCode solutions citeturn3search3turn4search17turn3search19 |
| [MIT OpenCourseWare 6.006 lecture notes index](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-notes/) | A rigorous, coherent set of lecture notes for hashing, trees, heaps, BFS/DFS, and DP foundations | High-quality university treatment that supports deeper understanding when a pattern starts feeling "hand-wavy" citeturn7search22turn7search3turn6search3turn7search4 |
| [CP Algorithms - Index](https://cp-algorithms.com/index.html) | A reference-grade index for algorithms and data structures (good for when you want the formal version of a technique) | Widely used as a CP reference; excellent for definitions, complexity, and standard variants citeturn3search37turn3search2turn2search14 |

H00
## Linked lists and pointer discipline

| Resource | Best used when | Coverage you will reuse across many Mediums |
|---|---|---|
| [Linked List (Single, Doubly), Stack, Queue, Deque](https://visualgo.net/en/list) | You want to visually sanity-check pointer updates, insertion, deletion, and traversal invariants | Singly vs doubly linked list mechanics, plus stack/queue variants built on list operations citeturn0search0turn0search7 |
| [Linked list cheatsheet for coding interviews](https://www.techinterviewhandbook.org/algorithms/linked-list/) | You want a compact, non-solution-oriented refresher of list types and routine sub-skills | Singly, doubly, and circular list distinctions; common routines like traversal, middle-finding, reversal, safe rewiring citeturn5search11 |
| [What's a Linked List, Anyway? Part 1](https://medium.com/basecs/whats-a-linked-list-anyway-part-1-d8b7e6508b9d) | You want a narrative, visual explanation that makes lists feel intuitive again | Clear conceptual grounding: what nodes and pointers represent; how traversal differs from arrays citeturn4search8 |
| [What's a Linked List, Anyway? Part 2](https://medium.com/basecs/whats-a-linked-list-anyway-part-2-131d96f71996) | You want to internalize the "order of pointer operations" that prevents losing the rest of the list | Insert and pointer update sequencing; why certain orders create cycles or disconnect sublists citeturn4search0 |
| [Linked List Problems (Stanford CS Education Library)](https://cslibrary.stanford.edu/105/LinkedListProblems.pdf) | You want pointer-safety practice and diagram-friendly list reasoning without platform-specific spoilers | Classic, technique-focused list exercises that build robust pointer hygiene citeturn4search20 |
| [Stack (Linked List Implementation) visualization](https://www.cs.usfca.edu/~galles/visualization/StackLL.html) | You want a minimal interactive pointer structure where failures are obvious | Pointer discipline in a controlled setting (stack operations make linking/unlinking visible) citeturn8search2turn0search1 |

I00
## Trees: traversal, subtree aggregation, and tree metrics

| Resource | Best used when | Coverage you will reuse across many Mediums |
|---|---|---|
| [Lecture 6: Binary Trees, Part 1](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-6-binary-trees-part-1/) | You want clean mental models for tree navigation and structural operations | Terminology, navigation, and tree operations; strong foundation for level-order, parent/child reasoning citeturn7search1 |
| [Lecture 7: Binary Trees, Part 2: AVL](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-7-binary-trees-part-2-avl/) | You need intuition for subtree augmentation (values computed from children) | Subtree augmentation concepts that generalize to subtree sums/counts and "value depends on subtree" tasks citeturn7search2 |
| [Introduction to Tree Algorithms](https://usaco.guide/silver/intro-tree) | You want a tree-focused bridge from DFS into subtree reasoning (sizes, rooted trees) | Subtrees and basic rooted-tree thinking; great for subtree aggregation problems citeturn2search34 |
| [Binary Search Tree, AVL Tree](https://visualgo.net/en/bst) | You want traversal animations (preorder/postorder) and a concrete tree to interact with | Traversal order intuition; step-by-step tree operation visualization citeturn2search1 |
| [AVL Tree visualization](https://www.cs.usfca.edu/~galles/visualization/AVLtree.html) | You want a second visualization viewpoint for balanced-tree operations | Another interactive look at tree transformations; helpful for building structural confidence citeturn2search19turn0search1 |
| [Tutorial: Diameter of a tree and its applications](https://codeforces.com/blog/entry/101271) | You want a focused explanation of tree diameter logic and properties | Tree diameter concepts and properties that transfer to "farthest endpoints" reasoning citeturn2search10 |

J00
## Graphs and grids: BFS/DFS, components, DAG reasoning, DSU, functional graphs

| Resource | Best used when | Coverage you will reuse across many Mediums |
|---|---|---|
| [Lecture 9: Breadth-First Search](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-9-breadth-first-search/) | You want a rigorous, clear explanation of BFS layers and shortest paths in unweighted graphs | BFS as shortest-path tree construction; queue discipline and graph representation foundations citeturn7search4turn7search0 |
| [Lecture 10: Depth-First Search](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/) | You want DFS with applications that map to Medium graph tasks | DFS, full-DFS, plus topological sorts and cycle detection (useful for DAG-oriented reasoning) citeturn2search2turn2search5 |
| [Graph Traversal (DFS/BFS) visualization](https://visualgo.net/en/dfsbfs) | You want to see traversal order and variants evolve step-by-step | DFS/BFS mechanics and variants; builds intuition for visitation states and traversal side-effects citeturn1search2turn1search6 |
| [Breadth-First Search visualization](https://www.cs.usfca.edu/~galles/visualization/BFS.html) | You want a minimal interactive BFS that makes queue order concrete | BFS exploration order and frontier growth, visually citeturn0search5turn0search1 |
| [Graph Traversal (USACO Guide)](https://usaco.guide/silver/graph-traversal) | You want a practical module-format explanation bridging DFS and BFS | A consistent, written "what it is and when to use" for traversal patterns citeturn5search10turn4search17 |
| [Flood Fill](https://usaco.guide/silver/flood-fill) | Your graph is a grid and you need components, regions, or reachability with obstacles | Flood fill as grid-connected components; useful for many grid Mediums citeturn4search1turn4search17 |
| [Disjoint Set Union](https://usaco.guide/gold/dsu) | You need connectivity queries or component merging without repeated traversals | DSU fundamentals and problem archetypes; aligns with "many queries, one graph" thinking citeturn3search0turn3search19 |
| [Union-Find Disjoint Sets (UFDS) visualization](https://visualgo.net/en/ufds) | You want DSU path compression/union mechanics to feel intuitive, not magical | DSU operations and forest representation in an interactive model citeturn8search0turn8search3 |
| [Disjoint Sets visualization](https://www.cs.usfca.edu/~galles/visualization/DisjointSets.html) | You want an alternate DSU visualization and immediate feedback on rank/compression ideas | DSU with path compression and union heuristics in a second visualization style citeturn8search1turn0search1 |
| [Union-Find case study (algs4)](https://algs4.cs.princeton.edu/15uf/) | You want a careful, classic explanation of DSU tradeoffs and complexity | DSU variants and performance discussion; extremely common reference point citeturn0search2 |
| [Introduction to Functional Graphs](https://usaco.guide/silver/func-graphs) | Your directed graph has outdegree-1 structure (or close to it) and you need cycle/chain reasoning | Functional graph decomposition and Floyd cycle-finding context, highly relevant to "closest node" style tasks citeturn5search3turn4search17 |
| [A Visual Guide to Graph Traversal Algorithms](https://workshape.github.io/visual-graph-algorithms/) | You want an additional, traversal-focused interactive guide beyond VisuAlgo/USFCA | Interactive BFS/DFS traversal visuals for intuition building citeturn1search23 |

K00
## Arrays and strings: two pointers, sliding window, prefix sums, difference arrays, bitwise invariants, and hashing

| Resource | Best used when | Coverage you will reuse across many Mediums |
|---|---|---|
| [Two Pointers](https://usaco.guide/silver/two-pointers) | You want the general "two monotonic indices" framework behind many array/string Mediums | Standard two pointers and sliding window relationship, with clear module structure citeturn0search17turn1search30 |
| [Sliding Window](https://usaco.guide/gold/sliding-window) | You want a focused treatment of windows as a first-class technique | Sliding window as a maintained subarray with incremental updates; bridges into more complex window invariants citeturn0search3 |
| [Introduction to Prefix Sums](https://usaco.guide/silver/prefix-sums) | You want the canonical "range query becomes O(1)" transformation | 1D prefix sums, invertible-operation framing, and clean definitions citeturn1search0turn9search13 |
| [More on Prefix Sums](https://usaco.guide/silver/more-prefix-sums) | You want a step up: 2D prefix thinking and more advanced applications | Extends prefix sums into higher-dimensional reasoning and harder archetypes citeturn1search4turn2search6 |
| [An Introduction To Difference Arrays](https://codeforces.com/blog/entry/78762) | You want the simplest, most reusable mental model for offline range updates | Difference array framing for range updates; pairs naturally with prefix sums citeturn9search0 |
| [Intro to Bitwise Operators](https://usaco.guide/silver/intro-bitwise) | You want bitwise basics that connect to subarray constraints and mask logic | Bitwise AND/OR/XOR orientation and typical usage patterns citeturn6search0turn4search17 |
| [Bitmask (Bit Manipulation) visualization](https://visualgo.net/en/bitmask) | You want to actually see masks, bits, and operations play out | Interactive intuition for masks and bit operations, helpful before "bitwise window invariants" citeturn6search1turn6search5 |
| [Lecture 4: Hashing](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-4-hashing/) | You want a solid foundation for hash-based counting and structure encoding | Hashing models and hash function context; good for "counting + mapping" Mediums citeturn7search3turn7search7 |

L00
## Optimization patterns: greedy, heaps, binary search on monotonic predicates, sweep line for intervals, DP, and backtracking

| Resource | Best used when | Coverage you will reuse across many Mediums |
|---|---|---|
| [Introduction to Greedy Algorithms](https://usaco.guide/bronze/intro-greedy) | You need a precise definition of greedy and why it can fail or succeed | Greedy framing as "locally best" construction; good baseline before harder greedy Mediums citeturn4search2 |
| [Greedy Algorithms with Sorting](https://usaco.guide/silver/greedy-sorting) | Your greedy choice depends on ordering (a very common interview archetype) | Sorting-driven greedy strategy reasoning and how to think about "value functions" citeturn4search6turn4search17 |
| [Lecture 8: Binary Heaps](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-binary-heaps/) | You want a rigorous explanation of heaps as a priority queue interface | Priority queue interfaces and heap operations, with conceptual motivation citeturn6search3turn6search7 |
| [Binary Heap (Priority Queue) visualization](https://visualgo.net/en/heap) | You want heap operations to be visually obvious and memorable | Insert/extract mechanics and heap property maintenance via animation citeturn1search3turn1search7 |
| [Priority Queues](https://usaco.guide/silver/priority-queues) | You want a practical, pattern-first module for when to reach for a heap | Priority queue operations and why it beats more complex structures in many tasks citeturn5search2turn4search17 |
| [Binary Search](https://usaco.guide/silver/binary-search) | You want "binary search on monotonic predicates" (binary search on answer) clearly explained | Monotonic function framing and the predicate mindset that powers many Medium time/capacity problems citeturn1search1turn1search30 |
| [Binary Search (TopCoder tutorial)](https://www.topcoder.com/community/data-science/data-science-tutorials/binary-search/) | You want an additional explanation of binary search fundamentals and why it works | Classic tutorial used by many interview and contest learners citeturn3search25 |
| [Chapter 4: Interval Scheduling (Princeton slides)](https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pearson/04GreedyAlgorithms-2x2.pdf) | You want the interval-to-rooms/classrooms idea explained cleanly (very relevant to "minimum groups" style problems) | Shows the canonical "sort by start time, manage resources with a priority queue" framing for interval allocation citeturn10search8 |
| [Sweep Line](https://usaco.guide/plat/sweep-line) | You want the event-based "count overlaps" view of interval problems | Event conversion and sweep processing patterns that map to overlap counting and peak concurrency citeturn10search2turn3search10 |
| [Introduction to DP](https://usaco.guide/gold/intro-dp) | You want a clear DP introduction focused on subproblems and avoiding redundant work | DP fundamentals, mental models for subproblems, and beginner-friendly classical framing citeturn3search1turn3search24 |
| [Paths on Grids](https://usaco.guide/gold/paths-grids) | You want approachable grid DP that looks like many Medium "grid cost/count" tasks | Grid as DP state space; recurrence thinking and ordering of computation citeturn5search22 |
| [Recursion Tree and DAG visualization](https://visualgo.net/en/recursion) | You want to see overlapping subproblems and why DP changes the shape of computation | Visualizes recursion trees vs recursion DAGs, directly reinforcing DP intuition citeturn2search15 |
| [CS106B Recursive Backtracking and Enumeration](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/11-backtracking1/) | You want backtracking taught as a disciplined search process (choices, dead-ends, undo) | A clean conceptual model of backtracking as "choose, explore, un-choose" with clarity about dead-ends citeturn6search2turn6search6 |