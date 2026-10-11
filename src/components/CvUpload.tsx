'use client'

import { useRef, useState } from 'react'
import { CV_MAX_BYTES, CV_MIME } from '@/lib/options'
import { useLang } from './LangProvider'

export function CvUpload({
  file,
  onChange,
  error,
  label,
}: {
  file: File | null
  onChange: (f: File | null, err?: string) => void
  error?: string
  /** Defaults to the job-track wording; the Master's track passes its own. */
  label?: string
}) {
  const { t, lang } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function accept(f: File | undefined) {
    if (!f) return
    if (!CV_MIME.includes(f.type)) return onChange(null, t.form.err.cvType)
    if (f.size > CV_MAX_BYTES) return onChange(null, t.form.err.cvSize)
    onChange(f)
  }

  const sizeLabel = file
    ? `${(file.size / 1024 / 1024).toFixed(2)} ${lang === 'ar' ? 'ميجابايت' : 'MB'}`
    : ''

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-navy">
        {label ?? t.form.f.cv} <span className="text-orange">*</span>
      </span>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-navy/20 bg-navy-050 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-orange/10 text-orange">
              <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                <path
                  d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{file.name}</p>
              <p className="text-xs text-muted">
                {t.form.f.cv_selected} · {sizeLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            {t.form.f.remove}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            accept(e.dataTransfer.files?.[0])
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging
              ? 'border-orange bg-orange/5'
              : error
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-grey bg-white hover:border-navy/40 hover:bg-navy-050/50'
          }`}
        >
          <span className="grid size-11 place-items-center rounded-full bg-navy-050 text-navy">
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
              <path
                d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold text-navy">{label ?? t.form.f.cv}</span>
          <span className="text-xs text-muted">{t.form.f.cv_hint}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  )
}
