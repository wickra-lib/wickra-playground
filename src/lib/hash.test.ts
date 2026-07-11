import { describe, expect, it } from 'vitest'
import { sha256 } from './hash'

describe('sha256', () => {
  it('matches the known digest of the empty string', async () => {
    expect(await sha256('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('matches the known digest of "abc"', async () => {
    expect(await sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('is stable and hex-encoded (64 chars)', async () => {
    const a = await sha256('wickra')
    const b = await sha256('wickra')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is UTF-8 sensitive', async () => {
    expect(await sha256('é')).not.toBe(await sha256('e'))
  })
})
