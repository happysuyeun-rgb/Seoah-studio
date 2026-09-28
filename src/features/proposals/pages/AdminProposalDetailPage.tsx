import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ProposalDocument } from '../components/ProposalDocument'
import { useProposalSource } from '../useProposalSource'

export function AdminProposalDetailPage() {
  usePageTitle('Proposal — SEOAH.STUDIO')
  const { id } = useParams()
  const { proposals, ready } = useProposalSource()
  const proposal = proposals.find((item) => item.id === id) ?? null

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8"><p className="text-sm text-ink-faint">로딩 중...</p></main>
  }
  if (!proposal) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <p className="text-sm text-ink">Proposal not found.</p>
        <Link to="/admin/proposals" className="mt-4 inline-block text-sm text-ink-soft">Proposals</Link>
      </main>
    )
  }

  return (
    <main className="px-4 py-8 sm:px-8">
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between gap-4">
        <Link to="/admin/proposals" className="text-sm text-ink-soft">Proposals</Link>
        <Link to={`/admin/proposals/${proposal.id}/edit`} className="border border-ink px-3 py-2 text-sm text-ink">Edit</Link>
      </div>
      <ProposalDocument proposal={proposal} showInternal />
      <p className="mx-auto mt-4 max-w-3xl text-xs text-ink-faint">
        Version {proposal.currentVersion}. 수정 요청 이후에는 기존 버전을 덮어쓰지 않고 새 Version을 만드는 구조입니다. 지금은 저장되지 않습니다.
      </p>
    </main>
  )
}
