import type { WorkingDocument } from "./model";

export type DocumentFilter = "active" | "archived" | "recent";
export const documentFilterKey = "gtl.document-filter.v1";
export function filteredDocuments(
  documents: WorkingDocument[],
  filter: DocumentFilter,
  recentLimit: number,
): WorkingDocument[] {
  const sorted = documents
    .filter((item) => (filter === "archived" ? !!item.record.archivedAt : !item.record.archivedAt))
    .sort(
      (a, b) =>
        b.record.updatedAt.localeCompare(a.record.updatedAt) ||
        a.record.id.localeCompare(b.record.id),
    );
  return filter === "recent" ? sorted.slice(0, recentLimit) : sorted;
}
