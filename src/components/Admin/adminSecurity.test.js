import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(js|jsx)$/.test(name) && !name.endsWith('.test.js')
      ? [path]
      : []
  })
}

test('client source contains no Supabase privileged server key', () => {
  const sourceRoot = new URL('../../', import.meta.url).pathname
  const combined = sourceFiles(sourceRoot)
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')

  assert.doesNotMatch(combined, /SUPABASE_SERVICE_ROLE_KEY/)
  assert.doesNotMatch(combined, /service_role\s*[:=]/)
})
