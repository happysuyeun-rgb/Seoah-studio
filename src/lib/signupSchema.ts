import { z } from 'zod'

export const accountTypes = ['individual', 'business'] as const
export type AccountType = (typeof accountTypes)[number]

export const signupSchema = z
  .object({
    account_type: z.enum(accountTypes, { errorMap: () => ({ message: '계정 유형을 선택해 주세요.' }) }),
    name: z.string().trim().min(2, '이름은 2자 이상이어야 합니다.').max(50, '이름은 50자 이하여야 합니다.'),
    email: z.string().trim().email('이메일 형식을 확인해 주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').max(72, '비밀번호가 너무 깁니다.'),
    password_confirm: z.string(),
    company_name: z.string().trim().max(80, '회사명은 80자 이하여야 합니다.'),
  })
  .refine((value) => value.password === value.password_confirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['password_confirm'],
  })
