import { z } from 'zod'

export const inquiryTypes = ['ready', 'studio', 'care', 'saas', 'payment', 'partnership', 'other'] as const
export type InquiryType = (typeof inquiryTypes)[number]

export const inquiryTypeLabels: Record<InquiryType, string> = {
  ready: 'Ready',
  studio: 'Studio',
  care: 'Care',
  saas: 'SaaS',
  payment: 'Payment',
  partnership: 'Partnership',
  other: 'Other',
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, '이름은 2자 이상이어야 합니다.').max(50, '이름은 50자 이하여야 합니다.'),
  email: z.string().trim().email('이메일 형식을 확인해 주세요.'),
  phone: z
    .string()
    .trim()
    .max(30, '연락처가 너무 깁니다.')
    .refine((value) => value === '' || /^[0-9+\-()\s]{8,30}$/.test(value), '연락처 형식을 확인해 주세요.'),
  inquiry_type: z.enum(inquiryTypes, { errorMap: () => ({ message: '문의 유형을 선택해 주세요.' }) }),
  message: z.string().trim().min(10, '내용은 10자 이상이어야 합니다.').max(3000, '내용은 3000자 이하여야 합니다.'),
  website: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
