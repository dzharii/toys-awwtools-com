# Alien Dictionary
Date: 2024-06-29

### Problem: Alien Dictionary

The "Alien Dictionary" problem involves determining the order of characters in an alien language based on a sorted list of words in that language. Given a list of words sorted lexicographically by the rules of this new language, you need to derive the order of letters in the alien alphabet.

### Plan and Approach to Solve the Alien Dictionary Problem

1. **Understand the Problem Requirements:**
   - You are given a list of words sorted lexicographically by the rules of the alien language.
   - Your task is to determine the order of characters in the alien language.

2. **Model the Problem as a Graph:**
   - Treat each character as a node in a directed graph.
   - Draw a directed edge from character `u` to character `v` if `u` comes before `v` in the alien language.

3. **Build the Graph:**
   - Iterate through the list of words and for each pair of adjacent words, find the first character that differs.
   - Add a directed edge from the first differing character of the first word to the first differing character of the second word.
   - Keep track of the in-degree (number of incoming edges) for each character.

4. **Perform Topological Sorting:**
   - Use topological sorting to find a valid order of characters in the directed graph.
   - Characters with zero in-degrees are placed at the beginning of the order, and their edges are removed from the graph.
   - Continue the process until all nodes are processed.

5. **Detect Cycles:**
   - If there is a cycle in the graph, it indicates a contradiction in the given words, and it is impossible to determine a valid character order.
   - Ensure cycle detection is part of your topological sort implementation.

6. **Return the Result:**
   - If a valid topological sort is found, return the characters in the sorted order.
   - If not, return an indication that no valid order exists (e.g., an empty string).

### Solving the Alien Dictionary: Step-by-Step Approach

1. **Initialize the Graph:**
   - Use a dictionary to represent the adjacency list of the graph.
   - Use another dictionary to count the in-degrees of each character.

2. **Build the Graph from Words:**
   - Compare each pair of adjacent words to build the graph.
   - Update the adjacency list and in-degree counts accordingly.

3. **Topological Sorting Using Kahn's Algorithm:**
   - Initialize a queue with all characters having zero in-degrees.
   - Process each character, append it to the result, and reduce the in-degrees of its neighbors.
   - Add neighbors with zero in-degrees to the queue.
   - Detect if all characters are processed; otherwise, a cycle exists.

4. **Handle Edge Cases:**
   - Consider edge cases such as single-word input, multiple identical words, and inconsistent character orders.

By following this structured approach, you can systematically solve the "Alien Dictionary" problem, ensuring both correctness and efficiency.

---

### Problems to Solve Before Alien Dictionary:

#### Easy Problems:
1. **Number of Islands (Leetcode 200)**
   - **Category:** Easy 🌟
   - **Why it helps:** This problem helps you practice graph traversal techniques like Depth-First Search (DFS) and Breadth-First Search (BFS) on a grid.
   - **Knowledge and practice gain:** You will gain familiarity with traversing a graph-like structure, marking visited nodes, and understanding connected components, which are essential for understanding the dependencies in the "Alien Dictionary."
   - **Link:** [Number of Islands](https://leetcode.com/problems/number-of-islands/)

2. **Course Schedule (Leetcode 207)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem introduces you to detecting cycles in a directed graph using topological sorting, which is directly applicable to the "Alien Dictionary."
   - **Knowledge and practice gain:** You will learn about topological sorting, cycle detection, and the use of DFS and BFS in the context of directed graphs.
   - **Link:** [Course Schedule](https://leetcode.com/problems/course-schedule/)

3. **Find the Town Judge (Leetcode 997)**
   - **Category:** Easy 🌟
   - **Why it helps:** This problem involves understanding relationships in a graph where you need to find a node with specific properties (e.g., in-degree and out-degree).
   - **Knowledge and practice gain:** You will practice identifying nodes based on their connections, which can be useful for understanding how characters depend on each other in the "Alien Dictionary."
   - **Link:** [Find the Town Judge](https://leetcode.com/problems/find-the-town-judge/)

4. **Graph Valid Tree (Leetcode 261)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem requires you to determine if a graph is a valid tree, focusing on graph connectivity and the absence of cycles.
   - **Knowledge and practice gain:** You will understand how to verify the structure of a graph, ensuring there are no cycles and that it is fully connected, both of which are important for processing graph data structures.
   - **Link:** [Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/)

5. **Find Whether Path Exists in Graph (Leetcode 1971)**
   - **Category:** Easy 🌟
   - **Why it helps:** This problem involves determining if there is a path between two nodes in an undirected graph using graph traversal.
   - **Knowledge and practice gain:** You will practice basic graph traversal techniques and pathfinding, which are useful for ensuring all dependencies are met in the "Alien Dictionary."
   - **Link:** [Find Whether Path Exists in Graph](https://leetcode.com/problems/find-if-path-exists-in-graph/)

#### Medium Problems:
1. **Course Schedule II (Leetcode 210)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem extends the "Course Schedule" problem by requiring you to return the order of courses, which is a direct application of topological sorting.
   - **Knowledge and practice gain:** You will gain a deeper understanding of topological sorting and how to construct a valid order of nodes in a directed graph, a key skill for the "Alien Dictionary."
   - **Link:** [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

2. **Minimum Height Trees (Leetcode 310)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem requires you to find the roots of the minimum height trees, involving central nodes in a graph.
   - **Knowledge and practice gain:** You will learn about handling trees and understanding the centrality of nodes, which can help in visualizing and processing hierarchical data structures.
   - **Link:** [Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/)

3. **All Paths From Source to Target (Leetcode 797)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem involves finding all paths in a directed acyclic graph (DAG), similar to finding all valid orderings in the "Alien Dictionary."
   - **Knowledge and practice gain:** You will practice working with DAGs and understanding multiple paths, which is useful for comprehending all possible character orders in the "Alien Dictionary."
   - **Link:** [All Paths From Source to Target](https://leetcode.com/problems/all-paths-from-source-to-target/)

4. **Reconstruct Itinerary (Leetcode 332)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem involves reconstructing an itinerary from a list of flights, requiring careful traversal of edges.
   - **Knowledge and practice gain:** You will understand how to manage and reconstruct sequences based on given constraints, which helps in forming valid character sequences in the "Alien Dictionary."
   - **Link:** [Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/)

5. **Sequence Reconstruction (Leetcode 444)**
   - **Category:** Medium ⭐⭐
   - **Why it helps:** This problem involves determining if a sequence can be uniquely reconstructed from subsequences, closely related to determining unique ordering in the "Alien Dictionary."
   - **Knowledge and practice gain:** You will practice topological sorting in the context of unique sequence reconstruction, directly applicable to determining a valid character order in the "Alien Dictionary."
   - **Link:** [Sequence Reconstruction](https://leetcode.com/problems/sequence-reconstruction/)



