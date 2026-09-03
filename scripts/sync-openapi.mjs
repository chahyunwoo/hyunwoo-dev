/**
 * api-server가 커밋해 둔 openapi.json을 이 저장소로 가져온다.
 *
 * Usage:
 *   pnpm api:sync                                   # 기본값: api-server dev 브랜치
 *   OPENAPI_SPEC=../api-server/openapi.json pnpm api:sync   # 로컬 체크아웃에서
 *   OPENAPI_SPEC=https://.../dev/openapi.json pnpm api:sync # 다른 브랜치에서
 *
 * 왜 스펙을 커밋해 두는가:
 *   백엔드와 저장소가 분리돼 있어, 빌드/CI가 백엔드 서버나 DB에 의존하게 만들면
 *   운영 배포가 백엔드 상태에 끌려간다. 스펙을 파일로 커밋하면 (a) 스펙 변경이
 *   PR diff에 그대로 보이고 (b) CI가 네트워크 없이 돈다.
 *
 * 바이트를 그대로 복사한다 — 다시 직렬화하면 백엔드가 커밋한 파일과 달라져서
 * 두 파일을 diff로 대조할 수 없게 된다.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_PATH = resolve(ROOT, 'packages/shared/openapi.json')

// 기준은 api-server의 `dev`다. 두 저장소 모두 기본 브랜치가 `dev`이고 feature -> dev -> main으로
// 같이 승격되므로, dev <-> dev 비교가 같은 시점끼리 맞대는 것이다.
// `main`을 기준으로 삼으면 dev가 앞서 있는 동안 백엔드 변경이 검사에 안 잡힌다.
const DEFAULT_SOURCE = 'https://raw.githubusercontent.com/chahyunwoo/chahyunwoo-api/dev/openapi.json'
const source = process.env.OPENAPI_SPEC || DEFAULT_SOURCE

async function read(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`스펙을 받지 못했습니다: ${res.status} ${res.statusText} (${src})`)
    return await res.text()
  }
  return readFileSync(resolve(ROOT, src), 'utf8')
}

const raw = await read(source)

// 404 HTML 페이지 같은 걸 그대로 써버리면 codegen이 엉뚱하게 실패한다.
let parsed
try {
  parsed = JSON.parse(raw)
} catch {
  throw new Error(`받은 내용이 JSON이 아닙니다 (${source}). 앞 200자:\n${raw.slice(0, 200)}`)
}
if (!parsed.openapi || !parsed.paths) {
  throw new Error(`OpenAPI 문서로 보이지 않습니다 (${source}). openapi/paths 키가 없습니다.`)
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
writeFileSync(OUTPUT_PATH, raw, 'utf8')

const operations = Object.values(parsed.paths).reduce((acc, item) => acc + Object.keys(item).length, 0)
const schemas = Object.keys(parsed.components?.schemas ?? {}).length
console.log(`openapi.json synced from ${source}`)
console.log(`  openapi ${parsed.openapi} / ${operations} operations / ${schemas} schemas`)
