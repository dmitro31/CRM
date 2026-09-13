export function formatCommentContent(content: string): React.ReactNode[] {
  const pattern = /@\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    parts.push(
      <span key={key++} className="rounded bg-[#E7EEE9] px-1 font-medium text-[#24493B]">
        @{match[1]}
      </span>,
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}