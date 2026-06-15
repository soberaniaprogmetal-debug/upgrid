import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { findUserById, initDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  await initDb()
  const user = await findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  })
}
