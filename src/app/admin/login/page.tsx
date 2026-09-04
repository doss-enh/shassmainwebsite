export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{next?: string; error?: string}>
}) {
  const params = await searchParams
  const next = params.next || '/admin/dashboard'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
            SG
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">Shass Console</div>
            <div className="text-xs text-muted">Corporate gifts · Dubai</div>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-semibold text-foreground">Sign in</h1>
        <p className="mb-6 text-sm text-muted">Enter the console password to continue.</p>

        {params.error && (
          <div className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            Incorrect password. Please try again.
          </div>
        )}

        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
