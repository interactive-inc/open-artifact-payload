type Props = {
  current: number
  previous: number
}

/** 前の期間からの増減率（百分率の整数）。前の期間が0なら比べられないので null。 */
export function calculateChangeRate(props: Props): number | null {
  if (props.previous === 0) return null

  return Math.round(((props.current - props.previous) / props.previous) * 100)
}
