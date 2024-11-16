// Lists Definitions

// Objective Verbs
const objectives = [
  "Find",
  "Calculate",
  "Determine",
  "Generate",
  "Count",
  "Compute",
  "Check",
  "Identify",
  "Return",
  "Implement",
  "Design",
  "Develop",
  "Construct",
  "Discover",
  "Estimate",
  "Evaluate",
  "Solve",
  "Optimize",
  "Simulate",
  "Analyze",
  "Test",
  "Verify",
  "Compare",
  "Modify",
  "Enhance",
  "Build",
  "Adapt",
  "Translate",
  "Validate",
  "Predict"
];

// Subjects (What to find or compute)
const subjects = [
  "the maximum sum subarray",
  "the shortest path",
  "the longest increasing sequence",
  "the number of islands",
  "the median of two sorted arrays",
  "the kth largest element",
  "all valid parentheses combinations",
  "the lowest common ancestor",
  "the number of unique binary search trees",
  "the maximum product subarray",
  "the longest palindromic substring",
  "the number of ways to climb stairs",
  "the missing number in an array",
  "the duplicate number in an array",
  "the longest common prefix among strings",
  "the number of connected components in a graph",
  "the area of the largest rectangle in a histogram",
  "the maximal area of an island",
  "the valid palindrome",
  "the trapping rain water problem",
  "the top k frequent elements in a dataset",
  "the binary tree level order traversal",
  "the invert of a binary tree",
  "the diameter of a binary tree",
  "the maximum depth of a binary tree",
  "the minimum window substring",
  "the edit distance between two words",
  "the longest substring without repeating characters",
  "all anagrams in a string",
  "the maximum subarray sum less than k",
  "the number of subarrays with sum equal to k",
  "the median of a data stream",
  "the length of the word ladder",
  "the minimum path sum in a grid",
  "the knight's tour on a chessboard",
  "a sudoku solver",
  "the largest palindrome product",
  "the integer to Roman numeral conversion",
  "the Roman numeral to integer conversion",
  "the zigzag level order traversal of a binary tree",
  "all possible combinations of numbers summing to a target",
  "all permutations of a list of numbers",
  "all subsets of a set",
  "solutions to the N-Queens problem",
  "the maximum profit from stock prices",
  "a binary search tree iterator",
  "an LRU cache implementation",
  "a min stack design",
  "serialization and deserialization of a binary tree",
  "the evaluation of reverse Polish notation",
  "the merging of overlapping intervals",
  "the validation of a binary search tree",
  "the identification of valid sudoku boards",
  "the maximum length of a concatenated string with unique characters",
  "the peak element in an array",
  "the minimum number of coins for change",
  "the possibility to jump to the end of an array",
  "the container with the most water",
  "the circuit completion in a gas station problem",
  "the maximal square area in a binary matrix",
  "the best time to buy and sell stock",
  "the word search in a 2D grid",
  "the celebrity identification in a group",
  "the rearrangement of a string with k distance apart",
  "random pick with weight",
  "the detection of duplicate subtrees",
  "the grouping of anagrams",
  "the count of smaller numbers after self",
  "the paint house problem",
  "the sliding window maximum",
  "the reading of N characters given read4",
  "the design of a hit counter",
  "the reversal of nodes in k-group",
  "the count of range sum",
  "the finding of kth smallest pair distance",
  "the k empty slots problem",
  "the counting of atoms in a chemical formula",
  "the design of a log storage system",
  "the maximum length of a repeated subarray",
  "the calculation of maximum vacation days",
  "the design of a snake game",
  "the design of a tic-tac-toe game",
  "the unique paths in a grid",
  "the identification of minimum in a rotated sorted array",
  "the merging of k sorted lists",
  "the implementation of pow(x, n)",
  "the number of ways to climb stairs with variable steps",
  "the setting of matrix zeroes",
  "the search in a rotated sorted array",
  "the removal of the nth node from end of list",
  "the validation of parentheses",
  "the generation of valid parentheses",
  "the letter combinations of a phone number",
  "the regular expression matching",
  "the wildcard pattern matching",
  "the conversion of integer to English words",
  "the reversal of an integer",
  "the number of ways to decode a message",
  "the longest consecutive sequence in an array",
  "the task scheduler problem",
  "the course schedule feasibility",
  "the design of a bounded blocking queue",
  "the processing of queries per second in a rate limiter"
];

// Contexts (Where to find it)
const contexts = [
  "in an array of integers",
  "within a binary tree",
  "in a grid with obstacles",
  "among all possible permutations",
  "in a linked list",
  "within a matrix",
  "in a rotated sorted array",
  "among all substrings of a given string",
  "in a graph with weighted edges",
  "within a set of intervals",
  "in a 2D grid of characters",
  "in a stream of data",
  "among the nodes of a trie",
  "within a circular linked list",
  "in a max heap",
  "in a min heap",
  "among the factors of a number",
  "within a range of numbers",
  "in a binary search tree",
  "among the digits of an integer",
  "in Pascal's triangle",
  "within a magic square",
  "among an array of points",
  "in a schedule of tasks",
  "within a string of parentheses",
  "in an array representing heights",
  "among a list of courses",
  "in a cache system",
  "within a shuffled deck of cards",
  "among an array of timestamps",
  "in a system of equations",
  "within a sorted linked list",
  "in a series of stock prices",
  "among competing processes",
  "in a collection of documents",
  "within an image represented by pixels",
  "in a database of records",
  "among a set of key-value pairs",
  "within a network of computers",
  "in a map of cities and roads",
  "among various file paths",
  "within a chemical molecule structure",
  "in a genetic sequence",
  "among celestial bodies in space",
  "within a musical composition",
  "in an arrangement of dominoes",
  "among the layers of a neural network",
  "within an encrypted message",
  "in a collection of intervals",
  "among a set of versioned files",
  "within a blockchain ledger"
];

// Constraints (Conditions or Rules)
const constraints = [
  "using O(n) time and O(1) space",
  "without modifying the original data",
  "where duplicates are allowed",
  "with elements in sorted order",
  "using dynamic programming",
  "without using extra space",
  "by performing at most k operations",
  "where negative numbers are included",
  "using a divide and conquer approach",
  "with a recursive solution",
  "with a time complexity better than O(n log n)",
  "without using built-in libraries",
  "with constant extra space",
  "using a stack data structure",
  "where the input is read-only",
  "with amortized constant time operations",
  "using a greedy algorithm",
  "in a multi-threaded environment",
  "where the data is too large to fit in memory",
  "using memoization",
  "without using recursion",
  "with in-place algorithm",
  "without changing the relative order",
  "using bit manipulation",
  "with concurrent access",
  "where overflow must be handled",
  "in a distributed system",
  "using breadth-first search",
  "using depth-first search",
  "with backtracking",
  "without using division or multiplication",
  "only by swapping adjacent elements",
  "with limited resources",
  "using hash tables",
  "where the data stream is infinite",
  "by simulating a real-world scenario",
  "with probabilistic methods",
  "using heap data structures",
  "with minimal network latency",
  "without exceeding a given budget",
  "under real-time constraints",
  "using only addition and subtraction",
  "with an event-driven approach",
  "where the solution must be scalable",
  "using a functional programming paradigm",
  "with high fault tolerance",
  "where security considerations are paramount",
  "in the presence of unreliable data",
  "using machine learning techniques",
  "with user-defined precision",
  "while ensuring data integrity",
  "using only constant time operations",
  "with support for internationalization",
  "ensuring compatibility across platforms",
  "with minimal user interaction",
  "without prior knowledge of the data size",
  "using only primitive data types",
  "by exploiting mathematical properties",
  "with a modular design",
  "avoiding deadlocks in concurrent execution",
  "with consideration for energy efficiency",
  "using a randomized algorithm",
  "while maintaining a high throughput",
  "with compliance to specific protocols",
  "under memory fragmentation constraints",
  "using only immutable data structures",
  "with partial information",
  "ensuring backward compatibility",
  "without relying on external APIs",
  "with minimal computational overhead",
  "using tail recursion",
  "adhering to coding standards",
  "with support for undo operations",
  "in a resource-constrained environment",
  "with adaptive algorithms",
  "using a monotonic queue",
  "with predictive analysis",
  "while handling exceptions gracefully",
  "in an object-oriented design",
  "with multi-language support",
  "ensuring thread safety",
  "using lock-free programming",
  "with offline data processing",
  "while minimizing disk I/O",
  "under high network traffic",
  "with support for batch processing",
  "in a real-time analytics system",
  "with high availability requirements",
  "using a plugin architecture",
  "while preserving data privacy",
  "with adherence to accessibility standards",
  "in compliance with legal regulations",
  "with consideration for user experience",
  "ensuring minimal latency",
  "with dynamic data updates",
  "while optimizing for cache performance",
  "using a microservices architecture",
  "with continuous deployment in mind"
];

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Function to Generate Random Idea
function generateIdea() {
  const objective = objectives[Math.floor(Math.random() * objectives.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  let context = contexts[Math.floor(Math.random() * contexts.length)];

  // Adjust preposition if necessary (optional enhancement)
  if (subject.startsWith("the") && context.startsWith("in a")) {
    context = context.replace("in a", "within a");
  } else if (subject.startsWith("all") && context.startsWith("within")) {
    context = context.replace("within", "among");
  }

  // Generate a random number between 5 and 15 for the number of constraints
  const numConstraints = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // Random integer between 5 and 15

  // Copy and shuffle the constraints array
  const shuffledConstraints = constraints.slice(); // Make a copy
  shuffle(shuffledConstraints);

  // Select the first numConstraints constraints
  const selectedConstraints = shuffledConstraints.slice(0, numConstraints);

  // Combine the constraints into a string
  let constraintsText = '';

  if (selectedConstraints.length > 1) {
    constraintsText =
      selectedConstraints.slice(0, -1).join(', ') +
      ', and ' +
      selectedConstraints[selectedConstraints.length - 1];
  } else if (selectedConstraints.length === 1) {
    constraintsText = selectedConstraints[0];
  }

  const idea = `${objective} ${subject} ${context} ${constraintsText}.`;

  document.getElementById('idea').innerText = idea;
}

// Generate idea on page load
generateIdea();
