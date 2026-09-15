export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#171A18]">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[12px] text-[#B3261E]">{error}</p>}
    </div>
  )
}