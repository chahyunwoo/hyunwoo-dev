'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, toast } from '@hyunwoo/ui'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { HTTPError } from 'ky'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { verifyTwoFactor } from '@/entities/auth'

const CODE_LENGTH = 6
const TOKEN_TTL_MS = 5 * 60 * 1000

interface TotpFormProps {
  twoFactorToken: string
  onBack: () => void
}

export function TotpForm({ twoFactorToken, onBack }: TotpFormProps) {
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [remainingMs, setRemainingMs] = useState(TOKEN_TTL_MS)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, TOKEN_TTL_MS - elapsed)
      setRemainingMs(remaining)
      if (remaining === 0) {
        clearInterval(timer)
        toast.error('인증 시간이 만료되었습니다. 다시 로그인해주세요.')
        onBack()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [onBack])

  const verifyMutation = useMutation({
    mutationFn: () => verifyTwoFactor(twoFactorToken, digits.join('')),
    onSuccess: () => navigate({ to: '/' }),
    onError: async (e: Error) => {
      let message = '인증에 실패했습니다'
      if (e instanceof HTTPError) {
        const body = await e.response.json().catch(() => null)
        message = body?.message ?? `HTTP ${e.response.status}`
      }
      toast.error(message)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    },
  })

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every(d => d) && newDigits.join('').length === CODE_LENGTH) {
      verifyMutation.mutate()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const newDigits = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)

    if (pasted.length === CODE_LENGTH) {
      verifyMutation.mutate()
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  const isExpiring = remainingMs < 60000

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[400px] max-w-full">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <ShieldCheck className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">2FA 인증</CardTitle>
          <p className="text-sm text-muted-foreground text-center">인증 앱에 표시된 6자리 코드를 입력하세요</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 6칸 고정 길이라 추가·삭제·재정렬이 없다. ref 배열도 같은 인덱스를 쓴다
              <input
                key={i}
                ref={el => {
                  inputRefs.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={verifyMutation.isPending}
                className="w-11 h-14 text-center text-xl font-mono font-bold rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            ))}
          </div>

          <p
            className={`text-xs text-center tabular-nums ${isExpiring ? 'text-destructive font-bold' : 'text-muted-foreground'}`}
          >
            남은 시간: {minutes}:{String(seconds).padStart(2, '0')}
          </p>

          <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={verifyMutation.isPending}>
            <ArrowLeft className="size-4" />
            로그인으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
