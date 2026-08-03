export function formatCliOutput(input: string): string | Error {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return new Error('CLI received an invalid JSON response')
  }

  return `${JSON.stringify(parsed, null, 2)}\n`
}
