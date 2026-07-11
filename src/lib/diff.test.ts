import { describe, expect, it } from 'vitest'
import { compare, firstDifferingIndex } from './diff'

describe('firstDifferingIndex', () => {
  it('returns -1 for equal strings', () => {
    expect(firstDifferingIndex('abc', 'abc')).toBe(-1)
  })

  it('returns the first differing character index', () => {
    expect(firstDifferingIndex('abcd', 'abXd')).toBe(2)
  })

  it('returns the length boundary when one is a prefix of the other', () => {
    expect(firstDifferingIndex('abc', 'abcd')).toBe(3)
  })
})

describe('compare', () => {
  it('reports identical for an empty input', () => {
    expect(compare([])).toEqual({ identical: true, firstDiff: [] })
  })

  it('reports identical when every string matches the first', () => {
    const result = compare(['{"a":1}', '{"a":1}', '{"a":1}'])
    expect(result.identical).toBe(true)
    expect(result.firstDiff).toEqual([-1, -1, -1])
  })

  it('reports a difference and pinpoints where it starts', () => {
    const result = compare(['{"a":1}', '{"a":2}'])
    expect(result.identical).toBe(false)
    expect(result.firstDiff).toEqual([-1, 5])
  })

  it('does not normalize JSON — key order and whitespace matter', () => {
    // Semantically equal JSON, different bytes: a real difference here.
    expect(compare(['{"a":1,"b":2}', '{"b":2,"a":1}']).identical).toBe(false)
    expect(compare(['{"a":1}', '{ "a": 1 }']).identical).toBe(false)
  })
})
