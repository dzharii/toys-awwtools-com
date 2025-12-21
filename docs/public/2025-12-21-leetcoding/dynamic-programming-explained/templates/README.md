# DP Practice Templates

Each template is a single file containing a problem statement, a `solve(...)` stub, and an ad hoc test runner.
No external dependencies are required.

## JavaScript (Node.js)

Run a single test file:

```
node dp-01-climbing-stairs.js
```

To run all JS templates from the `templates/js` folder (bash):

```
for f in dp-*.js; do node "$f"; done
```

## C99

Compile and run a single test file (GCC example):

```
gcc -std=c99 -O2 -Wall -Wextra -pedantic dp-01-climbing-stairs.c -o dp01 && ./dp01
```

To run all C templates from the `templates/c99` folder (bash):

```
for f in dp-*.c; do gcc -std=c99 -O2 -Wall -Wextra -pedantic "$f" -o tmp && ./tmp; done
```

Tested assumptions:
- Node.js 18+
- GCC 11+ or Clang 13+

