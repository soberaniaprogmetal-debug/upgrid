import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPostsByUser, createPost, initDb } from '@/lib/db'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  await initDb()
  const posts = await getPostsByUser(session.userId)
  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 })
  }

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    await initDb()
    const body = await request.json()
    const { caption, mediaUrl, mediaType, accountId, scheduledAt } = body

    if (!caption && !mediaUrl) {
      return NextResponse.json({ error: 'É necessário uma legenda ou mídia' }, { status: 400 })
    }
    if (!accountId) {
      return NextResponse.json({ error: 'Selecione uma conta do Instagram' }, { status: 400 })
    }

    const status = scheduledAt ? 'scheduled' : 'draft'
    const post = await createPost({
      userId: session.userId,
      accountId,
      caption: caption || '',
      mediaUrl,
      mediaType: mediaType || 'IMAGE',
      status,
      scheduledAt,
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar post' }, { status: 500 })
  }
}
