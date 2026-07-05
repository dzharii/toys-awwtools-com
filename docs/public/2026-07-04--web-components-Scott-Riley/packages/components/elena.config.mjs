/**
 * Elena bundler configuration.
 *
 * The source article uses Elena as the Progressive Web Component build tool.
 * This project keeps the default build explicit for educational review, while
 * keeping Elena configured as the migration path for component bundling.
 *
 * @type {import("@elenajs/bundler").ElenaConfig}
 */
export default {
  input: "src",
  output: {
    dir: "dist-elena",
    format: "esm",
    sourcemap: true,
    filename: "bundle.js",
  },
  bundle: "src/index.js",
};
