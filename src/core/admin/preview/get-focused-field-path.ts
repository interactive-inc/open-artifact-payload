const arrayRowIdPattern = /^(.+)-row-(\d+)$/

const fieldIdPrefix = "field-"

/**
 * 管理画面でフォーカスされた要素から Payload のフィールドパス（例 profile.rows.0.label）を求める。
 * 編集フォームの外、またはフィールドに属さない要素は null
 */
export function getFocusedFieldPath(element: Element): string | null {
  if (element.closest("form") === null) return null

  return findFieldPath(element)
}

/** フォームに達するまで祖先をたどり、最も内側のフィールドのパスを返す */
function findFieldPath(element: Element): string | null {
  if (element instanceof HTMLFormElement) return null

  const path = readFieldPath(element)
  if (path !== null) return path

  if (element.parentElement === null) return null

  return findFieldPath(element.parentElement)
}

/**
 * Payload が描画する印から読む。リッチテキストは data-field-path、入力欄は name、
 * フィールドの枠は id="field-a__b"、配列の行は id="a-b-row-0" に現れる
 */
function readFieldPath(element: Element): string | null {
  if (element instanceof HTMLElement && element.dataset.fieldPath) return element.dataset.fieldPath

  const controlName = readControlName(element)
  if (controlName) return controlName

  if (element.id.startsWith(fieldIdPrefix)) {
    return element.id.slice(fieldIdPrefix.length).replaceAll("__", ".")
  }

  const row = arrayRowIdPattern.exec(element.id)
  if (row === null) return null

  return `${row[1].replaceAll("-", ".")}.${row[2]}`
}

/** 入力欄の name は Payload のパスそのもの */
function readControlName(element: Element): string | null {
  if (element instanceof HTMLInputElement) return element.name

  if (element instanceof HTMLTextAreaElement) return element.name

  if (element instanceof HTMLSelectElement) return element.name

  return null
}
