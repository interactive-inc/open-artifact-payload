import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vite-plus/test"

// core が @/project から import してよいのはこの契約モジュールだけ。
// .docs/architecture.md の「コード所有境界」の契約と同期すること。
const PROJECT_CONTRACT_MODULES: ReadonlyArray<string> = [
  "@/project/types",
  "@/project/admin/dashboard-tasks",
  "@/project/shared/lib/locale-types",
  "@/project/shared/lib/is-locale",
  "@/project/shared/lib/with-locale-prefix",
  "@/project/shared/lib/get-ui-dictionary",
]

const ROOT_DIR = process.cwd()

const SOURCE_FILE_PATTERN = /\.tsx?$/

// import ... from "...", export ... from "...", import("...") の specifier を拾う。
const IMPORT_SPECIFIER_PATTERN = /(?:\bfrom\s+|\bimport\s*\(?\s*)["']([^"']+)["']/g

const PAGE_SECTION_IMPORT_PATTERN = /@\/project\/pages\/([a-zA-Z0-9_-]+)\/(sections|components)\//

type ImportRecord = {
  file: string
  line: number
  specifier: string
}

function listSourceFiles(relativeDir: string): ReadonlyArray<string> {
  const absoluteDir = path.join(ROOT_DIR, relativeDir)
  const entries = readdirSync(absoluteDir, { recursive: true, withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!SOURCE_FILE_PATTERN.test(entry.name)) continue
    const absoluteFile = path.join(entry.parentPath, entry.name)
    files.push(path.relative(ROOT_DIR, absoluteFile).split(path.sep).join("/"))
  }

  return files
}

function listImports(relativeFile: string): ReadonlyArray<ImportRecord> {
  const content = readFileSync(path.join(ROOT_DIR, relativeFile), "utf8")
  const lines = content.split("\n")
  const records: ImportRecord[] = []

  for (const lineNumber of lines.keys()) {
    const line = lines[lineNumber]
    if (line === undefined) continue
    for (const match of line.matchAll(IMPORT_SPECIFIER_PATTERN)) {
      const specifier = match[1]
      if (specifier === undefined) continue
      records.push({ file: relativeFile, line: lineNumber + 1, specifier })
    }
  }

  return records
}

function withFormattedViolations(records: ReadonlyArray<ImportRecord>): string {
  return records.map((record) => `${record.file}:${record.line} ${record.specifier}`).join("\n")
}

describe("依存方向", () => {
  it("src/core は許可された契約モジュール以外を @/project から import しない", () => {
    const coreFiles = listSourceFiles("src/core")
    const violations: ImportRecord[] = []

    for (const file of coreFiles) {
      for (const record of listImports(file)) {
        if (!record.specifier.startsWith("@/project")) continue
        if (PROJECT_CONTRACT_MODULES.includes(record.specifier)) continue
        violations.push(record)
      }
    }

    expect(violations, withFormattedViolations(violations)).toEqual([])
  })

  it("src/core は @/app や相対パスで src/app または src/project へ抜けない", () => {
    const coreFiles = listSourceFiles("src/core")
    const violations: ImportRecord[] = []

    for (const file of coreFiles) {
      for (const record of listImports(file)) {
        if (record.specifier.startsWith("@/app")) {
          violations.push(record)
          continue
        }
        if (!record.specifier.startsWith(".")) continue
        const resolved = path.posix.normalize(
          path.posix.join(path.posix.dirname(file), record.specifier),
        )
        if (resolved.startsWith("src/app") || resolved.startsWith("src/project")) {
          violations.push(record)
        }
      }
    }

    expect(violations, withFormattedViolations(violations)).toEqual([])
  })

  it("pages/<page>/sections または pages/<page>/components はそのページと src/app 以外から import されない", () => {
    const allFiles = listSourceFiles("src")
    const violations: ImportRecord[] = []

    for (const file of allFiles) {
      for (const record of listImports(file)) {
        const match = record.specifier.match(PAGE_SECTION_IMPORT_PATTERN)
        if (!match) continue
        const page = match[1]
        const allowedPrefix = `src/project/pages/${page}/`
        if (file.startsWith(allowedPrefix)) continue
        if (file.startsWith("src/app/")) continue
        violations.push(record)
      }
    }

    expect(violations, withFormattedViolations(violations)).toEqual([])
  })
})
