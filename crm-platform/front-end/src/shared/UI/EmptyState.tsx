export function EmptyState({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-[#DFE3DC] p-8 text-center">
      <p className="text-[13px] text-[#6C716A]">{title}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}