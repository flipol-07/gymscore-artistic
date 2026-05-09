// Cookie HttpOnly firmada (HMAC-SHA256) que prueba que el usuario verifico
// la contrasena del evento. NUNCA almacenamos la contrasena ni el hash.
//
// Estructura del payload (base64url(JSON)):
//   { cid: <uuid>, exp: <unix-seconds> }
// Cookie: `${base64url(payload)}.${base64url(hmac)}`

import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_PREFIX = 'gs_event_'
const TTL_SECONDS = 60 * 60 * 12 // 12 h

function getSecret(): string {
  const s = process.env.EVENT_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error(
      'EVENT_SESSION_SECRET ausente o demasiado corta (>=32 chars). Define la variable de entorno.',
    )
  }
  return s
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf, 'utf8') : buf
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Buffer.from(s, 'base64')
}

function sign(payloadB64: string): string {
  return b64urlEncode(createHmac('sha256', getSecret()).update(payloadB64).digest())
}

export function cookieNameFor(competitionId: string): string {
  return `${COOKIE_PREFIX}${competitionId}`
}

export async function issueEventSession(competitionId: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const payload = b64urlEncode(JSON.stringify({ cid: competitionId, exp }))
  const sig = sign(payload)
  const cookieStore = await cookies()
  cookieStore.set(cookieNameFor(competitionId), `${payload}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_SECONDS,
  })
}

export async function clearEventSession(competitionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(cookieNameFor(competitionId), '', { path: '/', maxAge: 0 })
}

export async function hasValidEventSession(competitionId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(cookieNameFor(competitionId))?.value
  if (!raw) return false

  const [payloadB64, sig] = raw.split('.')
  if (!payloadB64 || !sig) return false

  const expected = sign(payloadB64)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  try {
    const payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8')) as {
      cid: string
      exp: number
    }
    if (payload.cid !== competitionId) return false
    if (payload.exp <= Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}
