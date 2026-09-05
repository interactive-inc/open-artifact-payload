const previewOrigin = "https://preview.invalid"

/** URL解釈による正規化の前後で、自サイト内のパスであることを検証する。 */
export function toSafePreviewPath(path: string | null): string {
  if (!path?.startsWith("/")) return "/"
  for (const character of path) {
    const code = character.charCodeAt(0)
    if (code <= 31 || code === 127 || character === "\\") return "/"
  }

  try {
    const url = new URL(path, previewOrigin)
    if (url.origin !== previewOrigin || url.pathname.startsWith("//")) return "/"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/"
  }
}
