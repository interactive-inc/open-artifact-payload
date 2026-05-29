export function withDatabaseId(source: string, databaseId: string): string {
  return source.replace(/"database_id"\s*:\s*"[^"]*"/, `"database_id": "${databaseId}"`)
}

export function withR2BucketName(source: string, bucketName: string): string {
  return source.replace(/"bucket_name"\s*:\s*"[^"]*"/g, `"bucket_name": "${bucketName}"`)
}

export function withWorkerName(source: string, name: string): string {
  return source.replace(/"name"\s*:\s*"[^"]*"/, `"name": "${name}"`)
}
