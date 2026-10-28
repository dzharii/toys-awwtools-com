import { validateGrid, validPath, pathXor, solve, binary } from '../model.js';
import { optimalRouteGraph, enumerateOptimalRoutes } from './optimal-paths.js';

// The engine owns domain operations and caches. It has no DOM, viewport, or storage dependency.
export class ExperimentEngine {
  #solution = null;
  #optimalGraph = null;
  #routes = null;
  constructor(experiment) { this.load(experiment); }
  load(experiment) {
    validateGrid(experiment.grid);
    if (!validPath(experiment.grid, experiment.path)) experiment.path = [0];
    this.experiment = experiment;
    this.invalidate();
  }
  get grid() { return this.experiment.grid; }
  get path() { return this.experiment.path; }
  get columns() { return this.grid[0].length; }
  get total() { return this.grid.length * this.columns; }
  get position() { return this.path.at(-1); }
  get xor() { return pathXor(this.grid, this.path); }
  get complete() { return this.position === this.total - 1; }
  value(cell) { return this.grid[Math.floor(cell / this.columns)][cell % this.columns]; }
  tracePath(path = this.path) {
    if (!validPath(this.grid, path)) throw Error('That path is not valid for this grid.');
    let xor = 0;
    return path.map((cell, index) => {
      const previous = xor, value = this.value(cell);
      xor ^= value;
      return { cell, step: index + 1, from: index ? path[index - 1] : null, value, previous, xor, binary: binary(xor), final: cell === this.total - 1 };
    });
  }
  nextMoves() {
    const next = [];
    if (this.position % this.columns < this.columns - 1) next.push(this.position + 1);
    if (this.position + this.columns < this.total) next.push(this.position + this.columns);
    const xor = this.xor;
    return next.map(cell => ({ cell, value: this.value(cell), xor: xor ^ this.value(cell), binary: binary(xor ^ this.value(cell)) }));
  }
  move(cell) {
    if (!this.nextMoves().some(next => next.cell === cell)) return false;
    this.path.push(cell); return true;
  }
  undo() { if (this.path.length === 1) return false; this.path.pop(); return true; }
  reset() { this.experiment.path = [0]; }
  setValue(cell, value) {
    if (!Number.isInteger(value) || value < 0 || value > 1023) throw Error('Enter an integer from 0 to 1023.');
    if (!Number.isInteger(cell) || cell < 0 || cell >= this.total) throw Error('That cell is outside the grid.');
    this.grid[Math.floor(cell / this.columns)][cell % this.columns] = value;
    this.invalidate();
  }
  resize(rows, cols) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows * cols > 1000) throw Error('Use positive dimensions with at most 1,000 cells.');
    const previous = this.grid;
    this.experiment.grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => previous[r]?.[c] ?? 0));
    this.reset(); this.invalidate();
  }
  invalidate() { this.#solution = null; this.#optimalGraph = null; this.#routes = null; this.experiment.reference = null; }
  solution() { return this.#solution ||= solve(this.grid); }
  optimalRoutes(limit = 8) {
    this.#optimalGraph ||= optimalRouteGraph(this.grid, this.solution());
    const bound = Math.max(1, Math.min(32, Math.trunc(limit) || 8));
    if (!this.#routes || this.#routes.limit !== bound) this.#routes = enumerateOptimalRoutes(this.grid, this.#optimalGraph, bound);
    return this.#routes;
  }
}
