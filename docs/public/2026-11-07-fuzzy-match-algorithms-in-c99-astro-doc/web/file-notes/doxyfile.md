---
file: "Doxyfile"
---

This optional configuration builds a conventional Doxygen API/source browser. The published guide uses Starlight.

<!-- at: 1 -->
## Select C sources and enable source cross-references

Inputs include `src/`, the correctness suite and the start guide. Static functions and source browsing are enabled so implementation helpers remain visible. HTML output goes to `doxygen/`; LaTeX and Graphviz are disabled. Nothing in this file changes compilation or matching behavior.

