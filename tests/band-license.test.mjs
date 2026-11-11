import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// Ported MIT code: each project has a LICENSE-<project> file with its copyright line and permission
// notice, and each ported file names that file.
const plugin = new URL('../plugins/construct/', import.meta.url)
const PORTS = [
  ['gentle-shell', 'Copyright \\(c\\) 2025 Mario Zechner', ['hooks/scripts/delegation-admission.mjs', 'hooks/scripts/delivery-signals.mjs']],
]

for (const [project, copyright, files] of PORTS) {
  test(`LICENSE-${project} holds its copyright line and the permission notice`, () => {
    const text = readFileSync(new URL(`LICENSE-${project}`, plugin), 'utf8')
    assert.match(text, new RegExp(copyright))
    assert.match(text, /Permission is hereby granted/)
    assert.match(text, /THE SOFTWARE IS PROVIDED "AS IS"/)
  })
  for (const file of files) {
    test(`${file} names LICENSE-${project}`, () => {
      const text = readFileSync(new URL(file, plugin), 'utf8')
      assert.match(text, new RegExp(`adapted from ${project} \\(https://github.com/Gentleman-Programming/${project}\\), MIT, ${copyright}, see LICENSE-${project}`))
    })
  }
}

// The band files are Construct's own code: no MIT header, no adaptation line.
for (const file of ['layout.js', 'state.js']) {
  test(`${file} carries no adapted-code header`, () => {
    const text = readFileSync(new URL(`hooks/band/${file}`, plugin), 'utf8')
    assert.doesNotMatch(text, /Permission is hereby granted/)
    assert.doesNotMatch(text, /adapted from/i)
  })
}

// Vendored code: sh-syntax (MIT) and its mvdan/sh WASM payload (BSD-3-Clause) are copied
// unmodified, so their hashes are pinned to the npm package, their licenses sit beside the
// plugin's own, and NOTICE and its user name them.
test('LICENSE-mvdan-sh holds its copyright line and the BSD-3-Clause terms', () => {
  const text = readFileSync(new URL('LICENSE-mvdan-sh', plugin), 'utf8')
  assert.match(text, /Copyright \(c\) 2016, Daniel Mart/)
  assert.match(text, /Redistribution and use in source and binary forms/)
  assert.match(text, /Redistributions of source code must retain the above copyright/)
  assert.match(text, /Neither the name of the copyright holder/)
  assert.match(text, /THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS/)
})

test('LICENSE-sh-syntax holds its copyright line and the MIT terms', () => {
  const text = readFileSync(new URL('LICENSE-sh-syntax', plugin), 'utf8')
  assert.match(text, /Copyright \(c\) 2021 UnTS/)
  assert.match(text, /Permission is hereby granted/)
  assert.match(text, /THE SOFTWARE IS PROVIDED "AS IS"/)
})

test('hooks/vendor/sh-syntax/lib/index.cjs is the unmodified sh-syntax 0.8.3 build', () => {
  const sha = createHash('sha256').update(readFileSync(new URL('hooks/vendor/sh-syntax/lib/index.cjs', plugin))).digest('hex')
  assert.equal(sha, '0efc5a2b5377464611b07da2cfd80ba58cec2cc65eb29788d114e19b788baca4')
})

test('hooks/vendor/sh-syntax/vendors/wasm_exec.cjs is the unmodified sh-syntax 0.8.3 vendor', () => {
  const sha = createHash('sha256').update(readFileSync(new URL('hooks/vendor/sh-syntax/vendors/wasm_exec.cjs', plugin))).digest('hex')
  assert.equal(sha, '0c949f4996f9a89698e4b5c586de32249c3b69b7baadb64d220073cc04acba14')
})

test('hooks/vendor/sh-syntax/main.wasm is the unmodified sh-syntax 0.8.3 payload', () => {
  const sha = createHash('sha256').update(readFileSync(new URL('hooks/vendor/sh-syntax/main.wasm', plugin))).digest('hex')
  assert.equal(sha, '5f2aeca075646f3e257c83a1e98b7b7f80edb315339178bf3c3fdaddd34a7ea8')
})

test('shell-words.mjs and NOTICE name sh-syntax and its license', () => {
  assert.match(readFileSync(new URL('hooks/scripts/shell-words.mjs', plugin), 'utf8'), /sh-syntax 0\.8\.3 .*MIT.*see its LICENSE/s)
  const notice = readFileSync(new URL('NOTICE', plugin), 'utf8')
  assert.match(notice, /sh-syntax/)
  assert.match(notice, /hooks\/vendor\/sh-syntax\//)
  assert.match(notice, /LICENSE-sh-syntax/)
})
