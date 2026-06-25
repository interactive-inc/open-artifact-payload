type Props = {
  source: string
  databaseId: string
}

export function withDatabaseId(props: Props): string {
  return props.source.replace(/"database_id"\s*:\s*"[^"]*"/, `"database_id": "${props.databaseId}"`)
}
