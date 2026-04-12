import { mkdirSync } from "node:fs";
import { createBookmarkletUrl } from "../src/build-artifacts.js";

mkdirSync("./dist", { recursive: true });

await Bun.$`bun build --target=browser --format=iife --sourcemap=none --outfile=./dist/bookmarklet.js ./src/entry.js`;

const bundleText = await Bun.file("./dist/bookmarklet.js").text();
await Bun.write("./dist/bookmarklet-url.txt", createBookmarkletUrl(bundleText));
console.log("Built dist/bookmarklet.js and dist/bookmarklet-url.txt");
