type Props = {
  source: string
  bucketName: string
}

// `/g` を付けると wrangler.jsonc の本番と staging の両方の bucket_name が同じ値で上書きされ、
// staging から本番バケットを参照する事故になる。with-worker-name / with-database-id と同じく
// 先頭一致 (= 本番) のみ置換する。staging の差し替えは案件側で別途行う。
export function withR2BucketName(props: Props): string {
  return props.source.replace(/"bucket_name"\s*:\s*"[^"]*"/, `"bucket_name": "${props.bucketName}"`)
}
