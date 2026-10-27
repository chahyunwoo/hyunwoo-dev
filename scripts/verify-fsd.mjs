/**
 * FSD 레이어 규칙 검사 (전역 규칙 `frontend-react-fsd`).
 *
 * 🔴 **단방향 의존 — 예외 없이 지킨다.** 하위 레이어는 상위를 import 하지 않는다.
 *    type-only 여도 컴파일 타임 레이어 위반이므로 "type 이니까 괜찮다" 로 넘기지 않는다.
 * 🔴 **슬라이스는 `index.ts` 로만 노출한다.** 다른 슬라이스의 내부 파일을
 *    직접 import 하지 않는다.
 * 🔴 **상대경로(`../`) 금지.** 같은 폴더 `./` 만 허용.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// 모노레포라 앱 여러 개를 본다. 인자로 좁힐 수 있다: node scripts/verify-fsd.mjs apps/admin/src
const SRCS = process.argv.slice(2).length ? process.argv.slice(2) : ['apps/blog/src', 'apps/portfolio/src', 'apps/admin/src']
/** 위에서 아래로. 아래일수록 하위 레이어다. */
const ORDER = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(p)) out.push(p)
  }
  return out
}

const problems = []
for (const SRC of SRCS)
for (const file of walk(SRC)) {
  const rel = relative(SRC, file)
  const [layer, slice] = rel.split('/')
  /*
   * ⚠️ 주석을 먼저 지운다. 주석 안의 `from '@/shared'` 같은 **설명 문구**를
   *    실제 import 로 오인해 위반으로 잡은 적이 있다(실측 2026-09-10).
   */
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  for (const m of src.matchAll(/from '([^']+)'/g)) {
    const spec = m[1]

    // 상대경로 — **같은 슬라이스(shared 는 같은 세그먼트) 안에 머무르면 허용**한다.
    // 밖으로 나가면 위반이다. 2026-09-17 정정: 예전엔 `../` 를 전부 막았는데,
    // 그러면 `shared/ui/error/x.tsx` 가 `shared/ui/inner-container` 를 부를 길이 없다 —
    // 절대경로는 이 게이트가 막고, 배럴(`@/shared/ui`)은 **순환 import** 가 된다(index 가 error 를 다시 내보낸다).
    if (spec.startsWith('../')) {
      const here = relative(SRC, join(file, '..', spec)).split('/')
      const mineParts = rel.split('/')
      // shared 는 layer+segment(2단계), 나머지는 layer+slice(2단계)까지 같으면 같은 울타리 안이다
      const same = here[0] === mineParts[0] && here[1] === mineParts[1]
      if (!same) {
        problems.push(`${SRC}: 슬라이스 밖으로 나가는 상대경로: ${rel} → ${spec}`)
      }
      continue
    }
    if (!spec.startsWith('@/')) continue

    const [depLayer, depSlice, ...rest] = spec.slice(2).split('/')
    const here = ORDER.indexOf(layer)
    const there = ORDER.indexOf(depLayer)
    if (here === -1 || there === -1) continue

    // 단방향: 하위(인덱스 큼)가 상위(인덱스 작음)를 부르면 위반
    if (there < here) {
      problems.push(`${SRC}: 단방향 위반: ${layer} → ${depLayer}  (${rel} → ${spec})`)
      continue
    }
    /*
     * 같은 레이어의 다른 슬라이스는 부르지 않는다(횡단 금지).
     *
     * ⚠️ `shared` 는 예외다 — 슬라이스가 아니라 **세그먼트**(ui·lib·styles)로
     *    나뉘는 레이어다. `shared/ui` 가 `shared/lib` 를 쓰는 것은 정상이다.
     */
    if (there === here && depSlice !== slice && layer !== 'shared') {
      problems.push(`${SRC}: 같은 레이어 횡단: ${rel} → ${spec}`)
      continue
    }
    /*
     * 다른 슬라이스의 내부 파일을 직접 부르면 위반 (index.ts 로만).
     *
     * ⚠️ CSS Module 은 예외다 — `index.ts` 로 재노출할 방법이 없다
     *    (`export ... from '*.module.css'` 는 타입이 안 붙는다).
     *    그래서 공용 스타일은 파일 경로로 직접 가져온다.
     */
    /*
     * 🔴 `shared` 는 **세그먼트까지가 public API** 다(`@/shared/ui`).
     *    통짜 `@/shared` 로 두지 않는다 — 실측(FLW): 통짜 사용 0건, 전부
     *    `@/shared/components/ui` 처럼 세그먼트로 부른다. 통짜 barrel 은
     *    무관한 모듈을 한 파일에 묶어 순환 참조를 만들기 쉽다.
     */
    if (depLayer === 'shared') {
      // 통짜 `@/shared` 도 막는다. 세그먼트를 명시해야 한다.
      if (!depSlice) {
        problems.push(`${SRC}: 통짜 @/shared 금지(세그먼트를 쓴다): ${rel} → ${spec}`)
        continue
      }
      if (rest.length > 0 && !spec.endsWith('.css')) {
        problems.push(`${SRC}: shared 세그먼트 내부 직접 참조: ${rel} → ${spec}`)
      }
      continue
    }
    if (there > here && rest.length > 0 && !spec.endsWith('.css')) {
      problems.push(`${SRC}: 슬라이스 내부 직접 참조: ${rel} → ${spec}`)
    }
  }
}

if (problems.length) {
  process.stderr.write(`FSD 검사 — ${problems.length}건 위반\n`)
  for (const p of problems) process.stderr.write(`  ${p}\n`)
  process.exit(1)
}
process.stdout.write('FSD 검사 통과 — 단방향 의존 · 슬라이스 public API · 절대경로\n')
