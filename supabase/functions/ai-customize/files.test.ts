import assert from 'node:assert/strict'
import { decodeUtf8, isOwnedUploadPath, selectUploadPaths, textFromDocxDocumentXml, textFromPptxSlideXml } from './files.ts'

const userId = 'user-1'
const projectId = 'project-1'
const owned = `${userId}/${projectId}/notes.txt`

assert.equal(isOwnedUploadPath(owned, userId, projectId), true)
assert.equal(isOwnedUploadPath(`other/${projectId}/notes.txt`, userId, projectId), false)
assert.equal(isOwnedUploadPath(`${userId}/other/notes.txt`, userId, projectId), false)
assert.equal(isOwnedUploadPath(`${userId}/${projectId}/../secret.txt`, userId, projectId), false)

const selected = selectUploadPaths({
  filePaths: [owned, `${userId}/${projectId}/draft.md`],
  fileUrls: ['https://evil.example/secret.txt'],
}, userId, projectId)
assert.equal(selected.ok, true)
if (selected.ok) {
  assert.deepEqual(selected.paths, [owned, `${userId}/${projectId}/draft.md`])
  assert.equal(selected.paths.some((path) => path.startsWith('https://')), false)
}

const blocked = selectUploadPaths({ filePaths: ['https://evil.example/a.txt'] }, userId, projectId)
assert.equal(blocked.ok, false)

assert.equal(decodeUtf8(new TextEncoder().encode('안녕 markdown')), '안녕 markdown')
assert.equal(textFromDocxDocumentXml('<w:document><w:t>Hello doc</w:t></w:document>'), 'Hello doc')
assert.equal(textFromPptxSlideXml(['<a:t>Slide one</a:t>', '<a:t>Slide two</a:t>']), 'Slide one\nSlide two')

console.log('ai-customize file tests passed')
