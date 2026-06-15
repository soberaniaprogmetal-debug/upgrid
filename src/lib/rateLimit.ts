// Rate limiting simples em memória (para produção, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(ip: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now()
  const key = ip

  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true // permitido
  }

  if (record.count >= maxRequests) {
    return false // bloqueado
  }

  record.count++
  return true // permitido
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0].trim() || realIP || '127.0.0.1'
}
