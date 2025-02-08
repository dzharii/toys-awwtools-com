// src/buildConfig.ts
import config from "./config";
import { processConfig } from "./processConfig";
import { writeFileSync } from "fs";

const jsonConfig = processConfig(config);
const output = JSON.stringify(jsonConfig, null, 2);

console.log(output);
writeFileSync("outputConfig.json", output);
