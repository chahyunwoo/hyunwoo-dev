import { useCallback, useEffect, useRef, useState } from 'react'
import { extendSession, logout } from '@/entities/auth/api/auth.api'
import { getRemainingSession } from './auth.store'

const WARNING_THRESHOLD = 5 * 60 * 1000

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useSessionTimer() {
  const [remaining, setRemaining] = useState(getRemainingSession)
  const intervalRef = useRef<number | null>(null)

  const showWarning = remaining > 0 && remaining <= WARNING_THRESHOLD
  const display = formatTime(remaining)

  const extend = useCallback(async () => {
    await extendSession()
    setRemaining(getRemainingSession())
  }, [])

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const ms = getRemainingSession()
      setRemaining(ms)

      if (ms <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        logout()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    remaining,
    display,
    showWarning,
    extend,
  }
}
