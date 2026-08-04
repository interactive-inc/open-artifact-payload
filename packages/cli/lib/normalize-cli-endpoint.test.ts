import { describe, expect, test } from 'vite-plus/test'

import { normalizeCliEndpoint } from './normalize-cli-endpoint'

describe('normalizeCliEndpoint', () => {
  test('allows HTTPS and loopback HTTP endpoints', () => {
    expect(normalizeCliEndpoint('https://cms.example.com/')).toBe('https://cms.example.com')
    expect(normalizeCliEndpoint('http://localhost:3000/')).toBe('http://localhost:3000')
    expect(normalizeCliEndpoint('http://inta.localhost:3000/')).toBe('http://inta.localhost:3000')
    expect(normalizeCliEndpoint('http://[::1]:3000/')).toBe('http://[::1]:3000')
  })

  test('rejects cleartext remote endpoints and embedded secrets', () => {
    expect(normalizeCliEndpoint('http://cms.example.com')).toBeInstanceOf(Error)
    expect(normalizeCliEndpoint('https://user:secret@cms.example.com')).toBeInstanceOf(Error)
    expect(normalizeCliEndpoint('https://cms.example.com?token=secret')).toBeInstanceOf(Error)
  })
})
