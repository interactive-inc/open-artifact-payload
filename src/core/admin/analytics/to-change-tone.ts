/** 増減の数値から表示の色分けを決める。比べられないとき（null）は変化なしと同じ扱い。 */
export function toChangeTone(change: number | null): "up" | "down" | "flat" {
  if (change === null || change === 0) return "flat"

  return change > 0 ? "up" : "down"
}
