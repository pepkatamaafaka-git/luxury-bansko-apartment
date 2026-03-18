import { NextResponse } from 'next/server'
import {
  verifyCredentials,
  createAdminToken,
  verifyAdminToken,
  getAdminToken,
  ADMIN_COOKIE,
} from '@/lib/auth'

const COOKIE_OPTIONS = [
  `HttpOnly`,
  `Path=/`,
  `SameSite=Strict`,
  `Max-Age=${8 * 60 * 60}`, // 8 hours
  process.env.NODE_ENV === 'production' ? 'Secure' : '',
]
  .filter(Boolean)
  .join('; ')

// ── POST /api/admin/auth  — login ─────────────────────────────────────────────
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { username, password } = (body as Record<string, unknown>) ?? {}

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 })
  }

  if (!verifyCredentials(username, password)) {
    // Generic message — don't hint whether username or password was wrong
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createAdminToken(username)

  const res = NextResponse.json({ ok: true, token })
  // Also set an httpOnly cookie so browser requests are automatically authenticated
  res.headers.set('Set-Cookie', `${ADMIN_COOKIE}=${token}; ${COOKIE_OPTIONS}`)
  return res
}

// ── GET /api/admin/auth  — check session ──────────────────────────────────────
export async function GET(req: Request) {
  const token = getAdminToken(req)
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

  const payload = verifyAdminToken(token)
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 })

  return NextResponse.json({ authenticated: true, username: payload.sub })
}

// ── DELETE /api/admin/auth  — logout ─────────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `${ADMIN_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`,
  )
  return res
}
