/** YYYY-MM-DD を「月/日」にする。グラフの軸に使う。 */
export function formatShortDate(date: string): string {
  const parts = date.split("-").map(Number)

  return `${parts[1]}/${parts[2]}`
}
