import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAccountsByUser, initDb } from '@/lib/db'
import { getIGMedia } from '@/lib/instagram'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 })
  }

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) return NextResponse.json({ error: 'accountId é obrigatório' }, { status: 400 })

  await initDb()
  const accounts = await getAccountsByUser(session.userId)
  const account = accounts.find(a => a.id === accountId)

  if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

  try {
    const media = await getIGMedia(account.instagramUserId, account.accessToken)
    return NextResponse.json(media)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar mídia'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
