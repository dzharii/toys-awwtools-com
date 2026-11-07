# Configuration parsing and resolution sequence

The published guide uses Astro Starlight. For direct offline reading, open `dist/offline/index.html`. Both versions use local assets.

Start with `src/parser.c`, `src/normalization.c`, then `src/resolver.c`. Follow one key through these files before reading the algorithms.

A raw line becomes an `Entry`. Its key becomes a `Prepared` name. Comparing names produces a `Resolution`. Only accepted resolutions may reach the binder.

Read `src/algorithms/edit.c` next. Each distance cell asks: what is the cheapest way to transform these two prefixes? The nearby comments show the three choices and explain where the restricted adjacent-swap method and full Damerau-Levenshtein differ.

Tags such as `PM-Lv2pR6` are local references, not video IDs. Search a tag in your editor, use `rg 'PM-Lv2pR6'`, or click it on the site. A tag keeps its identity when surrounding lines move.

On the website, each source line has a stable-in-this-build URL. Tags are better bookmarks across edits. Search accepts a function name, filename, tag or phrase. Detailed reference pages remain available when needed.

## Build the documentation website and offline reference

Run `npm ci`, then `make docs`. The website build needs Node.js and Python 3.9+. The C benchmark still needs only GCC and Make.

`astro.config.mjs` configures Starlight. `scripts/prepare_starlight.py` prepares the source views and Markdown pages. `make docs-check` checks rendered headings, local links and source copies. `make docs-offline` builds only the Python offline reference.

For a conventional API/source index, install Doxygen and run `make doxygen`. `Doxyfile` enables source browsing and local references; Graphviz is optional and disabled by default. Doxygen output is an alternative, not a dependency of the guided site.

The optional Doxygen configuration follows the [official configuration reference](https://www.doxygen.nl/manual/config.html). Its documentation comments follow the [official comment-block format](https://www.doxygen.nl/manual/docblocks.html).
