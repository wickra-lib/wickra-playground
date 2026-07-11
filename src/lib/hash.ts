/**
 * SHA-256 of a UTF-8 string, hex-encoded, via the Web Crypto API. Used as the
 * shareable "proof hash" of a report: identical report strings produce the same
 * digest, so one hash across every panel is the byte-identity claim in a line.
 */
export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
