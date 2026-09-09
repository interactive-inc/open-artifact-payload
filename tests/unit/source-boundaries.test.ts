import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"
import { describe, expect, it } from "vite-plus/test"

// .docs/architecture.mdの契約と同期する。互換用aliasやfacadeは置かない。
const coreContracts = new Set([
  "src/cms/types",
  "src/cms/admin/dashboard-tasks",
  "src/i18n/locale-types",
  "src/i18n/is-locale",
  "src/i18n/with-locale-prefix",
  "src/i18n/get-ui-dictionary",
])
const frontend = "src/app/(frontend)"
const inquiry = "src/core/inquiry"
const businessRoots = ["src/cms", "src/seo", "src/i18n", "src/scripts", inquiry]
const within = (file: string, root: string) => file === root || file.startsWith(`${root}/`)
const modulePath = (file: string) => file.replace(/\.[cm]?[jt]sx?$/, "").replace(/\/index$/, "")

type Reference = { specifier: string; target: string | null }

function targetPath(file: string, specifier: string, component: boolean) {
  const clean = specifier.split("#")[0]
  if (clean.startsWith("@/")) return modulePath(path.posix.normalize(`src/${clean.slice(2)}`))
  if (clean.startsWith("."))
    return modulePath(path.posix.join(component ? "src" : path.posix.dirname(file), clean))
  return null
}

function references(file: string, source: ts.SourceFile) {
  const found = new Map<number, Reference>()
  const add = (node: ts.Node, component = false) => {
    const specifier = ts.isStringLiteralLike(node)
      ? node.text
      : ts.isTemplateExpression(node)
        ? node.head.text
        : null
    if (specifier === null) return
    const position = node.getStart(source)
    if (!found.has(position))
      found.set(position, { specifier, target: targetPath(file, specifier, component) })
  }
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) add(node.moduleSpecifier)
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node.argument.literal)
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      if (node.moduleReference.expression) add(node.moduleReference.expression)
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      if (node.arguments[0]) add(node.arguments[0])
    }
    if (
      ts.isStringLiteralLike(node) &&
      (node.text.startsWith("@/") || node.text.startsWith("./"))
    ) {
      // Payload's component strings are resolved relative to importMap.baseDir (src).
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isPropertyAssignment(parent) && parent.name.getText(source) === "components") {
          add(node, true)
          break
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return [...found.values()]
}

function dependencyViolations(file: string, refs: Reference[]) {
  const pure =
    !/\.test\.tsx?$/.test(file) &&
    (within(file, `${inquiry}/domain`) || within(file, `${inquiry}/application`))
  return refs.flatMap((reference) => {
    const target = reference.target
    const error = `${file} -> ${reference.specifier}`
    if (target && within(target, "src/project")) return [`Old project reference: ${error}`]
    if (
      target &&
      within(file, "src/core") &&
      (within(target, "src/app") ||
        [...businessRoots.slice(0, 4)].some((root) => within(target, root))) &&
      !coreContracts.has(target)
    )
      return [`Core contract: ${error}`]
    if (
      target &&
      businessRoots.some((root) => within(file, root)) &&
      (within(target, frontend) || within(target, "src/core/frontend"))
    )
      return [`Business to public UI: ${error}`]
    if (
      pure &&
      !(
        target &&
        (within(target, `${inquiry}/domain`) ||
          (within(file, `${inquiry}/application`) && within(target, `${inquiry}/application`)))
      )
    )
      return [`Pure inquiry dependency: ${error}`]
    const privateFolder = target?.match(
      /^(src\/app\/\(frontend\)\/\[locale\](?:\/[^_][^/]*)*)\/_(?:components|sections|styles|data|lib|hooks|ui)(?:\/|$)/,
    )
    if (privateFolder) {
      const owner = privateFolder[1]
      if (!within(file, owner)) return [`Route private module: ${error}`]
      // Root-page helpers belong to the home page, not every nested locale route.
      if (
        owner === `${frontend}/[locale]` &&
        file.slice(owner.length + 1).includes("/") &&
        !file.slice(owner.length + 1).startsWith("_")
      )
        return [`Home private module: ${error}`]
    }
    return []
  })
}

function ambientViolations(file: string, source: ts.SourceFile) {
  if (
    /\.test\.tsx?$/.test(file) ||
    !["domain", "application"].some((scope) => within(file, `${inquiry}/${scope}`))
  )
    return []
  const forbidden = new Set([
    "process",
    "Bun",
    "Deno",
    "fetch",
    "WebSocket",
    "XMLHttpRequest",
    "setTimeout",
    "setInterval",
    "crypto",
  ])
  const options: ts.CompilerOptions = { noLib: true, noResolve: true, types: [] }
  const host = ts.createCompilerHost(options)
  host.getSourceFile = (name) => (name === file ? source : undefined)
  const checker = ts.createProgram([file], options, host).getTypeChecker()
  const failures: string[] = []
  const visit = (node: ts.Node) => {
    const globalIdentifier =
      ts.isIdentifier(node) &&
      forbidden.has(node.text) &&
      !(
        "name" in node.parent &&
        node.parent.name === node &&
        !ts.isShorthandPropertyAssignment(node.parent)
      ) &&
      !(ts.isBindingElement(node.parent) && node.parent.propertyName === node) &&
      !(ts.isShorthandPropertyAssignment(node.parent)
        ? checker.getShorthandAssignmentValueSymbol(node.parent)?.declarations?.length
        : checker.getSymbolAtLocation(node)?.declarations?.length)
    const globalProperty =
      (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
      ts.isIdentifier(node.expression) &&
      ["globalThis", "window", "self", "global"].includes(node.expression.text) &&
      forbidden.has(
        ts.isPropertyAccessExpression(node)
          ? node.name.text
          : ts.isStringLiteralLike(node.argumentExpression)
            ? node.argumentExpression.text
            : "",
      )
    const meta = ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword
    if (globalIdentifier || globalProperty || meta)
      failures.push(`${file}: ambient IO ${node.getText(source)}`)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return failures
}

function inspect(file: string, text: string) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  return [
    ...dependencyViolations(file, references(file, source)),
    ...ambientViolations(file, source),
  ]
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`
    return entry.isDirectory() ? sourceFiles(file) : /\.[cm]?[jt]sx?$/.test(file) ? [file] : []
  })
}

describe("source ownership and dependency direction", () => {
  it("keeps core contracts, route ownership and pure inquiry boundaries", () => {
    expect(sourceFiles("src").flatMap((file) => inspect(file, readFileSync(file, "utf8")))).toEqual(
      [],
    )
    expect(existsSync("src/project")).toBe(false)
  })

  it.each([
    'import type { UI } from "@/app/(frontend)/_components/ui"',
    'import "../app/(frontend)/_styles/site.css"',
    'export { UI } from "@/app/(frontend)/_components/ui"',
    'const ui = import("@/app/(frontend)/_components/ui")',
    "const ui = import(`@/app/(frontend)/_components/${name}`)",
    'type UI = import("@/app/(frontend)/_components/ui").UI',
    'const ui = require("@/app/(frontend)/_components/ui")',
    'const admin = { components: { Field: "@/app/(frontend)/_components/ui#UI" } }',
    'const admin = { components: { Field: { path: "./app/(frontend)/_components/ui", exportName: "UI" } } }',
  ])("rejects reverse UI dependencies: %s", (text) => {
    expect(inspect("src/cms/example.ts", text)).toHaveLength(1)
  })

  it("allows exactly the six core contracts through direct and relative imports", () => {
    for (const contract of coreContracts) {
      expect(
        inspect("src/core/example.ts", `import { value } from "@/${contract.slice(4)}"`),
      ).toEqual([])
      expect(
        inspect("src/core/example.ts", `import { value } from "../${contract.slice(4)}"`),
      ).toEqual([])
    }
    expect(
      inspect("src/core/example.ts", 'import { value } from "@/cms/collections/works"'),
    ).toHaveLength(1)
    expect(inspect("src/core/example.ts", 'import { value } from "../project/types"')).toHaveLength(
      1,
    )
  })

  it.each([
    "payload",
    "next/headers",
    "@opennextjs/cloudflare",
    "node:fs",
    "fs/promises",
    "@/payload.config",
    "@/core/inquiry/infrastructure/save-contact-submission",
  ])("rejects SDK and connection dependency %s from pure layers", (specifier) => {
    for (const scope of ["domain", "application"])
      expect(
        inspect(`${inquiry}/${scope}/example.ts`, `import { value } from "${specifier}"`),
      ).toHaveLength(1)
  })

  it.each([
    "process.env.SECRET",
    "const { env } = process",
    "import.meta.env.SECRET",
    'import.meta["env"].SECRET',
    "globalThis.process.env.SECRET",
    'fetch("https://example.test")',
    "const io = { fetch }",
    'globalThis["fetch"]("https://example.test")',
    'Bun.file("file")',
    "Deno.env.get('KEY')",
    "setTimeout(callback, 1000)",
  ])("rejects ambient environment access: %s", (text) => {
    expect(inspect(`${inquiry}/application/example.ts`, text).length).toBeGreaterThan(0)
  })

  it("allows pure values and injected operations, without interpreting comments or URLs", () => {
    expect(
      inspect(
        `${inquiry}/application/example.ts`,
        `import type { Fields } from "../domain/contact-form-fields"
      // import { UI } from "@/app/(frontend)/_components/ui"
      const url = "/contact"
      function accept(fields: Fields, ports: { fetch: (fields: Fields) => void }) { ports.fetch(fields) }`,
      ),
    ).toEqual([])
    expect(
      inspect(
        `${inquiry}/application/example.ts`,
        "function accept(fetch: () => void) { fetch() }",
      ),
    ).toEqual([])
    expect(
      inspect(
        `${inquiry}/domain/example.ts`,
        'import { value } from "../application/accept-contact"',
      ),
    ).toHaveLength(1)
  })

  it("keeps page-private assets inside their URL subtree", () => {
    const work =
      'import { labels } from "@/app/(frontend)/[locale]/works/_lib/work-category-labels"'
    expect(inspect(`${frontend}/[locale]/works/[slug]/page.tsx`, work)).toEqual([])
    expect(inspect(`${frontend}/[locale]/news/page.tsx`, work)).toHaveLength(1)
    const home = 'import { HomeGrid } from "@/app/(frontend)/[locale]/_sections/home-grid"'
    expect(inspect(`${frontend}/[locale]/page.tsx`, home)).toEqual([])
    expect(inspect(`${frontend}/[locale]/about/page.tsx`, home)).toHaveLength(1)
  })
})
