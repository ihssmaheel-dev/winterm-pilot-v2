import { describe, it, expect } from 'vitest'
import { uid, esc, debounce } from '@/lib/utils'

describe('uid', () => {
  it('returns a string', () => {
    expect(typeof uid()).toBe('string')
  })

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()))
    expect(ids.size).toBe(100)
  })
})

describe('esc', () => {
  it('escapes ampersands', () => {
    expect(esc('a&b')).toBe('a&amp;b')
  })

  it('escapes less-than', () => {
    expect(esc('a<b')).toBe('a&lt;b')
  })

  it('escapes greater-than', () => {
    expect(esc('a>b')).toBe('a&gt;b')
  })

  it('escapes double quotes', () => {
    expect(esc('a"b')).toBe('a&quot;b')
  })

  it('escapes single quotes', () => {
    expect(esc("a'b")).toBe('a&#x27;b')
  })

  it('escapes backticks', () => {
    expect(esc('a`b')).toBe('a&#x60;b')
  })

  it('returns safe string unchanged', () => {
    expect(esc('hello world')).toBe('hello world')
  })
})

describe('debounce', () => {
  it('creates a function', () => {
    const fn = debounce(() => {}, 100)
    expect(typeof fn).toBe('function')
  })
})
