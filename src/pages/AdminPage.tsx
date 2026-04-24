import DOMPurify from 'dompurify'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore, DEV_MOCK_USER_ID_CONST } from '../store/authStore'
import { toast } from '../store/toastStore'
import { REQUIRED_SLOTS } from '../lib/slotSpec'
import { AdminPreviewRebuildButton } from '../components/AdminPreviewRebuildButton'

type OrderPeriod = 'today' | 'week' | 'all'
type AdminTab = 'templates' | 'orders' | 'users' | 'inquiries' | 'chatbot' | 'refunds'

type OrderRow = {
  id: string
  amount: number
  status: string
  plan_type: string
  created_at: string
  users?: { email: string } | null
}

interface TemplateRow {
  id: string
  name: string
  category: string
  thumbnail_url: string | null
  html_template: string
  tags: string[] | null
  preview_html?: string | null
  is_active: boolean
  created_at: string
}

const DEMO_DATA: Record<string, string> = {
  company: 'DEMO COMPANY',
  headline: '당신의 비즈니스를 알려주세요',
  description: 'AI가 분석해 맞춤형 랜딩을 만들어 드립니다.',
  cta: '시작하기',
  color_primary: '#1A4FA0',
  color_secondary: '#E8EEFA',
  feature_1: '기능 1',
  feature_2: '기능 2',
  feature_3: '기능 3',
  contact: 'contact@demo.com',
  font_hint: 'Noto Sans KR',
  logo_url: '',
}

function buildPreviewHtml(htmlTemplate: string) {
  let out = htmlTemplate
  for (const [k, v] of Object.entries(DEMO_DATA)) out = out.replaceAll(`{{${k}}}`, v)
  // 공개 미리보기는 script 제거 + 기본 html 프로파일로 정화
  return DOMPurify.sanitize(out, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script'] })
}

function extractVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{(\w+)\}\}/g)
  const set = new Set<string>()
  for (const m of matches) set.add(m[1])
  return Array.from(set)
}

export function AdminPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [orderPeriod, setOrderPeriod] = useState<OrderPeriod>('all')
  const [tab, setTab] = useState<AdminTab>('templates')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('portfolio')
  const [formTags, setFormTags] = useState('')
  const [formHtml, setFormHtml] = useState('')
  const [formThumbFile, setFormThumbFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewRebuilding, setPreviewRebuilding] = useState(false)
  const [inquiryReplyId, setInquiryReplyId] = useState<string | null>(null)
  const [inquiryReplyText, setInquiryReplyText] = useState('')
  const [inquiryReplySaving, setInquiryReplySaving] = useState(false)
  const [badgeOrders, setBadgeOrders] = useState(0)
  const [badgeInquiries, setBadgeInquiries] = useState(0)
  const [badgeChatbot, setBadgeChatbot] = useState(0)
  const [badgeRefunds, setBadgeRefunds] = useState(0)
  const [refundReviewId, setRefundReviewId] = useState<string | null>(null)
  const [refundReviewNote, setRefundReviewNote] = useState('')
  const [refundProcessing, setRefundProcessing] = useState(false)

  const updatePreviewHtml = async (templateId: string, htmlTemplate: string) => {
    const previewHtml = buildPreviewHtml(htmlTemplate)
    const { error } = await supabase.rpc('admin_update_template_preview_html', {
      p_id: templateId,
      p_preview_html: previewHtml,
    })
    if (error) throw error
  }

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id, import.meta.env.DEV && typeof localStorage !== 'undefined' ? localStorage.getItem('dev-admin') : null],
    queryFn: async () => {
      if (!user?.id) return null
      if (import.meta.env.DEV && user.id === DEV_MOCK_USER_ID_CONST) {
        return { is_admin: typeof localStorage !== 'undefined' && localStorage.getItem('dev-admin') === 'true' }
      }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data as { is_admin?: boolean } | null
    },
    enabled: !!user?.id,
  })

  if (user && profile && !profile.is_admin) {
    navigate('/', { replace: true })
    return null
  }

  const { data: templates = [] } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_templates')
      if (error) throw error
      return (data ?? []) as TemplateRow[]
    },
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as OrderRow[]
    },
  })

  const { data: newUsersThisMonth } = useQuery({
    queryKey: ['admin-new-users-month'],
    queryFn: async () => {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', start.toISOString())
      if (error) throw error
      return count ?? 0
    },
    enabled: tab === 'orders',
  })

  const { data: usersList = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('id, email, name, created_at').order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: tab === 'users',
  })

  const { data: projectCounts } = useQuery({
    queryKey: ['admin-user-project-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('user_id').is('deleted_at', null)
      if (error) throw error
      const map: Record<string, number> = {}
      for (const r of data ?? []) {
        map[r.user_id] = (map[r.user_id] ?? 0) + 1
      }
      return map
    },
    enabled: tab === 'users',
  })

  const { data: orderCounts } = useQuery({
    queryKey: ['admin-user-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('user_id').eq('status', 'paid')
      if (error) throw error
      const map: Record<string, number> = {}
      for (const r of data ?? []) {
        map[r.user_id] = (map[r.user_id] ?? 0) + 1
      }
      return map
    },
    enabled: tab === 'users',
  })

  const { data: adminInquiries = [] } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, subject, body, type, status, admin_reply, replied_at, created_at, user_id')
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as { id: string; subject: string; body: string; type: string | null; status: string; admin_reply: string | null; replied_at: string | null; created_at: string; user_id: string }[]
      const userIds = [...new Set(rows.map((r) => r.user_id))]
      const { data: usersData } = await supabase.from('users').select('id, email').in('id', userIds)
      const emailMap = Object.fromEntries(((usersData ?? []) as { id: string; email: string }[]).map((u) => [u.id, u.email]))
      return rows.map((r) => ({ ...r, userEmail: emailMap[r.user_id] ?? '-' }))
    },
    enabled: tab === 'inquiries',
  })

  const { data: chatbotInquiries = [] } = useQuery({
    queryKey: ['admin-chatbot-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_inquiries')
        .select('id, category, content, name, email, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as { id: string; category: string | null; content: string | null; name: string | null; email: string | null; created_at: string }[]
    },
    enabled: tab === 'chatbot',
  })

  const { data: refundRequests = [] } = useQuery({
    queryKey: ['admin-refund-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refund_requests')
        .select('id, order_id, user_id, reason, status, review_note, created_at, orders(amount, plan_type, users(email))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Array<{
        id: string
        order_id: string
        reason: string
        status: string
        review_note: string | null
        created_at: string
        orders?: { amount: number; plan_type: string; users?: { email: string } | null } | null
      }>
    },
    enabled: tab === 'refunds',
  })

  const filteredOrders = useMemo(() => {
    if (orderPeriod === 'all') return orders
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000
    return (orders as OrderRow[]).filter((o) => {
      const t = new Date(o.created_at).getTime()
      if (orderPeriod === 'today') return t >= todayStart
      return t >= weekStart
    })
  }, [orders, orderPeriod])

  const openNew = () => {
    setEditingId(null)
    setFormName('')
    setFormCategory('portfolio')
    setFormTags('')
    setFormHtml('')
    setFormThumbFile(null)
    setModalOpen(true)
  }

  const openEdit = (t: TemplateRow) => {
    setEditingId(t.id)
    setFormName(t.name)
    setFormCategory(t.category)
    setFormTags(Array.isArray(t.tags) ? t.tags.join(', ') : '')
    setFormHtml(t.html_template)
    setFormThumbFile(null)
    setModalOpen(true)
  }

  const handleSaveTemplate = async () => {
    if (!formName.trim() || !formHtml.trim()) {
      toast.error('이름과 HTML 템플릿을 입력하세요.')
      return
    }
    setSaving(true)
    try {
      const tags = formTags.split(',').map((s) => s.trim()).filter(Boolean)
      const variables = extractVariables(formHtml)

      if (editingId) {
        let thumbnailUrl: string | null = null
        if (formThumbFile) {
          const ext = formThumbFile.name.split('.').pop() || 'jpg'
          const path = `${editingId}.${ext}`
          const { error: upErr } = await supabase.storage.from('thumbnails').upload(path, formThumbFile, { upsert: true })
          if (upErr) throw upErr
          const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
          thumbnailUrl = urlData.publicUrl
        }
        const previewHtml = buildPreviewHtml(formHtml)
        const { error } = await supabase.rpc('admin_upsert_template_v2', {
          p_id: editingId,
          p_name: formName.trim(),
          p_category: formCategory,
          p_tags: tags,
          p_variables: variables,
          p_html_template: formHtml,
          p_preview_html: previewHtml,
          p_thumbnail_url: thumbnailUrl,
          p_is_active: true,
        })
        if (error) throw error
        toast.success('템플릿이 수정되었습니다.')
      } else {
        let thumbnailUrl: string | null = null
        if (formThumbFile) {
          const ext = formThumbFile.name.split('.').pop() || 'jpg'
          const path = `${crypto.randomUUID()}.${ext}`
          const { error: upErr } = await supabase.storage.from('thumbnails').upload(path, formThumbFile, { upsert: true })
          if (upErr) throw upErr
          const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
          thumbnailUrl = urlData.publicUrl
        }
        const previewHtml = buildPreviewHtml(formHtml)
        const { error: insertErr } = await supabase.rpc('admin_upsert_template_v2', {
          p_id: null,
          p_name: formName.trim(),
          p_category: formCategory,
          p_tags: tags,
          p_variables: variables,
          p_html_template: formHtml,
          p_preview_html: previewHtml,
          p_thumbnail_url: thumbnailUrl,
          p_is_active: true,
        })
        if (insertErr) throw insertErr
        toast.success('템플릿이 추가되었습니다.')
      }
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('이 템플릿을 비활성화하시겠습니까?')) return
    const { error } = await supabase.rpc('admin_set_template_active', { p_id: id, p_is_active: false })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('비활성화되었습니다.')
    queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
  }

  const handleInquiryReply = async () => {
    if (!inquiryReplyId || !inquiryReplyText.trim()) return
    setInquiryReplySaving(true)
    try {
      const inquiry = adminInquiries.find((i) => i.id === inquiryReplyId)
      const { error } = await supabase
        .from('inquiries')
        .update({
          admin_reply: inquiryReplyText.trim(),
          replied_at: new Date().toISOString(),
          status: 'replied',
        })
        .eq('id', inquiryReplyId)
      if (error) throw error
      if (inquiry?.userEmail && inquiry.userEmail !== '-') {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'inquiry_answered',
            to: inquiry.userEmail,
            inquirySubject: inquiry.subject,
            adminReply: inquiryReplyText.trim(),
          },
        })
      }
      toast.success('답변이 등록되었고, 이메일이 발송되었습니다.')
      setInquiryReplyId(null)
      setInquiryReplyText('')
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setInquiryReplySaving(false)
    }
  }

  useEffect(() => {
    if (!profile?.is_admin) return
    const chOrders = supabase.channel('admin-realtime-orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
      setBadgeOrders((n) => n + 1)
    }).subscribe()
    const chInquiries = supabase.channel('admin-realtime-inquiries').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, () => {
      setBadgeInquiries((n) => n + 1)
    }).subscribe()
    const chChatbot = supabase.channel('admin-realtime-chatbot').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chatbot_inquiries' }, () => {
      setBadgeChatbot((n) => n + 1)
    }).subscribe()
    const chRefunds = supabase.channel('admin-realtime-refunds').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'refund_requests' }, () => {
      setBadgeRefunds((n) => n + 1)
    }).subscribe()
    return () => {
      supabase.removeChannel(chOrders)
      supabase.removeChannel(chInquiries)
      supabase.removeChannel(chChatbot)
      supabase.removeChannel(chRefunds)
    }
  }, [profile?.is_admin])

  useEffect(() => {
    if (tab === 'orders') setBadgeOrders(0)
    if (tab === 'inquiries') setBadgeInquiries(0)
    if (tab === 'chatbot') setBadgeChatbot(0)
    if (tab === 'refunds') setBadgeRefunds(0)
  }, [tab])

  useEffect(() => {
    if (['templates', 'orders', 'users', 'inquiries', 'chatbot', 'refunds'].includes(tab)) {
      document.title = '관리자 — SEOAH.STUDIO'
    }
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [tab])

  const handleRefundProcess = async (action: 'approve' | 'reject') => {
    if (!refundReviewId) return
    setRefundProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: { requestId: refundReviewId, action, reviewNote: refundReviewNote.trim() || undefined },
      })
      if (error) throw error
      if (data && !(data as { success?: boolean }).success) {
        const err = (data as { error?: { code?: string; message?: string } }).error
        const code = err?.code ?? ''
        const msg = err?.message ?? '처리 실패'
        if (code === 'PORTONE_CANCEL_FAILED' || code === 'REFUND_ERROR') {
          throw new Error(`${msg} PortOne 환불 API 실패 시 수동 환불 후 관리자에서 상태를 확인해 주세요.`)
        }
        throw new Error(msg)
      }
      toast.success(action === 'approve' ? '환불이 승인되었습니다.' : '환불 요청이 거절되었습니다.')
      setRefundReviewId(null)
      setRefundReviewNote('')
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRefundProcessing(false)
    }
  }

  const orderStats = useMemo(() => {
    const paid = (orders as { status: string; amount?: number; created_at: string }[]).filter((o) => o.status === 'paid')
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const thisMonth = paid.filter((o) => new Date(o.created_at).getTime() >= thisMonthStart)
    const revenue = thisMonth.reduce((s, o) => s + (o.amount ?? 0), 0)
    return { totalOrders: orders.length, paidCount: paid.length, thisMonthRevenue: revenue }
  }, [orders])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-gray-900">관리자</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 overflow-x-auto">
        {(['templates', 'orders', 'users', 'inquiries', 'chatbot', 'refunds'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative min-h-[44px] shrink-0 border-b-2 px-4 py-2 text-sm font-medium ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'templates' && '템플릿 관리'}
            {t === 'orders' && <>주문 현황 {badgeOrders > 0 && <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">{badgeOrders}</span>}</>}
            {t === 'users' && '사용자'}
            {t === 'inquiries' && <>문의 관리 {badgeInquiries > 0 && <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">{badgeInquiries}</span>}</>}
            {t === 'chatbot' && <>챗봇 문의 {badgeChatbot > 0 && <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">{badgeChatbot}</span>}</>}
            {t === 'refunds' && <>환불 관리 {badgeRefunds > 0 && <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">{badgeRefunds}</span>}</>}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">템플릿 관리</h2>
            <div className="flex flex-wrap gap-2">
              <AdminPreviewRebuildButton
                templates={templates}
                disabled={previewRebuilding}
                onRebuildingChange={setPreviewRebuilding}
              />
              <button type="button" onClick={openNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                새 템플릿 추가
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">이름</th>
                  <th className="py-2">카테고리</th>
                  <th className="py-2">태그</th>
                  <th className="py-2">활성</th>
                  <th className="py-2">미리보기</th>
                  <th className="py-2">수정</th>
                  <th className="py-2">비활성화</th>
                </tr>
              </thead>
              <tbody>
                {(templates ?? []).map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2">{t.category}</td>
                    <td className="py-2">{Array.isArray(t.tags) ? t.tags.slice(0, 3).join(', ') : '-'}</td>
                    <td className="py-2">{t.is_active ? 'Y' : 'N'}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setPreviewRebuilding(true)
                            await updatePreviewHtml(t.id, t.html_template)
                            toast.success('미리보기가 재생성되었습니다.')
                            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
                          } catch (e) {
                            toast.error((e as Error).message)
                          } finally {
                            setPreviewRebuilding(false)
                          }
                        }}
                        disabled={previewRebuilding}
                        className="text-gray-700 hover:underline disabled:opacity-50"
                      >
                        재생성
                      </button>
                    </td>
                    <td className="py-2">
                      <button type="button" onClick={() => openEdit(t)} className="text-primary hover:underline">
                        수정
                      </button>
                    </td>
                    <td className="py-2">
                      {t.is_active && (
                        <button type="button" onClick={() => handleDeactivate(t.id)} className="text-amber-600 hover:underline">
                          비활성화
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'orders' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">주문 현황</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">이번 달 매출</p>
              <p className="text-xl font-semibold">{orderStats.thisMonthRevenue.toLocaleString()}원</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">총 주문 수</p>
              <p className="text-xl font-semibold">{orderStats.totalOrders}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">결제 완료</p>
              <p className="text-xl font-semibold">{orderStats.paidCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">신규 사용자 (이번 달)</p>
              <p className="text-xl font-semibold">{newUsersThisMonth ?? '-'}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['today', 'week', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setOrderPeriod(p)}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium ${orderPeriod === p ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {p === 'today' ? '오늘' : p === 'week' ? '이번 주' : '전체'}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">주문번호</th>
                  <th className="py-2">이메일</th>
                  <th className="py-2">파일 형태</th>
                  <th className="py-2">금액</th>
                  <th className="py-2">상태</th>
                  <th className="py-2">날짜</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 50).map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="py-2">{o.id.slice(0, 8)}...</td>
                    <td className="py-2">{o.users?.email ?? '-'}</td>
                    <td className="py-2">{o.plan_type ?? '-'}</td>
                    <td className="py-2">{o.amount?.toLocaleString()}</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">사용자</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">이름</th>
                  <th className="py-2">이메일</th>
                  <th className="py-2">가입일</th>
                  <th className="py-2">프로젝트 수</th>
                  <th className="py-2">결제 횟수</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u: { id: string; email: string; name: string | null; created_at: string }) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.name ?? '-'}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-2">{projectCounts?.[u.id] ?? 0}</td>
                    <td className="py-2">{orderCounts?.[u.id] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'inquiries' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">문의 관리</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">제목</th>
                  <th className="py-2">유형</th>
                  <th className="py-2">문의자</th>
                  <th className="py-2">상태</th>
                  <th className="py-2">일시</th>
                  <th className="py-2">답변</th>
                </tr>
              </thead>
              <tbody>
                {adminInquiries.map((i) => (
                  <tr key={i.id} className="border-b">
                    <td className="py-2">{i.subject}</td>
                    <td className="py-2">{(i as { type?: string | null }).type ?? '-'}</td>
                    <td className="py-2">{(i as { userEmail?: string }).userEmail ?? '-'}</td>
                    <td className="py-2">
                      <span className={`rounded px-2 py-0.5 text-xs ${i.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {i.status === 'replied' ? '답변완료' : '접수'}
                      </span>
                    </td>
                    <td className="py-2">{new Date(i.created_at).toLocaleString()}</td>
                    <td className="py-2">
                      {i.status === 'replied' ? (
                        <span className="text-gray-400">답변 완료</span>
                      ) : (
                        <button type="button" onClick={() => { setInquiryReplyId(i.id); setInquiryReplyText(i.admin_reply ?? ''); }} className="text-primary hover:underline">
                          답변하기
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {adminInquiries.length === 0 && <p className="py-4 text-center text-gray-500">문의가 없습니다.</p>}
          </div>
        </section>
      )}

      {tab === 'refunds' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">환불 관리</h2>
          <p className="mt-1 text-sm text-gray-500">총 {refundRequests.length}건</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">주문</th>
                  <th className="py-2">이메일</th>
                  <th className="py-2">금액</th>
                  <th className="py-2">사유</th>
                  <th className="py-2">상태</th>
                  <th className="py-2">요청일</th>
                  <th className="py-2">처리</th>
                </tr>
              </thead>
              <tbody>
                {refundRequests.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.order_id?.slice(0, 8)}...</td>
                    <td className="py-2">{r.orders?.users?.email ?? '-'}</td>
                    <td className="py-2">{(r.orders?.amount ?? 0).toLocaleString()}원</td>
                    <td className="max-w-[180px] truncate py-2" title={r.reason}>{r.reason}</td>
                    <td className="py-2">
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        r.status === 'requested' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status === 'requested' ? '대기' : r.status === 'approved' ? '승인' : '거절'}
                      </span>
                    </td>
                    <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2">
                      {r.status === 'requested' && (
                        <button
                          type="button"
                          onClick={() => { setRefundReviewId(r.id); setRefundReviewNote(''); }}
                          className="text-primary hover:underline"
                        >
                          검토
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {refundRequests.length === 0 && <p className="py-4 text-center text-gray-500">환불 요청이 없습니다.</p>}
          </div>
        </section>
      )}

      {tab === 'chatbot' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">챗봇 문의</h2>
          <p className="mt-1 text-sm text-gray-500">총 {chatbotInquiries.length}건</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">카테고리</th>
                  <th className="py-2">이름</th>
                  <th className="py-2">이메일</th>
                  <th className="py-2">내용</th>
                  <th className="py-2">일시</th>
                </tr>
              </thead>
              <tbody>
                {chatbotInquiries.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.category ?? '-'}</td>
                    <td className="py-2">{c.name ?? '-'}</td>
                    <td className="py-2">{c.email ?? '-'}</td>
                    <td className="max-w-[200px] truncate py-2" title={c.content ?? ''}>{c.content ?? '-'}</td>
                    <td className="py-2">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {chatbotInquiries.length === 0 && <p className="py-4 text-center text-gray-500">챗봇 문의가 없습니다.</p>}
          </div>
        </section>
      )}

      {refundReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">환불 검토</h3>
            <p className="mt-1 text-sm text-gray-600">승인 시 포트원 환불 API가 호출됩니다.</p>
            <textarea
              value={refundReviewNote}
              onChange={(e) => setRefundReviewNote(e.target.value)}
              rows={3}
              placeholder="검토 메모 / 거절 사유 (선택)"
              className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setRefundReviewId(null); setRefundReviewNote(''); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                취소
              </button>
              <button type="button" onClick={() => handleRefundProcess('reject')} disabled={refundProcessing} className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
                거절
              </button>
              <button type="button" onClick={() => handleRefundProcess('approve')} disabled={refundProcessing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                {refundProcessing ? '처리 중...' : '승인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {inquiryReplyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">답변 등록</h3>
            <p className="mt-1 text-sm text-gray-600">{adminInquiries.find((i) => i.id === inquiryReplyId)?.subject}</p>
            <textarea
              value={inquiryReplyText}
              onChange={(e) => setInquiryReplyText(e.target.value)}
              rows={5}
              placeholder="답변 내용"
              className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setInquiryReplyId(null); setInquiryReplyText(''); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                취소
              </button>
              <button type="button" onClick={handleInquiryReply} disabled={inquiryReplySaving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                {inquiryReplySaving ? '저장 중...' : '답변 등록 및 이메일 발송'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">{editingId ? '템플릿 수정' : '새 템플릿 추가'}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500">이름</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">카테고리</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
                  <option value="portfolio">portfolio</option>
                  <option value="homepage">homepage</option>
                  <option value="app-mvp">app-mvp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500">태그 (쉼표 구분)</label>
                <input type="text" value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="미니멀, 포트폴리오" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">썸네일 이미지 (선택)</label>
                <input type="file" accept="image/*" onChange={(e) => setFormThumbFile(e.target.files?.[0] ?? null)} className="mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">HTML 템플릿 ({'{{변수}}'} 사용)</label>
                <textarea value={formHtml} onChange={(e) => setFormHtml(e.target.value)} rows={12} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" placeholder="<html>..." />
                {formHtml && (() => {
                  const detected = extractVariables(formHtml)
                  const missingRequired = REQUIRED_SLOTS.filter((s) => !detected.includes(s))
                  return (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-gray-500">감지된 변수: {detected.length ? detected.join(', ') : '없음'}</p>
                      {missingRequired.length > 0 && (
                        <p className="text-xs text-amber-600">필수 슬롯 누락: {missingRequired.join(', ')} — 템플릿에 포함하는 것을 권장합니다.</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                취소
              </button>
              <button type="button" onClick={handleSaveTemplate} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
