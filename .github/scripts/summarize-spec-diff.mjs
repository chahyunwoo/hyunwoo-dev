/**
 * 두 OpenAPI 문서를 비교해 사람이 읽을 요약을 만든다.
 *
 * Usage:
 *   node .github/scripts/summarize-spec-diff.mjs <old.json> <new.json>
 *
 * 왜 git diff 텍스트를 grep하지 않는가:
 *   `git diff -U0`은 바뀐 줄만 내놓기 때문에, "기존 DTO에 필드 하나 추가" 같은 가장 흔한
 *   변경에서는 바뀐 줄이 `"nickname": {`이고 그걸 감싸는 스키마 이름은 컨텍스트라 잡히지 않는다.
 *   실제로 그 경우 요약이 통째로 비었다. 키 집합을 직접 비교한다.
 */
import { readFileSync } from 'node:fs'

const [, , oldPath, newPath] = process.argv
if (!oldPath || !newPath) {
  console.error('Usage: summarize-spec-diff.mjs <old.json> <new.json>')
  process.exit(2)
}

const load = p => JSON.parse(readFileSync(p, 'utf8'))
const oldDoc = load(oldPath)
const newDoc = load(newPath)

// path item에는 메서드 말고도 parameters/summary/$ref 같은 키가 올 수 있다.
// 그걸 오퍼레이션으로 세면 이슈 본문에 `PARAMETERS /a` 같은 게 찍힌다.
const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

/** `${METHOD} ${path}` 집합 */
function operations(doc) {
  const out = new Set()
  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    for (const method of Object.keys(item ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue
      out.add(`${method.toUpperCase()} ${path}`)
    }
  }
  return out
}

const schemas = doc => new Map(Object.entries(doc.components?.schemas ?? {}))

const diffSets = (before, after) => ({
  added: [...after].filter(x => !before.has(x)).sort(),
  removed: [...before].filter(x => !after.has(x)).sort(),
})

const lines = []
const push = (title, items) => {
  if (items.length > 0) lines.push(`${title} (${items.length}):`, ...items.map(x => `  ${x}`), '')
}

const ops = diffSets(operations(oldDoc), operations(newDoc))
push('추가된 오퍼레이션', ops.added)
push('삭제된 오퍼레이션', ops.removed)

const oldSchemas = schemas(oldDoc)
const newSchemas = schemas(newDoc)
const sch = diffSets(new Set(oldSchemas.keys()), new Set(newSchemas.keys()))
push('추가된 스키마', sch.added)
push('삭제된 스키마', sch.removed)

// 양쪽에 다 있는 스키마는 필드 단위로 본다 — 여기가 grep 방식이 놓치던 지점이다.
const changed = []
for (const [name, before] of oldSchemas) {
  const after = newSchemas.get(name)
  if (!after) continue
  const props = diffSets(
    new Set(Object.keys(before.properties ?? {})),
    new Set(Object.keys(after.properties ?? {})),
  )
  const required = diffSets(new Set(before.required ?? []), new Set(after.required ?? []))
  const notes = []
  if (props.added.length) notes.push(`필드 추가 ${props.added.join(', ')}`)
  if (props.removed.length) notes.push(`필드 삭제 ${props.removed.join(', ')}`)
  if (required.added.length) notes.push(`필수로 바뀜 ${required.added.join(', ')}`)
  if (required.removed.length) notes.push(`선택으로 바뀜 ${required.removed.join(', ')}`)
  if (notes.length) changed.push(`${name}: ${notes.join(' / ')}`)
}
push('변경된 스키마', changed)

if (lines.length === 0) {
  // 키 집합은 그대로인데 파일이 다른 경우 — description, example, 타입 변경 등.
  lines.push('오퍼레이션/스키마 목록은 같지만 내용이 다릅니다(설명·예시·타입 등). 전체 diff를 확인하세요.')
}

const summary = lines.join('\n').trimEnd()

// 이슈 본문을 통째로 여기서 만든다. 워크플로 YAML에서 셸 echo로 마크다운을 조립하면
// 백틱·따옴표 인용 문제가 생기고(shellcheck SC2016), heredoc 들여쓰기를 틀리면
// YAML 자체가 깨진다 — 실제로 한 번 그렇게 깨뜨렸다.
process.stdout.write(`api-server의 \`openapi.json\`이 이 저장소에 커밋된 사본과 다릅니다.
프론트 생성 타입이 실제 API를 기술하지 못하는 상태일 수 있습니다.

\`\`\`
${summary}
\`\`\`

## 해야 할 일

\`\`\`bash
pnpm api:sync      # api-server의 스펙을 받아온다
pnpm api:codegen   # 타입 재생성
pnpm typecheck     # 여기서 깨지면 프론트 코드도 같이 고쳐야 한다
\`\`\`

변경분을 커밋하고 PR을 올리세요.

<sub>이 이슈는 \`.github/workflows/openapi-sync-check.yml\`이 자동 생성했습니다.</sub>
`)
