import {ROLES, PERMISSIONS, can} from '@/lib/roles'
import {PageHeader} from '@/components/admin/PageHeader'

export const dynamic = 'force-dynamic'

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles"
        description="Roles are a fixed set defined in code (src/lib/roles.ts), so the permissions matrix and its enforcement can never drift apart."
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-black/[0.015] text-left text-xs font-semibold uppercase tracking-wide text-muted-2">
              <th className="px-4 py-3">Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="px-4 py-3 text-center capitalize">
                  {r.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PERMISSIONS.map((p) => (
              <tr key={p}>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{p}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-4 py-3 text-center">
                    {can(r, p) ? <span className="text-success">✓</span> : <span className="text-muted-2">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
