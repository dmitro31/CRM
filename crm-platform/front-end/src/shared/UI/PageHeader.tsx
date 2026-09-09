export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-medium text-[#171A18]">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-[#6C716A]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}