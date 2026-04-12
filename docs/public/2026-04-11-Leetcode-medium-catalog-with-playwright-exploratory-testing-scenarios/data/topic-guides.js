(function () {
  "use strict";

  const LINKS = {
    visualgoList: "https://visualgo.net/en/list",
    visualgoDfsBfs: "https://visualgo.net/en/dfsbfs",
    visualgoBst: "https://visualgo.net/en/bst",
    visualgoUfds: "https://visualgo.net/en/ufds",
    visualgoRecursion: "https://visualgo.net/en/recursion",
    usfcaAlgorithms: "https://www.cs.usfca.edu/~galles/visualization/Algorithms.html",
    usfcaBfs: "https://www.cs.usfca.edu/~galles/visualization/BFS.html",
    usfcaDisjointSets: "https://www.cs.usfca.edu/~galles/visualization/DisjointSets.html",
    techInterviewHandbookLists: "https://www.techinterviewhandbook.org/algorithms/linked-list/",
    stanfordLinkedList: "https://cslibrary.stanford.edu/105/LinkedListProblems.pdf",
    mitBinaryTrees1:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-6-binary-trees-part-1/",
    mitBinaryTrees2:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-7-binary-trees-part-2-avl/",
    mitBfs:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-9-breadth-first-search/",
    mitDfs:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/",
    mitHashing:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-4-hashing/",
    mitHeaps:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-binary-heaps/",
    usacoTwoPointers: "https://usaco.guide/silver/two-pointers",
    usacoSlidingWindow: "https://usaco.guide/gold/sliding-window",
    usacoPrefixSums: "https://usaco.guide/silver/prefix-sums",
    usacoMorePrefixSums: "https://usaco.guide/silver/more-prefix-sums",
    usacoIntroTree: "https://usaco.guide/silver/intro-tree",
    usacoGraphTraversal: "https://usaco.guide/silver/graph-traversal",
    usacoFloodFill: "https://usaco.guide/silver/flood-fill",
    usacoDsu: "https://usaco.guide/gold/dsu",
    usacoIntroDp: "https://usaco.guide/gold/intro-dp",
    usacoPathsOnGrids: "https://usaco.guide/gold/paths-grids",
    usacoIntroBitwise: "https://usaco.guide/silver/intro-bitwise",
    cfDifferenceArrays: "https://codeforces.com/blog/entry/78762",
    topcoderBinarySearch:
      "https://www.topcoder.com/community/data-science/data-science-tutorials/binary-search/",
    stanfordBacktracking:
      "https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/11-backtracking1/",
    cpAlgorithms: "https://cp-algorithms.com/index.html",
  };

  function section(title, html) {
    return { title, html };
  }

  function bullets(items) {
    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function ordered(items) {
    return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  }

  function resource(title, url, why) {
    return { title, url, why };
  }

  function resourceGroup(title, items) {
    return { title, items };
  }

  window.TOPIC_GUIDES = {
    "two-pointers": {
      title: "Two Pointers",
      summary:
        "Use two pointers when the useful information lives in the relationship between positions, and moving one boundary can safely discard or confirm a region.",
      relatedProblems: [
        "container-with-most-water",
        "3sum",
        "sort-colors",
        "remove-nth-node-from-end-of-list",
        "linked-list-cycle-ii",
        "reorder-list",
      ],
      relatedTopics: ["sliding-window", "linked-lists", "prefix-sums"],
      fitSignals: [
        "The data is already ordered, or ordering would make boundary movement meaningful.",
        "A decision at one end can rule out whole regions instead of just one candidate.",
        "The real question is about distance, pairing, or a maintained gap rather than one isolated index.",
      ],
      reviewChecklist: [
        "Can I explain exactly why the next pointer move is safe?",
        "What does each boundary guarantee right now?",
        "If the pointers cross, have I already considered every useful candidate?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("USACO Guide: Two Pointers", LINKS.usacoTwoPointers, "Pattern-first explanation of monotonic pointer movement."),
          resource("Tech Interview Handbook: Linked List", LINKS.techInterviewHandbookLists, "Useful for fast/slow and gap-based pointer routines on lists."),
        ]),
        resourceGroup("Visual intuition", [
          resource("VisuAlgo: Linked List / Queue / Deque", LINKS.visualgoList, "Makes pointer movement and list structure changes concrete."),
          resource("Algorithm Visualizations index", LINKS.usfcaAlgorithms, "A second interactive reference for pointer-adjacent structures."),
        ]),
      ],
      sections: [
        section(
          "When It Fits",
          `<p>Two pointers is not “use two variables.” It is a proof technique. One boundary moves because the other boundary already makes some candidates uninteresting.</p>${bullets([
            "Opposite ends: the weaker side limits the current value, so only one side can plausibly improve the answer.",
            "Fast and slow: one pointer reveals structure such as a middle point, a gap, or a cycle.",
            "Partitioning: boundaries mark regions whose meanings stay true after each swap or advance.",
          ])}`,
        ),
        section(
          "The Invariant To Protect",
          `<p>If you cannot state the invariant, the pointer moves will degrade into guesswork. Good two-pointer solutions usually sound like one of these sentences:</p>${bullets([
            "Everything outside the current boundaries has already been proved irrelevant.",
            "The distance or ordering between pointers already encodes the part of the answer we care about.",
            "Each labeled region still contains only the kind of values it is supposed to contain.",
          ])}`,
        ),
        section(
          "What Breaks Beginners",
          `${bullets([
            "Moving a pointer because it feels symmetric, not because one side is dominated.",
            "Forgetting that opposite-end scans and fast/slow pointers solve different classes of problems.",
            "Using pointer movement to patch over weak reasoning instead of making the reasoning explicit.",
          ])}`,
        ),
        section(
          "How To Review After Solving",
          `${ordered([
            "Write one sentence explaining why each pointer move was safe.",
            "Name the invariant in plain words, not code terms.",
            "Ask whether the same invariant would survive if the story changed but the data shape stayed similar.",
          ])}`,
        ),
      ],
    },

    "sliding-window": {
      title: "Sliding Window",
      summary:
        "A sliding window is a moving interval where you maintain one cheap state summary and repair the interval only when that summary becomes invalid or less useful.",
      relatedProblems: [
        "longest-substring-without-repeating-characters",
        "longest-repeating-character-replacement",
        "longest-nice-subarray",
        "maximum-sum-of-distinct-subarrays-with-length-k",
        "length-of-longest-subarray-with-at-most-k-frequency",
        "count-subarrays-where-max-element-appears-at-least-k-times",
      ],
      relatedTopics: ["two-pointers", "prefix-sums"],
      fitSignals: [
        "The prompt asks about a subarray or substring, not an arbitrary subset.",
        "Extending the interval changes the condition locally rather than forcing a full recomputation.",
        "The left edge only needs to move forward, never backward, to repair the current state.",
      ],
      reviewChecklist: [
        "What does the window state summarize cheaply?",
        "Exactly what condition makes me shrink?",
        "Am I recording a value for every right edge, or only when the window is fully legal?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("USACO Guide: Sliding Window", LINKS.usacoSlidingWindow, "Direct explanation of the expand-repair-record rhythm."),
          resource("USACO Guide: Two Pointers", LINKS.usacoTwoPointers, "Helps connect fixed and variable windows to the broader pointer framework."),
        ]),
        resourceGroup("Supporting fundamentals", [
          resource("MIT 6.006: Hashing", LINKS.mitHashing, "Useful when the window state is frequency-based."),
          resource("USACO Guide: Intro to Bitwise Operators", LINKS.usacoIntroBitwise, "Helpful for window invariants driven by masks or AND/OR conflicts."),
        ]),
      ],
      sections: [
        section(
          "Core Rhythm",
          `${ordered([
            "Expand the right edge so the window learns one new fact.",
            "Update the summary for that new value.",
            "Shrink the left edge only until the invariant is restored.",
            "Record the best or counted result at the correct moment.",
          ])}<p>That rhythm is more important than any one code template.</p>`,
        ),
        section(
          "Common Window Shapes",
          `${bullets([
            "Variable-size window: grow greedily and shrink only when invalid.",
            "Fixed-size window: the size never changes, so the main question is whether the current slice is legal or worth scoring.",
            "Counting window: do not list every valid range; count how many ranges the current right edge unlocks.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Tracking too much state when only one or two counters actually matter.",
            "Shrinking for aesthetic reasons instead of because the invariant broke.",
            "Mixing the legality check with the scoring rule so the code stops matching the reasoning.",
          ])}`,
        ),
        section(
          "Review Questions",
          `${bullets([
            "What single sentence defines a legal window here?",
            "Can the left edge ever need to move backward? If yes, it is probably not a standard window.",
            "What exactly becomes cheaper because the window state is incremental?",
          ])}`,
        ),
      ],
    },

    "prefix-sums": {
      title: "Prefix Sums And Difference Arrays",
      summary:
        "Prefix sums turn repeated range evaluation into cheap boundary arithmetic, while difference arrays let you defer many range updates and reconstruct the final effect later.",
      relatedProblems: [
        "product-of-array-except-self",
        "shifting-letters-ii",
        "minimum-penalty-for-a-shop",
        "count-subarrays-where-max-element-appears-at-least-k-times",
      ],
      relatedTopics: ["sliding-window", "two-pointers"],
      fitSignals: [
        "You care about many ranges, split points, or cumulative effects over contiguous data.",
        "The same interval would otherwise be recomputed from scratch many times.",
        "A range update or range score can be expressed through boundary changes instead of per-element simulation.",
      ],
      reviewChecklist: [
        "What does the prefix value at index i mean exactly?",
        "Is this a query problem, an update problem, or both?",
        "Could I solve the story by comparing the cost on the left of a split against the cost on the right?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("USACO Guide: Prefix Sums", LINKS.usacoPrefixSums, "The cleanest first explanation for 1D cumulative reasoning."),
          resource("USACO Guide: More on Prefix Sums", LINKS.usacoMorePrefixSums, "Extends the idea to richer range reasoning."),
        ]),
        resourceGroup("Range updates", [
          resource("Difference Arrays (Codeforces blog)", LINKS.cfDifferenceArrays, "A strong explanation of boundary-marking for many updates."),
          resource("CP-Algorithms Index", LINKS.cpAlgorithms, "Good when you want a more formal reference after the intuition clicks."),
        ]),
      ],
      sections: [
        section(
          "Two Distinct Jobs",
          `<p>Prefix sums and difference arrays often get mixed together, but they solve opposite jobs:</p>${bullets([
            "Prefix sums answer many range queries after one preprocessing sweep.",
            "Difference arrays apply many range updates cheaply, then collapse them into the final values with one sweep.",
          ])}`,
        ),
        section(
          "Best Split Point Thinking",
          `<p>Many deceptively small Mediums are really boundary-scoring problems. Instead of simulating a story step by step, evaluate every split point with precomputed left and right costs.</p>${bullets([
            "Penalty or reward before the split is one running total.",
            "Penalty or reward after the split is another running total.",
            "The best answer is whichever split minimizes or maximizes the combined score.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Using an off-by-one prefix definition and then patching formulas case by case.",
            "Applying every range update directly when only the boundaries matter.",
            "Forgetting that the story may sound complicated even when the real structure is just cumulative accounting.",
          ])}`,
        ),
        section(
          "Review Questions",
          `${bullets([
            "What does prefix[i] mean in one exact sentence?",
            "Could I answer this by checking boundaries instead of replaying the whole range?",
            "If there are many updates, can I record change events and rebuild the real values later?",
          ])}`,
        ),
      ],
    },

    "linked-lists": {
      title: "Linked Lists",
      summary:
        "Linked-list problems reward pointer discipline: preserve access before rewiring, name the part you still need, and keep head-edge cases under control.",
      relatedProblems: [
        "add-two-numbers",
        "remove-nth-node-from-end-of-list",
        "swap-nodes-in-pairs",
        "linked-list-cycle-ii",
        "merge-nodes-in-between-zeros",
        "remove-nodes-from-linked-list",
        "insert-greatest-common-divisors-in-linked-list",
      ],
      relatedTopics: ["two-pointers"],
      fitSignals: [
        "The structure is easy to traverse but expensive to revisit randomly.",
        "The important work is insertion, deletion, splitting, or merging rather than searching by index.",
        "A dummy node or a carefully maintained tail would simplify head-edge cases immediately.",
      ],
      reviewChecklist: [
        "What reference must stay alive before I change the next pointer?",
        "Would a dummy node make this calmer?",
        "Am I solving a list problem, or am I secretly converting it into an array problem first?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("Tech Interview Handbook: Linked List", LINKS.techInterviewHandbookLists, "Compact refresher on singly, doubly, circular, and common pointer routines."),
          resource("Stanford Linked List Problems", LINKS.stanfordLinkedList, "Classic pointer-safety exercises without platform-specific spoilers."),
        ]),
        resourceGroup("Visual intuition", [
          resource("VisuAlgo: Linked List", LINKS.visualgoList, "Useful for insertion, deletion, and list-shape changes."),
          resource("USFCA Algorithm Visualizations", LINKS.usfcaAlgorithms, "Second interactive reference when a pointer update still feels abstract."),
        ]),
      ],
      sections: [
        section(
          "The First Question",
          `<p>Ask what the structure makes easy and what it makes awkward. Arrays make random access easy. Lists make local rewiring easy. Most good list solutions exploit that difference instead of fighting it.</p>`,
        ),
        section(
          "Pointer Safety Rules",
          `${ordered([
            "Save the next reference you still need.",
            "Perform one local rewiring step.",
            "Reconnect the stable part to the untouched part.",
            "Advance using the references that still mean what you think they mean.",
          ])}`,
        ),
        section(
          "Common Shapes",
          `${bullets([
            "Sentinel and delete: simplify head removal and repeated deletions.",
            "Fast and slow: reveal the middle, a gap, or a cycle without extra storage.",
            "Split, reverse, merge: many larger list problems are just clean composition of these smaller routines.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Changing a pointer before preserving access to the remaining nodes.",
            "Writing a long rewiring sequence with unnamed temporary references.",
            "Treating head-edge cases as exceptions instead of designing them away with a sentinel.",
          ])}`,
        ),
      ],
    },

    "tree-traversal": {
      title: "Tree Traversal",
      summary:
        "Tree problems become easier once you decide whether information should flow down from ancestors, back up from children, or across levels as a batch.",
      relatedProblems: [
        "binary-tree-level-order-traversal",
        "validate-binary-search-tree",
        "lowest-common-ancestor-of-a-binary-tree",
        "create-binary-tree-from-descriptions",
        "count-nodes-equal-to-average-of-subtree",
        "reverse-odd-levels-of-binary-tree",
      ],
      relatedTopics: ["bfs", "dfs", "graph-traversal"],
      fitSignals: [
        "Each node creates smaller subproblems with the same structure.",
        "The question depends on parent-child relationships, subtree summaries, or level groupings.",
        "The right answer appears naturally if you choose the correct traversal order.",
      ],
      reviewChecklist: [
        "Is this really top-down, bottom-up, or per-level?",
        "What should a recursive call return?",
        "Would the problem get simpler if I temporarily viewed the tree as a graph instead?",
      ],
      resourceGroups: [
        resourceGroup("Core reading", [
          resource("MIT 6.006: Binary Trees Part 1", LINKS.mitBinaryTrees1, "Clean structural models for navigating and reasoning about trees."),
          resource("USACO Guide: Intro to Tree Algorithms", LINKS.usacoIntroTree, "Practical bridge from DFS to subtree thinking."),
        ]),
        resourceGroup("Subtree and structure intuition", [
          resource("MIT 6.006: Binary Trees Part 2", LINKS.mitBinaryTrees2, "Useful when subtree augmentation or child-return signals feel fuzzy."),
          resource("VisuAlgo: BST / AVL", LINKS.visualgoBst, "Helpful for traversal order and tree-shape intuition."),
        ]),
      ],
      sections: [
        section(
          "Three Common Tree Questions",
          `${bullets([
            "Visit nodes in a useful order.",
            "Compute a value from each subtree.",
            "Use one structural promise such as BST ordering or level grouping to avoid extra work.",
          ])}`,
        ),
        section(
          "Top-Down vs Bottom-Up",
          `<p>Top-down recursion passes context into children. Bottom-up recursion asks children to report something meaningful back. Many tree solutions become clean only after you choose one of those directions explicitly.</p>${bullets([
            "Top-down examples: valid range, depth, running path state.",
            "Bottom-up examples: subtree sum, subtree count, found-target signals.",
          ])}`,
        ),
        section(
          "When BFS Is Better",
          `<p>If the prompt talks about time steps, visible layers, or per-level operations, the tree is often asking to be processed level by level rather than recursively.</p>`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Using recursion without knowing what the function is supposed to return.",
            "Checking only local parent-child relations when the property is global.",
            "Mixing tree logic and graph logic instead of committing to one model at a time.",
          ])}`,
        ),
      ],
    },

    bfs: {
      title: "Breadth-First Search",
      summary:
        "BFS explores in layers, which makes it the default tool for unweighted distance, shortest path by edge count, simultaneous spread, and any 'time step' story.",
      relatedProblems: [
        "binary-tree-level-order-traversal",
        "binary-tree-right-side-view",
        "rotting-oranges",
        "walls-and-gates",
        "amount-of-time-for-binary-tree-to-be-infected",
        "reachable-nodes-with-restrictions",
      ],
      relatedTopics: ["tree-traversal", "graph-traversal", "dfs"],
      fitSignals: [
        "The prompt uses words like minimum steps, nearest, layers, minutes, rounds, or shortest in an unweighted setting.",
        "Many sources may begin spreading at once.",
        "You care about the first time a node or cell is reached.",
      ],
      reviewChecklist: [
        "What counts as one layer here?",
        "Do I need to know distance explicitly, or is the queue depth enough?",
        "What is the exact moment a node becomes visited?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("MIT 6.006: Breadth-First Search", LINKS.mitBfs, "Clear explanation of layers and shortest paths in unweighted graphs."),
          resource("USACO Guide: Graph Traversal", LINKS.usacoGraphTraversal, "Practical BFS/DFS usage guide."),
        ]),
        resourceGroup("Visual intuition", [
          resource("VisuAlgo: DFS/BFS", LINKS.visualgoDfsBfs, "Shows frontier growth and visitation order."),
          resource("USFCA BFS Visualization", LINKS.usfcaBfs, "Minimal visual reference for queue-driven expansion."),
        ]),
      ],
      sections: [
        section(
          "What BFS Guarantees",
          `<p>BFS does one thing extremely well: it reaches every state in nondecreasing distance from the source set.</p>${bullets([
            "That is why it solves unweighted shortest path questions.",
            "That is why it models spread over time cleanly.",
            "That is why level-order tree traversal feels so natural in BFS form.",
          ])}`,
        ),
        section(
          "Single-Source vs Multi-Source",
          `${bullets([
            "Single-source BFS starts from one node and expands outward.",
            "Multi-source BFS starts by enqueuing all active sources at distance zero, then lets the frontier spread together.",
          ])}<p>If the story says several things begin at once, multi-source BFS should be one of the first candidates you test mentally.</p>`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Marking visited too late and accidentally enqueuing the same node many times.",
            "Using BFS for weighted edges without questioning the distance model.",
            "Counting levels manually in a way that drifts away from the queue's actual structure.",
          ])}`,
        ),
        section(
          "Review Questions",
          `${bullets([
            "What is the source set?",
            "What counts as one edge or one minute?",
            "If I stop when I first see the target, am I guaranteed that is optimal?",
          ])}`,
        ),
      ],
    },

    dfs: {
      title: "Depth-First Search",
      summary:
        "DFS is for exhaustive structural exploration: connected components, subtree work, topological reasoning, cycle detection, and any situation where finishing one branch before the next simplifies the state.",
      relatedProblems: [
        "validate-binary-search-tree",
        "lowest-common-ancestor-of-a-binary-tree",
        "number-of-islands",
        "course-schedule",
        "count-unreachable-pairs-of-nodes-in-an-undirected-graph",
        "count-the-number-of-complete-components",
      ],
      relatedTopics: ["tree-traversal", "graph-traversal", "bfs"],
      fitSignals: [
        "You need to fully inspect one branch, subtree, or component before moving on.",
        "The question is about connectivity, structural validity, or postorder-style aggregation.",
        "The order of entry and exit from nodes matters.",
      ],
      reviewChecklist: [
        "What does the recursive call promise to return or complete?",
        "Does the problem care about entry, exit, or both?",
        "Am I traversing a tree, a DAG, or a general graph with cycles?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("MIT 6.006: Depth-First Search", LINKS.mitDfs, "Excellent for recursive structure, discovery, and finishing times."),
          resource("USACO Guide: Graph Traversal", LINKS.usacoGraphTraversal, "Practical DFS usage across graphs and grids."),
        ]),
        resourceGroup("Supporting visuals", [
          resource("VisuAlgo: DFS/BFS", LINKS.visualgoDfsBfs, "Makes recursion order and visitation feel less abstract."),
          resource("USACO Guide: Flood Fill", LINKS.usacoFloodFill, "Grid-based DFS intuition for components and regions."),
        ]),
      ],
      sections: [
        section(
          "What DFS Is Good At",
          `${bullets([
            "Fully exploring a component or subtree before returning.",
            "Producing bottom-up signals from children to parents.",
            "Tracking discovery and finishing order when order itself has meaning.",
          ])}`,
        ),
        section(
          "Recursive Contract",
          `<p>Strong DFS solutions usually begin by stating what one call means. Examples:</p>${bullets([
            "This call marks the whole component containing this node.",
            "This call returns the subtree sum/count needed by the parent.",
            "This call reports whether the target was found below.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Running DFS on a cyclic graph with tree-style assumptions.",
            "Using a recursion that mutates global state without a clear contract.",
            "Confusing 'visited' for cycle prevention with separate states needed for active recursion stacks.",
          ])}`,
        ),
        section(
          "Review Questions",
          `${bullets([
            "What exactly does one completed DFS call buy me?",
            "Do I need a visited set, a recursion-stack marker, or both?",
            "Would BFS give a simpler distance interpretation here, or is full branch exploration the real task?",
          ])}`,
        ),
      ],
    },

    "graph-traversal": {
      title: "Graph Traversal And Components",
      summary:
        "Graph problems get calmer once you decide the model first: explicit graph, grid-as-graph, DAG, or repeated connectivity queries that may prefer DSU over repeated traversals.",
      relatedProblems: [
        "course-schedule",
        "number-of-islands",
        "rotting-oranges",
        "count-unreachable-pairs-of-nodes-in-an-undirected-graph",
        "maximum-number-of-fish-in-a-grid",
        "count-the-number-of-complete-components",
      ],
      relatedTopics: ["bfs", "dfs", "tree-traversal"],
      fitSignals: [
        "The main objects are nodes and edges, whether explicit or hidden inside a grid.",
        "Connectivity, reachability, or component structure is more important than the raw input layout.",
        "The same graph may face multiple connectivity questions, suggesting DSU or preprocessing.",
      ],
      reviewChecklist: [
        "What is a node? What is an edge?",
        "Is this traversal once, traversal many times, or connectivity under repeated queries?",
        "Do restrictions or blocked states act like deleted nodes/edges?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("USACO Guide: Graph Traversal", LINKS.usacoGraphTraversal, "Strong pattern-first graph traversal reference."),
          resource("MIT 6.006: BFS", LINKS.mitBfs, "Best when distance or layer semantics matter."),
          resource("MIT 6.006: DFS", LINKS.mitDfs, "Best when structure and branch completion matter."),
        ]),
        resourceGroup("Components and DSU", [
          resource("USACO Guide: Flood Fill", LINKS.usacoFloodFill, "Grid components and reachability."),
          resource("USACO Guide: DSU", LINKS.usacoDsu, "When repeated connectivity queries make repeated traversal wasteful."),
          resource("VisuAlgo: Union-Find", LINKS.visualgoUfds, "Path compression and merging made visual."),
          resource("USFCA Disjoint Sets", LINKS.usfcaDisjointSets, "Second DSU visualizer."),
        ]),
      ],
      sections: [
        section(
          "Model First, Algorithm Second",
          `<p>Many graph mistakes happen before traversal begins. Convert the input into the right graph model first.</p>${bullets([
            "Grid: neighbors are implied by directions.",
            "Tree with upward movement: it may need to be treated like an undirected graph.",
            "DAG: direction and dependency order matter.",
            "Many connectivity queries: DSU may fit better than repeating DFS/BFS from scratch.",
          ])}`,
        ),
        section(
          "Component Thinking",
          `<p>Connected components are often the first layer of understanding, not the final answer.</p>${bullets([
            "Sometimes the answer is the component size.",
            "Sometimes the answer is how components relate to each other.",
            "Sometimes you must validate an internal property after the component is found.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Jumping into traversal before defining edges clearly.",
            "Repeating full traversals when the graph/query pattern suggests preprocessing.",
            "Treating blocked nodes as special cases everywhere instead of baking the restriction into the model.",
          ])}`,
        ),
        section(
          "Review Questions",
          `${bullets([
            "What is the cheapest correct way to represent adjacency here?",
            "Is connectivity enough, or do I need distance, order, or structure inside each component?",
            "Would DSU reduce repeated work, or do I need explicit traversal side effects?",
          ])}`,
        ),
      ],
    },

    backtracking: {
      title: "Backtracking",
      summary:
        "Backtracking is disciplined search: choose, explore, undo. It fits when the search space is explicit, constraints are local enough to prune, and the goal is not to enumerate blindly but to cut bad branches early.",
      relatedProblems: [
        "combination-sum",
        "subsets",
        "palindrome-partitioning",
        "maximum-points-in-an-archery-competition",
      ],
      relatedTopics: ["dynamic-programming"],
      fitSignals: [
        "The answer is built from a sequence of reversible choices.",
        "A partial choice can already be judged as hopeless or invalid.",
        "The search space is small enough, or can be pruned enough, to explore systematically.",
      ],
      reviewChecklist: [
        "What is the current partial decision?",
        "What makes a branch dead early?",
        "Would memoization turn this into DP if overlapping states appear repeatedly?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("Stanford CS106B: Recursive Backtracking and Enumeration", LINKS.stanfordBacktracking, "Best fit here: clear, discipline-first explanation of search and undo."),
          resource("VisuAlgo: Recursion Tree / DAG", LINKS.visualgoRecursion, "Helpful for seeing branching shape and why repeated subproblems matter."),
        ]),
        resourceGroup("Related next step", [
          resource("USACO Guide: Intro to DP", LINKS.usacoIntroDp, "Use this when the search starts revisiting the same state over and over."),
        ]),
      ],
      sections: [
        section(
          "Backtracking Is Not Random Try-And-See",
          `<p>Good backtracking has a state model, a branching rule, and a reason to prune. The recursion tree should reflect the problem's real choices, not accidental code structure.</p>`,
        ),
        section(
          "The Standard Loop",
          `${ordered([
            "Choose one next option.",
            "Update the partial state.",
            "If still viable, explore deeper.",
            "Undo the choice so the next branch starts clean.",
          ])}`,
        ),
        section(
          "When To Stop And Reframe",
          `${bullets([
            "If many branches arrive at the same state, you may be in DP territory.",
            "If constraints can be checked only at the very end, pruning may be too weak for brute-force search.",
            "If the branching factor is huge and unstructured, another model may be better.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Mutating shared state without a reliable undo path.",
            "Exploring branches whose failure could have been detected earlier.",
            "Not naming the search state clearly enough to reason about pruning.",
          ])}`,
        ),
      ],
    },

    "dynamic-programming": {
      title: "Dynamic Programming",
      summary:
        "DP is about state design: define a subproblem so clearly that larger answers become combinations of smaller answers you already trust.",
      relatedProblems: [
        "unique-paths",
        "coin-change",
        "word-break",
        "decode-ways",
        "count-ways-to-build-good-strings",
      ],
      relatedTopics: ["backtracking", "prefix-sums"],
      fitSignals: [
        "The problem can be broken into overlapping smaller subproblems.",
        "You care about the best count, minimum cost, feasibility, or number of ways over a structured state space.",
        "The answer for state X depends on a small set of smaller states, not on the entire original input.",
      ],
      reviewChecklist: [
        "What does one state mean in plain language?",
        "What smaller states feed into it?",
        "Is this a feasibility DP, optimization DP, or counting DP?",
      ],
      resourceGroups: [
        resourceGroup("Start here", [
          resource("USACO Guide: Intro to DP", LINKS.usacoIntroDp, "Clear introduction to subproblems and transitions."),
          resource("USACO Guide: Paths on Grids", LINKS.usacoPathsOnGrids, "Good for approachable grid-state examples."),
        ]),
        resourceGroup("Supporting intuition", [
          resource("VisuAlgo: Recursion Tree / DAG", LINKS.visualgoRecursion, "Shows why memoization changes the computation shape."),
          resource("CP-Algorithms Index", LINKS.cpAlgorithms, "Helpful when you want a more formal follow-up reference."),
        ]),
      ],
      sections: [
        section(
          "DP Starts With State, Not With Loops",
          `<p>If the state meaning is vague, the recurrence will be vague too. Start by writing one sentence such as:</p>${bullets([
            "dp[i] = best answer for the prefix ending at i.",
            "dp[len] = number of valid constructions of this length.",
            "dp[amount] = minimum cost to reach this total.",
          ])}`,
        ),
        section(
          "Three Common DP Jobs",
          `${bullets([
            "Feasibility: can this state be reached?",
            "Optimization: what is the best value for this state?",
            "Counting: how many ways reach this state?",
          ])}<p>Confusing those jobs is one of the fastest ways to design the wrong transition.</p>`,
        ),
        section(
          "Memoization vs Tabulation",
          `${bullets([
            "Memoization is often easiest when the recursive structure is already obvious.",
            "Tabulation is often easier to inspect once the state order is clear.",
            "Both are secondary choices; the state definition matters more.",
          ])}`,
        ),
        section(
          "Failure Modes",
          `${bullets([
            "Encoding too much into the state and making transitions unreadable.",
            "Using DP before proving the problem really has overlapping subproblems.",
            "Filling states in an order that uses values not computed yet.",
          ])}`,
        ),
      ],
    },
  };
})();
