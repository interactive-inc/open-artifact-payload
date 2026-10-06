"use client"

import { useRowLabel } from "@payloadcms/ui"

type Props = {
  fieldName: string
  fallback: string
}

/**
 * 繰り返し項目の見出しに、行の入力値（項目名・拠点名など）を表示する。
 * Payload 標準は「Row 01」と連番だけを出すため、どの行か開かないと分からない。
 * 未入力の行は標準と同じく「<fallback> 01」の連番にする。
 */
export function ArrayRowLabel(props: Props) {
  const rowLabel = useRowLabel<Record<string, unknown>>()

  const value = rowLabel.data?.[props.fieldName]

  if (typeof value === "string" && value.trim() !== "") {
    return <span>{value}</span>
  }

  const rowNumber = String((rowLabel.rowNumber ?? 0) + 1).padStart(2, "0")

  return <span>{`${props.fallback} ${rowNumber}`}</span>
}
