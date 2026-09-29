import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useProjectStore } from '../store/projectStore'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import { getErrorMessage } from '../lib/errorCodes'
import { StepIndicator } from '../components/StepIndicator'
import type { Template } from '../types'

const ACCEPT = '.txt,.md,.pptx,.docx,.jpg,.jpeg,.png,.pdf'
const ACCEPT_EXT = ['txt', 'md', 'pptx', 'docx', 'jpg', 'jpeg', 'png', 'pdf']
const MAX_SIZE = 20 * 1024 * 1024
const MAX_FILES = 3

function isAcceptedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return ACCEPT_EXT.includes(ext)
}

type FileBannerType = 'office' | 'image' | null
function getFileBannerType(name: string): FileBannerType {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['pptx', 'docx'].includes(ext)) return 'office'
  if (['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) return 'image'
  return null
}

export function UploadPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    selectedTemplateId,
    setCurrentProjectId,
    setUploadedFilePaths,
    setTextInput,
    uploadedFiles,
    setUploadedFiles,
    textInput,
  } = useProjectStore()
  const [uploading, setUploading] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadTab, setUploadTab] = useState<'file' | 'text'>('file')

  const canSubmit = (uploadedFiles.length > 0 || (textInput && textInput.trim().length >= 50))

  const { data: selectedTemplate } = useQuery({
    queryKey: ['template', selectedTemplateId],
    queryFn: async () => {
      if (!selectedTemplateId) return null
      const { data, error } = await supabase
        .from('templates_public')
        .select('id, name, category, thumbnail_url')
        .eq('id', selectedTemplateId)
        .single()
      if (error || !data) return null
      return data as Pick<Template, 'id' | 'name' | 'category' | 'thumbnail_url'>
    },
    enabled: !!selectedTemplateId,
  })

  const inputGuide = [
    { title: '회사/서비스명', desc: '회사 또는 서비스 이름을 적어 주세요.' },
    { title: '타겟/한 줄 소개', desc: '대상 고객이나 한 줄 캐치프레이즈.' },
    { title: '기능 3줄', desc: '주요 기능이나 특징을 3가지 정도로 정리.' },
    { title: '연락처', desc: '이메일, 전화, SNS 등 연락 수단.' },
    { title: '추가 톤/문구', desc: '원하는 말투나 강조할 문구가 있으면 적어 주세요.' },
  ]

  const handleFiles = (files: File[]) => {
    const accepted = files.filter((f) => isAcceptedFile(f))
    if (accepted.length !== files.length) toast.error(getErrorMessage('E-010', '지원하지 않는 파일 형식입니다.'))
    const valid = accepted.filter((f) => f.size <= MAX_SIZE)
    if (valid.length !== accepted.length) toast.error(getErrorMessage('E-011', '파일 크기는 20MB 이하여야 합니다.'))
    const combined = [...uploadedFiles, ...valid].slice(0, MAX_FILES)
    setUploadedFiles(combined)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length) handleFiles(files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user || !selectedTemplateId || !canSubmit) return
    setUploading(true)
    try {
      const { data: project, error: insertErr } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          template_id: selectedTemplateId,
          status: 'draft',
          input_data: { textInput: textInput.trim() },
        })
        .select('id')
        .single()
      if (insertErr || !project?.id) throw insertErr ?? new Error('프로젝트를 만들지 못했습니다.')
      const projectId = project.id

      const filePaths: string[] = []
      try {
        if (uploadedFiles.length > 0) {
          const pathPrefix = `${user.id}/${projectId}`
          for (const file of uploadedFiles) {
            const safeName = file.name.split(/[/\\]/).pop() || 'file'
            if (safeName === '.' || safeName === '..') throw new Error('파일 이름이 올바르지 않습니다.')
            const path = `${pathPrefix}/${safeName}`
            const { error: uploadErr } = await supabase.storage.from('project-uploads').upload(path, file, { upsert: true })
            if (uploadErr) throw uploadErr
            filePaths.push(path)
          }
          const { error: updateErr } = await supabase
            .from('projects')
            .update({ input_data: { textInput: textInput.trim(), filePaths } })
            .eq('id', projectId)
            .eq('user_id', user.id)
          if (updateErr) throw updateErr
        }
      } catch (uploadErr) {
        if (filePaths.length > 0) {
          await supabase.storage.from('project-uploads').remove(filePaths)
        }
        await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', projectId).eq('user_id', user.id)
        throw uploadErr
      }
      setUploadedFilePaths(filePaths)
      setCurrentProjectId(projectId)
      navigate('/project/customize')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '업로드 실패'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const charCount = (textInput ?? '').trim().length
  const minChars = 50

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <StepIndicator currentStep="upload" />
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_minmax(200px,30%)]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">자료 업로드</h1>
          <div className="mt-4 flex border-b border-gray-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={uploadTab === 'file'}
              onClick={() => setUploadTab('file')}
              className={`min-h-[44px] border-b-2 px-4 py-2 text-sm font-medium ${
                uploadTab === 'file' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              파일 업로드
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={uploadTab === 'text'}
              onClick={() => setUploadTab('text')}
              className={`min-h-[44px] border-b-2 px-4 py-2 text-sm font-medium ${
                uploadTab === 'text' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              직접 입력
            </button>
          </div>
          <div className="mt-6 space-y-8">
            {uploadTab === 'file' && (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">파일 업로드</label>
              <div
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-2 flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 bg-gray-50'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  accept={ACCEPT}
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <span className="cursor-pointer text-sm text-gray-600 hover:text-primary">
                  클릭 또는 드래그하여 파일 선택 (.txt, .md, .pptx, .docx, .jpg, .png, .pdf / 최대 20MB, 3개)
                </span>
            {uploadedFiles.length > 0 && (
              <ul className="mt-4 w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                {uploadedFiles.map((f, i) => {
                  const bannerType = getFileBannerType(f.name)
                  return (
                    <li key={i} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="min-h-[44px] text-red-600 hover:underline" aria-label="파일 삭제">
                          삭제
                        </button>
                      </div>
                      {bannerType === 'office' && (
                        <div className="flex items-start gap-2 bg-amber-50 border-t border-amber-200 px-3 py-2 text-xs text-amber-900">
                          <span className="shrink-0" aria-hidden>⚠</span>
                          <span>
                            PPT·Word 파일은 텍스트를 추출합니다. 빠지는 내용이 있으면 &apos;직접 입력&apos; 탭에 보완해 주세요.
                          </span>
                        </div>
                      )}
                      {bannerType === 'image' && (
                        <div className="flex items-start gap-2 bg-blue-50 border-t border-blue-200 px-3 py-2 text-xs text-blue-900">
                          <span className="shrink-0" aria-hidden>ℹ</span>
                          <span>
                            이미지·PDF는 내용 자동 인식을 지원하지 않습니다. 이미지에 담긴 텍스트를 &apos;직접 입력&apos; 탭에 작성해주세요.
                          </span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
            </div>
            )}
            {uploadTab === 'text' && (
            <div>
              <button
                type="button"
                onClick={() => setGuideOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>어떤 내용을 입력하면 좋을까요?</span>
                <span className="text-gray-500">{guideOpen ? '▲' : '▼'}</span>
              </button>
              {guideOpen && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 text-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 font-medium text-gray-900">구분</th>
                        <th className="py-2 font-medium text-gray-900">형식</th>
                        <th className="py-2 font-medium text-gray-900">안내</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 text-gray-600">지원</td>
                        <td className="py-2 font-mono text-gray-900">.txt .md</td>
                        <td className="py-2 text-gray-600">AI가 자동으로 텍스트 추출</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 text-gray-600">제한</td>
                        <td className="py-2 font-mono text-gray-900">.pptx .docx</td>
                        <td className="py-2 text-gray-600">텍스트 추출. 직접 입력 병행 권장</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 text-gray-600">미지원</td>
                        <td className="py-2 font-mono text-gray-900">.jpg .png .pdf</td>
                        <td className="py-2 text-gray-600">내용 자동 인식 없음. 직접 입력 필요</td>
                      </tr>
                    </tbody>
                  </table>
                  <ul className="mt-4 space-y-2">
                    {inputGuide.map((item) => (
                      <li key={item.title}>
                        <span className="font-medium text-gray-900">{item.title}</span>
                        <span className="ml-2 text-gray-600">– {item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <label htmlFor="upload-text-input" className="mt-4 block text-sm font-medium text-gray-700">텍스트 입력</label>
              <textarea
                id="upload-text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="회사명, 서비스 소개, 주요 기능, 연락처 등을 입력해 주세요."
                className="mt-2 min-h-[200px] w-full rounded-lg border border-gray-300 p-3 text-sm"
                rows={8}
              />
              <p className="mt-1 text-right text-sm">
                <span className={charCount >= minChars ? 'text-green-600' : 'text-amber-600'}>
                  {charCount} / 50자 이상
                </span>
              </p>
            </div>
            )}
        </div>
        <button
          type="button"
          disabled={!canSubmit || uploading}
          onClick={handleSubmit}
          className="w-full min-h-[44px] rounded-lg bg-primary py-3 font-medium text-white disabled:opacity-50 hover:bg-primary/90 disabled:hover:bg-primary"
        >
          {uploading ? '처리 중...' : 'AI 커스터마이징 시작'}
        </button>
        </div>

        <aside className="order-2 border-t border-gray-200 pt-8 md:order-none md:border-t-0 md:border-l md:border-gray-200 md:pl-8 md:pt-0">
          <h2 className="text-sm font-medium text-gray-700">선택한 템플릿</h2>
          {selectedTemplate ? (
            <div className="mt-3">
              {selectedTemplate.thumbnail_url ? (
                <img
                  src={selectedTemplate.thumbnail_url}
                  alt=""
                  className="aspect-video w-full rounded-lg border border-gray-200 object-cover"
                />
              ) : (
                <div className="aspect-video w-full rounded-lg border border-gray-200 bg-gray-100" />
              )}
              <p className="mt-2 font-medium text-gray-900">{selectedTemplate.name}</p>
              <button
                type="button"
                onClick={() => navigate(`/templates/${selectedTemplate.category}`)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                템플릿 변경
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-500">템플릿이 선택되지 않았습니다</p>
              <button
                type="button"
                onClick={() => navigate('/templates/portfolio')}
                className="mt-2 text-sm text-primary hover:underline"
              >
                갤러리에서 선택
              </button>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
