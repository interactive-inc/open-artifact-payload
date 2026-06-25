type Props = {
  source: string
  name: string
}

export function withWorkerName(props: Props): string {
  return props.source.replace(/"name"\s*:\s*"[^"]*"/, `"name": "${props.name}"`)
}
