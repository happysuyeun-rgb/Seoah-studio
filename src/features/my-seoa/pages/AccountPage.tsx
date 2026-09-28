import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ButtonLink } from '../../../components/ui/Button'
import { PageHeader, SectionHeader } from '../components/SectionHeader'
import { useAuthStore } from '../../../store/authStore'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-line py-4 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  )
}

export function AccountPage() {
  usePageTitle('Account — MY SEOA')
  const user = useAuthStore((state) => state.user)
  const name = typeof user?.user_metadata?.name === 'string' && user.user_metadata.name.trim() ? user.user_metadata.name : '—'
  const email = user?.email || '—'

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Account" description="프로필과 계정 설정을 확인합니다." />
      <section>
        <SectionHeader title="Profile" />
        <dl>
          <Field label="Name" value={name} />
          <Field label="Email" value={email} />
        </dl>
      </section>
      <section className="mt-12">
        <SectionHeader title="Company Info" />
        <dl>
          <Field label="Account type" value="—" />
          <Field label="Company name" value="—" />
        </dl>
      </section>
      <section className="mt-12">
        <SectionHeader title="Security" />
        <dl>
          <Field label="Email" value={email} />
          <Field label="Password" value="—" />
        </dl>
      </section>
      <section className="mt-12">
        <SectionHeader title="Notification Settings" />
        <dl>
          <Field label="Project" value="—" />
          <Field label="Payment" value="—" />
          <Field label="Support" value="—" />
        </dl>
      </section>
      <section className="mt-12">
        <SectionHeader title="Withdrawal" description="계정 삭제가 필요하면 문의해 주세요." />
        <ButtonLink to="/contact" variant="secondary" size="sm">
          문의하기
        </ButtonLink>
      </section>
    </div>
  )
}
