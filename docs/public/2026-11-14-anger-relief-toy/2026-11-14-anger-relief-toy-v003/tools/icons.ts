const tags = new Set([
  "svg",
  "defs",
  "linearGradient",
  "stop",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "polygon",
  "line",
  "polyline",
]);
export function validateIcon(art: string, id: string): void {
  if (
    !art.startsWith("<svg ") ||
    art.length > 16000 ||
    /<!|<\?|\bon\w+\s*=|href\s*=|\bstyle\s*=|url\((?!#)/i.test(art)
  )
    throw new Error(`Unsafe icon: ${id}`);
  for (const match of art.matchAll(/<\/?([\w:-]+)/g))
    if (!tags.has(match[1]!)) throw new Error(`Unsupported icon element: ${id}`);
}
