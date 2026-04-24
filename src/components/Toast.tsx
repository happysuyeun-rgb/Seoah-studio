import { useToastStore } from '../store/toastStore'

export function Toast() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`rounded-lg px-4 py-3 shadow-lg ${
            t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'
          }`}
        >
          {t.message}
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="ml-2 opacity-80 hover:opacity-100"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
