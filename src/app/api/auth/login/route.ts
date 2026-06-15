import { NextRequest, NextResponse } from 'next/server'
import { validateUser, initDb } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
  }

  try {
    await initDb()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const user = await validateUser(email.toLowerCase().trim(), password)
    if (!user) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({
      message: 'Login realizado com sucesso!',
      user: { id: user.id, name: user.name, email: user.email },
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
