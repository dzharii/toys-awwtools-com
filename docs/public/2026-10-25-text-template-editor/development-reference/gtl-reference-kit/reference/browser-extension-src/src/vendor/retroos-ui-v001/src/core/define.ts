// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

export function defineOnce(tagName: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ctor);
  }
}

export function defineMany(definitions: Iterable<readonly [string, CustomElementConstructor]>): void {
  for (const [tagName, ctor] of definitions) {
    defineOnce(tagName, ctor);
  }
}
