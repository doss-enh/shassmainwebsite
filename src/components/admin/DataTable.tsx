export type Column<T> = {
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends {_id: string}>({
  columns,
  rows,
  emptyMessage = 'Nothing here yet.',
}: {
  columns: Column<T>[]
  rows: T[]
  emptyMessage?: string
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-black/[0.015] text-left text-xs font-semibold uppercase tracking-wide text-muted-2">
            {columns.map((col) => (
              <th key={col.header} className={`whitespace-nowrap px-4 py-3 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row._id} className="transition-colors hover:bg-black/[0.02]">
              {columns.map((col) => (
                <td key={col.header} className={`whitespace-nowrap px-4 py-3 align-middle text-foreground ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
