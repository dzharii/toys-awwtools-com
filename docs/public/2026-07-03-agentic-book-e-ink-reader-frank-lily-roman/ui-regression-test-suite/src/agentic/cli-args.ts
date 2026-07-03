/** Minimal --flag / --flag=value / --flag value CLI parser for agentic scripts. */
export interface ParsedArgs {
  get(name: string): string | undefined;
  num(name: string, fallback: number): number;
  bool(name: string): boolean;
  raw: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const map = new Map<string, string>();
  const flags = new Set<string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const body = a.slice(2);
    const eq = body.indexOf("=");
    if (eq >= 0) {
      map.set(body.slice(0, eq), body.slice(eq + 1));
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      map.set(body, argv[i + 1]);
      i++;
    } else {
      flags.add(body);
      map.set(body, "true");
    }
  }
  return {
    get: (name) => map.get(name),
    num: (name, fallback) => {
      const v = map.get(name);
      const n = v === undefined ? NaN : Number(v);
      return Number.isFinite(n) ? n : fallback;
    },
    bool: (name) => flags.has(name) || map.get(name) === "true",
    raw: argv,
  };
}
