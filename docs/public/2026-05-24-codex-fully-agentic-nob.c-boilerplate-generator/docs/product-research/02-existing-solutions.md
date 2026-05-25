# Existing Solutions And Common Approaches

## Existing Solution Categories

- Static examples in upstream or community `nob.c` files.
- Manual copy/edit starter snippets.
- General-purpose build systems such as Make, CMake, Meson, Ninja-based flows, and shell scripts.
- Project generators that scaffold whole repositories.
- Educational articles or videos explaining NoBuild-style workflows.

## Differentiation

This product should not compete with full build systems. It should compete with the blank editor buffer and static examples by letting users configure a small `nob.c` and immediately see how each choice changes the code.

## Spec Implications

- The product must not claim to replace Make, CMake, or package managers.
- The generated output must be readable enough for users to keep editing manually.
- A static snippet page is insufficient unless the UI exposes cause-and-effect configuration and validation.

