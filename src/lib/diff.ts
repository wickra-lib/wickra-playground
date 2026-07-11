/** The result of a byte-exact comparison across report strings. */
export interface DiffResult {
  /** True iff every string equals the first one, byte for byte. */
  identical: boolean
  /**
   * Per input, the index of the first character that differs from the reference
   * (the first input), or `-1` if it is identical to the reference.
   */
  firstDiff: number[]
}

/**
 * Byte-exact comparison of report strings — **no JSON normalization**. The
 * strings are equal iff every one matches the first exactly; any drift is a
 * real difference, not a formatting artifact, because each runner returns the
 * core's response verbatim.
 */
export function compare(strings: string[]): DiffResult {
  if (strings.length === 0) {
    return { identical: true, firstDiff: [] }
  }
  const reference = strings[0]
  const firstDiff = strings.map((s) => firstDifferingIndex(reference, s))
  return { identical: firstDiff.every((i) => i === -1), firstDiff }
}

/** The index of the first differing character, or `-1` if the strings are equal. */
export function firstDifferingIndex(a: string, b: string): number {
  if (a === b) {
    return -1
  }
  const shared = Math.min(a.length, b.length)
  for (let i = 0; i < shared; i += 1) {
    if (a[i] !== b[i]) {
      return i
    }
  }
  // One string is a prefix of the other; they diverge at the length boundary.
  return shared
}
