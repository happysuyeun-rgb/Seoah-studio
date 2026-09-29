export const CHATBOT_CONTENT_MAX = 4000
export const CHATBOT_NAME_MAX = 50
export const CHATBOT_EMAIL_MAX = 200
export const CHATBOT_CATEGORY_MAX = 100
export const CHATBOT_RATE_LIMIT = 5
export const CHATBOT_RATE_WINDOW_MS = 60_000

export type ChatbotInput = { category?: string; content?: string; name?: string; email?: string }

export type ChatbotValidation =
  | { ok: true; category: string; content: string; name: string; email: string }
  | { ok: false; status: 400; code: 'MISSING_PARAMS' | 'INVALID' }

export function validateChatbotInput(input: ChatbotInput): ChatbotValidation {
  const category = (input.category ?? '').trim()
  const content = (input.content ?? '').trim()
  const name = (input.name ?? '').trim()
  const email = (input.email ?? '').trim()

  if (!content || !name || !email) return { ok: false, status: 400, code: 'MISSING_PARAMS' }
  if (
    content.length > CHATBOT_CONTENT_MAX
    || name.length > CHATBOT_NAME_MAX
    || email.length > CHATBOT_EMAIL_MAX
    || category.length > CHATBOT_CATEGORY_MAX
    || !email.includes('@')
  ) {
    return { ok: false, status: 400, code: 'INVALID' }
  }
  return { ok: true, category, content, name, email }
}
