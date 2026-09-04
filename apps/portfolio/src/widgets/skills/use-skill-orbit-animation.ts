import { useEffect, useRef } from 'react'
import type { SkillItem } from '@/entities/portfolio'

function getSkillSize(proficiency: number): number {
  return Math.max(62, 48 + proficiency * 0.35)
}

interface UseSkillOrbitAnimationOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  orbits: SkillItem[][]
}

export function useSkillOrbitAnimation({ containerRef, orbits }: UseSkillOrbitAnimationOptions) {
  const pausedOrbits = useRef<Set<number>>(new Set())
  const anglesRef = useRef<number[]>(orbits.map(() => 0))

  useEffect(() => {
    let raf: number
    let last = performance.now()

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now

      orbits.forEach((_, orbitIndex) => {
        if (pausedOrbits.current.has(orbitIndex)) return
        const speed = (360 / (25 + orbitIndex * 12)) * (orbitIndex % 2 === 0 ? 1 : -1)
        anglesRef.current[orbitIndex] += speed * dt
      })

      const container = containerRef.current
      if (!container) {
        raf = requestAnimationFrame(tick)
        return
      }

      let idx = 0
      for (let o = 0; o < orbits.length; o++) {
        const orbit = orbits[o]
        const radiusX = 200 + o * 120
        const radiusY = 150 + o * 95
        const baseAngle = anglesRef.current[o] * (Math.PI / 180)

        for (let i = 0; i < orbit.length; i++) {
          const angle = baseAngle + (i / orbit.length) * Math.PI * 2
          const x = Math.cos(angle) * radiusX + 400
          const y = Math.sin(angle) * radiusY + 325
          const el = container.children[idx] as HTMLElement
          if (el) {
            const size = getSkillSize(orbit[i].proficiency)
            el.style.left = `${x - size / 2}px`
            el.style.top = `${y - size / 2}px`
          }
          idx++
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [orbits, containerRef])

  return { pausedOrbits }
}
