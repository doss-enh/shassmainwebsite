import {sql} from '@/lib/db'

export type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  created_at: string
}

export async function listCustomers(): Promise<Customer[]> {
  return sql<Customer[]>`
    select id, name, email, phone, company, created_at from customer order by created_at desc
  `
}
