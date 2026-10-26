/** Narrow application adapter contract; the upstream UMD distribution is unchanged. */
interface Table {
  get(id: string): Promise<unknown>;
  toArray(): Promise<unknown[]>;
  put(value: unknown): Promise<unknown>;
  delete(id: string): Promise<void>;
}
export default class Dexie {
  constructor(name: string);
  version(version: number): { stores(schema: Record<string, string>): void };
  table(name: string): Table;
  open(): Promise<unknown>;
  close(): void;
  transaction<T>(mode: "rw", table: Table, action: () => Promise<T>): Promise<T>;
}
