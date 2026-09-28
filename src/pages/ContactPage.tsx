import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { SelectField, TextAreaField, TextField } from '../components/marketing/Fields'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'
import { contactSchema, inquiryTypeLabels, inquiryTypes, type InquiryType } from '../lib/contactSchema'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

const cooldownKey = 'seoah_contact_at'

function initialType(topic: string | null): InquiryType {
  if (topic && (inquiryTypes as readonly string[]).includes(topic)) return topic as InquiryType
  return 'ready'
}

export function ContactPage() {
  usePageTitle('Contact — SEOAH.STUDIO')
  const [params] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [inquiryType, setInquiryType] = useState<InquiryType>(initialType(params.get('topic')))
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    if (!user) return
    const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : ''
    setName((current) => current || metaName)
    setEmail((current) => current || user.email || '')
  }, [user])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitLock.current) return
    submitLock.current = true
    setSubmitting(true)

    const parsed = contactSchema.safeParse({
      name,
      email,
      phone,
      inquiry_type: inquiryType,
      message,
      website,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? '입력 내용을 확인해 주세요.')
      submitLock.current = false
      setSubmitting(false)
      return
    }
    if (parsed.data.website?.trim()) {
      setSent(true)
      submitLock.current = false
      setSubmitting(false)
      return
    }

    const last = Number(sessionStorage.getItem(cooldownKey) ?? 0)
    if (Number.isFinite(last) && Date.now() - last < 20_000) {
      toast.error('잠시 후 다시 시도해 주세요.')
      submitLock.current = false
      setSubmitting(false)
      return
    }

    try {
      if (!isSupabaseConfigured) {
        toast.error('문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          inquiry_type: parsed.data.inquiry_type,
          message: parsed.data.message,
          website: '',
        },
      })
      if (error || !data?.success) {
        toast.error('문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      sessionStorage.setItem(cooldownKey, String(Date.now()))
      setSent(true)
      setMessage('')
      setPhone('')
      toast.success('문의가 접수되었습니다. 확인 후 연락드리겠습니다.')
    } catch {
      toast.error('문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      window.setTimeout(() => {
        submitLock.current = false
        setSubmitting(false)
      }, 700)
    }
  }

  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="문의하기"
        description="로그인 없이 남길 수 있습니다. 필요한 내용만 적어도 됩니다."
      />
      <MarketingSection>
        {sent ? (
          <p className="max-w-xl text-lead text-ink-soft">문의가 접수되었습니다. 확인 후 연락드리겠습니다.</p>
        ) : (
          <form onSubmit={submit} className="relative grid max-w-xl gap-6">
            <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </label>
            </div>
            <TextField label="이름" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            <TextField label="이메일" name="email" type="text" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            <TextField label="연락처" name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
            <SelectField
              label="문의 유형"
              name="inquiryType"
              value={inquiryType}
              onChange={(event) => setInquiryType(event.target.value as InquiryType)}
            >
              {inquiryTypes.map((type) => (
                <option key={type} value={type}>
                  {inquiryTypeLabels[type]}
                </option>
              ))}
            </SelectField>
            <TextAreaField label="내용" name="message" value={message} onChange={(event) => setMessage(event.target.value)} />
            <Button type="submit" disabled={submitting}>
              {submitting ? '보내는 중' : '보내기'}
            </Button>
          </form>
        )}
      </MarketingSection>
    </main>
  )
}
