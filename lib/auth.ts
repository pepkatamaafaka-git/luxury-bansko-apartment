import { createHmac, timingSafeEqual } from 'crypto'

// ─── Config ──────────────────────────────────────────────────────────────────
if (!process.env.ADMIN_JWT_SECRET) throw new Error('ADMIN_JWT_SECRET env var is required')
const SECRET = process.env.ADMIN_JWT_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours
export const ADMIN_COOKIE = 'admin_session'

// ─── Token payload ───────────────────────────────────────────────────────────
interface TokenPayload {
  sub: string // username
  exp: number // unix ms
}

// ─── Token helpers ───────────────────────────────────────────────────────────
export function createAdminToken(username: string): string {
  const payload: TokenPayload = {
    sub: username,
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyAdminToken(token: string): TokenPayload | null {
  try {
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return null

    const data = token.slice(0, lastDot)
    const sig = token.slice(lastDot + 1)

    const expected = createHmac('sha256', SECRET).update(data).digest('base64url')
    const sigBuf = Buffer.from(sig, 'utf8')
    const expBuf = Buffer.from(expected, 'utf8')

    // Pad to equal length before timingSafeEqual
    const maxLen = Math.max(sigBuf.length, expBuf.length)
    const paddedSig = Buffer.concat([sigBuf, Buffer.alloc(maxLen - sigBuf.length)])
    const paddedExp = Buffer.concat([expBuf, Buffer.alloc(maxLen - expBuf.length)])
    if (!timingSafeEqual(paddedSig, paddedExp) || sigBuf.length !== expBuf.length) return null

    const payload: TokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// ─── Credential verification ─────────────────────────────────────────────────
export function verifyCredentials(username: string, password: string): boolean {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return false
  // HMAC the inputs — produces same-length (32-byte) buffers for timing-safe comparison
  const hmacInput = createHmac('sha256', SECRET)
    .update(`${username}:${password}`)
    .digest()
  const hmacValid = createHmac('sha256', SECRET)
    .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)
    .digest()
  return timingSafeEqual(hmacInput, hmacValid)
}

// ─── Request auth extraction ──────────────────────────────────────────────────
export function getAdminToken(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const auth = req.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()

  // 2. Cookie
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(new RegExp(`${ADMIN_COOKIE}=([^;\\s]+)`))
  return match?.[1] ?? null
}

export function requireAdmin(req: Request): boolean {
  const token = getAdminToken(req)
  if (!token) return false
  return verifyAdminToken(token) !== null
}
