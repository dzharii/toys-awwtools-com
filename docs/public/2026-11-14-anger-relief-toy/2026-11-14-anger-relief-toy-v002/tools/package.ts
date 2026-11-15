import { $ } from "bun";
await $`bun run build`;
await $`bun run check`;
await $`bun test`;
await $`python3 tools/package.py`;
