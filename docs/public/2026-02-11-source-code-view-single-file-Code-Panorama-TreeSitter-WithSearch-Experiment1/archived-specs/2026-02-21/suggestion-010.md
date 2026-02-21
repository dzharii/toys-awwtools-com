2026-02-11

This is very good. Now it’s time to do a quality pass on this project.

At this point, I’m changing the requirements a bit because the project has grown really fast and the codebase has expanded. We now have all the essential functionality.

What we want to do next is keep the “no bundlers” approach, but move to modern ECMAScript modules (i.e., using the `import` keyword). If we’re going to use imports, we need to decide what functionality we can extract.

So this is a full refactor with the goal of pulling functionality into separate modules. One important thing: I want to keep it simple. These should still feel like low-level modules—we’re not introducing new high-level abstractions. No extra architectural layers.

We can do this with straightforward function decomposition: factor logic into functions and export/import them. I prefer functions over classes or more abstract patterns because it’s easier to read.

Right now, having everything in one file is simple in one sense—you can see everything at once, and it’s easy to rely on shared globals. But it’s time to extract into functions and modules while keeping the codebase simple and readable.

Use your best judgment. Think carefully about how to break this into modules that stay straightforward and don’t introduce a lot of abstraction.
