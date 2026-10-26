/**
 * Shared runtime globals supplied by extension pages, bundled content scripts,
 * or third-party libraries loaded through static script tags/importScripts.
 */
type LpSettingsDocument = Record<string, unknown>;

interface LpLogApi {
  initFromSettings(): unknown;
  setLevelFromSettingsDocument(doc: LpSettingsDocument): unknown;
  setLevel?(level: unknown): unknown;
  getLevel?(): unknown;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

interface LpSettingsApi {
  SETTINGS_STORAGE_KEY: string;
  loadSettingsDocument(forceRefresh?: boolean): Promise<LpSettingsDocument>;
  saveSettingsDocument?(doc: LpSettingsDocument): Promise<LpSettingsDocument>;
  getDefaultDocument(): LpSettingsDocument;
  getEffectiveValue(doc: LpSettingsDocument, keyPath: string): unknown;
  findSetting?(doc: LpSettingsDocument, keyPath: string): unknown;
  getSetting(keyPath: string): Promise<unknown>;
  setSetting(keyPath: string, value: unknown): Promise<unknown>;
  resetSetting(keyPath: string): Promise<unknown>;
  resetAllSettings(): Promise<LpSettingsDocument | null>;
  isUnset?(value: unknown): value is null | undefined;
}

interface ReadabilityArticle {
  title?: string;
  textContent?: string;
  content?: string;
  byline?: string;
  siteName?: string;
  length?: number;
  excerpt?: string;
}

interface LpTextExpanderBuildEffectsApi {
  evalPage(fn: (...args: unknown[]) => unknown, options?: Record<string, unknown>): unknown;
  openUrl(url: string, disposition?: string, options?: Record<string, unknown>): unknown;
  copy(text: string, options?: Record<string, unknown>): unknown;
  overlay(overlayId: string, render: (...args: unknown[]) => unknown, options?: Record<string, unknown>): unknown;
  bg(type: string, payload?: Record<string, unknown>, options?: Record<string, unknown>): unknown;
}

interface ReadabilityConstructor {
  new (document: Document): {
    parse(): ReadabilityArticle | null;
  };
}

interface TurndownServiceInstance {
  use(plugin: unknown): void;
  addRule(
    key: string,
    rule: {
      filter: string | string[] | ((node: Node) => boolean);
      replacement: (content: string, node?: Node) => string;
    }
  ): void;
  turndown(input: string | Node): string;
}

interface TurndownServiceConstructor {
  new (options?: Record<string, unknown>): TurndownServiceInstance;
}

type DexieTableRecord = Record<string, unknown>;

interface DexieCollection<TRecord extends DexieTableRecord = DexieTableRecord> {
  equals(value: unknown): DexieCollection<TRecord>;
  reverse(): DexieCollection<TRecord>;
  limit(count: number): DexieCollection<TRecord>;
  toArray(): Promise<TRecord[]>;
  first(): Promise<TRecord | undefined>;
  delete(): Promise<number>;
}

interface DexieTable<TRecord extends DexieTableRecord = DexieTableRecord> {
  add(record: TRecord): Promise<unknown>;
  count(): Promise<number>;
  get(key: unknown): Promise<TRecord | undefined>;
  put(record: TRecord): Promise<unknown>;
  update(key: unknown, changes: Partial<TRecord>): Promise<number>;
  delete(key: unknown): Promise<void>;
  toArray(): Promise<TRecord[]>;
  where(index: string): DexieCollection<TRecord>;
  orderBy(index: string): DexieCollection<TRecord>;
  clear(): Promise<void>;
  bulkDelete(keys: unknown[]): Promise<void>;
  filter(predicate: (record: TRecord) => boolean): DexieCollection<TRecord>;
}

interface DexieDatabase {
  version(versionNumber: number): {
    stores(schema: Record<string, string>): DexieDatabase;
  };
  open(): Promise<DexieDatabase>;
  close(): void;
  isOpen(): boolean;
  table<TRecord extends DexieTableRecord = DexieTableRecord>(name: string): DexieTable<TRecord>;
}

interface DexieConstructor {
  new (databaseName: string): DexieDatabase;
}

declare global {
  type LpSettingsDocument = Record<string, unknown>;

  type DexieTableRecord = Record<string, unknown>;

  interface DexieCollection<TRecord extends DexieTableRecord = DexieTableRecord> {
    equals(value: unknown): DexieCollection<TRecord>;
    reverse(): DexieCollection<TRecord>;
    limit(count: number): DexieCollection<TRecord>;
    toArray(): Promise<TRecord[]>;
    first(): Promise<TRecord | undefined>;
    delete(): Promise<number>;
  }

  interface DexieTable<TRecord extends DexieTableRecord = DexieTableRecord> {
    add(record: TRecord): Promise<unknown>;
    count(): Promise<number>;
    get(key: unknown): Promise<TRecord | undefined>;
    put(record: TRecord): Promise<unknown>;
    update(key: unknown, changes: Partial<TRecord>): Promise<number>;
    delete(key: unknown): Promise<void>;
    toArray(): Promise<TRecord[]>;
    where(index: string): DexieCollection<TRecord>;
    orderBy(index: string): DexieCollection<TRecord>;
    clear(): Promise<void>;
    bulkDelete(keys: unknown[]): Promise<void>;
    filter(predicate: (record: TRecord) => boolean): DexieCollection<TRecord>;
  }

  function importScripts(...urls: string[]): void;
  var lpLog: LpLogApi;
  var lpSettings: LpSettingsApi;
  var Readability: ReadabilityConstructor | undefined;
  var isProbablyReaderable:
    | ((document: Document, options?: Record<string, unknown>) => boolean)
    | undefined;
  var TurndownService: TurndownServiceConstructor | undefined;
  var turndownPluginGfm: { gfm?: unknown } | undefined;
  var JSZip: unknown;
  var Dexie: DexieConstructor;
  var __LP_BUILD_VERSION: string;
}

export {};
