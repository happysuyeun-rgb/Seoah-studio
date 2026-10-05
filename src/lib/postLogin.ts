export function postLoginPath(explicit: string | null | undefined) {
  if (explicit && explicit.length > 0) return explicit
  return '/my'
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
