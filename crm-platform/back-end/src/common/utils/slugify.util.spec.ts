import { slugify } from './slugify.util'
import { describe, expect, it } from '@jest/globals'

describe('slugify', () => {
  it('transliterates Ukrainian Cyrillic to Latin', () => {
    expect(slugify('Клієнти')).toBe('kliyenty')
  })

  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Моя CRM')).toBe('moya-crm')
  })

  it('strips apostrophes', () => {
    expect(slugify("Ім'я")).toBe('imya')
  })

  it('collapses multiple separators into one dash', () => {
    expect(slugify('Тест   з   пробілами')).toBe('test-z-probilamy')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('--тест--')).toBe('test')
  })

  it('returns fallback for empty or fully-stripped input', () => {
    expect(slugify('!!!', 'module')).toBe('module')
  })
})