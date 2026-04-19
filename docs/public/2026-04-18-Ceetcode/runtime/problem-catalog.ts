import { problemCatalog } from "../problems/catalog";
import { createLogger } from "./logging";
import { problemSchema, type ProblemDefinition } from "./types";

const problemLog = createLogger("App", "ProblemCatalog");

export function loadProblemCatalog(): ProblemDefinition[] {
  const loaded = problemCatalog.map((item) => problemSchema.parse(item));
  problemLog.info("Problem catalog loaded", {
    context: { count: loaded.length, ids: loaded.map((problem) => problem.id) }
  });
  return loaded;
}
