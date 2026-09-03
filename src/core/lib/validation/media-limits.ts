/**
 * media コレクションに保存を許可する MIME タイプ。
 * SVG はスクリプトを埋め込めるため既定では許可しない。案件で必要になった場合だけ
 * "image/svg+xml" を追加し、アップロード権限を持つ編集者の範囲を合わせて見直すこと。
 */
export const ALLOWED_MEDIA_MIME_TYPES: ReadonlyArray<string> = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]

/** 1 ファイルあたりの最大バイト数 (10 MB)。 */
export const MEDIA_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** エラー文言に出す上限値 (MB)。 */
export const MEDIA_MAX_FILE_SIZE_MEGABYTES = MEDIA_MAX_FILE_SIZE_BYTES / (1024 * 1024)
