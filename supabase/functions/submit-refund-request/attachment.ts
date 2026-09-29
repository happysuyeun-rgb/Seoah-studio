export function isOwnedRefundAttachment(path: string | null | undefined, userId: string, orderId: string): boolean {
  if (!path) return true
  if (!userId || !orderId) return false
  if (path.includes('..') || path.includes('\\') || path.includes('\0')) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return false
  const prefix = `${userId}/${orderId}/`
  if (!path.startsWith(prefix)) return false
  const name = path.slice(prefix.length)
  return name.length > 0 && !name.includes('/')
}
