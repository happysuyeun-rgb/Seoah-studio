export const requestHandoffKey = 'seoah_project_request_handoff'

export type RequestHandoff = {
  name: string
  email: string
  phone: string
  message: string
}

export function readRequestHandoff(): RequestHandoff | null {
  try {
    const raw = sessionStorage.getItem(requestHandoffKey)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<RequestHandoff>
    if (typeof data.message !== 'string') return null
    return {
      name: typeof data.name === 'string' ? data.name : '',
      email: typeof data.email === 'string' ? data.email : '',
      phone: typeof data.phone === 'string' ? data.phone : '',
      message: data.message,
    }
  } catch {
    return null
  }
}

export function writeRequestHandoff(value: RequestHandoff) {
  sessionStorage.setItem(requestHandoffKey, JSON.stringify(value))
}
