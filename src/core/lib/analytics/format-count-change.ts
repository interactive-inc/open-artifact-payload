type Props = {
  current: number
  previous: number
}

/** 件数の差を「▲2件」の形にする。件数が少ない問い合わせは率より差のほうが読みやすい。 */
export function formatCountChange(props: Props): string {
  const difference = props.current - props.previous

  if (difference > 0) return `▲${difference}件`

  if (difference < 0) return `▼${Math.abs(difference)}件`

  return "±0件"
}
