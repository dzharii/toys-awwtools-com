/** Count exact optimal routes with rolling sparse rows, never storing path histories. */
export function countOptimalRoutes(grid, target) {
  const transpose = grid[0].length > grid.length;
  const rows = transpose ? grid[0].length : grid.length;
  const width = transpose ? grid.length : grid[0].length;
  const at = (r, c) => transpose ? grid[c][r] : grid[r][c];
  const counts = Array.from({ length: width }, () => new Map());
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < width; c++) {
      const value = at(r, c), next = new Map();
      if (r === 0 && c === 0) next.set(value, 1n);
      else {
        const append = source => {
          for (const [xor, count] of source) {
            const result = xor ^ value;
            next.set(result, (next.get(result) || 0n) + count);
          }
        };
        if (r) append(counts[c]);
        if (c) append(counts[c - 1]);
      }
      counts[c] = next;
    }
  }
  return counts[width - 1].get(target) || 0n;
}

/** Exact union of every optimal route, plus a bounded set of distinct examples. */
export function optimalRouteGraph(grid, solution) {
  const n = grid[0].length, total = grid.length * n;
  const active = new Uint8Array(total * 1024), cells = new Uint8Array(total);
  active[(total - 1) * 1024 + solution.min] = 1;
  for (let i = total - 1; i >= 0; i--) {
    const cellValue = grid[Math.floor(i / n)][i % n], offset = i * 1024;
    for (let x = 0; x < 1024; x++) {
      if (!active[offset + x]) continue;
      cells[i] = 1;
      const previous = x ^ cellValue;
      if (i >= n && solution.states[(i - n) * 1024 + previous]) active[(i - n) * 1024 + previous] = 1;
      if (i % n && solution.states[(i - 1) * 1024 + previous]) active[(i - 1) * 1024 + previous] = 1;
    }
  }
  return { active, cells, count: countOptimalRoutes(grid, solution.min), minimum: solution.min };
}

export function enumerateOptimalRoutes(grid, graph, limit = 8) {
  const n = grid[0].length, total = grid.length * n;
  const bound = Math.max(1, Math.min(32, Math.trunc(limit) || 8));
  const paths = [], path = [0], stack = [{ cell: 0, xor: grid[0][0], next: null, cursor: 0 }];
  while (stack.length && paths.length < bound) {
    const frame = stack.at(-1);
    if (frame.cell === total - 1) {
      paths.push(path.slice()); stack.pop(); path.pop(); continue;
    }
    if (frame.next === null) {
      const candidates = [];
      if (frame.cell % n < n - 1) candidates.push(frame.cell + 1);
      if (frame.cell + n < total) candidates.push(frame.cell + n);
      frame.next = candidates.flatMap(cell => {
        const xor = frame.xor ^ grid[Math.floor(cell / n)][cell % n];
        return graph.active[cell * 1024 + xor] ? [{ cell, xor, next: null, cursor: 0 }] : [];
      });
    }
    if (frame.cursor < frame.next.length) {
      const next = frame.next[frame.cursor++]; stack.push(next); path.push(next.cell);
    } else { stack.pop(); path.pop(); }
  }
  const membership = Array.from({ length: total }, () => []);
  paths.forEach((route, id) => route.forEach(cell => membership[cell].push(id)));
  return { ...graph, paths, membership, truncated: graph.count > BigInt(paths.length), limit: bound };
}
