'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import type { SkillGroup, SkillItem } from '@/entities/portfolio'
import { useSkillOrbitAnimation } from './use-skill-orbit-animation'

interface SkillOrbitProps {
  group: SkillGroup
}

function getSkillColor(proficiency: number): string {
  if (proficiency >= 90) return 'from-emerald-400 to-emerald-600'
  if (proficiency >= 75) return 'from-blue-400 to-blue-600'
  if (proficiency >= 60) return 'from-violet-400 to-violet-600'
  return 'from-slate-400 to-slate-500'
}

function getSkillSize(proficiency: number): number {
  return Math.max(62, 48 + proficiency * 0.35)
}

const ORBIT_WIDTH = 800
const ORBIT_HEIGHT = 650

export function SkillOrbit({ group }: SkillOrbitProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null)
  const orbits = useMemo(() => distributeToOrbits(group.items), [group.items])
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { pausedOrbits } = useSkillOrbitAnimation({ containerRef, orbits })

  const allItems = orbits.flatMap((orbit, orbitIndex) =>
    orbit.map((skill, i) => ({ skill, orbitIndex, indexInOrbit: i })),
  )

  const handleSkillActivate = (skill: SkillItem, orbitIndex: number) => {
    pausedOrbits.current.add(orbitIndex)
    setSelectedSkill(skill)
  }

  const handleSkillDeactivate = (orbitIndex: number) => {
    pausedOrbits.current.delete(orbitIndex)
    setSelectedSkill(null)
  }

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: ORBIT_WIDTH,
          height: ORBIT_HEIGHT,
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            width: ORBIT_WIDTH,
            height: ORBIT_HEIGHT,
            transformOrigin: 'top left',
          }}
          className="@container-[size] relative"
        >
          {orbits.map((_orbit, orbitIndex) => {
            const radiusX = 200 + orbitIndex * 120
            const radiusY = 150 + orbitIndex * 95
            const trackKey = `track-${group.category}-r${radiusX}`
            return (
              <div
                key={trackKey}
                className="absolute border border-white/15"
                style={{
                  width: radiusX * 2,
                  height: radiusY * 2,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                }}
              />
            )
          })}

          <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 20 }}>
            {allItems.map(({ skill, orbitIndex }) => {
              const size = getSkillSize(skill.proficiency)
              const isSelected = selectedSkill?.name === skill.name

              return (
                <button
                  type="button"
                  key={skill.name}
                  className="absolute touch-manipulation"
                  style={{ width: size, height: size, pointerEvents: 'auto' }}
                  onMouseEnter={() => handleSkillActivate(skill, orbitIndex)}
                  onMouseLeave={() => handleSkillDeactivate(orbitIndex)}
                  onFocus={() => handleSkillActivate(skill, orbitIndex)}
                  onBlur={() => handleSkillDeactivate(orbitIndex)}
                  onTouchStart={() => handleSkillActivate(skill, orbitIndex)}
                  onTouchEnd={() => setTimeout(() => handleSkillDeactivate(orbitIndex), 1200)}
                  aria-label={`${skill.name} ${skill.proficiency}%`}
                >
                  <div
                    className={`
                      relative w-full h-full rounded-full flex items-center justify-center
                      bg-linear-to-br ${getSkillColor(skill.proficiency)}
                      cursor-pointer transition-shadow duration-200
                      ${isSelected ? 'ring-2 ring-white shadow-lg shadow-primary/40' : 'hover:shadow-lg'}
                    `}
                    style={{
                      boxShadow: isSelected
                        ? undefined
                        : `0 ${size * 0.15}px ${size * 0.3}px rgba(0,0,0,0.4), inset 0 -${size * 0.08}px ${size * 0.15}px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 50%)',
                      }}
                    />
                    <span
                      className="relative text-white font-semibold text-center leading-tight select-none px-1"
                      style={{
                        fontSize: `${Math.max(10, size * 0.2)}px`,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                      }}
                    >
                      {skill.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <AnimatePresence mode="wait">
              {selectedSkill ? (
                <motion.div
                  key={selectedSkill.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="glass rounded-xl p-4 space-y-2 w-[220px] text-center"
                >
                  <div className="font-semibold text-foreground text-sm">{selectedSkill.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-primary to-primary/60"
                        style={{ width: `${selectedSkill.proficiency}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary font-medium tabular-nums">{selectedSkill.proficiency}%</span>
                  </div>
                  {selectedSkill.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedSkill.description}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="category"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="relative w-28 h-28 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center"
                  style={{
                    boxShadow:
                      '0 0 40px rgba(108,60,224,0.3), 0 12px 24px rgba(0,0,0,0.4), inset 0 -8px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3), transparent 50%)' }}
                  />
                  <span className="relative text-white font-bold text-base text-center leading-tight px-2">
                    {group.category}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function distributeToOrbits(items: SkillItem[]) {
  const sorted = [...items].sort((a, b) => b.proficiency - a.proficiency)
  const orbits: SkillItem[][] = []
  const maxPerOrbit = [4, 6, 8, 10]

  let idx = 0
  for (const max of maxPerOrbit) {
    if (idx >= sorted.length) break
    orbits.push(sorted.slice(idx, idx + max))
    idx += max
  }

  if (idx < sorted.length) {
    if (orbits.length > 0) {
      orbits[orbits.length - 1].push(...sorted.slice(idx))
    } else {
      orbits.push(sorted.slice(idx))
    }
  }

  return orbits
}
