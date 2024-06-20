const flashcards = [
    {
        id: 1,
        type: 'multiple-choice',
        question: 'What is the time complexity of heapify?',
        options: ['O(n log n)', 'O(n)', 'O(log n)'],
        answer: 'O(log n)',
        explanation: 'Heapify has a time complexity of O(log n) as it ensures the heap property by traversing the height of the tree.',
        tags: ['heap', 'time complexity', 'easy']
    },
    {
        id: 2,
        type: 'fill-in-the-gap',
        question: 'Fill in the missing code for the merge sort function.',
        code: `
function mergeSort(arr) {
    if (arr.length < 2) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return ___(left, right);
}

function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
        if (left[0] < right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    return result.concat(left, right);
}`,
        gap: '___',
        answer: 'merge',
        explanation: 'The merge function combines two sorted arrays into a single sorted array.',
        tags: ['sorting', 'merge sort', 'medium']
    },
    {
        id: 3,
        type: 'matching-pairs',
        question: 'Match the algorithm to its use case.',
        pairs: [
            { item1: 'Dijkstra\'s Algorithm', item2: 'Shortest Path in Weighted Graph' },
            { item1: 'DFS', item2: 'Graph Traversal' },
            { item1: 'Binary Search', item2: 'Finding Element in Sorted Array' }
        ],
        explanation: 'Dijkstra\'s Algorithm finds the shortest path in a weighted graph, DFS is used for graph traversal, and Binary Search is used to find an element in a sorted array.',
        tags: ['graph', 'searching', 'medium']
    },
    {
        id: 4,
        type: 'multiple-choice',
        question: 'Which of the following is a self-balancing binary search tree?',
        options: ['Binary Search Tree', 'AVL Tree', 'Red-Black Tree', 'B-tree'],
        answer: 'AVL Tree',
        explanation: 'AVL Trees and Red-Black Trees are examples of self-balancing binary search trees. A B-tree is a generalization of a binary search tree.',
        tags: ['tree', 'binary tree', 'medium']
    },
    {
        id: 5,
        type: 'multiple-choice',
        question: 'What is the purpose of the Floyd-Warshall algorithm?',
        options: ['Find shortest path in unweighted graph', 'Find shortest path between all pairs of nodes', 'Find minimum spanning tree', 'Topological sort of a graph'],
        answer: 'Find shortest path between all pairs of nodes',
        explanation: 'The Floyd-Warshall algorithm is used to find the shortest paths between all pairs of nodes in a weighted graph.',
        tags: ['graph', 'dynamic programming', 'hard']
    }
    // Add more flashcards here following the same pattern
];
