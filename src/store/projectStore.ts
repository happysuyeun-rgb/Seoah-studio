import { create } from 'zustand'

export interface CustomResult {
  company?: string
  headline?: string
  description?: string
  feature_1?: string
  feature_2?: string
  feature_3?: string
  cta?: string
  contact?: string
  color_primary?: string
  color_secondary?: string
  font_hint?: string
  logo_url?: string
  [key: string]: unknown
}

interface ProjectState {
  selectedTemplateId: string | null
  currentProjectId: string | null
  uploadedFiles: File[]
  uploadedFileUrls: string[]
  textInput: string
  customResult: CustomResult | null
  setSelectedTemplateId: (id: string | null) => void
  setCurrentProjectId: (id: string | null) => void
  setUploadedFiles: (files: File[]) => void
  setUploadedFileUrls: (urls: string[]) => void
  setTextInput: (text: string) => void
  setCustomResult: (result: CustomResult | null) => void
  reset: () => void
}

export const PROJECT_ID_STORAGE_KEY = 'seoah_current_project_id'

export function getStoredProjectId(): string | null {
  try {
    return sessionStorage.getItem(PROJECT_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

const initialState = {
  selectedTemplateId: null,
  currentProjectId: null,
  uploadedFiles: [],
  uploadedFileUrls: [],
  textInput: '',
  customResult: null,
}

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setCurrentProjectId: (id) => {
    try {
      if (id) sessionStorage.setItem(PROJECT_ID_STORAGE_KEY, id)
      else sessionStorage.removeItem(PROJECT_ID_STORAGE_KEY)
    } catch (_) {}
    set({ currentProjectId: id })
  },
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  setUploadedFileUrls: (urls) => set({ uploadedFileUrls: urls }),
  setTextInput: (text) => set({ textInput: text }),
  setCustomResult: (result) => set({ customResult: result }),
  reset: () => set(initialState),
}))
