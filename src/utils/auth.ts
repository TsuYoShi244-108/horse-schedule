import { getAuthEntry, saveAuthEntry } from '../lib/firestoreDB'

export const DEFAULT_PIN = '1234'

// ── SubtleCrypto ヘルパー ────────────────────────────

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexDecode(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return arr
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 100_000 },
    keyMaterial,
    256
  )
}

async function hashPin(pin: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hashBuf = await deriveKey(pin, salt)
  return { salt: hexEncode(salt.buffer), hash: hexEncode(hashBuf) }
}

async function verifyEntry(pin: string, entry: { salt: string; hash: string }): Promise<boolean> {
  const salt = hexDecode(entry.salt)
  const hashBuf = await deriveKey(pin, salt)
  return hexEncode(hashBuf) === entry.hash
}

// ── 公開 API ─────────────────────────────────────────

/** PINを検証する（未設定の場合はデフォルトPIN "1234" と照合） */
export async function verifyPin(instructorId: string, pin: string): Promise<boolean> {
  const entry = await getAuthEntry(instructorId)
  if (!entry) {
    return pin === DEFAULT_PIN
  }
  return verifyEntry(pin, entry)
}

/** PINを設定・変更する */
export async function setPin(instructorId: string, newPin: string): Promise<void> {
  const entry = await hashPin(newPin)
  await saveAuthEntry(instructorId, entry)
}
