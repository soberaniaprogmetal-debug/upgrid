import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getInstagramAuthUrl } from '@/lib/instagram'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (!process.env.INSTAGRAM_APP_ID) {
    return NextResponse.json(
      { error: 'Configuração do Instagram não encontrada. Configure INSTAGRAM_APP_ID no .env.local' },
      { status: 503 }
    )
  }

  const url = getInstagramAuthUrl()
  return NextResponse.json({ url })
}
