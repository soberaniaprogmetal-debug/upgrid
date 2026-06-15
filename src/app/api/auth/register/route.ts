import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { rateLimit, getClientIP } from '@/lib/rateLimit'
import { initDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  try {
    await initDb()
    const { name, email, password } = await request.json()

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }
    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome muito curto' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres' }, { status: 400 })
    }

    const user = await createUser(name.trim(), email.toLowerCase().trim(), password)
    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({
      message: 'Conta criada com sucesso!',
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
