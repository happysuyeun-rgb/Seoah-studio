const FALLBACK = '/my'

export function postLoginPath(explicit: string | null | undefined) {
  if (explicit == null) return FALLBACK
  const value = explicit.trim()
  if (value.length === 0) return FALLBACK
  if (!value.startsWith('/') || value.startsWith('//')) return FALLBACK
  if (value.includes('\\') || value.includes('://')) return FALLBACK
  let decoded = value
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return FALLBACK
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\') || decoded.includes('://')) return FALLBACK
  return value
}

export function takeStoredReturnTo() {
  let stored: string | null = null
  try {
    stored = sessionStorage.getItem('seoah_returnTo')
    sessionStorage.removeItem('seoah_returnTo')
  } catch {
    stored = null
  }
  return postLoginPath(stored)
}

export function requiresAccountType(input: { isOAuth: boolean; isRecent: boolean; accountType: string | null | undefined }) {
  return input.isOAuth && input.isRecent && (input.accountType == null || input.accountType === '')
}

export function destinationAfterSignup(hasSession: boolean) {
  return hasSession ? FALLBACK : null
}
