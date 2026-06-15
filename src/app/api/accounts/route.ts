import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAccountsByUser, initDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  await initDb()
  const accounts = await getAccountsByUser(session.userId)

  // Não retornar o accessToken por segurança
  const safeAccounts = accounts.map(({ accessToken: _, ...acc }) => acc)

  return NextResponse.json({ accounts: safeAccounts })
}
