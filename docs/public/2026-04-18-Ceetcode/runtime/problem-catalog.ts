import { problemCatalog } from "../problems/catalog";
import { createLogger } from "./logging";
import { problemSchema, type ProblemDefinition } from "./types";

const problemLog = createLogger("App", "ProblemCatalog");
export const scratchpadProblemId = "new";

export function loadProblemCatalog(): ProblemDefinition[] {
  const loaded = problemCatalog.map((item) => problemSchema.parse(item));
  loaded.sort((left, right) => {
    if (left.id === scratchpadProblemId && right.id !== scratchpadProblemId) return -1;
    if (right.id === scratchpadProblemId && left.id !== scratchpadProblemId) return 1;
    return 0;
  });
  problemLog.info("Problem catalog loaded", {
    context: { count: loaded.length, ids: loaded.map((problem) => problem.id) }
  });
  return loaded;
}
