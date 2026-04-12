#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CACHE_PATH = DATA_DIR / "leetcode_validation_cache.json"
OUTPUT_JSON = DATA_DIR / "problems.json"
OUTPUT_JS = DATA_DIR / "problems.js"
SUMMARY_JSON = DATA_DIR / "generation-summary.json"
SOLUTIONS_DIR = DATA_DIR / "solutions"


RESEARCH_SOURCES = {
    "leetcode_patterns": "https://seanprashad.com/leetcode-patterns/",
    "neetcode": "https://neetcode.io/",
    "svg_accessibility": "https://www.w3.org/TR/SVG/access",
    "uswds_search": "https://designsystem.digital.gov/components/search/",
}

LANGUAGE_CONFIG = {
    ".py": {"id": "python", "label": "Python", "comment": "#"},
    ".cpp": {"id": "cpp", "label": "C++", "comment": "//"},
    ".java": {"id": "java", "label": "Java", "comment": "//"},
    ".go": {"id": "go", "label": "Go", "comment": "//"},
    ".ts": {"id": "typescript", "label": "TypeScript", "comment": "//"},
    ".js": {"id": "javascript", "label": "JavaScript", "comment": "//"},
    ".cs": {"id": "csharp", "label": "C#", "comment": "//"},
    ".c": {"id": "c", "label": "C", "comment": "//"},
    ".kt": {"id": "kotlin", "label": "Kotlin", "comment": "//"},
    ".rs": {"id": "rust", "label": "Rust", "comment": "//"},
    ".swift": {"id": "swift", "label": "Swift", "comment": "//"},
    ".rb": {"id": "ruby", "label": "Ruby", "comment": "#"},
    ".scala": {"id": "scala", "label": "Scala", "comment": "//"},
    ".dart": {"id": "dart", "label": "Dart", "comment": "//"},
}

LANGUAGE_ORDER = [
    "python",
    "cpp",
    "java",
    "go",
    "typescript",
    "javascript",
    "csharp",
    "c",
    "kotlin",
    "rust",
    "swift",
    "ruby",
    "scala",
    "dart",
]

REPO_PRIORITY = [
    "neetcode-gh_leetcode",
    "kamyu104_LeetCode-Solutions",
    "doocs_leetcode",
    "wisdompeak_LeetCode",
    "haoel_leetcode",
    "test-123",
]

LEARNING_URLS = {
    "linked_lists": "https://www.techinterviewhandbook.org/algorithms/linked-list/",
    "tree_intro": "https://usaco.guide/silver/intro-tree",
    "mit_bfs": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-9-breadth-first-search/",
    "mit_dfs": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/",
    "graph_traversal": "https://usaco.guide/silver/graph-traversal",
    "flood_fill": "https://usaco.guide/silver/flood-fill",
    "sliding_window": "https://usaco.guide/gold/sliding-window",
    "two_pointers": "https://usaco.guide/silver/two-pointers",
    "prefix_sums": "https://usaco.guide/silver/prefix-sums",
    "difference_arrays": "https://codeforces.com/blog/entry/78762",
    "dynamic_programming": "https://usaco.guide/gold/intro-dp",
    "backtracking": "https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/11-backtracking1/",
}


PHASES = [
    {
        "id": "foundations",
        "name": "Phase 1: First Solid Mediums",
        "shortName": "First Solid Mediums",
        "description": "Shorter statements, one main invariant, and quick pattern payoff.",
    },
    {
        "id": "linked-lists",
        "name": "Phase 2: Pointer Control",
        "shortName": "Pointer Control",
        "description": "Linked-list problems that reward careful pointer movement without excessive domain noise.",
    },
    {
        "id": "trees",
        "name": "Phase 3: Trees And Recursive Signals",
        "shortName": "Trees And Recursive Signals",
        "description": "Tree traversal, recursion flow, and clean structural invariants.",
    },
    {
        "id": "graphs",
        "name": "Phase 4: Grids And Reachability",
        "shortName": "Grids And Reachability",
        "description": "Graph and grid traversal with clear stories and strong BFS/DFS reuse.",
    },
    {
        "id": "state-space",
        "name": "Phase 5: State Space Search",
        "shortName": "State Space Search",
        "description": "Backtracking, DAG exploration, and choice-making under constraints.",
    },
    {
        "id": "dp",
        "name": "Phase 6: Intro Dynamic Programming",
        "shortName": "Intro Dynamic Programming",
        "description": "Decision chains and manageable state transitions that start to feel like real DP.",
    },
]


LANES = {
    "window-pointer": {
        "label": "Windows And Pointers",
        "color": "#9c4f2c",
    },
    "linked-list": {
        "label": "Linked Lists",
        "color": "#005f73",
    },
    "tree": {
        "label": "Trees",
        "color": "#3d405b",
    },
    "graph-grid": {
        "label": "Graphs And Grids",
        "color": "#1d7874",
    },
    "state-search": {
        "label": "State Search",
        "color": "#7b2d26",
    },
    "dp": {
        "label": "Dynamic Programming",
        "color": "#5f0f40",
    },
}


TOPIC_GUIDES = {
    "two-pointers": {"title": "Two Pointers", "path": "topics/two-pointers.html"},
    "sliding-window": {"title": "Sliding Window", "path": "topics/sliding-window.html"},
    "prefix-sums": {"title": "Prefix Sums And Difference Arrays", "path": "topics/prefix-sums.html"},
    "linked-lists": {"title": "Linked Lists", "path": "topics/linked-lists.html"},
    "tree-traversal": {"title": "Tree Traversal", "path": "topics/tree-traversal.html"},
    "bfs": {"title": "Breadth-First Search", "path": "topics/bfs.html"},
    "dfs": {"title": "Depth-First Search", "path": "topics/dfs.html"},
    "graph-traversal": {"title": "Graph Traversal", "path": "topics/graph-traversal.html"},
    "backtracking": {"title": "Backtracking", "path": "topics/backtracking.html"},
    "dynamic-programming": {"title": "Dynamic Programming", "path": "topics/dynamic-programming.html"},
}


EXCLUSIONS = [
    {
        "number": 198,
        "title": "House Robber",
        "reason": "Removed from the final site because it is Easy, and the published collection is Medium-only.",
    },
    {
        "number": 103,
        "title": "Binary Tree Zigzag Level Order Traversal",
        "reason": "Left out to reduce overlap after keeping level-order, right-side view, and stronger traversal follow-ups.",
    },
    {
        "number": 934,
        "title": "Shortest Bridge",
        "reason": "Strong problem, but trimmed from the main path because the graph section was already dense and this sits a bit later in the learning curve.",
    },
]


def problem(
    *,
    number: int,
    title: str,
    phase: str,
    lane: str,
    concepts: list[str],
    topic_guides: list[str],
    overview: str,
    why_solve: str,
    what_you_practice: str,
    interest_note: str,
    caveat: str,
    clarity: str,
    effort: str,
    transition: str,
    recommended_order: int,
    readiness: str,
    classic: bool = False,
    newer_gem: bool = False,
    starter: bool = False,
    statement_style: str = "",
    expected_mental_model: str = "",
    prerequisites: list[str] | None = None,
    source_urls: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "number": number,
        "title": title,
        "phase": phase,
        "lane": lane,
        "concepts": concepts,
        "topicGuideIds": topic_guides,
        "overview": overview,
        "whySolve": why_solve,
        "whatYouPractice": what_you_practice,
        "interestNote": interest_note,
        "caveat": caveat,
        "clarity": clarity,
        "effort": effort,
        "transitionFriendliness": transition,
        "recommendedOrder": recommended_order,
        "readiness": readiness,
        "classic": classic,
        "newerGem": newer_gem,
        "starter": starter,
        "statementStyle": statement_style,
        "expectedMentalModel": expected_mental_model,
        "prerequisites": prerequisites or [],
        "supportSourceUrls": source_urls or [RESEARCH_SOURCES["leetcode_patterns"]],
    }


CURATED_PROBLEMS = [
    problem(
        number=3,
        title="Longest Substring Without Repeating Characters",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "hashing", "string"],
        topic_guides=["sliding-window"],
        overview="Keep a live substring valid while repeated characters force you to adjust its left edge.",
        why_solve="This is one of the cleanest introductions to a moving constraint, and the same rhythm shows up across many string mediums.",
        what_you_practice="Maintaining window state, knowing when to shrink, and separating the invariant from the bookkeeping.",
        interest_note="A classic first Medium because the statement is short but the technique scales far beyond this problem.",
        caveat="The idea is clean, but it is easy to get the left boundary updates slightly wrong.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=1,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short string prompt with one dominant condition.",
        expected_mental_model="Protect one running invariant instead of restarting work from scratch.",
    ),
    problem(
        number=424,
        title="Longest Repeating Character Replacement",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "counting", "string"],
        topic_guides=["sliding-window"],
        overview="Grow and trim a substring while asking how much editing pressure the current window can absorb.",
        why_solve="It deepens the sliding-window habit without turning into a long statement or a niche trick.",
        what_you_practice="Reasoning about window validity, frequency counts, and when an approximate summary is enough to move forward.",
        interest_note="Strong follow-up to #3 because it teaches a more durable way to think about window constraints.",
        caveat="Many first attempts over-correct the frequency logic and make the window harder than it needs to be.",
        clarity="clear",
        effort="moderate",
        transition="prime",
        recommended_order=2,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Compact string prompt with a single tolerance rule.",
        expected_mental_model="A valid window can survive some pressure; you do not need to rebuild the whole story each step.",
    ),
    problem(
        number=238,
        title="Product of Array Except Self",
        phase="foundations",
        lane="window-pointer",
        concepts=["array", "prefix-suffix", "bookkeeping"],
        topic_guides=["two-pointers"],
        overview="Produce an output for each position while avoiding the tempting but forbidden direct route.",
        why_solve="It teaches the value of deliberate passes and reusable partial work without requiring heavy theory.",
        what_you_practice="Left-to-right and right-to-left accumulation, output construction, and disciplined state reuse.",
        interest_note="This problem often feels like a small leap in maturity because the clean solution is about structure, not clever syntax.",
        caveat="The logic is short, but careless ordering will overwrite information you still need.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=3,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Straightforward array prompt with a useful restriction.",
        expected_mental_model="Use partial work from each side instead of recomputing every view independently.",
    ),
    problem(
        number=11,
        title="Container With Most Water",
        phase="foundations",
        lane="window-pointer",
        concepts=["two-pointers", "array", "proof-ish reasoning"],
        topic_guides=["two-pointers"],
        overview="Compare pairs from the outside in while the limiting side controls the value of the current choice.",
        why_solve="It is one of the best first two-pointer Mediums because the win comes from reasoning, not from implementation bulk.",
        what_you_practice="Shrinking search space, defending pointer movement, and reading a geometric statement as an invariant problem.",
        interest_note="High payoff for interviews because the pattern teaches how to justify a pointer move rather than guess one.",
        caveat="The code is tiny; the real work is trusting why one pointer move can safely discard many candidates.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=4,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Visual array prompt with almost no setup friction.",
        expected_mental_model="Eliminate regions only when you can explain why they cannot beat the current best path forward.",
    ),
    problem(
        number=15,
        title="3Sum",
        phase="foundations",
        lane="window-pointer",
        concepts=["sorting", "two-pointers", "duplicate-handling"],
        topic_guides=["two-pointers"],
        overview="Find unique triples by reshaping the search into a more manageable sorted scan.",
        why_solve="This is a real transition problem: still readable, but now duplicate handling and search structure both matter.",
        what_you_practice="Reducing a harder search to a familiar subproblem, working on sorted data, and controlling repeated answers.",
        interest_note="It is famous for a reason: the core idea returns in many sum and combination problems.",
        caveat="The conceptual move is good; the tedious part is keeping duplicate handling clean and consistent.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=5,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Short numeric prompt with a stronger uniqueness requirement.",
        expected_mental_model="Reframe the broad search into one anchor plus a smaller coordinated scan.",
    ),
    problem(
        number=49,
        title="Group Anagrams",
        phase="foundations",
        lane="window-pointer",
        concepts=["hashing", "string", "bucketing"],
        topic_guides=["sliding-window"],
        overview="Cluster strings that share the same underlying letter makeup even when their order differs.",
        why_solve="The statement is easy to digest, but it teaches a durable pattern: choose a stable representation, then bucket on it.",
        what_you_practice="Canonical representations, hash-based grouping, and thinking about data normalization before implementation.",
        interest_note="A calm, useful Medium that rewards clean modeling more than algorithmic theatrics.",
        caveat="The main decision is how to represent the signature cleanly and consistently.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=6,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short grouping prompt with low statement friction.",
        expected_mental_model="If equivalent inputs can share one signature, grouping becomes much simpler.",
    ),
    problem(
        number=56,
        title="Merge Intervals",
        phase="foundations",
        lane="window-pointer",
        concepts=["sorting", "intervals", "sweep"],
        topic_guides=["two-pointers"],
        overview="Condense overlapping ranges into a smaller summary without losing any covered span.",
        why_solve="It builds the recurring interview instinct that many interval problems become manageable once the data is ordered.",
        what_you_practice="Sorting for structure, maintaining a running merged region, and deciding when to extend versus flush work.",
        interest_note="One of the best examples of a reusable 'sort first, then scan' pattern.",
        caveat="The implementation is not hard, but edge cases around touching and nested intervals deserve attention.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=7,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Clean interval prompt with obvious output semantics.",
        expected_mental_model="Order the world first, then maintain one current region until the next item truly breaks it.",
    ),
    problem(
        number=75,
        title="Sort Colors",
        phase="foundations",
        lane="window-pointer",
        concepts=["two-pointers", "partitioning", "array"],
        topic_guides=["two-pointers"],
        overview="Rearrange a tiny alphabet of values in-place while preserving what each region already means.",
        why_solve="It is compact, memorable, and excellent for learning how pointer invariants can define multiple active zones at once.",
        what_you_practice="Multi-pointer partitioning, in-place swaps, and staying honest about the meaning of each segment.",
        interest_note="A short problem with outsized value because it trains disciplined invariant thinking.",
        caveat="The danger is not time complexity; it is losing track of what each pointer boundary currently guarantees.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=8,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Very short array prompt with strong invariant pressure.",
        expected_mental_model="Treat the array as labeled zones and keep those promises true after every swap.",
    ),
    problem(
        number=2,
        title="Add Two Numbers",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "digit-carry", "pointer-walk"],
        topic_guides=["linked-lists"],
        overview="Walk two linked structures together while building a third result one digit at a time.",
        why_solve="It is one of the friendliest linked-list Mediums because the story is intuitive but still forces pointer discipline.",
        what_you_practice="Parallel traversal, node construction, carry management, and using a stable build pointer.",
        interest_note="A foundational linked-list problem that gives you confidence without relying on obscure pointer tricks.",
        caveat="The cases are simple, but forgetting the tail carry or an uneven list length leads to subtle misses.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=9,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Concrete, arithmetic-flavored linked-list prompt.",
        expected_mental_model="Advance through both lists in lockstep and build the answer incrementally instead of patching it later.",
    ),
    problem(
        number=19,
        title="Remove Nth Node From End of List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "two-pointers", "offset"],
        topic_guides=["linked-lists", "two-pointers"],
        overview="Delete one node near the end without first rewriting the list as an array.",
        why_solve="It is a perfect pointer-offset problem and a strong lesson in how one pass can replace two when you control the gap.",
        what_you_practice="Sentinel use, offset pointers, and deletion around boundary cases such as removing the head.",
        interest_note="This problem earns its place because the pattern generalizes cleanly to many one-pass list routines.",
        caveat="The core idea is stable, but head removal is where many otherwise correct drafts break.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=10,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short linked-list prompt with one practical operation.",
        expected_mental_model="Maintain a fixed distance so later structure becomes available exactly when you need it.",
    ),
    problem(
        number=24,
        title="Swap Nodes in Pairs",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "pointer-rewiring"],
        topic_guides=["linked-lists"],
        overview="Rewire a linked list locally so adjacent nodes trade places without changing the stored values.",
        why_solve="It is small enough to focus purely on link manipulation, which makes it good pointer practice without heavy setup.",
        what_you_practice="Temporary references, local rewiring order, and preserving access to the unprocessed remainder of the list.",
        interest_note="Useful because it teaches calm, stepwise rewiring rather than dramatic pointer gymnastics.",
        caveat="If you change links in the wrong order, you can lose the rest of the list almost immediately.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=11,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Tiny linked-list transformation with no story overhead.",
        expected_mental_model="Treat each pair as a local surgery while preserving the handle to everything not yet processed.",
    ),
    problem(
        number=142,
        title="Linked List Cycle II",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "fast-slow-pointers", "cycle"],
        topic_guides=["linked-lists", "two-pointers"],
        overview="Determine where a linked-list loop begins after detecting that a loop exists at all.",
        why_solve="It is one of the first list problems where a non-obvious pointer pattern becomes worth learning as a reusable mental model.",
        what_you_practice="Reasoning about pointer speed, meeting behavior, and separating detection from location.",
        interest_note="High interview value because the pattern is memorable and shows up far outside linked lists.",
        caveat="The proof intuition matters; without it, the second phase can feel magical instead of reliable.",
        clarity="moderate",
        effort="moderate",
        transition="strong",
        recommended_order=12,
        readiness="next-up",
        classic=True,
        starter=False,
        statement_style="Short prompt, but the insight is more conceptual than mechanical.",
        expected_mental_model="Different pointer speeds create structure you can exploit later, not just a detection signal.",
    ),
    problem(
        number=328,
        title="Odd Even Linked List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "stable-reordering", "pointer-partition"],
        topic_guides=["linked-lists"],
        overview="Split a list into two traversal streams and stitch them back together while keeping their internal order.",
        why_solve="It is a practical reordering problem that feels richer than it first appears but stays readable.",
        what_you_practice="Maintaining parallel tails, respecting stability, and updating multiple linked segments safely.",
        interest_note="Good transition material because it feels like a real list transformation rather than a toy pointer drill.",
        caveat="The bookkeeping is mild, but dropping the head of one partition or finishing the tail incorrectly is common.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=13,
        readiness="next-up",
        classic=False,
        starter=True,
        statement_style="Straightforward linked-list reordering task.",
        expected_mental_model="Build clean sublists first, then reconnect them once the structure is stable.",
    ),
    problem(
        number=143,
        title="Reorder List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "two-pointers", "reverse", "merge"],
        topic_guides=["linked-lists", "two-pointers"],
        overview="Reshape a list into an alternating front-back pattern without converting it into a random-access structure.",
        why_solve="This is a great later linked-list pick because it composes several manageable routines into one coherent transformation.",
        what_you_practice="Finding the middle, reversing a suffix, and interleaving two list fragments cleanly.",
        interest_note="Strong bridge problem because it shows how small pointer routines can be composed into a larger plan.",
        caveat="The final merge is easy to rush; careful termination matters more than the raw idea.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=14,
        readiness="stretch",
        classic=True,
        starter=False,
        statement_style="Readable transformation prompt with several natural substeps.",
        expected_mental_model="Break the task into clean list subroutines, then recombine them in a controlled order.",
    ),
    problem(
        number=102,
        title="Binary Tree Level Order Traversal",
        phase="trees",
        lane="tree",
        concepts=["tree", "bfs", "queue"],
        topic_guides=["tree-traversal", "bfs"],
        overview="Visit a tree level by level and preserve the grouping the traversal naturally reveals.",
        why_solve="This is the friendliest tree BFS Medium and the template returns constantly in traversal variants.",
        what_you_practice="Queue-driven processing, level boundaries, and translating a tree shape into ordered output groups.",
        interest_note="An ideal starting point for tree traversal because the statement and the mechanism line up neatly.",
        caveat="The important part is organizing level boundaries cleanly instead of mixing all nodes into one flat pass.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=15,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short visual tree prompt with a very natural output shape.",
        expected_mental_model="Use the queue to mirror how the tree unfolds outward from the root.",
    ),
    problem(
        number=199,
        title="Binary Tree Right Side View",
        phase="trees",
        lane="tree",
        concepts=["tree", "bfs", "dfs", "visibility"],
        topic_guides=["tree-traversal", "bfs", "dfs"],
        overview="Report which nodes remain visible when the tree is observed from one side.",
        why_solve="It is a small but worthwhile twist on level traversal and encourages you to think about order within each level.",
        what_you_practice="Level grouping, traversal order choices, and extracting one representative view from broader traversal state.",
        interest_note="Useful because it turns a familiar traversal into a more selective, view-based question.",
        caveat="The problem is not hard, but mixing the visibility rule with traversal order can create avoidable confusion.",
        clarity="clear",
        effort="light",
        transition="strong",
        recommended_order=16,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Small tree-visibility prompt with low friction.",
        expected_mental_model="The traversal gives more information than you need; the challenge is choosing the right signal from each layer.",
    ),
    problem(
        number=98,
        title="Validate Binary Search Tree",
        phase="trees",
        lane="tree",
        concepts=["tree", "dfs", "bst", "invariants"],
        topic_guides=["tree-traversal", "dfs"],
        overview="Check whether every node in a tree respects the global ordering promises of a BST.",
        why_solve="It is one of the best recursion-invariant problems because the local parent-child view is not enough.",
        what_you_practice="Passing structural constraints through recursion, reading tree properties globally, and handling boundary values safely.",
        interest_note="High signal because it teaches the difference between local checks and full structural guarantees.",
        caveat="The trap is exactly the point: a locally valid-looking tree can still fail globally.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=17,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Clean tree property check with a famous hidden pitfall.",
        expected_mental_model="Carry the allowable range through the recursion instead of relying on immediate neighbors alone.",
    ),
    problem(
        number=230,
        title="Kth Smallest Element in a BST",
        phase="trees",
        lane="tree",
        concepts=["tree", "bst", "inorder"],
        topic_guides=["tree-traversal", "dfs"],
        overview="Use the ordering structure of a BST to locate one position in its sorted view.",
        why_solve="It rewards recognizing what BST order gives you for free and turns traversal into a targeted search.",
        what_you_practice="Inorder thinking, counting during traversal, and linking a data-structure property to output order.",
        interest_note="A confidence-building tree Medium because the main value is understanding the structure, not wrestling with edge cases.",
        caveat="You can solve it several ways; the worthwhile part is choosing the one that actually uses the BST property cleanly.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=18,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short structural tree prompt with a direct interpretation.",
        expected_mental_model="Convert the BST promise into traversal order rather than treating the tree like an arbitrary graph.",
    ),
    problem(
        number=236,
        title="Lowest Common Ancestor of a Binary Tree",
        phase="trees",
        lane="tree",
        concepts=["tree", "dfs", "postorder", "signals"],
        topic_guides=["tree-traversal", "dfs"],
        overview="Find the deepest node that still sits above both targets inside a binary tree.",
        why_solve="It is a classic recursion problem where the meaningful work is how information bubbles back up from children.",
        what_you_practice="Postorder reasoning, return-value design, and distinguishing between 'found here' and 'found below.'",
        interest_note="A durable interview staple because the recursive signal flow is reusable in many tree questions.",
        caveat="The statement is friendly, but weak return-value design can make the recursion messy fast.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=19,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Readable tree prompt with a relationship-based goal.",
        expected_mental_model="Children send signals upward; the parent decides whether those signals combine into the answer.",
    ),
    problem(
        number=105,
        title="Construct Binary Tree from Preorder and Inorder Traversal",
        phase="trees",
        lane="tree",
        concepts=["tree", "recursion", "indexing", "decomposition"],
        topic_guides=["tree-traversal", "dfs"],
        overview="Rebuild a tree from two traversal views that each reveal different structural information.",
        why_solve="It is a very good transition problem for learning how recursive subproblems are defined by ranges instead of copied arrays.",
        what_you_practice="Recursive decomposition, boundary indexing, and mapping traversal semantics to subtree slices.",
        interest_note="Worth doing because it makes traversal orders feel operational instead of purely descriptive.",
        caveat="The statement is clear, but sloppy range bookkeeping quickly turns the recursion into noise.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=20,
        readiness="stretch",
        classic=True,
        starter=False,
        statement_style="Tree reconstruction prompt with predictable subproblem structure.",
        expected_mental_model="Each traversal tells you something different; combine them to carve the tree into smaller valid regions.",
    ),
    problem(
        number=863,
        title="All Nodes Distance K in Binary Tree",
        phase="trees",
        lane="tree",
        concepts=["tree", "graph-thinking", "bfs", "dfs"],
        topic_guides=["tree-traversal", "bfs", "dfs", "graph-traversal"],
        overview="Find all nodes a fixed number of steps away from a target in a structure that normally only points downward.",
        why_solve="It is an excellent bridge from trees to graphs because it forces you to think about missing upward movement.",
        what_you_practice="Reframing tree navigation, neighborhood reasoning, and using traversal after a structural conversion.",
        interest_note="Strong follow-up once plain tree traversals feel familiar, because it broadens how you model the structure itself.",
        caveat="The challenge is not raw traversal; it is choosing a representation that makes distance feel natural.",
        clarity="moderate",
        effort="stretch",
        transition="strong",
        recommended_order=21,
        readiness="stretch",
        classic=False,
        starter=False,
        statement_style="Concrete tree-distance prompt with one modeling twist.",
        expected_mental_model="If the natural structure blocks the movement you need, change the representation before you search.",
    ),
    problem(
        number=200,
        title="Number of Islands",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "dfs", "bfs", "connected-components"],
        topic_guides=["bfs", "dfs", "graph-traversal"],
        overview="Count how many separate land regions exist in a grid where adjacency defines connection.",
        why_solve="This is the gateway grid traversal problem and the underlying component idea reappears everywhere.",
        what_you_practice="Component discovery, visited marking, and turning a visual grid story into systematic traversal.",
        interest_note="One of the highest-ROI Mediums in interview prep because so many variants are direct cousins of this one.",
        caveat="The traversal is standard; the real habit to build is marking visits cleanly and not recounting the same region.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=22,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Highly visual grid prompt with obvious connectivity rules.",
        expected_mental_model="When a cell belongs to a region, finish that whole region before moving on to the next count.",
    ),
    problem(
        number=994,
        title="Rotting Oranges",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "bfs", "multi-source", "levels"],
        topic_guides=["bfs", "graph-traversal"],
        overview="Track how a spreading effect moves through a grid over time from all currently active sources.",
        why_solve="It is one of the clearest multi-source BFS problems, and the time interpretation makes the level structure intuitive.",
        what_you_practice="Level-based expansion, simultaneous sources, and reading time from traversal layers instead of manual simulation.",
        interest_note="Excellent BFS teaching problem because the queue evolution mirrors the story almost perfectly.",
        caveat="It is easy to accidentally mix up 'how many cells changed' with 'how much time passed.'",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=23,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Visual grid process with a natural notion of rounds.",
        expected_mental_model="Each BFS layer is one time step, and all active sources move together.",
    ),
    problem(
        number=542,
        title="01 Matrix",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "bfs", "multi-source", "distance"],
        topic_guides=["bfs", "graph-traversal"],
        overview="Compute how far every cell is from the nearest target value instead of solving each cell independently.",
        why_solve="This is a strong distance-to-nearest problem and a great moment for understanding why reverse thinking can simplify search.",
        what_you_practice="Multi-source BFS, distance propagation, and setting up a global search instead of many local ones.",
        interest_note="Very good pattern builder because it looks broad at first and then collapses into one reusable traversal idea.",
        caveat="If you try to solve each cell from scratch, the problem becomes much noisier than it needs to be.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=24,
        readiness="next-up",
        classic=False,
        starter=True,
        statement_style="Clean grid distance prompt.",
        expected_mental_model="Start from every known destination at once and let distance spread outward.",
    ),
    problem(
        number=1091,
        title="Shortest Path in Binary Matrix",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "bfs", "shortest-path", "reachability"],
        topic_guides=["bfs", "graph-traversal"],
        overview="Move through a blocked grid while finding the fewest steps from one corner to the other.",
        why_solve="It is a clean shortest-path Medium in an unweighted setting, which makes BFS feel justified instead of magical.",
        what_you_practice="Reachability checks, shortest-path layering, and careful neighbor generation on a grid.",
        interest_note="Strong starter shortest-path problem because the statement is concrete and the winning search model is stable.",
        caveat="Most mistakes come from boundary handling and start-or-end blocked cases rather than from the search idea itself.",
        clarity="very-clear",
        effort="moderate",
        transition="prime",
        recommended_order=25,
        readiness="next-up",
        classic=False,
        starter=True,
        statement_style="Visual shortest-path grid prompt.",
        expected_mental_model="In an unweighted grid, the first time you reach a cell at a layer is already its best distance.",
    ),
    problem(
        number=1926,
        title="Nearest Exit from Entrance in Maze",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "bfs", "maze", "shortest-path"],
        topic_guides=["bfs", "graph-traversal"],
        overview="Start from one position inside a maze and find the nearest valid way out.",
        why_solve="It is a newer, very readable BFS problem that keeps the state light and the decision value high.",
        what_you_practice="Shortest-path search, entrance-versus-exit rules, and staying disciplined about what counts as a finish.",
        interest_note="A modern gem for transition practice because the problem feels approachable but still trains the full BFS habit.",
        caveat="The story is simple, but you need to encode the exit rule precisely so you do not count the entrance incorrectly.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=26,
        readiness="first-medium",
        classic=False,
        newer_gem=True,
        starter=True,
        statement_style="Clean maze prompt with immediate visual intuition.",
        expected_mental_model="Expand outward evenly until the first qualifying exit appears.",
    ),
    problem(
        number=841,
        title="Keys and Rooms",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "dfs", "bfs", "reachability"],
        topic_guides=["dfs", "bfs", "graph-traversal"],
        overview="Follow reachable room-to-key relationships and determine whether the entire structure becomes visitable.",
        why_solve="This is a low-friction graph traversal problem with almost no graph-theory jargon, which is exactly what makes it useful here.",
        what_you_practice="Visited tracking, graph reachability, and seeing traversal as unlocking more future work.",
        interest_note="Excellent confidence builder for anyone who finds abstract graph wording more intimidating than the underlying idea.",
        caveat="The concept is gentle; the only real mistake is forgetting that keys can reveal more keys recursively.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=27,
        readiness="first-medium",
        classic=False,
        newer_gem=False,
        starter=True,
        statement_style="Friendly graph story with almost no formalism.",
        expected_mental_model="Every newly reached node may add more nodes to the frontier, so keep exploring until the frontier is empty.",
    ),
    problem(
        number=547,
        title="Number of Provinces",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "dfs", "bfs", "components"],
        topic_guides=["dfs", "bfs", "graph-traversal"],
        overview="Count how many disconnected groups exist inside a city-connection matrix.",
        why_solve="It is an approachable graph component problem and a good transition from grid components to abstract connectivity.",
        what_you_practice="Reading an adjacency matrix, component counting, and mapping the same connected-region idea to a new representation.",
        interest_note="Useful because it reveals that many graph problems are really the same connectivity question in different clothing.",
        caveat="The challenge is small, but the matrix representation can tempt you into scanning redundantly if you are not careful.",
        clarity="clear",
        effort="light",
        transition="prime",
        recommended_order=28,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Short connectivity prompt in matrix form.",
        expected_mental_model="A province is just a component; once one city is claimed, finish that whole group before counting again.",
    ),
    problem(
        number=133,
        title="Clone Graph",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "dfs", "bfs", "hashing", "copying-structure"],
        topic_guides=["dfs", "bfs", "graph-traversal"],
        overview="Recreate an entire graph while preserving its connectivity instead of only its labels.",
        why_solve="It is one of the cleanest graph-copying problems and teaches why a visited map is about identity, not just repetition.",
        what_you_practice="Visited maps, structure copying, and traversing cyclic data without duplicating nodes or getting trapped in loops.",
        interest_note="Good medium-value problem because the story is direct but the bookkeeping is representative of real graph work.",
        caveat="The main risk is cloning neighbors before you have a stable mapping for the node identities you have already seen.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=29,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Simple graph-copy prompt with clear success criteria.",
        expected_mental_model="Separate 'have I already built this node' from 'have I already explored its neighbors.'",
    ),
    problem(
        number=207,
        title="Course Schedule",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "topological-sort", "cycle-detection", "dependencies"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Decide whether a dependency graph can be completed without circular requirements blocking progress.",
        why_solve="It is the standard on-ramp to directed graph reasoning because the story is concrete and the graph concept is essential.",
        what_you_practice="Dependency modeling, cycle awareness, and distinguishing between reachability and valid ordering.",
        interest_note="A staple for a reason: many real interview graphs are just dependency constraints with different names.",
        caveat="The graph itself is readable; the key is choosing a representation that makes 'blocked forever' visible.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=30,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Practical dependency prompt with direct real-world framing.",
        expected_mental_model="A schedule works only if dependency pressure can be peeled away layer by layer without leaving a loop behind.",
    ),
    problem(
        number=210,
        title="Course Schedule II",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "topological-sort", "dependencies", "ordering"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Produce one valid course order when the dependency graph allows it.",
        why_solve="It extends Course Schedule in the healthiest possible way: same core idea, richer output requirement.",
        what_you_practice="Turning feasibility reasoning into constructive output and managing order as part of traversal state.",
        interest_note="Great follow-up because it reinforces the same dependency model instead of making you learn a new story.",
        caveat="The trick is not the graph; it is preserving a consistent order once you know the schedule is possible.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=31,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Natural extension prompt with a constructive output.",
        expected_mental_model="Once dependency pressure is manageable, keep the sequence you peeled away rather than discarding it.",
    ),
    problem(
        number=752,
        title="Open the Lock",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "bfs", "implicit-graph", "state-space"],
        topic_guides=["bfs", "graph-traversal", "backtracking"],
        overview="Search through dial configurations where each move creates a small set of neighboring states.",
        why_solve="It is a very good implicit-graph problem because the state generation is simple and the shortest-path need is obvious.",
        what_you_practice="Generating neighbors on the fly, visited-state handling, and treating strings as graph states.",
        interest_note="High-value newer-style BFS problem because it feels like a state machine rather than a traditional node-edge diagram.",
        caveat="Dead-end handling matters; forgetting blocked states early can waste a lot of search effort.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=32,
        readiness="next-up",
        classic=False,
        newer_gem=True,
        starter=True,
        statement_style="Short puzzle-flavored state graph prompt.",
        expected_mental_model="The graph is not given to you; you manufacture neighbors as you explore the state space.",
    ),
    problem(
        number=1466,
        title="Reorder Routes to Make All Paths Lead to the City Zero",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "dfs", "bfs", "edge-direction", "bookkeeping"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Traverse a road network and count how many directed roads would need to change for everything to flow toward one hub.",
        why_solve="It is a strong modern graph Medium because the twist is concrete, readable, and still teaches careful traversal bookkeeping.",
        what_you_practice="Undirected traversal over directed facts, lightweight edge annotations, and root-oriented reasoning.",
        interest_note="A newer gem with good educational return because it adds a twist without drowning you in graph theory language.",
        caveat="The main challenge is preserving original direction information while still traversing the whole graph flexibly.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=33,
        readiness="next-up",
        classic=False,
        newer_gem=True,
        starter=True,
        statement_style="Concrete city-network prompt with one directional twist.",
        expected_mental_model="Traverse the network freely, but keep enough edge metadata to judge each road relative to the root.",
    ),
    problem(
        number=1319,
        title="Number of Operations to Make Network Connected",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "components", "dfs", "bfs", "network"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Decide whether spare connections can be reused to make a whole network connected and how much work that would take.",
        why_solve="It is a clean network-flavored component problem that often feels more intuitive than older province-style phrasing.",
        what_you_practice="Component counting, feasibility checks from raw counts, and interpreting connectivity in system language.",
        interest_note="Good practical graph pick because the story feels close to real infrastructure reasoning.",
        caveat="There are two separate questions hiding inside: whether the goal is possible at all and how many groups remain.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=34,
        readiness="first-medium",
        classic=False,
        newer_gem=True,
        starter=True,
        statement_style="Direct network-connectivity prompt with low jargon.",
        expected_mental_model="Count disconnected groups first; the needed work follows from that structure and the available spare edges.",
    ),
    problem(
        number=797,
        title="All Paths From Source to Target",
        phase="state-space",
        lane="state-search",
        concepts=["graph", "dfs", "dag", "path-enumeration"],
        topic_guides=["dfs", "graph-traversal", "backtracking"],
        overview="Enumerate every valid route through a DAG from the start node to the finish node.",
        why_solve="It is an approachable bridge from plain traversal to path-building recursion because the graph is acyclic and the goal is concrete.",
        what_you_practice="Building paths incrementally, backtracking over graph choices, and recognizing when acyclicity simplifies the search.",
        interest_note="A good gentle state-space problem because it expands DFS thinking without immediately turning into pruning-heavy backtracking.",
        caveat="The output itself grows, so the focus should stay on path construction discipline rather than on over-optimizing the traversal.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=35,
        readiness="next-up",
        classic=False,
        starter=True,
        statement_style="Simple DAG prompt with explicit start and target.",
        expected_mental_model="Carry one current path, explore one choice, then cleanly step back before taking the next.",
    ),
    problem(
        number=17,
        title="Letter Combinations of a Phone Number",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "string-building", "choice-tree"],
        topic_guides=["backtracking"],
        overview="Generate all strings formed by one choice from each digit's letter set.",
        why_solve="This is arguably the cleanest first backtracking Medium because the search tree is easy to picture.",
        what_you_practice="Choice expansion, path building, and the basic rhythm of take, recurse, and undo or append-forward.",
        interest_note="Excellent confidence builder for recursion because the branching structure is visible from the statement itself.",
        caveat="The solution is not hard, but it becomes messy if you do not keep the current partial answer isolated and reusable.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=36,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Very short combinational prompt.",
        expected_mental_model="Each digit opens a small choice fan-out; walk the tree depth by depth until a full word is formed.",
    ),
    problem(
        number=22,
        title="Generate Parentheses",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "constraints", "string-building"],
        topic_guides=["backtracking"],
        overview="Build every valid parentheses string of a fixed size while respecting balance constraints at all times.",
        why_solve="It is a classic constraint-building problem and a very good next step after simple combination generation.",
        what_you_practice="State validation during generation, pruning bad prefixes early, and seeing recursion as controlled search.",
        interest_note="A backtracking staple because the constraint is intuitive but the search behavior teaches a lot.",
        caveat="The search tree is manageable only if invalid partial strings stop early instead of being completed and filtered later.",
        clarity="very-clear",
        effort="moderate",
        transition="prime",
        recommended_order=37,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Compact generation prompt with one clear validity rule.",
        expected_mental_model="Only continue branches that still have a plausible path to a valid final string.",
    ),
    problem(
        number=78,
        title="Subsets",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "sets", "decision-tree"],
        topic_guides=["backtracking"],
        overview="List every subset of a small array by deciding, step by step, which elements belong in the current choice.",
        why_solve="It is one of the most reusable recursion templates because the include-or-skip structure appears everywhere.",
        what_you_practice="Decision branching, recording partial work, and recognizing when a recursion tree mirrors a binary choice process.",
        interest_note="Low-friction but high-payoff pattern problem for building a mental template you will reuse often.",
        caveat="The main trap is mutating one shared path object without remembering when a snapshot is needed.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=38,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Minimal subset-generation prompt.",
        expected_mental_model="At each position, branch on whether this item belongs to the current subset or not.",
    ),
    problem(
        number=46,
        title="Permutations",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "ordering", "choice-tree"],
        topic_guides=["backtracking"],
        overview="Generate every ordering of a set of values rather than just every selection of them.",
        why_solve="It turns the backtracking template into a slightly richer search where used-state and path length both matter.",
        what_you_practice="Choice tracking, used-element bookkeeping, and exploring order-sensitive search trees.",
        interest_note="Worth doing because it makes the backtracking skeleton feel operational rather than abstract.",
        caveat="The search explodes quickly, so clean bookkeeping matters more than clever optimization.",
        clarity="very-clear",
        effort="moderate",
        transition="strong",
        recommended_order=39,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Short generation prompt where order changes the result.",
        expected_mental_model="Each step chooses the next unused item for the growing arrangement.",
    ),
    problem(
        number=39,
        title="Combination Sum",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "target-tracking", "combinations"],
        topic_guides=["backtracking"],
        overview="Search for value combinations that exactly hit a target while candidates may be reused.",
        why_solve="It is a strong transition backtracking problem because target pressure and reuse rules make the recursion more realistic.",
        what_you_practice="State reduction, branch control, and choosing a search order that avoids unnecessary duplicate work.",
        interest_note="High-value pattern problem because many later combination questions are variations on this structure.",
        caveat="The important design choice is how you keep the search from reordering the same combination into noisy duplicates.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=40,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Readable number-combination prompt with a concrete goal.",
        expected_mental_model="Carry the remaining target downward and stop branches that have already overspent it.",
    ),
    problem(
        number=131,
        title="Palindrome Partitioning",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "string", "partitioning"],
        topic_guides=["backtracking"],
        overview="Cut a string into segments so that every chosen piece satisfies the same structural property.",
        why_solve="It is a richer backtracking problem that still stays readable and adds a meaningful validation layer to the search.",
        what_you_practice="Partition-based recursion, candidate validation, and balancing path growth against local checks.",
        interest_note="A nice later backtracking Medium because it adds depth without depending on a weird story.",
        caveat="The branching is straightforward, but repeated substring checks can make the search feel heavier than the statement suggests.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=41,
        readiness="stretch",
        classic=True,
        starter=False,
        statement_style="Clean string partition prompt with a strong segment rule.",
        expected_mental_model="Choose the next cut, validate that segment, and recurse on the untouched suffix.",
    ),
    problem(
        number=62,
        title="Unique Paths",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "grid", "counting"],
        topic_guides=["dynamic-programming"],
        overview="Count how many ways exist to reach one grid corner from another when movement is restricted.",
        why_solve="It is one of the easiest true DP Mediums because the state and recurrence are both visually intuitive.",
        what_you_practice="State definition, recurrence building, and seeing repeated substructure inside a grid.",
        interest_note="Excellent DP opener because the problem feels friendly while still teaching the core tabulation instinct.",
        caveat="The recurrence is simple; the real lesson is deciding what each cell should mean before you fill anything.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=42,
        readiness="first-medium",
        classic=True,
        starter=True,
        statement_style="Very clear grid-counting prompt.",
        expected_mental_model="Each state inherits its count from the smaller states that can feed into it.",
    ),
    problem(
        number=322,
        title="Coin Change",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "minimization", "amount-state"],
        topic_guides=["dynamic-programming"],
        overview="Reach a target amount using the fewest pieces from a reusable set of coin values.",
        why_solve="It is a foundational DP Medium because it forces you to think about impossible states, not just successful ones.",
        what_you_practice="1D DP state design, minimization updates, and distinguishing between reachable and unreachable subproblems.",
        interest_note="One of the most reusable beginner DP problems because many later tasks are the same shape with different stories.",
        caveat="The recurrence is not the hard part; handling impossible states and initialization cleanly is.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=43,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Short optimization prompt with a familiar story.",
        expected_mental_model="Build answers for smaller amounts first, then reuse them when considering the current amount.",
    ),
    problem(
        number=300,
        title="Longest Increasing Subsequence",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "sequence", "optimization"],
        topic_guides=["dynamic-programming"],
        overview="Find the longest subsequence that keeps rising without requiring the chosen values to stay adjacent.",
        why_solve="This is a major milestone DP problem because it teaches how to define a sequence state around 'best ending here.'",
        what_you_practice="Sequence-state reasoning, comparing current choices against prior history, and separating subsequences from substrings.",
        interest_note="A classic pattern builder that later opens the door to many more sequence DPs.",
        caveat="The problem is conceptually clean, but the non-adjacent subsequence idea trips up many first reads.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=44,
        readiness="stretch",
        classic=True,
        starter=True,
        statement_style="Compact sequence prompt with one important distinction.",
        expected_mental_model="Ask what the best increasing chain looks like if it must end at this position.",
    ),
    problem(
        number=416,
        title="Partition Equal Subset Sum",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "subset", "knapsack"],
        topic_guides=["dynamic-programming"],
        overview="Decide whether a collection can be split into two groups with the same total weight.",
        why_solve="It is a very good first subset-sum style Medium and a realistic introduction to yes-or-no DP states.",
        what_you_practice="Target reduction, subset feasibility thinking, and translating a partition story into one smaller question.",
        interest_note="A useful bridge problem because it makes knapsack-style reasoning feel concrete instead of theoretical.",
        caveat="The key move is reframing the original goal into the right target; otherwise the search feels larger than it is.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=45,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Simple numeric partition prompt.",
        expected_mental_model="If you can hit the right half-sum cleanly, the original partition question is already answered.",
    ),
    problem(
        number=139,
        title="Word Break",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "string", "prefix-decomposition"],
        topic_guides=["dynamic-programming"],
        overview="Decide whether a string can be broken into valid dictionary pieces without gaps or leftovers.",
        why_solve="It is an excellent transition from recursive guessing to memoized or tabulated decomposition.",
        what_you_practice="Prefix-state thinking, reuse of earlier segmentation results, and seeing strings as buildable from smaller valid prefixes.",
        interest_note="High payoff because many string DPs are really about valid ways to decompose a prefix or suffix.",
        caveat="The brute-force search grows quickly, so the learning value is in recognizing overlapping decomposition states.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=46,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Readable dictionary segmentation prompt.",
        expected_mental_model="Treat each prefix boundary as a state: can the string up to here be assembled validly or not?",
    ),
    problem(
        number=494,
        title="Target Sum",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "subset", "counting", "sign-choice"],
        topic_guides=["dynamic-programming"],
        overview="Assign a plus or minus choice to each number so the final expression lands on the requested target.",
        why_solve="It is rewarding because the surface story looks different, but underneath it becomes a familiar state-counting problem.",
        what_you_practice="State transformation, counting variants of a target, and recognizing when a strange prompt hides a standard DP shape.",
        interest_note="Good later DP pick because it trains the habit of reformulating the question before filling states.",
        caveat="The problem becomes much easier only after the right reframing, so the front-end interpretation matters a lot.",
        clarity="moderate",
        effort="stretch",
        transition="strong",
        recommended_order=47,
        readiness="stretch",
        classic=True,
        starter=False,
        statement_style="Short arithmetic prompt with a hidden structural reduction.",
        expected_mental_model="Before filling states, ask what equivalent target-counting question the sign choices are really describing.",
    ),
    problem(
        number=91,
        title="Decode Ways",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "string", "counting", "local-validity"],
        topic_guides=["dynamic-programming"],
        overview="Count how many valid decodings a digit string can produce under a small mapping rule.",
        why_solve="It is a manageable string DP where local validity checks and position-based state both matter.",
        what_you_practice="Position DP, branching on one-step versus two-step moves, and handling invalid local patterns cleanly.",
        interest_note="A very good string-DP transition problem because the recurrence is compact but not totally obvious.",
        caveat="The challenge is less about coding and more about being precise about which local chunks are legal.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=48,
        readiness="next-up",
        classic=True,
        starter=True,
        statement_style="Short decoding prompt with small local rules.",
        expected_mental_model="At each position, ask how many legal ways the remainder can be interpreted if you consume one or two digits.",
    ),
    problem(
        number=45,
        title="Jump Game II",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "greedy", "reachability", "array"],
        topic_guides=["dynamic-programming"],
        overview="Reach the end of an array in the fewest jumps when each position offers a limited forward range.",
        why_solve="It is a useful end-of-ramp problem because it sits at the border between DP thinking and stronger greedy perspective.",
        what_you_practice="Range-based state thinking, measuring progress in layers or intervals, and comparing constructive approaches.",
        interest_note="Strong capstone for this collection because it tests whether you can reason about future reach instead of only local moves.",
        caveat="It is easy to focus on individual jumps when the cleaner viewpoint is to reason about the current reachable band.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=49,
        readiness="stretch",
        classic=True,
        starter=True,
        statement_style="Compact array prompt with obvious stakes.",
        expected_mental_model="Think in terms of how far the current wave of reachable positions can take you before another jump becomes unavoidable.",
    ),
    problem(
        number=2181,
        title="Merge Nodes in Between Zeros",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "segmentation", "single-pass"],
        topic_guides=["linked-lists"],
        overview="Traverse a linked list whose zero nodes mark segment boundaries and collapse each segment into one output node.",
        why_solve="It is one of the cleanest modern linked-list Mediums because the structure tells you exactly where the meaningful work starts and ends.",
        what_you_practice="Single-pass list traversal, segment accumulation, and building output without losing pointer safety.",
        interest_note="A very good confidence-builder if classic pointer questions still feel brittle.",
        caveat="The statement is friendly, but it is still easy to attach result nodes in the wrong place or forget to reset the running segment total.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=50,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Short linked-list prompt with explicit structural markers.",
        expected_mental_model="The zeros are boundaries, not data; walk segment by segment and only materialize the collapsed result.",
        source_urls=[LEARNING_URLS["linked_lists"]],
    ),
    problem(
        number=2487,
        title="Remove Nodes From Linked List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "monotonic-thinking", "rewiring"],
        topic_guides=["linked-lists"],
        overview="Delete nodes that are dominated by a later larger value while keeping the surviving list intact.",
        why_solve="It teaches a valuable linked-list lesson: some local keep-or-delete decisions depend on future structure, not only the current node.",
        what_you_practice="Reasoning about future comparisons, list cleanup, and choosing a representation that makes destructive edits manageable.",
        interest_note="This feels newer and fresher than the standard pointer-drill Mediums while still teaching a reusable idea.",
        caveat="The trap is trying to make irrevocable deletion decisions before you have a stable view of the nodes to the right.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=51,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Short list prompt with a future-looking deletion rule.",
        expected_mental_model="The interesting comparison is against what survives later, not merely against the immediate next node.",
        source_urls=[LEARNING_URLS["linked_lists"]],
    ),
    problem(
        number=2807,
        title="Insert Greatest Common Divisors in Linked List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "in-place-insertion", "pair-processing"],
        topic_guides=["linked-lists"],
        overview="Walk adjacent pairs in a list and insert one derived node between them without breaking traversal.",
        why_solve="It is compact, concrete, and useful for learning the exact pointer order needed for safe in-place insertion.",
        what_you_practice="Preserving access before insertion, pairwise processing, and advancing correctly after mutating the list.",
        interest_note="A strong short-form refresher when you want pure pointer mechanics without extra algorithmic noise.",
        caveat="Because the inserted node becomes part of the structure immediately, careless pointer advancement can create skipped work or loops.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=52,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Very direct linked-list transformation prompt.",
        expected_mental_model="Handle one original pair at a time and be explicit about where traversal resumes after insertion.",
        source_urls=[LEARNING_URLS["linked_lists"]],
    ),
    problem(
        number=2816,
        title="Double a Number Represented as a Linked List",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "carry", "digit-processing"],
        topic_guides=["linked-lists"],
        overview="Double a number stored across list nodes while managing carries and the possibility of a new leading digit.",
        why_solve="It is a good follow-up to Add Two Numbers because the list mechanics are familiar but the carry flow is less obvious.",
        what_you_practice="Digit carry propagation, head-edge handling, and choosing an update order that does not fight the representation.",
        interest_note="Useful because it teaches how arithmetic constraints interact with pointer constraints.",
        caveat="The main risk is underestimating how a carry can escape all the way past the current head.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=53,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Readable arithmetic-flavored list prompt.",
        expected_mental_model="Treat the list like a digit stream with carry pressure that may need structural help at the front.",
        source_urls=[LEARNING_URLS["linked_lists"]],
    ),
    problem(
        number=3217,
        title="Delete Nodes From Linked List Present in Array",
        phase="linked-lists",
        lane="linked-list",
        concepts=["linked-list", "hashing", "deletion"],
        topic_guides=["linked-lists"],
        overview="Remove every node whose value appears in an external array while preserving the rest of the list.",
        why_solve="It combines a standard membership structure with reliable list deletion, which is exactly the kind of two-technique blend that shows up in interviews.",
        what_you_practice="Sentinel-based deletion, membership preprocessing, and keeping the traversal logic simpler than the problem story suggests.",
        interest_note="High practical value because it feels like real data cleanup rather than a toy list puzzle.",
        caveat="The data-structure choice is straightforward; the subtle part is deleting cleanly at the head and through runs of removable nodes.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=54,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Concrete list-filtering prompt with no hidden story tax.",
        expected_mental_model="Solve membership first, then make the list walk a calm delete-or-keep routine.",
        source_urls=[LEARNING_URLS["linked_lists"]],
    ),
    problem(
        number=2196,
        title="Create Binary Tree From Descriptions",
        phase="trees",
        lane="tree",
        concepts=["tree", "construction", "parent-child-relationships"],
        topic_guides=["tree-traversal", "dfs"],
        overview="Build a binary tree from parent-child descriptions and identify the real root once the pieces exist.",
        why_solve="It is excellent tree-construction practice because the input is relational rather than already shaped like a tree.",
        what_you_practice="Node creation, parent-child wiring, and root detection from incomplete relational data.",
        interest_note="This is one of the cleanest tree-building Mediums from the newer LeetCode range.",
        caveat="The node wiring is not difficult, but it is easy to lose track of which values have already been established as children.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=55,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Short relational prompt that turns into explicit structure-building.",
        expected_mental_model="Construct nodes and edges first, then ask which node was never claimed as anyone else's child.",
        source_urls=[LEARNING_URLS["tree_intro"], LEARNING_URLS["mit_dfs"]],
    ),
    problem(
        number=2265,
        title="Count Nodes Equal to Average of Subtree",
        phase="trees",
        lane="tree",
        concepts=["tree", "postorder", "subtree-aggregation"],
        topic_guides=["tree-traversal", "dfs"],
        overview="For each node, compare its value against a summary computed from its entire subtree.",
        why_solve="It is a great postorder aggregation problem because the return values are simple and the payoff is immediate.",
        what_you_practice="Returning multiple subtree facts at once, composing child results, and using bottom-up recursion cleanly.",
        interest_note="A very strong 'why postorder exists' teaching problem.",
        caveat="The work is conceptually clean, but the recursion gets messy fast if the return data is not designed deliberately.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=56,
        readiness="next-up",
        newer_gem=True,
        starter=True,
        statement_style="Short tree prompt with one subtree-based check.",
        expected_mental_model="Children report the numbers the parent needs; the parent should not recompute a subtree from scratch.",
        source_urls=[LEARNING_URLS["tree_intro"], LEARNING_URLS["mit_dfs"]],
    ),
    problem(
        number=2385,
        title="Amount of Time for Binary Tree to Be Infected",
        phase="trees",
        lane="tree",
        concepts=["tree", "bfs", "distance"],
        topic_guides=["tree-traversal", "bfs"],
        overview="Treat infection spread through a tree as a distance problem and ask how long the farthest node takes to reach.",
        why_solve="It is one of the best tree-to-graph bridge problems because the story naturally suggests layered spread over edges.",
        what_you_practice="Turning a tree into a traversal graph, multi-directional movement, and reading elapsed time from BFS levels.",
        interest_note="Excellent for learning when a tree problem stops being about parent-child recursion and starts being about distance.",
        caveat="The statement is clear, but many first attempts stay trapped in one-way child traversal even though the process spreads in all directions.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=57,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Readable tree story with explicit spread-over-time semantics.",
        expected_mental_model="Once infection can move both up and down, this is a distance layering problem more than a classic recursive one.",
        source_urls=[LEARNING_URLS["mit_bfs"], LEARNING_URLS["tree_intro"]],
    ),
    problem(
        number=2415,
        title="Reverse Odd Levels of Binary Tree",
        phase="trees",
        lane="tree",
        concepts=["tree", "bfs", "level-order"],
        topic_guides=["tree-traversal", "bfs"],
        overview="Process a tree level by level and apply a transformation only to the layers that match one parity rule.",
        why_solve="It is a clean level-order practice problem because the transformation is simple enough that the traversal logic stays central.",
        what_you_practice="Level grouping, per-level buffering, and modifying tree values without losing track of level structure.",
        interest_note="High teaching value because it makes level-order feel operational rather than just observational.",
        caveat="The trap is not algorithmic difficulty; it is mixing up which nodes belong to one logical level before you reverse anything.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=58,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Very direct tree-transformation prompt.",
        expected_mental_model="Do the traversal first, understand the level as a batch, then apply the parity rule to that batch only.",
        source_urls=[LEARNING_URLS["mit_bfs"], LEARNING_URLS["tree_intro"]],
    ),
    problem(
        number=2471,
        title="Minimum Number of Operations to Sort a Binary Tree by Level",
        phase="trees",
        lane="tree",
        concepts=["tree", "bfs", "level-order", "array-reasoning"],
        topic_guides=["tree-traversal", "bfs"],
        overview="Collect each level of a tree, then reason about how much work it takes to reorder that level cleanly.",
        why_solve="It is a good next tree Medium because it combines comfortable traversal with a separate, more deliberate level subtask.",
        what_you_practice="Separating traversal from per-level processing, converting tree state into arrays, and solving the right subproblem per level.",
        interest_note="This problem rewards good decomposition more than raw coding speed.",
        caveat="It is tempting to treat the whole tree as one sorting job, but the structure only asks you to solve smaller level-sized jobs independently.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=59,
        readiness="stretch",
        newer_gem=True,
        starter=False,
        statement_style="Clear tree prompt that becomes a sequence of per-level array questions.",
        expected_mental_model="Traverse first, isolate one level at a time, then solve the smaller reordering problem that level creates.",
        source_urls=[LEARNING_URLS["mit_bfs"], LEARNING_URLS["tree_intro"]],
    ),
    problem(
        number=2316,
        title="Count Unreachable Pairs of Nodes in an Undirected Graph",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "components", "dfs", "counting"],
        topic_guides=["graph-traversal", "dfs"],
        overview="Find connected components in an undirected graph and translate their sizes into the number of impossible cross-component pairs.",
        why_solve="It is extremely high-signal graph practice because the traversal part is simple and the counting insight transfers widely.",
        what_you_practice="Component discovery, size aggregation, and counting across partitions without double-counting.",
        interest_note="One of the best newer graph Mediums if you want a problem that teaches more than it annoys.",
        caveat="The graph traversal is straightforward; the real learning is in turning component sizes into pair counts cleanly.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=60,
        readiness="next-up",
        newer_gem=True,
        starter=True,
        statement_style="Short graph-counting prompt with one important structural insight.",
        expected_mental_model="Traverse to learn the component sizes first; only then ask how many pairs cannot cross those boundaries.",
        source_urls=[LEARNING_URLS["graph_traversal"], LEARNING_URLS["mit_dfs"]],
    ),
    problem(
        number=2368,
        title="Reachable Nodes With Restrictions",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "dfs", "bfs", "restricted-traversal"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Traverse an undirected graph while respecting a set of forbidden nodes that should behave like hard walls.",
        why_solve="It is a very clean graph-traversal variant because the only twist is a restriction set, not a whole new algorithm.",
        what_you_practice="Visited-state discipline, incorporating constraints into traversal, and keeping the graph model simple.",
        interest_note="A good graph confidence-builder because the story stays readable and the constraint is easy to explain.",
        caveat="The main failure mode is letting the restriction check live in too many places instead of making it part of the traversal contract.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=61,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Very direct reachability prompt with one explicit constraint set.",
        expected_mental_model="Treat restricted nodes exactly like blocked cells in a grid: the traversal should never enter them in the first place.",
        source_urls=[LEARNING_URLS["graph_traversal"], LEARNING_URLS["mit_bfs"]],
    ),
    problem(
        number=2658,
        title="Maximum Number of Fish in a Grid",
        phase="graphs",
        lane="graph-grid",
        concepts=["grid", "components", "dfs", "bfs"],
        topic_guides=["graph-traversal", "dfs", "bfs"],
        overview="Explore connected water regions in a grid and compute the total reward available inside each component.",
        why_solve="It is a friendly grid-components problem with a tangible payoff metric, which makes flood-fill reasoning feel useful immediately.",
        what_you_practice="Grid traversal, component aggregation, and reading a matrix as an implicit graph.",
        interest_note="Excellent starter material for graph learners who are more comfortable with grids than adjacency lists.",
        caveat="The traversal itself is standard; the important habit is to aggregate during one visit instead of revisiting cells repeatedly.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=62,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Readable grid prompt with almost no wording friction.",
        expected_mental_model="Each connected patch is one component; harvest its total once, then compare components.",
        source_urls=[LEARNING_URLS["flood_fill"], LEARNING_URLS["graph_traversal"]],
    ),
    problem(
        number=2685,
        title="Count the Number of Complete Components",
        phase="graphs",
        lane="graph-grid",
        concepts=["graph", "components", "validation", "counting"],
        topic_guides=["graph-traversal", "dfs"],
        overview="Break a graph into connected components, then check whether each component is fully connected inside itself.",
        why_solve="It is a good next step after plain connected-components problems because the traversal is only the first half of the job.",
        what_you_practice="Component extraction, structural validation, and translating a graph property into a precise per-component check.",
        interest_note="Strong educational value because it teaches the difference between finding a component and reasoning about its internal shape.",
        caveat="The trick is not fancy traversal; it is making the completeness test exact instead of relying on vague visual intuition.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=63,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Short graph prompt with a clean structural property.",
        expected_mental_model="Traversal tells you which nodes belong together; then you ask whether that set contains every internal edge it should.",
        source_urls=[LEARNING_URLS["graph_traversal"], LEARNING_URLS["mit_dfs"]],
    ),
    problem(
        number=2381,
        title="Shifting Letters II",
        phase="foundations",
        lane="window-pointer",
        concepts=["prefix-sums", "difference-array", "string", "range-updates"],
        topic_guides=["prefix-sums"],
        overview="Apply many range-based character shifts efficiently by recording the changes at boundaries before you sweep through the string once.",
        why_solve="It is one of the best approachable difference-array problems because the story is concrete and the pattern generalizes well.",
        what_you_practice="Offline range updates, boundary marking, and turning deferred changes into a final running total.",
        interest_note="High transfer value because the same idea reappears whenever many updates touch overlapping intervals.",
        caveat="The logic is elegant, but only if you commit to recording change events instead of simulating every range directly.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=64,
        readiness="next-up",
        newer_gem=True,
        starter=True,
        statement_style="Readable string-update prompt with repeated operations.",
        expected_mental_model="Store how the shift amount changes at the boundaries, then reconstruct the real effect in one final pass.",
        source_urls=[LEARNING_URLS["prefix_sums"], LEARNING_URLS["difference_arrays"]],
    ),
    problem(
        number=2401,
        title="Longest Nice Subarray",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "bitwise", "array"],
        topic_guides=["sliding-window"],
        overview="Maintain a subarray whose members do not conflict under a bitwise condition, and shrink only when the invariant breaks.",
        why_solve="It is a strong sliding-window upgrade because the invariant is not about counts or sums, but the window rhythm still survives.",
        what_you_practice="Window repair logic, compact state summaries, and applying sliding-window discipline to a less familiar constraint.",
        interest_note="Great for proving to yourself that sliding windows are about invariants, not about one specific string template.",
        caveat="The difficulty is conceptual rather than syntactic: if the invariant is fuzzy, the left-edge movement becomes guesswork.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=65,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Short array prompt with a less obvious validity rule.",
        expected_mental_model="The window is legal only while one compact state summary stays conflict-free; expand, repair, record.",
        source_urls=[LEARNING_URLS["sliding_window"], LEARNING_URLS["two_pointers"]],
    ),
    problem(
        number=2461,
        title="Maximum Sum of Distinct Subarrays With Length K",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "fixed-window", "distinctness", "counting"],
        topic_guides=["sliding-window"],
        overview="Slide a fixed-size window, keep track of duplicates cheaply, and only score windows that remain fully distinct.",
        why_solve="It is one of the cleanest fixed-window Mediums because the value function and the legality check are both easy to explain.",
        what_you_practice="Fixed-size window updates, distinctness bookkeeping, and separating 'window value' from 'window validity.'",
        interest_note="A high-signal practice problem for anyone whose windows still feel hand-wavy.",
        caveat="The pattern is stable, but mixing sum maintenance and duplicate maintenance in the wrong order causes avoidable bugs.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=66,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Compact array prompt with one natural fixed-size invariant.",
        expected_mental_model="The window size never changes; the only question is whether the current K-length slice is legal and worth scoring.",
        source_urls=[LEARNING_URLS["sliding_window"], LEARNING_URLS["two_pointers"]],
    ),
    problem(
        number=2483,
        title="Minimum Penalty for a Shop",
        phase="foundations",
        lane="window-pointer",
        concepts=["prefix-sums", "best-split", "string", "counting"],
        topic_guides=["prefix-sums"],
        overview="Choose the best closing point by comparing how much penalty lies to the left versus to the right of each split.",
        why_solve="It is a terrific prefix-style problem because the statement is tiny but the split-point reasoning transfers everywhere.",
        what_you_practice="Best split evaluation, prefix-versus-suffix counting, and converting a narrative prompt into positional cost accounting.",
        interest_note="One of the highest-value short Mediums in the newer range.",
        caveat="The risk is thinking in terms of simulating store behavior when the cleaner view is just to score each possible boundary.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=67,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Tiny decision prompt with almost no wording overhead.",
        expected_mental_model="Every possible closing time is a split point; precompute what each side of that split costs.",
        source_urls=[LEARNING_URLS["prefix_sums"]],
    ),
    problem(
        number=2958,
        title="Length of Longest Subarray With at Most K Frequency",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "frequency", "array"],
        topic_guides=["sliding-window"],
        overview="Keep a window valid while no value exceeds the allowed frequency cap, and shrink only when one value violates that rule.",
        why_solve="It is a strong general-purpose sliding-window problem because the invariant is realistic and broadly reusable.",
        what_you_practice="Frequency bookkeeping, targeted window repair, and trusting the monotonic left-to-right rhythm.",
        interest_note="A very practical next-step window Medium for interview preparation.",
        caveat="The mistake pattern is predictable: people track too much instead of only the counts that can break validity.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=68,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Short array prompt with one local frequency rule.",
        expected_mental_model="Only shrink when the current window violates the cap, and only as much as needed to restore legality.",
        source_urls=[LEARNING_URLS["sliding_window"], LEARNING_URLS["two_pointers"]],
    ),
    problem(
        number=2962,
        title="Count Subarrays Where Max Element Appears at Least K Times",
        phase="foundations",
        lane="window-pointer",
        concepts=["sliding-window", "counting", "positions", "array"],
        topic_guides=["sliding-window", "prefix-sums"],
        overview="Count valid subarrays by reasoning about where the important maximum-value occurrences sit instead of enumerating every range.",
        why_solve="It is a worthwhile counting Medium because it nudges you away from brute-force window enumeration toward more structural counting.",
        what_you_practice="Counting without explicit enumeration, turning a condition into positional reasoning, and using monotonic movement to compress work.",
        interest_note="Good for strengthening the 'count, do not list' habit that many later array problems rely on.",
        caveat="The challenge is not the statement; it is resisting the urge to inspect every candidate subarray directly.",
        clarity="clear",
        effort="moderate",
        transition="strong",
        recommended_order=69,
        readiness="next-up",
        newer_gem=True,
        starter=False,
        statement_style="Readable array-counting prompt with one highlighted element.",
        expected_mental_model="Once the key occurrence positions are understood, whole groups of subarrays can be counted at once.",
        source_urls=[LEARNING_URLS["sliding_window"], LEARNING_URLS["prefix_sums"]],
    ),
    problem(
        number=2212,
        title="Maximum Points in an Archery Competition",
        phase="state-space",
        lane="state-search",
        concepts=["backtracking", "choice-search", "constraint-allocation"],
        topic_guides=["backtracking"],
        overview="Distribute a limited resource across scoring targets and search for the best legal allocation.",
        why_solve="It is one of the more approachable backtracking Mediums because the choices are concrete and the search space has a visible story.",
        what_you_practice="State branching, budget tracking, and deciding when a search problem is small enough to explore directly.",
        interest_note="A useful 'backtracking can still feel friendly' problem.",
        caveat="The branching is manageable, but the search only stays readable if the state representation is disciplined from the start.",
        clarity="clear",
        effort="stretch",
        transition="strong",
        recommended_order=70,
        readiness="stretch",
        newer_gem=True,
        starter=False,
        statement_style="Concrete resource-allocation prompt with a bounded search space.",
        expected_mental_model="Each target is a choice point: spend enough to win it or skip it, and keep the remaining budget honest.",
        source_urls=[LEARNING_URLS["backtracking"]],
    ),
    problem(
        number=2466,
        title="Count Ways To Build Good Strings",
        phase="dp",
        lane="dp",
        concepts=["dynamic-programming", "counting", "length-state"],
        topic_guides=["dynamic-programming"],
        overview="Count how many valid strings can be built when each move increases length by one of two allowed step sizes.",
        why_solve="It is an approachable DP counting problem because the state is simple and the recurrence follows directly from the allowed moves.",
        what_you_practice="1D counting DP, state transitions on length, and distinguishing 'how many ways' from 'is it possible.'",
        interest_note="A very good newer DP ramp problem if classic coin-style prompts feel too abstract.",
        caveat="The recurrence is friendly, but only once each length is treated as a state with incoming contributions from smaller lengths.",
        clarity="very-clear",
        effort="light",
        transition="prime",
        recommended_order=71,
        readiness="first-medium",
        newer_gem=True,
        starter=True,
        statement_style="Short constructive-counting prompt with explicit move sizes.",
        expected_mental_model="Length is the state; every valid previous length contributes forward if one of the allowed jumps can reach the current one.",
        source_urls=[LEARNING_URLS["dynamic_programming"]],
    ),
]


def slugify(value: str) -> str:
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def normalize_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def write_js_dataset(path: Path, payload: Any) -> None:
    path.write_text(
        "window.PROBLEM_DATA = " + json.dumps(payload, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )


def read_repo_metadata(repo_root: Path) -> dict[str, str | None]:
    config_path = repo_root / ".git" / "config"
    metadata: dict[str, str | None] = {"originUrl": None, "defaultBranch": None}
    if not config_path.exists():
        return metadata
    raw = config_path.read_text(encoding="utf-8", errors="ignore")
    origin_match = re.search(r'\[remote "origin"\]\s+url = (.+)', raw)
    if origin_match:
        metadata["originUrl"] = origin_match.group(1).strip()
    branch_match = re.search(r'\[branch "([^"]+)"\]\s+remote = origin', raw)
    if branch_match:
        metadata["defaultBranch"] = branch_match.group(1).strip()
    return metadata


def iter_repo_files(repo_root: Path) -> list[str]:
    files: list[str] = []
    for current_root, dirnames, filenames in os.walk(repo_root):
        dirnames[:] = [
            dirname
            for dirname in dirnames
            if dirname not in {".git", ".idea", "__pycache__", "node_modules"}
        ]
        current_path = Path(current_root)
        for filename in filenames:
            files.append(str((current_path / filename).relative_to(repo_root)))
    return files


def leetcode_graphql(slug: str) -> dict[str, Any]:
    query = {
        "operationName": "questionData",
        "variables": {"titleSlug": slug},
        "query": (
            "query questionData($titleSlug: String!) {"
            " question(titleSlug: $titleSlug) {"
            " questionId questionFrontendId title titleSlug difficulty isPaidOnly"
            " topicTags { name slug }"
            " }"
            "}"
        ),
    }
    request = urllib.request.Request(
        "https://leetcode.com/graphql",
        data=json.dumps(query).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.load(response)
    question = payload["data"]["question"]
    if not question:
        raise RuntimeError(f"LeetCode returned no question for slug {slug}")
    return question


def validate_with_leetcode(problems: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    cache = read_json(CACHE_PATH, {})
    changed = False
    for entry in problems:
        slug = slugify(entry["title"])
        cached = cache.get(slug)
        if cached:
            continue
        try:
            cache[slug] = leetcode_graphql(slug)
            changed = True
            time.sleep(0.15)
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Failed validating {slug} against LeetCode: {exc}") from exc
    if changed:
        write_json(CACHE_PATH, cache)
    return cache


def make_repo_entry(repo: str, number: int | None, title: str, paths: list[str], coverage_type: str, notes: str) -> dict[str, Any]:
    slug = slugify(title)
    return {
        "repo": repo,
        "number": number,
        "title": title,
        "slug": slug,
        "normalizedTitle": normalize_title(title),
        "paths": sorted(set(paths)),
        "coverageType": coverage_type,
        "notes": notes,
    }


def index_doocs() -> dict[str, Any]:
    repo_root = ROOT / "doocs_leetcode"
    entries = []
    for solution_dir in (repo_root / "solution").glob("*/*"):
        if not solution_dir.is_dir():
            continue
        match = re.match(r"(\d+)\.(.+)", solution_dir.name)
        if not match:
            continue
        number = int(match.group(1))
        title = match.group(2).replace("_", " ")
        paths = []
        for candidate in ["README.md", "README_EN.md", "Solution.cpp", "Solution.py", "Solution.java", "Solution.ts", "Solution.go"]:
            full = solution_dir / candidate
            if full.exists():
                paths.append(str(full.relative_to(repo_root)))
        if paths:
            entries.append(
                make_repo_entry(
                    "doocs_leetcode",
                    number,
                    title,
                    paths,
                    "code+explanation",
                    "Indexed solution directory with explanation pages and multilingual reference solutions.",
                )
            )
    files = iter_repo_files(repo_root)
    return {"entries": entries, "files": files}


def index_haoel() -> dict[str, Any]:
    repo_root = ROOT / "haoel_leetcode"
    entries = []
    pattern = re.compile(
        r"^\|(\d+)\|\[(.+?)\]\((https?://[^)]+)\)\s*\|\s*(.+?)\|([A-Za-z]+)\|$"
    )
    for line in (repo_root / "README.md").read_text(encoding="utf-8", errors="ignore").splitlines():
        match = pattern.match(line.strip())
        if not match:
            continue
        number = int(match.group(1))
        title = match.group(2)
        solutions_blob = match.group(4)
        paths = re.findall(r"\]\(\./([^)]+)\)", solutions_blob)
        entries.append(
            make_repo_entry(
                "haoel_leetcode",
                number,
                title,
                paths,
                "indexed-code",
                "README table with direct language links.",
            )
        )
    files = iter_repo_files(repo_root)
    return {"entries": entries, "files": files}


def index_kamyu() -> dict[str, Any]:
    repo_root = ROOT / "kamyu104_LeetCode-Solutions"
    entries = []
    files_to_parse = ["0001-1000.md", "1001-2000.md", "2001-3000.md", "README.md"]
    pattern = re.compile(
        r"^\s*(\d+)\s*\|\s*\[(.+?)\]\((https?://[^)]+)\)\s*\|\s*(.+?)\|\s*.*?\|\s*(Easy|Medium|Hard)\s*\|",
    )
    for rel in files_to_parse:
        path = repo_root / rel
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
            match = pattern.match(line)
            if not match:
                continue
            number = int(match.group(1))
            title = match.group(2)
            solution_blob = match.group(4)
            paths = re.findall(r"\]\(\./([^)]+)\)", solution_blob)
            entries.append(
                make_repo_entry(
                    "kamyu104_LeetCode-Solutions",
                    number,
                    title,
                    paths,
                    "indexed-code",
                    "Large multi-language index with category tags and direct solution links.",
                )
            )
    files = iter_repo_files(repo_root)
    return {"entries": entries, "files": files}


def index_neetcode() -> dict[str, Any]:
    repo_root = ROOT / "neetcode-gh_leetcode"
    site_data = read_json(repo_root / ".problemSiteData.json", [])
    entries = []
    for item in site_data:
        title = item.get("problem")
        if not title:
            continue
        code = item.get("code", "")
        number = int(code.split("-")[0]) if code and code.split("-")[0].isdigit() else None
        slug = item.get("link", "").strip("/")
        paths = []
        article = repo_root / "articles" / f"{slug}.md"
        hint = repo_root / "hints" / f"{slug}.md"
        if article.exists():
            paths.append(str(article.relative_to(repo_root)))
        if hint.exists():
            paths.append(str(hint.relative_to(repo_root)))
        for language_dir, extension in [
            ("cpp", ".cpp"),
            ("python", ".py"),
            ("java", ".java"),
            ("javascript", ".js"),
            ("typescript", ".ts"),
            ("go", ".go"),
            ("c", ".c"),
            ("csharp", ".cs"),
            ("rust", ".rs"),
            ("kotlin", ".kt"),
            ("swift", ".swift"),
            ("ruby", ".rb"),
            ("scala", ".scala"),
            ("dart", ".dart"),
        ]:
            if item.get(language_dir):
                candidate = repo_root / language_dir / f"{code}{extension}"
                if candidate.exists():
                    paths.append(str(candidate.relative_to(repo_root)))
        coverage_type = "article+code" if any(path.startswith("articles/") for path in paths) else "code"
        notes = "Structured problem metadata with local articles, hints, and multilingual implementations."
        entries.append(make_repo_entry("neetcode-gh_leetcode", number, title, paths, coverage_type, notes))
    files = iter_repo_files(repo_root)
    return {"entries": entries, "files": files, "siteData": site_data}


def index_test123() -> dict[str, Any]:
    repo_root = ROOT / "test-123"
    entries = []
    files = []
    for path in repo_root.glob("*"):
        if not path.is_file():
            continue
        rel = str(path.relative_to(repo_root))
        files.append(rel)
        title = path.stem.replace("-", " ")
        entries.append(
            make_repo_entry(
                "test-123",
                None,
                title,
                [rel],
                "code",
                "Flat mirror of solution source files, useful as a quick local reference after solving.",
            )
        )
    return {"entries": entries, "files": files}


def index_wisdompeak() -> dict[str, Any]:
    repo_root = ROOT / "wisdompeak_LeetCode"
    entries = []
    for directory in repo_root.glob("*/*"):
        if not directory.is_dir():
            continue
        match = re.match(r"(\d+)\.(.+)", directory.name)
        if not match:
            continue
        number = int(match.group(1))
        title = match.group(2).replace("-", " ")
        paths = [
            str(path.relative_to(repo_root))
            for path in directory.iterdir()
            if path.is_file()
        ]
        if not paths:
            continue
        entries.append(
            make_repo_entry(
                "wisdompeak_LeetCode",
                number,
                title,
                paths,
                "code+readme",
                "Topic-organized repository with per-problem Readme notes and focused C++ implementations.",
            )
        )
    files = iter_repo_files(repo_root)
    return {"entries": entries, "files": files}


def build_repo_indexes() -> dict[str, Any]:
    def enrich(repo_name: str, repo_root_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        repo_root = ROOT / repo_root_name
        metadata = read_repo_metadata(repo_root)
        payload["root"] = repo_root
        payload["originUrl"] = metadata["originUrl"]
        payload["defaultBranch"] = metadata["defaultBranch"] or "main"
        payload["repoName"] = repo_name
        return payload

    return {
        "doocs_leetcode": enrich("doocs_leetcode", "doocs_leetcode", index_doocs()),
        "haoel_leetcode": enrich("haoel_leetcode", "haoel_leetcode", index_haoel()),
        "kamyu104_LeetCode-Solutions": enrich("kamyu104_LeetCode-Solutions", "kamyu104_LeetCode-Solutions", index_kamyu()),
        "neetcode-gh_leetcode": enrich("neetcode-gh_leetcode", "neetcode-gh_leetcode", index_neetcode()),
        "test-123": enrich("test-123", "test-123", index_test123()),
        "wisdompeak_LeetCode": enrich("wisdompeak_LeetCode", "wisdompeak_LeetCode", index_wisdompeak()),
    }


def entry_matches_problem(entry: dict[str, Any], problem_number: int, slug: str, title: str) -> bool:
    if entry.get("number") == problem_number:
        return True
    normalized_title = normalize_title(title)
    return entry["slug"] == slug or entry["normalizedTitle"] == normalized_title


def broad_match(files: list[str], problem_number: int, slug: str, normalized_title: str) -> list[str]:
    matches = []
    number_pattern = re.compile(rf"(^|[^\d])0*{problem_number}([^\d]|$)")
    for rel in files:
        rel_lower = rel.lower()
        normalized_rel = normalize_title(rel)
        if slug in rel_lower or normalized_title in normalized_rel or number_pattern.search(rel_lower):
            matches.append(rel)
    return matches[:8]


def collect_repo_coverage(problem_entry: dict[str, Any], repo_indexes: dict[str, Any]) -> list[dict[str, Any]]:
    slug = problem_entry["id"]
    title = problem_entry["title"]
    number = problem_entry["number"]
    normalized_title = normalize_title(title)
    coverage = []
    for repo_name, repo_index in repo_indexes.items():
        exact_matches = [
            item for item in repo_index["entries"] if entry_matches_problem(item, number, slug, title)
        ]
        if exact_matches:
            merged_paths = []
            coverage_type = []
            notes = []
            for item in exact_matches:
                merged_paths.extend(item["paths"])
                coverage_type.append(item["coverageType"])
                notes.append(item["notes"])
            coverage.append(
                {
                    "repository": repo_name,
                    "coverageType": sorted(set(coverage_type))[0],
                    "paths": sorted(set(merged_paths))[:8],
                    "notes": notes[0],
                    "matchMode": "high-precision",
                }
            )
            continue
        broad_paths = broad_match(repo_index["files"], number, slug, normalized_title)
        if broad_paths:
            coverage.append(
                {
                    "repository": repo_name,
                    "coverageType": "code",
                    "paths": broad_paths,
                    "notes": "Broad path scan matched the problem by number or normalized slug.",
                    "matchMode": "broad",
                }
            )
    return coverage


def map_memberships(problem_entry: dict[str, Any], neetcode_site_data: list[dict[str, Any]]) -> tuple[list[str], str | None]:
    slug = problem_entry["id"]
    title = problem_entry["title"]
    memberships = ["Seed report"]
    neetcode_url = None
    for item in neetcode_site_data:
        if item.get("link", "").strip("/") == slug or normalize_title(item.get("problem", "")) == normalize_title(title):
            if item.get("neetcode150"):
                memberships.append("NeetCode 150")
            if item.get("blind75"):
                memberships.append("Blind 75")
            neetcode_url = f"https://neetcode.io/problems/{item['link'].strip('/')}"
            pattern = item.get("pattern")
            if pattern:
                memberships.append(pattern)
            break
    return sorted(dict.fromkeys(memberships)), neetcode_url


def language_sort_key(language_id: str) -> tuple[int, str]:
    try:
        return (LANGUAGE_ORDER.index(language_id), language_id)
    except ValueError:
        return (len(LANGUAGE_ORDER) + 1, language_id)


def repo_sort_key(repo_name: str) -> tuple[int, str]:
    try:
        return (REPO_PRIORITY.index(repo_name), repo_name)
    except ValueError:
        return (len(REPO_PRIORITY) + 1, repo_name)


def build_blob_url(origin_url: str | None, branch: str | None, rel_path: str) -> str | None:
    if not origin_url:
        return None
    cleaned = origin_url.removesuffix(".git")
    branch_name = branch or "main"
    return f"{cleaned}/blob/{branch_name}/{quote(rel_path.replace(os.sep, '/'), safe='/')}"


def extract_markdown_title(content: str, fallback: str) -> str:
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            candidate = stripped.lstrip("#").strip() or fallback
            if candidate.lower() in {"prerequisites", "hint 1", "hint 2", "hint 3", "solution"}:
                return fallback
            return candidate
    return fallback


def extract_excerpt(content: str, max_chars: int = 420) -> str:
    text = re.sub(r"\s+", " ", content).strip()
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rstrip() + "..."


def extract_complexity_hints(code: str) -> list[str]:
    hints = []
    for line in code.splitlines()[:12]:
        stripped = line.strip()
        if re.search(r"(time|space|complexity)", stripped, re.IGNORECASE):
            hints.append(stripped.lstrip("#/ *"))
    return hints[:3]


def is_comment_or_empty(line: str, comment_prefix: str) -> bool:
    stripped = line.strip()
    return not stripped or stripped.startswith(comment_prefix) or stripped.startswith("/*") or stripped.startswith("*")


def first_code_line(lines: list[str], comment_prefix: str) -> int | None:
    for index, line in enumerate(lines, start=1):
        if not is_comment_or_empty(line, comment_prefix):
            return index
    return None


def find_pattern_line(lines: list[str], patterns: list[str], start: int = 1) -> int | None:
    regex = re.compile("|".join(patterns))
    for index in range(max(0, start - 1), len(lines)):
        if regex.search(lines[index]):
            return index + 1
    return None


def find_last_pattern_line(lines: list[str], patterns: list[str]) -> int | None:
    regex = re.compile("|".join(patterns))
    for index in range(len(lines) - 1, -1, -1):
        if regex.search(lines[index]):
            return index + 1
    return None


def build_solution_annotations(problem: dict[str, Any], code: str, language_meta: dict[str, str]) -> list[dict[str, Any]]:
    lines = code.splitlines()
    comment_prefix = language_meta["comment"]
    signature_line = find_pattern_line(
        lines,
        [
            r"\bclass\s+Solution\b",
            r"\bdef\s+\w+\(",
            r"\bfunction\s+\w+\(",
            r"\bfunc\s+\w+\(",
            r"\bpublic\b.*\(",
            r"\bfn\s+\w+\(",
        ],
    ) or first_code_line(lines, comment_prefix)
    setup_line = find_pattern_line(
        lines,
        [r"\b(?:let|var|const)\b", r":=", r"\w+\s*=", r"\bListNode\b", r"\bnew\b"],
        start=(signature_line or 1) + 1,
    )
    loop_line = find_pattern_line(lines, [r"\bfor\b", r"\bwhile\b"], start=(signature_line or 1) + 1)
    decision_line = find_pattern_line(lines, [r"\bif\b", r"\belif\b", r"\belse if\b", r"\bmatch\b"], start=(loop_line or signature_line or 1))
    return_line = find_last_pattern_line(lines, [r"\breturn\b"])

    annotations = []
    seen: set[int] = set()

    def push(line_number: int | None, label: str, note: str) -> None:
        if not line_number or line_number in seen:
            return
        annotations.append({"line": line_number, "label": label, "note": note})
        seen.add(line_number)

    push(
        signature_line,
        "Entry point",
        f"Start from the core routine and keep this mental model in view: {problem['expectedMentalModel']}",
    )
    push(
        setup_line,
        "State setup",
        f"This setup stage creates the state needed for the invariant or partial result: {problem['whatYouPractice']}",
    )
    push(
        loop_line,
        "Main pass",
        f"This is the main sweep where the implementation earns its efficiency instead of restarting work from scratch.",
    )
    push(
        decision_line,
        "Decision point",
        f"Pay attention here: {problem['caveat']}",
    )
    push(
        return_line,
        "Return",
        "The final return exposes the result after the traversal and state updates have settled.",
    )
    return annotations


def build_reviewed_code(code: str, annotations: list[dict[str, Any]], comment_prefix: str) -> str:
    if not annotations:
        return code
    annotation_map = {item["line"]: item for item in annotations}
    rendered: list[str] = []
    for index, line in enumerate(code.splitlines(), start=1):
        annotation = annotation_map.get(index)
        if annotation:
            indent = re.match(r"\s*", line).group(0)
            rendered.append(f"{indent}{comment_prefix} [Reader note] {annotation['label']}")
            rendered.append(f"{indent}{comment_prefix} {annotation['note']}")
        rendered.append(line)
    return "\n".join(rendered)


def compile_problem_solutions(problem: dict[str, Any], repo_indexes: dict[str, Any], generated_at: str) -> dict[str, Any]:
    code_sources: list[dict[str, Any]] = []
    writeups: list[dict[str, Any]] = []

    for coverage in problem["repoCoverage"]:
        if coverage["matchMode"] != "high-precision":
            continue
        repo_name = coverage["repository"]
        repo_index = repo_indexes[repo_name]
        repo_root: Path = repo_index["root"]
        for rel_path in coverage["paths"]:
            ext = Path(rel_path).suffix.lower()
            full_path = repo_root / rel_path
            if not full_path.exists():
                continue
            source_url = build_blob_url(repo_index.get("originUrl"), repo_index.get("defaultBranch"), rel_path)
            local_path = str(full_path.relative_to(ROOT))
            content = full_path.read_text(encoding="utf-8", errors="ignore")
            if ext in LANGUAGE_CONFIG:
                language_meta = LANGUAGE_CONFIG[ext]
                annotations = build_solution_annotations(problem, content, language_meta)
                code_sources.append(
                    {
                        "id": sanitize_id(f"{repo_name}-{rel_path}"),
                        "repository": repo_name,
                        "repositoryUrl": repo_index.get("originUrl"),
                        "sourceUrl": source_url,
                        "localPath": local_path,
                        "relativePath": rel_path,
                        "languageId": language_meta["id"],
                        "languageLabel": language_meta["label"],
                        "coverageType": coverage["coverageType"],
                        "code": content,
                        "originalCode": content,
                        "reviewedCode": build_reviewed_code(content, annotations, language_meta["comment"]),
                        "embeddedSuccessfully": True,
                        "readerEnhancementsAdded": bool(annotations),
                        "enhancementNote": "Based on the attributed upstream source file. Reader-oriented explanatory comments were added for study use.",
                        "complexityHints": extract_complexity_hints(content),
                        "annotations": annotations,
                        "implementationReview": {
                            "whyThisVersion": problem["whySolve"],
                            "whatToNotice": problem["whatYouPractice"],
                            "riskPoint": problem["caveat"],
                        },
                    }
                )
            elif ext == ".md":
                writeups.append(
                    {
                        "id": sanitize_id(f"{repo_name}-{rel_path}"),
                        "repository": repo_name,
                        "repositoryUrl": repo_index.get("originUrl"),
                        "sourceUrl": source_url,
                        "localPath": local_path,
                        "relativePath": rel_path,
                        "title": extract_markdown_title(content, Path(rel_path).stem.replace("-", " ")),
                        "excerpt": extract_excerpt(content),
                    }
                )

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for source in code_sources:
        grouped[source["languageId"]].append(source)

    language_groups = []
    for language_id in sorted(grouped, key=language_sort_key):
        items = sorted(
            grouped[language_id],
            key=lambda item: (repo_sort_key(item["repository"]), item["relativePath"].lower()),
        )
        language_groups.append(
            {
                "id": language_id,
                "label": items[0]["languageLabel"],
                "sourceCount": len(items),
                "sources": items,
            }
        )

    summary = {
        "hasSolutions": bool(language_groups),
        "languageIds": [group["id"] for group in language_groups],
        "languageLabels": [group["label"] for group in language_groups],
        "solutionCount": len(code_sources),
        "writeupCount": len(writeups),
        "primaryLanguageId": language_groups[0]["id"] if language_groups else None,
    }

    return {
        "generatedAt": generated_at,
        "problemId": problem["id"],
        "problemTitle": problem["title"],
        "problemNumber": problem["number"],
        "summary": summary,
        "languages": language_groups,
        "writeups": sorted(writeups, key=lambda item: (repo_sort_key(item["repository"]), item["relativePath"].lower())),
    }


def sanitize_id(value: str) -> str:
    return re.sub(r"[^a-z0-9._-]+", "-", value.lower()).strip("-")


def write_solution_payloads(dataset_entries: list[dict[str, Any]], repo_indexes: dict[str, Any], generated_at: str) -> None:
    SOLUTIONS_DIR.mkdir(exist_ok=True)
    for existing in SOLUTIONS_DIR.glob("*.json"):
        existing.unlink()
    for problem in dataset_entries:
        payload = compile_problem_solutions(problem, repo_indexes, generated_at)
        problem["solutionSummary"] = payload["summary"]
        write_json(SOLUTIONS_DIR / f"{problem['id']}.json", payload)


def build_dataset() -> dict[str, Any]:
    validations = validate_with_leetcode(CURATED_PROBLEMS)
    repo_indexes = build_repo_indexes()
    neetcode_site_data = repo_indexes["neetcode-gh_leetcode"].get("siteData", [])
    phase_lookup = {phase["id"]: phase for phase in PHASES}
    generated_at = time.strftime("%Y-%m-%d")
    dataset_entries = []
    repo_presence_counter = defaultdict(int)
    for blueprint in CURATED_PROBLEMS:
        slug = slugify(blueprint["title"])
        validation = validations.get(slug)
        if not validation:
            raise RuntimeError(f"Missing LeetCode validation for {slug}")
        if validation["difficulty"] != "Medium":
            raise RuntimeError(f"Expected Medium difficulty for {slug}, found {validation['difficulty']}")
        memberships, neetcode_url = map_memberships({"id": slug, "title": blueprint["title"]}, neetcode_site_data)
        source_urls = [f"https://leetcode.com/problems/{validation['titleSlug']}/"]
        if neetcode_url:
            source_urls.append(neetcode_url)
        source_urls.extend(blueprint["supportSourceUrls"])
        source_urls = list(dict.fromkeys(source_urls))
        entry = {
            "id": validation["titleSlug"],
            "number": int(validation["questionFrontendId"]),
            "title": validation["title"],
            "difficulty": validation["difficulty"],
            "leetcodeUrl": f"https://leetcode.com/problems/{validation['titleSlug']}/",
            "concepts": blueprint["concepts"],
            "phase": phase_lookup[blueprint["phase"]],
            "lane": {
                "id": blueprint["lane"],
                "label": LANES[blueprint["lane"]]["label"],
                "color": LANES[blueprint["lane"]]["color"],
            },
            "transitionFriendliness": blueprint["transitionFriendliness"],
            "clarity": blueprint["clarity"],
            "effort": blueprint["effort"],
            "readiness": blueprint["readiness"],
            "whySolve": blueprint["whySolve"],
            "whatYouPractice": blueprint["whatYouPractice"],
            "overview": blueprint["overview"],
            "interestNote": blueprint["interestNote"],
            "caveat": blueprint["caveat"],
            "classic": blueprint["classic"],
            "newerGem": blueprint["newerGem"],
            "starter": blueprint["starter"],
            "recommendedOrder": blueprint["recommendedOrder"],
            "prerequisites": blueprint["prerequisites"],
            "statementStyle": blueprint["statementStyle"],
            "expectedMentalModel": blueprint["expectedMentalModel"],
            "topicGuides": [
                {
                    "id": guide_id,
                    "title": TOPIC_GUIDES[guide_id]["title"],
                    "path": TOPIC_GUIDES[guide_id]["path"],
                }
                for guide_id in blueprint["topicGuideIds"]
            ],
            "memberships": memberships,
            "sourceUrls": source_urls,
            "validatedTopicTags": validation["topicTags"],
        }
        entry["repoCoverage"] = collect_repo_coverage(entry, repo_indexes)
        for coverage in entry["repoCoverage"]:
            repo_presence_counter[coverage["repository"]] += 1
        dataset_entries.append(entry)
    dataset_entries.sort(key=lambda item: item["recommendedOrder"])
    write_solution_payloads(dataset_entries, repo_indexes, generated_at)
    return {
        "generatedAt": generated_at,
        "researchSources": RESEARCH_SOURCES,
        "phases": PHASES,
        "lanes": [
            {"id": lane_id, "label": lane["label"], "color": lane["color"]}
            for lane_id, lane in LANES.items()
        ],
        "topicGuides": [
            {"id": guide_id, **guide}
            for guide_id, guide in TOPIC_GUIDES.items()
        ],
        "problems": dataset_entries,
        "summary": {
            "problemCount": len(dataset_entries),
            "repoCoverageCounts": dict(sorted(repo_presence_counter.items())),
            "exclusions": EXCLUSIONS,
        },
    }


def write_summary(dataset: dict[str, Any]) -> None:
    summary_payload = {
        "generatedAt": dataset["generatedAt"],
        "problemCount": len(dataset["problems"]),
        "phaseCounts": dict(
            sorted(
                (
                    phase["shortName"],
                    len([problem for problem in dataset["problems"] if problem["phase"]["id"] == phase["id"]]),
                )
                for phase in dataset["phases"]
            )
        ),
        "repoCoverageCounts": dataset["summary"]["repoCoverageCounts"],
        "broadMatchProblems": [
            {
                "id": problem["id"],
                "title": problem["title"],
                "repositories": [
                    coverage["repository"]
                    for coverage in problem["repoCoverage"]
                    if coverage["matchMode"] == "broad"
                ],
            }
            for problem in dataset["problems"]
            if any(coverage["matchMode"] == "broad" for coverage in problem["repoCoverage"])
        ],
        "exclusions": EXCLUSIONS,
    }
    write_json(SUMMARY_JSON, summary_payload)


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    dataset = build_dataset()
    write_json(OUTPUT_JSON, dataset)
    write_js_dataset(OUTPUT_JS, dataset)
    write_summary(dataset)
    print(f"Wrote {len(dataset['problems'])} curated problems to {OUTPUT_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
