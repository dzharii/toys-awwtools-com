export const walkthroughGrid = [[0, 1, 0], [2, 0, 2]];
export const walkthroughSteps = [
  {cell:[0,0],value:0,incoming:[],states:[0],calculation:'Start: 0 XOR 0 = 0'},
  {cell:[0,1],value:1,incoming:[0],states:[1],calculation:'0 XOR 1 = 1'},
  {cell:[0,2],value:0,incoming:[1],states:[1],calculation:'1 XOR 0 = 1'},
  {cell:[1,0],value:2,incoming:[0],states:[2],calculation:'0 XOR 2 = 2'},
  {cell:[1,1],value:0,incoming:[1,2],states:[1,2],calculation:'1 XOR 0 = 1; 2 XOR 0 = 2'},
  {cell:[1,2],value:2,incoming:[1,2],states:[0,3],calculation:'1 XOR 2 = 3; 2 XOR 2 = 0'}
];
const set = values => '{' + values.join(', ') + '}';
export const advancedLessons = [
  {
    title:'Extend a path summary, one cell at a time.',
    intro:'The useful state is a pair: where a path ends, and the XOR of every value it has visited so far. We will unpack the algebra first, then use it to build the reachable sets. Here, XOR means bitwise XOR; braces such as {6, 7} mean two possible results, not an instruction to XOR 6 with 7.',
    sections:[
      {
        heading:'Change the question: which situations are reachable?',
        paragraphs:[
          'Picture a separate node for every pair (cell, running XOR). The cell (1,1) with running XOR 6 and the same cell with running XOR 7 are two different situations, because a later value can affect them differently. A state is simply the name for one of these situations.',
          'A right or down move creates an edge from (current cell, x) to (next cell, x XOR next value). We start at the node containing the start cell and its own value, then mark every node reachable by these edges. Different histories that reach the same node can share its future work.',
          'This changes the search space from an enormous collection of complete routes to a bounded collection of cell-and-XOR situations. In [[1,2],[3,4]], four physical cells give five reachable situation nodes: the destination appears twice, once for 6 and once for 7. The answer is the smallest XOR label among reachable destination nodes. The reachable-set algorithm below is a compact way of exploring this expanded graph.'
        ],
        figure:{name:'expanded-states',width:480,height:442,caption:'One physical cell can have several reachable situation nodes. The two destination nodes represent alternative final costs.'}
      },
      {
        heading:'What does an already-XORed value remember?',
        paragraphs:[
          'Suppose the visited values are 5 and 3. Their accumulated XOR is 6. This 6 is a summary of the entire prefix, not just the value of its last cell. If the next cell contains 5, the new accumulated XOR is 6 XOR 5 = 3.',
          'The property being used is associativity: (a XOR b) XOR c = a XOR (b XOR c). It lets us replace a sequence of earlier operations with their result. Thus (5 XOR 3) XOR 5 and 6 XOR 5 describe exactly the same path calculation. We do not XOR the earlier cells a second time.',
          'Bit by bit, the summary remembers parity: whether an odd or even number of visited values had a 1 in that position. A next-cell bit of 1 flips that parity; a bit of 0 leaves it alone. XOR has no carries between columns.'
        ],
        formula:'prefix XOR = x; next cell = v; extended path XOR = x XOR v',
        figure:{name:'accumulated-xor',width:480,height:362,caption:'The running value summarizes all earlier flips. Adding the next cell is one more XOR operation.'}
      },
      {
        heading:'Why do repeated values cancel?',
        paragraphs:[
          'Commutativity says a XOR b = b XOR a. Two other identities are a XOR a = 0 and a XOR 0 = a. Together with associativity, they explain the example: 5 XOR 3 XOR 5 = (5 XOR 5) XOR 3 = 0 XOR 3 = 3.',
          'Each bit set in 5 is flipped twice, so those flips cancel. This is an algebraic rearrangement of the values on one existing path. It does not permit moving left, revisiting a cell, or choosing a different sequence of grid positions. Distinct cells can have equal values; visiting both legitimately includes both contributions.'
        ],
        check:{question:'Check yourself: a path has running XOR 6 after visiting 5, then 3. If the next cell is 3, what is the new XOR?',answer:'It is 5: 6 XOR 3 = (5 XOR 3) XOR 3 = 5. The two occurrences of 3 cancel. In binary, 0000000110 XOR 0000000011 = 0000000101.'}
      },
      {
        heading:'A reachable set contains alternatives, not ingredients.',
        paragraphs:[
          'Define S(r,c) as the set of accumulated XOR values of valid paths ending at (r,c), including that cell. A state x at a predecessor already includes every cell up to that predecessor. It does not yet include the new cell v, so extending it computes x XOR v exactly once.',
          'For [[1,2],[3,4]], the top neighbor of the destination has state 3 from 1 XOR 2. The left neighbor has state 2 from 1 XOR 3. Entering the 4 gives two separate alternatives: 3 XOR 4 = 7 and 2 XOR 4 = 6. Store {6,7}.',
          'Do not compute 3 XOR 2 XOR 4. That would mix two different path histories. A path arrives from either top or left, never both in the same final move. Set union collects the possibilities; XOR extends each possibility individually.'
        ],
        figure:{name:'incoming-alternatives',width:480,height:344,caption:'Two incoming histories produce two candidate results. The set keeps both; it does not XOR them together.'},
        check:{question:'Why is 5 absent from the destination set, even though 3 XOR 2 XOR 4 = 5?',answer:'Because 3 and 2 describe alternative prefixes. No valid path in this 2 by 2 grid visits both intermediate cells before entering 4. Its only final results are 7 and 6.'}
      },
      {
        heading:'Name the numbers before reading the rule.',
        paragraphs:[
          'Keep three quantities separate. cellNumber is the fixed integer written inside the cell you are entering. incomingXor is a running result from one real path ending at a neighboring cell. newXor is the running result after appending the current cell. The reachable set stores possible running results, not the numbers printed in the grid.',
          'At destination (1,1) of [[1,2],[3,4]], cellNumber is always 4. The top path supplies incomingXor 3; the left path supplies incomingXor 2. Compute newXor separately for each incomingXor.'
        ],
        table:{caption:'The same cell number is used for each alternative incoming path.',headers:['Name','Meaning','In this example'],rows:[['cellNumber','Number printed in the current grid cell','4'],['incomingXor','XOR of a path before entering this cell','3 from top, or 2 from left'],['newXor','incomingXor XOR cellNumber','7 from top, or 6 from left'],['reachableXors','Set of all newXor results for this cell','{6,7}']]},
        figure:{name:'one-transition',width:480,height:416,caption:'The cell number 4 is one operand. The incoming XOR 3 summarizes the earlier cells 1 and 2. The new XOR 7 includes all three cells.'}
      },
      {
        heading:'Turn that reasoning into a recurrence.',
        paragraphs:[
          'The start has just one path, containing its own value: S(0,0) = {grid[0][0]}. Equivalently, start with the empty-prefix XOR 0 and XOR in the start once.',
          'At every other cell, take the union of the reachable sets of its existing top and left neighbors. For each incoming x, retain x XOR the current value. On the first row only the left neighbor exists; on the first column only the top neighbor exists. A missing neighbor contributes no states, not a made-up state 0.',
          'Process rows from top to bottom and each row from left to right. Then both required predecessors have already been processed. Distinct results are retained even if some are numerically larger. XOR can reverse their order later. Only after reaching the destination do we take a minimum.'
        ],
        formula:'S(r,c) = {x XOR grid[r][c] : x belongs to S(r-1,c) or S(r,c-1)}'
      },
      {
        heading:'Read the third index as a yes/no question.',
        paragraphs:[
          'The same reachable set can be written as a Boolean table called dp. The entry dp[r][c][x] asks: does at least one valid path end at position (r,c) with accumulated XOR exactly x? The answer is true or false. The third index x names a possible running result; it is not another grid coordinate.',
          'For the destination (1,1) of [[1,2],[3,4]], dp[1][1][6] and dp[1][1][7] are true, while dp[1][1][5] is false. This is exactly the set S(1,1) = {6,7}, written using flags. The cell number is still 4. A true entry at index 6 neither means six routes nor stores a minimum cost.',
          "An update reads a true entry at a top or left neighbor, uses that entry's index as incomingXor, computes newXor = incomingXor XOR cellNumber, and marks the current cell's entry at index newXor true. Sets, Boolean flags, and reachable nodes in the expanded graph are three representations of the same information."
        ],
        figure:{name:'set-to-flags',width:480,height:375,caption:'A set of possible XORs and a Boolean flag table encode the same reachable situations. Only the entries for 6 and 7 are true.'}
      },
      {
        heading:'Why equal states can share their future.',
        paragraphs:[
          'Two histories ending at the same cell with the same running XOR x have the same remaining legal moves. Let t be the XOR of the cells on any chosen continuation, starting after the shared cell. Both full paths finish at x XOR t. The shared cell is already in x; counting it again in t would be an error.',
          'That is why one copy of each (cell, XOR) pair is enough for finding the minimum. We can forget which prefix produced it without changing any future attainable result. This argument uses equality, not numeric order: different running values must remain separate.'
        ],
        figure:{name:'same-state-suffix',width:480,height:348,caption:'Different histories with the same state can use exactly the same suffix. Both finish with the same XOR.'}
      },
      {
        heading:'Why the recurrence is correct, in both directions.',
        paragraphs:[
          'The invariant is: after processing a cell, its set contains exactly the accumulated XORs of real valid paths ending there. The start satisfies this because there is exactly one one-cell path.',
          'Nothing is missing: take any valid path to a non-start cell and remove its last cell. The remaining prefix ends at its top or left neighbor. By the invariant its XOR x is already stored there, so the recurrence adds the full path result x XOR v.',
          'Nothing is invented: every state added by the recurrence comes from a real predecessor path. Appending the adjacent current cell is a legal move, and XORing its value gives that extended path cost. Deduplication keeps one copy of the same result, so it removes no possible result.',
          'Both statements preserve the invariant one cell at a time. The destination set therefore contains every attainable final cost and no others. Taking its minimum solves the original objective.'
        ]
      }
    ],
    grid:[[1,2],[3,4]],
    practice:'Trace right then down: 1, 3, 7. Reset and trace down then right: 1, 2, 6. The destination set is {6,7}. Notice that neither route calculation ever combines the two alternative middle cells.'
  },
  {
    title:'Work through the decisions, then test the argument.',
    intro:'Use one small counterexample all the way through: [[0,1,0],[2,0,2]]. It has only three routes, so we can verify every result by hand. It also exposes the exact information a greedy rule would lose.',
    sections:[
      {
        heading:'Fill all six cells without choosing a winner early.',
        paragraphs:[
          'The first row has only one route to each cell, giving {0}, then {1}, then {1}. The lower-left cell also has one route, with XOR 0 XOR 2 = 2.',
          'At (1,1), the top contributes 1 and the left contributes 2. The cell value is 0, so neither changes: its set is {1,2}. Keep both. At the destination, the top contributes 1 while the left contributes {1,2}. Their union is {1,2}; XOR each with the destination value 2 to obtain {3,0}. Store the set {0,3}, then select 0.'
        ],
        figure:{name:'reachable-walkthrough',width:480,height:418,caption:'Every box separates the original cell value from its reachable set. The destination keeps both 0 and 3.'},
        table:{caption:'Row-major computation using distinct incoming XORs. A neighbor-by-neighbor loop can encounter the same incoming XOR twice; set insertion still keeps one result.',headers:['Cell / number','Incoming XORs','Calculation','Stored XORs'],rows:walkthroughSteps.map(s=>[`(${s.cell.join(',')}) / ${s.value}`,s.incoming.length?set(s.incoming):'No predecessor',s.calculation,set(s.states)])}
      },
      {
        heading:'Check the sets against all actual routes.',
        paragraphs:[
          'The top route goes right, right, down: 0 XOR 1 XOR 0 XOR 2 = 3. The middle route goes right, down, right: 0 XOR 1 XOR 0 XOR 2 = 3. The bottom route goes down, right, right: 0 XOR 2 XOR 0 XOR 2 = 0.',
          'The bottom path has the larger running value 2 at (1,1), but the final 2 cancels it. Keeping only the smaller value 1 there would return 3 and miss the optimum. XOR does not preserve order: 1 < 2, yet (1 XOR 2) > (2 XOR 2).',
          'Two different routes finish at 3. A set stores 3 once because the objective asks which costs are possible. The number of routes and the number of reachable XOR values are different quantities. At the destination there are three routes but only two distinct states.'
        ],
        check:{question:'What changes if the final cell becomes 1 instead of 2?',answer:'Incoming 1 now gives 0, while incoming 2 gives 3. The final set is still {0,3}, but the winning incoming state changes from 2 to 1. The top and middle routes now achieve 0. A smaller prefix is sometimes better and sometimes worse; neither ordering is a safe pruning rule.'}
      },
      {
        heading:'What exactly gets deduplicated?',
        paragraphs:[
          'There can be two real routes to the same state. In [[1,2],[2,3]], right-down and down-right both reach the destination with 1 XOR 2 XOR 3 = 0. Retaining the state 0 once is sufficient for the numeric answer. To explain a path, retain one valid predecessor as well.',
          'At a fixed cell value v, XOR is reversible: (x XOR v) XOR v = x. Therefore different incoming XOR values cannot become equal merely by XORing both with the same v. A duplicate output comes from the same incoming XOR being available through multiple histories, such as through both neighbors. Deduplication removes repeated work, not a different numeric possibility.'
        ],
        formula:'(x XOR v) XOR v = x XOR (v XOR v) = x XOR 0 = x'
      },
      {
        heading:'Reconstruct a path without guessing its history.',
        paragraphs:[
          'For each retained (cell, result) state, keep one predecessor cell and the incoming XOR that generated it. Begin at the destination with its selected minimum and follow those stored links backward to the start. Reverse the collected cell order to get a forward path.',
          'In this example, destination result 0 and cell value 2 imply incoming XOR 0 XOR 2 = 2. The stored predecessor is (1,1). Its result 2 came from (1,0) with result 2, and that came from the start with result 0. Reversing the cells gives down, right, right.',
          'Self-inverse XOR explains how to recover the previous running value, but it does not identify the previous cell by itself. The stored provenance is what makes the reconstructed route valid. A single representative does not enumerate every route with that cost.'
        ]
      },
      {
        heading:'Use the constraints to account for the work.',
        paragraphs:[
          'All values use at most 10 bits. XOR acts independently on those bits and never creates a bit above them, so every result stays between 0 and 1023. Write B = 1024 for the maximum number of states per cell.',
          'Each cell scans at most B states from each of two predecessors. The factor of two is constant, giving O(m n B) time. Keeping every cell set uses O(m n B) space; a fixed-size predecessor record per state has the same asymptotic bound. At 1,000 cells, the reachability table has at most 1,024,000 entries.',
          'If only the final number is needed, keep the previous row and the partial current row for O(n B) reachability space. Retaining all cells is useful here because the debugger can inspect them and reconstruct paths. Exhaustive route enumeration is still valuable as an independent small-grid test, even though it is too expensive for the general solution.'
        ]
      },
      {
        heading:'Read one iteration with the names filled in.',
        paragraphs:[
          'We are at destination (1,2), so cellNumber is 2. Start its reachableXors set empty. The top neighbor (0,2) supplies incomingXor 1. Compute newXor = 1 XOR 2 = 3, then add 3 to the destination set.',
          'The left neighbor (1,1) supplies two separate incomingXors: first 1, then 2. The first gives newXor 3 again, so the set still contains just {3}. The second gives newXor 0, so the set becomes {0,3}. A set ignores repeated insertions; no operation XORs 3 with 0.',
          'The neighbor position selects a previously computed set. The incomingXor loop selects one running result inside that set. cellNumber stays fixed while those alternatives are examined. Every newXor belongs to a separate extended path.'
        ],
        table:{caption:'At the final cell, cellNumber = 2. Each newXor = incomingXor XOR cellNumber. Repeated insertion leaves the set unchanged.',headers:['Neighbor','Incoming XOR','New XOR','Stored set'],rows:[['top (0,2)','1','3','{3}'],['left (1,1)','1','3','{3}, unchanged'],['left (1,1)','2','0','{0,3}']]}
      },
      {
        heading:'Pseudocode with every quantity named.',
        paragraphs:[
          'reachableXors(r,c) means possible running results after visiting cell (r,c). It is a set attached to a position. Add means set insertion, so an already-present result stays present once. The start has no incoming path: initialize the start set with the number printed in the start cell.'
        ],
        pseudocode:'Define reachableXors(r,c) as a set of running XOR results.\nInitially, every reachableXors set is empty.\n\nVisit cell positions (r,c), top row first, left to right:\n  cellNumber = the number printed in grid cell (r,c).\n\n  If (r,c) is the start position (0,0):\n    Set reachableXors(0,0) to {cellNumber}.\n  Otherwise:\n    For each existing neighbor position p above or left of (r,c):\n      For each incomingXor in reachableXors(p):\n        newXor = incomingXor XOR cellNumber.\n        Add newXor to reachableXors(r,c).\n\nAnswer = the smallest number in reachableXors(bottom-right).'

      },
      {
        heading:'Stress the reasoning with small cases.',
        paragraphs:[
          'For a single cell containing 9, the only state and final answer are 9. For a single row or column, there is one path and no choice to optimize. Zeros preserve a running value; repeated equal values cancel in pairs. Multiple paths can share a state, and multiple states can remain at the destination.',
          'For a small grid, independently enumerate every right/down path and compare its distinct final XORs with the destination set. Check the whole set, not just its minimum. A missing non-minimal state can become important if you later extend or edit the grid.'
        ],
        check:{question:'Try changing the last 2 in the example to 3. Predict the complete final set before moving.',answer:'The incoming states remain {1,2}. Their results are 1 XOR 3 = 2 and 2 XOR 3 = 1, so the destination set becomes {1,2} and its minimum is 1. No other cell changes its reachable set.'}
      }
    ],
    grid:walkthroughGrid,
    practice:'Try all three paths. Their running XOR sequences are 0,1,1,3; 0,1,1,3; and 0,2,2,0. Then edit the final value to 1 or 3 and predict how each route changes before moving. This isolated experiment does not replace your workspace.'
  }
];
