type ParsedCliRequest = {
  request: Request
  help: boolean
}

const commandSegmentPattern = /^[a-z]+(?:-[a-z]+)*$/
const booleanFlags = new Set(['draft'])

export function toCliRequest(argv: ReadonlyArray<string>): ParsedCliRequest | Error {
  const segments: string[] = []
  const body: Record<string, string> = {}
  let help = false
  let index = 0

  while (index < argv.length) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') {
      help = true
      index += 1
      continue
    }

    if (argument.startsWith('--')) {
      const equalsIndex = argument.indexOf('=')
      const key = argument.slice(2, equalsIndex === -1 ? undefined : equalsIndex)
      if (!commandSegmentPattern.test(key)) return new Error(`Invalid flag: ${argument}`)

      if (equalsIndex !== -1) {
        body[key] = argument.slice(equalsIndex + 1)
        index += 1
        continue
      }

      const nextArgument = argv[index + 1]
      if (nextArgument === undefined || nextArgument.startsWith('-')) {
        if (!booleanFlags.has(key)) return new Error(`--${key} requires a value`)
        body[key] = 'true'
        index += 1
        continue
      }

      body[key] = nextArgument
      index += 2
      continue
    }

    if (argument.startsWith('-')) return new Error(`Unknown flag: ${argument}`)
    if (!commandSegmentPattern.test(argument)) return new Error(`Invalid command: ${argument}`)

    segments.push(argument)
    index += 1
  }

  const path = segments.length === 0 ? '/' : `/${segments.join('/')}`
  return {
    request: new Request(`http://cli${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    help,
  }
}
