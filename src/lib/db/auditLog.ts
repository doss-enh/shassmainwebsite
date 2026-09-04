import {sql} from '@/lib/db'

export type AuditLogEntry = {
  id: string
  actor: string
  action: string
  target: string | null
  metadata: unknown
  created_at: string
}

export async function logAudit(entry: {actor: string; action: string; target?: string; metadata?: unknown}) {
  try {
    await sql`
      insert into audit_log (actor, action, target, metadata)
      values (${entry.actor}, ${entry.action}, ${entry.target || null}, ${entry.metadata ? JSON.stringify(entry.metadata) : null})
    `
  } catch {
    // Audit logging must never break the action it's logging.
  }
}

export async function listRecentAuditLog(limit = 50): Promise<AuditLogEntry[]> {
  try {
    return await sql<AuditLogEntry[]>`
      select id, actor, action, target, metadata, created_at
      from audit_log
      order by created_at desc
      limit ${limit}
    `
  } catch {
    return []
  }
}
