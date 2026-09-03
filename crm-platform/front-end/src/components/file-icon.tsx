export function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <span>🖼️</span>
  if (mimeType === 'application/pdf') return <span>📄</span>
  if (mimeType.includes('word')) return <span>📝</span>
  return <span>📎</span>
}