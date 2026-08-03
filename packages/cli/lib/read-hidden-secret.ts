import { emitKeypressEvents } from 'node:readline'
import type { ReadStream, WriteStream } from 'node:tty'

type Keypress = {
  ctrl?: boolean
  name?: string
}

/** Interactive-only secret input that never echoes the entered value. */
export async function readHiddenSecret(
  prompt: string,
  input: ReadStream = process.stdin,
  output: WriteStream = process.stderr,
): Promise<string | Error> {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    return new Error(
      'Password input requires an interactive terminal. For automation, use OPEN_ARTIFACT_API_KEY.',
    )
  }

  output.write(prompt)
  emitKeypressEvents(input)
  const wasRaw = input.isRaw
  const wasPaused = input.isPaused()
  input.setRawMode(true)
  input.resume()

  return await new Promise((resolve) => {
    let secret = ''

    const finish = (result: string | Error): void => {
      input.removeListener('keypress', onKeypress)
      input.removeListener('error', onError)
      input.setRawMode(wasRaw)
      if (wasPaused) input.pause()
      output.write('\n')
      resolve(result)
    }
    const onError = (): void => finish(new Error('Unable to read password from the terminal'))
    const onKeypress = (character: string | undefined, key: Keypress): void => {
      if (key.ctrl && key.name === 'c') {
        finish(new Error('Login cancelled'))
        return
      }
      if (key.ctrl && key.name === 'd') {
        finish(new Error('Password input ended before Enter was pressed'))
        return
      }
      if (key.name === 'return' || key.name === 'enter') {
        finish(secret.length > 0 ? secret : new Error('Password must not be empty'))
        return
      }
      if (key.name === 'backspace') {
        secret = Array.from(secret).slice(0, -1).join('')
        return
      }
      if (!key.ctrl && typeof character === 'string' && character.length > 0) secret += character
    }

    input.on('error', onError)
    input.on('keypress', onKeypress)
  })
}
