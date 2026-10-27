/** Map a native textarea edit back to exact source, retaining untouched line endings. */
export function applyNativeSourceEdit(raw: string, next: string): string {
  const previous = raw.replace(/\r\n?/g, "\n");
  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start]) start++;
  let end = previous.length,
    nextEnd = next.length;
  while (end > start && nextEnd > start && previous[end - 1] === next[nextEnd - 1]) {
    end--;
    nextEnd--;
  }
  const rawOffset = (offset: number) => {
    let native = 0,
      index = 0;
    while (native < offset && index < raw.length) {
      if (raw[index] === "\r" && raw[index + 1] === "\n") index++;
      index++;
      native++;
    }
    return index;
  };
  const newline = /\r\n|\r|\n/.exec(raw)?.[0] ?? "\n";
  return (
    raw.slice(0, rawOffset(start)) +
    next.slice(start, nextEnd).replace(/\n/g, newline) +
    raw.slice(rawOffset(end))
  );
}
