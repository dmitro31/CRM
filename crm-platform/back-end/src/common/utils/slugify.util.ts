const TRANSLITERATION: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e',
  є: 'ye', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'shch', ю: 'yu', я: 'ya', ь: '', "'": '',
  '’': '', ъ: '', ы: 'y', э: 'e', ё: 'yo',
}

export function slugify(
  value: string,
  fallback = 'item',
): string {
  const normalized = value
    .toLowerCase()
    .split('')
    .map(char => TRANSLITERATION[char] ?? char)
    .join('')

  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

  return slug || fallback
}