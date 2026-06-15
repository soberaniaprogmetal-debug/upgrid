import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPostById, updatePost, deletePost, initDb } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  await initDb()
  const post = await getPostById(id)

  if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
  if (post.userId !== session.userId) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  try {
    const body = await request.json()
    const updated = await updatePost(id, body)
    return NextResponse.json({ post: updated })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  await initDb()
  const post = await getPostById(id)

  if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
  if (post.userId !== session.userId) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  await deletePost(id)
  return NextResponse.json({ message: 'Post removido com sucesso' })
}
