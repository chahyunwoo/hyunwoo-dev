export function countryFlag(countryCode: string): string {
  if (countryCode?.length !== 2) return ''
  const code = countryCode.toUpperCase()
  const offset = 0x1f1e6
  const a = 'A'.charCodeAt(0)
  return String.fromCodePoint(code.charCodeAt(0) - a + offset, code.charCodeAt(1) - a + offset)
}
