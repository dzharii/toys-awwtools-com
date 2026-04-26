export function defineOnce(tagName, ctor) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ctor);
  }
}

export function defineMany(definitions) {
  for (const [tagName, ctor] of definitions) {
    defineOnce(tagName, ctor);
  }
}
