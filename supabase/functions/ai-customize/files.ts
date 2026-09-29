export function isOwnedUploadPath(path: string, userId: string, projectId: string): boolean {
  if (!userId || !projectId || !path) return false
  if (path.includes('..') || path.includes('\\') || path.includes('\0')) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return false
  const prefix = `${userId}/${projectId}/`
  if (!path.startsWith(prefix)) return false
  const name = path.slice(prefix.length)
  return name.length > 0 && !name.includes('/')
}

export function selectUploadPaths(
  input: { filePaths?: string[]; fileUrls?: string[] },
  userId: string,
  projectId: string,
): { ok: true; paths: string[] } | { ok: false } {
  const paths = input.filePaths ?? []
  if (paths.some((path) => !isOwnedUploadPath(path, userId, projectId))) return { ok: false }
  return { ok: true, paths }
}

export function fileExtension(path: string): string {
  const name = path.split('/').pop() ?? ''
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot).toLowerCase() : ''
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function stripXmlToText(xml: string): string {
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function textFromDocxDocumentXml(xml: string | undefined): string | null {
  if (!xml) return null
  const text = stripXmlToText(xml)
  return text || null
}

export function textFromPptxSlideXml(slides: Array<string | undefined>): string | null {
  const text = slides.filter((xml): xml is string => Boolean(xml)).map(stripXmlToText).filter(Boolean).join('\n')
  return text || null
}
