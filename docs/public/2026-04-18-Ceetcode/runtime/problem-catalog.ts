import { problemCatalog } from "../problems/catalog";
import { problemSchema, type ProblemDefinition } from "./types";

export function loadProblemCatalog(): ProblemDefinition[] {
  return problemCatalog.map((item) => problemSchema.parse(item));
}
