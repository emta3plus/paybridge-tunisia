import { createHash, randomBytes, pbkdf2Sync } from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const ITERATIONS = 100000
const DIGEST = 'sha512'

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, storedHash] = hashedPassword.split(':')
  if (!salt || !storedHash) return false
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
  return hash === storedHash
}
