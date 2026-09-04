import {sql} from '@/lib/db'
import {hashPassword} from '@/lib/auth'
import type {Role} from '@/lib/roles'

export type ConsoleUser = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  created_at: string
}

export async function listUsers(): Promise<ConsoleUser[]> {
  return sql<ConsoleUser[]>`
    select id, name, email, role, active, created_at from app_user order by created_at asc
  `
}

export async function createUser(input: {name: string; email: string; password: string; role: Role}) {
  await sql`
    insert into app_user (name, email, password_hash, role, active)
    values (${input.name}, ${input.email}, ${hashPassword(input.password)}, ${input.role}, true)
  `
}

export async function setUserActive(id: string, active: boolean) {
  await sql`update app_user set active = ${active} where id = ${id}`
}
