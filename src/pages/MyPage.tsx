import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import JSZip from 'jszip'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { toast } from '../store/toastStore'
import { getInvokeMessage, getErrorMessage } from '../lib/errorCodes'

function getTabFromHash(): 'projects' | 'downloads' {
  return window.location.hash === '#downloads' ? 'downloads' : 'projects'
}

export function MyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, signOut } = useAuthStore()
  const { setCurrentProjectId } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'projects' | 'downloads'>(getTabFromHash)

  useEffect(() => {
    document.title = '마이페이지 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])
  useEffect(() => {
    const onHash = () => setActiveTab(getTabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const { data: projects = [] } = useQuery({
    queryKey: ['my-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = data ?? []
      const templateIds = [...new Set(rows.map((row) => row.template_id).filter((id): id is string => Boolean(id)))]
      const names = new Map<string, { name: string; thumbnail_url: string | null }>()
      if (templateIds.length > 0) {
        const { data: templates, error: templateError } = await supabase
          .from('templates_public')
          .select('id, name, thumbnail_url')
          .in('id', templateIds)
        if (templateError) throw templateError
        for (const template of templates ?? []) {
          names.set(template.id, { name: template.name, thumbnail_url: template.thumbnail_url })
        }
      }
      return rows.map((row) => ({
        ...row,
        templates: names.get(row.template_id) ?? null,
      }))
    },
    enabled: !!user?.id,
  })

  const { data: downloads = [] } = useQuery({
    queryKey: ['my-downloads', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data: orders } = await supabase.from('orders').select('id, project_id, status').eq('user_id', user.id)
      const ids = (orders ?? []).map((o) => o.id)
      if (ids.length === 0) return []
      const { data, error } = await supabase
        .from('downloads')
        .select('*, orders(project_id, status)')
        .in('order_id', ids)
        .order('downloaded_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const statusLabel: Record<string, string> = {
    draft: '작성 중',
    parsing: 'AI 처리 중',
    ready: 'AI 완료',
    pending_payment: '결제 대기',
    paid: '완료',
    fulfilled: '완료',
    error: '오류',
  }

  const goProject = (id: string, status: string) => {
    setCurrentProjectId(id)
    if (status === 'paid') navigate(`/payment/success?projectId=${id}`)
    else navigate('/project/preview')
  }

  const handleDeleteProject = async (id: string, templateName: string) => {
    if (!window.confirm(`"${templateName}" 프로젝트를 삭제하시겠습니까?`)) return
    const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) {
      toast.error('프로젝트 삭제에 실패했습니다.')
      return
    }
    queryClient.invalidateQueries({ queryKey: ['my-projects', user?.id] })
  }

  const handleRedownload = async (orderId: string, projectId: string) => {
    try {
      const { data: proj } = await supabase.from('projects').select('output_html').eq('id', projectId).single()
      if (proj?.output_html) {
        const zip = new JSZip()
        zip.file('index.html', proj.output_html)
        const blob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'seoah-studio-website.zip'
        a.click()
        URL.revokeObjectURL(url)
        await supabase.from('downloads').insert({ order_id: orderId, file_type: 'html' })
        queryClient.invalidateQueries({ queryKey: ['my-downloads', user?.id] })
        return
      }
      const { data, error } = await supabase.functions.invoke('get-download-url', {
        body: { projectId },
      })
      const downloadUrl =
        (data as { data?: { downloadUrl?: string } } | null)?.data?.downloadUrl ??
        (data as { downloadUrl?: string } | null)?.downloadUrl ??
        ''

      if (error || !data?.success || !downloadUrl) {
        const hasCode =
          !!(data as { error?: string | { code?: string } } | null)?.error &&
          (typeof (data as { error?: unknown } | null)?.error === 'string'
            ? true
            : !!(data as { error?: { code?: string } } | null)?.error?.code)
        const msg = hasCode
          ? getInvokeMessage(data as { message?: string; error?: string } | null, error)
          : getErrorMessage('E-051', '다운로드 링크가 만료되었습니다. 다시 시도해 주세요.')
        toast.error(msg)
        return
      }
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'seoah-studio-website.zip'
      a.rel = 'noopener noreferrer'
      a.target = '_blank'
      a.click()
      queryClient.invalidateQueries({ queryKey: ['my-downloads', user?.id] })
    } catch {
      toast.error(getErrorMessage('E-050', '다운로드 링크 생성에 실패했습니다. 고객센터에 문의해 주세요.'))
    }
  }

  const displayName = user?.user_metadata?.name ?? user?.email ?? ''
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url as string}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">
              {(user?.user_metadata?.name as string) || user?.email || '사용자'}
            </p>
            <p className="truncate text-sm text-gray-500">{user?.email ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/mypage/settings"
            className="min-h-[44px] py-2 text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            설정
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="min-h-[44px] shrink-0 text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            로그아웃
          </button>
        </div>
      </header>

      <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>

      <nav className="mt-4 flex border-b border-gray-200" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'projects'}
          onClick={() => {
            window.location.hash = '#projects'
            setActiveTab('projects')
          }}
          className={`min-h-[44px] border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          내 프로젝트
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'downloads'}
          onClick={() => {
            window.location.hash = '#downloads'
            setActiveTab('downloads')
          }}
          className={`min-h-[44px] border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'downloads' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          다운로드 내역
        </button>
      </nav>

      {activeTab === 'projects' && (
      <section className="mt-6">
        <h2 className="sr-only">내 프로젝트</h2>
        {projects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">아직 만든 프로젝트가 없습니다.</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              시작하기
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p: { id: string; status: string; templates?: { name: string; thumbnail_url: string | null } }) => {
              const templateName = p.templates?.name ?? '프로젝트'
              const thumbUrl = p.templates?.thumbnail_url
              return (
              <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-sm text-gray-500">
                      {templateName}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900">{templateName}</p>
                  <p className="text-sm text-gray-500">{statusLabel[p.status] ?? p.status}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => goProject(p.id, p.status)}
                      className="text-sm text-primary hover:underline"
                    >
                      보기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(p.id, templateName)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </section>
      )}

      {activeTab === 'downloads' && (
      <section className="mt-6">
        <h2 className="sr-only">다운로드 내역</h2>
        {downloads.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">다운로드 내역이 없습니다.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">파일 유형</th>
                  <th className="py-2">다운로드 시각</th>
                  <th className="py-2">동작</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d: { id: string; order_id: string; file_type: string; downloaded_at: string; orders?: { project_id: string; status?: string } | null }) => {
                  const projectId = d.orders?.project_id
                  const orderStatus = d.orders?.status ?? ''
                  const canRefund = orderStatus === 'paid' && projectId
                  return (
                    <tr key={d.id} className="border-b">
                      <td className="py-2">{d.file_type}</td>
                      <td className="py-2">{new Date(d.downloaded_at).toLocaleString()}</td>
                      <td className="py-2 flex flex-wrap gap-2">
                        {projectId ? (
                          <button
                            type="button"
                            onClick={() => handleRedownload(d.order_id, projectId)}
                            className="text-primary hover:underline"
                          >
                            다시 다운로드
                          </button>
                        ) : null}
                        {canRefund && (
                          <Link
                            to={`/mypage/refund/${d.order_id}`}
                            className="text-amber-600 hover:underline"
                          >
                            환불 요청
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-500">다운로드가 되지 않으면 브라우저의 팝업·다운로드 허용 설정을 확인해 주세요.</p>
          </div>
        )}
      </section>
      )}
    </main>
  )
}
