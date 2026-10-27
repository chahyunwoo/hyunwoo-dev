import { Button, Card, CardContent, CardHeader, CardTitle, Input, toast } from '@hyunwoo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { TwoFactorSetupResponse } from '@/entities/auth'
import { disableTwoFactor, enableTwoFactor, getTwoFactorStatus, setupTwoFactor } from '@/entities/auth'

const TOTP_CODE_LENGTH = 6

function getErrorMessage(e: Error, fallback: string) {
  if (e instanceof HTTPError) {
    return e.response
      .json()
      .then((body: { message?: string }) => body?.message ?? `HTTP ${e.response.status}`)
      .catch(() => fallback)
  }
  return Promise.resolve(fallback)
}

export function TwoFactorSetup() {
  const queryClient = useQueryClient()
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [code, setCode] = useState('')

  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: getTwoFactorStatus,
  })

  const setupMutation = useMutation({
    mutationFn: setupTwoFactor,
    onSuccess: data => setSetupData(data),
    onError: async (e: Error) => {
      toast.error(await getErrorMessage(e, '2FA 설정에 실패했습니다'))
    },
  })

  const enableMutation = useMutation({
    mutationFn: () => enableTwoFactor(code),
    onSuccess: () => {
      toast.success('2FA가 활성화되었습니다')
      setSetupData(null)
      setCode('')
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    },
    onError: async (e: Error) => {
      toast.error(await getErrorMessage(e, '인증 코드가 올바르지 않습니다'))
    },
  })

  const disableMutation = useMutation({
    mutationFn: () => disableTwoFactor(code),
    onSuccess: () => {
      toast.success('2FA가 비활성화되었습니다')
      setCode('')
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] })
    },
    onError: async (e: Error) => {
      toast.error(await getErrorMessage(e, '인증 코드가 올바르지 않습니다'))
    },
  })

  const isEnabled = status?.enabled ?? false
  const isPending = setupMutation.isPending || enableMutation.isPending || disableMutation.isPending
  const isValidCode = code.length === TOTP_CODE_LENGTH && /^\d+$/.test(code)

  if (isStatusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="size-5 text-green-500" />
          ) : (
            <ShieldAlert className="size-5 text-amber-500" />
          )}
          <CardTitle className="text-lg">2FA (Two-Factor Authentication)</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          {isEnabled
            ? '2FA가 활성화되어 있습니다. 로그인 시 인증 코드가 요구됩니다.'
            : 'Google Authenticator 또는 1Password에 등록하여 보안을 강화하세요.'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isEnabled ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">2FA 비활성화</p>
              <p className="text-sm text-muted-foreground">비활성화하려면 현재 인증 앱의 6자리 코드를 입력하세요.</p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6자리 코드 입력"
                maxLength={TOTP_CODE_LENGTH}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => disableMutation.mutate()}
              disabled={!isValidCode || isPending}
            >
              {disableMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              2FA 비활성화
            </Button>
          </>
        ) : !setupData ? (
          <Button type="button" onClick={() => setupMutation.mutate()} disabled={isPending}>
            {setupMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            2FA 설정 시작
          </Button>
        ) : (
          <>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={setupData.qrCode} alt="2FA QR Code" className="size-48" />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. 인증 앱에서 QR 코드를 스캔하세요.</p>
              <p>2. 아래에 인증 앱의 6자리 코드를 입력하여 활성화하세요.</p>
              <p>3. 이 QR 코드는 다시 표시되지 않으니 안전한 곳에 백업하세요.</p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6자리 코드 입력"
                maxLength={TOTP_CODE_LENGTH}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <Button
                type="button"
                onClick={() => enableMutation.mutate()}
                disabled={!isValidCode || isPending}
                className="w-full"
              >
                {enableMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                2FA 활성화 확정
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
