/** Resolve modules, not just import spelling, so aliases cannot bypass isolation. */
import ts from "typescript-compiler-api";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

function inside(root: string, path: string): boolean {
  const name = relative(root, path);
  return name === "" || (!name.startsWith(`..${sep}`) && name !== ".." && !isAbsolute(name));
}

async function files(root: string): Promise<string[]> {
  const info = await lstat(root);
  if (info.isSymbolicLink()) throw new Error(`Source symlinks are not allowed: ${root}`);
  if (info.isFile()) return [root];
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = resolve(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Source symlinks are not allowed: ${file}`);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else if ([".ts", ".js", ".mts", ".mjs", ".cts", ".cjs"].includes(extname(file)))
      result.push(file);
  }
  return result;
}

export async function auditTree(
  source: string,
  allowedRoot: string,
  options: ts.CompilerOptions,
  forbiddenRoot?: string,
): Promise<string[]> {
  const violations: string[] = [];
  const allowed = await realpath(allowedRoot);
  const forbidden = forbiddenRoot ? await realpath(forbiddenRoot) : undefined;
  for (const file of await files(source)) {
    const parsed = ts.createSourceFile(
      file,
      await readFile(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const specifiers: string[] = [];
    const visit = (node: ts.Node): void => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        specifiers.push(node.moduleSpecifier.text);
      } else if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        node.moduleReference.expression &&
        ts.isStringLiteral(node.moduleReference.expression)
      ) {
        specifiers.push(node.moduleReference.expression.text);
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        specifiers.push(node.argument.literal.text);
      } else if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require"))
      ) {
        const argument = node.arguments[0];
        if (!argument || !ts.isStringLiteralLike(argument))
          violations.push(`${file}: nonliteral module loading`);
        else specifiers.push(argument.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(parsed);
    for (const specifier of specifiers) {
      const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
      if (!resolved) continue; // The typechecker reports unresolved imports.
      const target = await realpath(resolved.resolvedFileName);
      if (
        (forbidden && inside(forbidden, target)) ||
        (!inside(allowed, target) && !target.split(sep).includes("node_modules"))
      ) {
        violations.push(
          `${file} imports outside its application boundary: ${specifier} -> ${target}`,
        );
      }
    }
  }
  return violations;
}

export async function checkBoundaries(suiteRoot: string): Promise<void> {
  suiteRoot = await realpath(suiteRoot);
  const configPath = resolve(suiteRoot, "tsconfig.json");
  const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
  if (loaded.error)
    throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, "\n"));
  if (loaded.config.extends || loaded.config.references?.length) {
    throw new Error(
      "The acceptance suite must own its configuration without project inheritance or references.",
    );
  }
  const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, suiteRoot);
  for (const file of parsed.fileNames) {
    if (!inside(suiteRoot, await realpath(file)))
      throw new Error(`Suite tsconfig includes product or outside source: ${file}`);
  }
  for (const targets of Object.values(parsed.options.paths ?? {})) {
    for (const target of targets) {
      if (!inside(suiteRoot, resolve(parsed.options.baseUrl ?? suiteRoot, target))) {
        throw new Error(`Suite tsconfig alias escapes the suite: ${target}`);
      }
    }
  }
  const product = resolve(suiteRoot, "..");
  const violations = [
    ...(await auditTree(resolve(suiteRoot, "src"), suiteRoot, parsed.options)),
    ...(await auditTree(resolve(suiteRoot, "scripts"), suiteRoot, parsed.options)),
    ...(await auditTree(resolve(suiteRoot, "playwright.config.ts"), suiteRoot, parsed.options)),
  ];
  const productConfig = ts.readConfigFile(resolve(product, "tsconfig.json"), ts.sys.readFile);
  const productOptions = ts.parseJsonConfigFileContent(
    productConfig.config,
    ts.sys,
    product,
  ).options;
  violations.push(
    ...(await auditTree(resolve(product, "src"), product, productOptions, suiteRoot)),
  );
  const pkg = JSON.parse(await readFile(resolve(suiteRoot, "package.json"), "utf8"));
  for (const value of Object.values({ ...pkg.dependencies, ...pkg.devDependencies })) {
    if (typeof value === "string" && /^(file|link|workspace):/.test(value)) {
      violations.push("Suite dependencies must not link product or workspace packages.");
    }
  }
  if (violations.length)
    throw new Error(`Acceptance isolation violations:\n${violations.join("\n")}`);
}

if (import.meta.main) {
  await checkBoundaries(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
  console.info("Product and acceptance implementation boundaries are isolated.");
}
