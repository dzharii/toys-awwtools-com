import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-compiler-api";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function checkSurfaceRegistry(suiteRoot = defaultRoot): number {
  const configPath = resolve(suiteRoot, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, suiteRoot);
  if (parsed.errors.length)
    throw new Error(
      parsed.errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, "\n")).join("\n"),
    );
  const sourceFiles = ts.sys.readDirectory(resolve(suiteRoot, "src"), [
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
  ]);
  const program = ts.createProgram(
    [...new Set([...parsed.fileNames, ...sourceFiles])],
    parsed.options,
  );
  const checker = program.getTypeChecker();
  const baseFile = program.getSourceFile(resolve(suiteRoot, "src", "framework", "page-object.ts"));
  const base = baseFile?.statements.find(
    (node): node is ts.ClassDeclaration =>
      ts.isClassDeclaration(node) && node.name?.text === "PageObject",
  );
  if (!base) throw new Error("Cannot resolve the suite's framework PageObject base.");
  const baseType = checker.getTypeAtLocation(base);
  type ClassNode = ts.ClassDeclaration | ts.ClassExpression;
  const declarations = new Set<ClassNode>();
  function subclass(type: ts.Type, seen = new Set<ts.Type>()): boolean {
    if (type === baseType) return true;
    if (seen.has(type) || !type.isClassOrInterface()) return false;
    seen.add(type);
    return type.getBaseTypes()?.some((parent) => subclass(parent, seen)) ?? false;
  }
  function unalias(symbol: ts.Symbol): ts.Symbol {
    return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  }
  function classFromConstructor(type: ts.Type): ClassNode | undefined {
    const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Construct)[0];
    return (
      signature &&
      checker
        .getReturnTypeOfSignature(signature)
        .getSymbol()
        ?.declarations?.find(
          (node): node is ClassNode => ts.isClassDeclaration(node) || ts.isClassExpression(node),
        )
    );
  }
  const visitedModules = new Set<ts.Symbol>();
  function visitExports(module: ts.Symbol, location: ts.Node): void {
    if (visitedModules.has(module)) return;
    visitedModules.add(module);
    for (const symbol of checker.getExportsOfModule(module)) {
      const target = unalias(symbol);
      const declaration = classFromConstructor(
        checker.getTypeOfSymbolAtLocation(target, target.valueDeclaration ?? location),
      );
      if (declaration) {
        const type = checker.getTypeAtLocation(declaration);
        const constructor = checker.getSignaturesOfType(type, ts.SignatureKind.Construct)[0];
        if (
          !declaration.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword) &&
          subclass(constructor ? checker.getReturnTypeOfSignature(constructor) : type)
        )
          declarations.add(declaration);
      }
      if (target.flags & ts.SymbolFlags.Module)
        visitExports(target, target.valueDeclaration ?? location);
    }
  }
  for (const file of program.getSourceFiles()) {
    const path = relative(resolve(suiteRoot, "src"), file.fileName);
    if (file.isDeclarationFile || path.startsWith("..")) continue;
    const module = checker.getSymbolAtLocation(file);
    if (module) visitExports(module, file);
  }
  const registryFile = program.getSourceFile(
    resolve(suiteRoot, "src", "framework", "surface-registry.ts"),
  );
  const statement = registryFile?.statements.find(
    (node): node is ts.VariableStatement =>
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((d) => d.name.getText() === "surfaceRegistry"),
  );
  let initializer = statement?.declarationList.declarations.find(
    (d) => d.name.getText() === "surfaceRegistry",
  )?.initializer;
  while (
    initializer &&
    (ts.isSatisfiesExpression(initializer) ||
      ts.isAsExpression(initializer) ||
      ts.isParenthesizedExpression(initializer))
  )
    initializer = initializer.expression;
  if (!initializer || !ts.isArrayLiteralExpression(initializer))
    throw new Error("surfaceRegistry must be one explicit array of literal entries.");
  const registered = new Set<ClassNode>();
  const ids = new Set<string>();
  for (const entry of initializer.elements) {
    if (!ts.isObjectLiteralExpression(entry))
      throw new Error("Registry entries must be explicit object literals.");
    const property = (name: string) =>
      entry.properties.find(
        (node): node is ts.PropertyAssignment =>
          ts.isPropertyAssignment(node) && node.name.getText() === name,
      )?.initializer;
    const id = property("id");
    const objectType = property("pageObject");
    const factory = property("create");
    if (!id || !ts.isStringLiteral(id) || !objectType || !factory)
      throw new Error("Registry entries need a literal ID, class, and factory.");
    if (ids.has(id.text)) throw new Error(`Duplicate surface ID: ${id.text}`);
    ids.add(id.text);
    const declaration = classFromConstructor(checker.getTypeAtLocation(objectType));
    if (!declaration || !declarations.has(declaration))
      throw new Error(
        `${id.text}: registration does not identify a concrete exported PageObject subclass.`,
      );
    if (registered.has(declaration)) throw new Error(`${id.text}: duplicate Page Object class.`);
    registered.add(declaration);
    const signature = checker.getSignaturesOfType(
      checker.getTypeAtLocation(factory),
      ts.SignatureKind.Call,
    )[0];
    const returned = signature && checker.getReturnTypeOfSignature(signature).getSymbol();
    if (!returned?.declarations?.includes(declaration))
      throw new Error(`${id.text}: factory must return the registered concrete class.`);
  }
  const missing = [...declarations].filter((declaration) => !registered.has(declaration));
  if (missing.length)
    throw new Error(
      `Unregistered Page Objects:\n${missing.map((d) => `${d.name?.text ?? "default export"} (${relative(suiteRoot, d.getSourceFile().fileName)})`).join("\n")}`,
    );
  return registered.size;
}

if (import.meta.main) {
  const count = checkSurfaceRegistry();
  console.info(
    `Page Object registry complete: ${count} concrete exported surfaces; no exclusions.`,
  );
}
