import { z } from 'zod'

export const contactSchema = z.object({
  // 서버 DTO가 @MinLength(2)이므로 여기서도 2로 맞춘다. min(1)로 두면
  // 한 글자 이름이 프론트 검증을 통과한 뒤 서버에서 400으로 거절된다.
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export type ContactForm = z.infer<typeof contactSchema>
