import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { classifyCaller } from './access.ts'

const projectDir = `${process.env.TEMP}\\seoah-local-supabase`
const dockerBin = `${process.env.LOCALAPPDATA}\\Programs\\DockerDesktop\\resources\\bin`
process.env.PATH = `${dockerBin};${process.env.PATH ?? ''}`
const status = spawnSync('npx', ['--yes', 'supabase@2.118.0', 'status', '-o', 'env'], {
  cwd: projectDir,
  encoding: 'utf8',
  shell: true,
})
if (status.status !== 0) {
  console.error('local supabase status failed')
  process.exit(1)
}

const env: Record<string, string> = {}
for (const line of status.stdout.split(/\r?\n/)) {
  const idx = line.indexOf('=')
  if (idx <= 0) continue
  env[line.slice(0, idx)] = line.slice(idx + 1).replace(/^"|"$/g, '')
}

const apiUrl = env.API_URL
const anonKey = env.ANON_KEY
const serviceKey = env.SERVICE_ROLE_KEY
if (!apiUrl || !anonKey || !serviceKey) {
  console.error('local auth env missing')
  process.exit(1)
}

async function lookupUser(token: string): Promise<{ id: string } | null> {
  const res = await fetch(`${apiUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  })
  if (!res.ok) return null
  const body = await res.json() as { id?: string }
  return body.id ? { id: body.id } : null
}

const email = `p3a1-jwt-${Date.now()}@example.test`
const password = `Pw-${crypto.randomUUID()}`
let userId = ''

try {
  const created = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (!created.ok) {
    console.error(`admin create failed ${created.status}`)
    process.exit(1)
  }
  const createdBody = await created.json() as { id?: string }
  userId = createdBody.id ?? ''

  const signed = await fetch(`${apiUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!signed.ok) {
    console.error(`password grant failed ${signed.status}`)
    process.exit(1)
  }
  const signedBody = await signed.json() as { access_token?: string }
  const accessToken = signedBody.access_token ?? ''
  if (!accessToken) {
    console.error('password grant missing token')
    process.exit(1)
  }

  assert.deepEqual(await classifyCaller('', serviceKey, lookupUser), { kind: 'anonymous' })
  assert.deepEqual(await classifyCaller(anonKey, serviceKey, lookupUser), { kind: 'anonymous' })
  assert.deepEqual(await classifyCaller(anonKey, '', lookupUser), { kind: 'anonymous' })
  assert.deepEqual(await classifyCaller('not-a-jwt', serviceKey, lookupUser), { kind: 'anonymous' })
  assert.deepEqual(await classifyCaller(accessToken, serviceKey, lookupUser), { kind: 'user', userId })
  assert.deepEqual(await classifyCaller(serviceKey, serviceKey, lookupUser), { kind: 'service' })
  console.log('send-email jwt classification passed')
} finally {
  if (userId) {
    await fetch(`${apiUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    })
  }
}
