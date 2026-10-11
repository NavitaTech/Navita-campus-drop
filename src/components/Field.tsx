'use client'

import { useId } from 'react'

const base =
  'w-full rounded-xl border border-grey bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition ' +
  'placeholder:text-muted/70 focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-grey/40'

type Common = { label: string; required?: boolean; hint?: string; error?: string }

function Shell({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
}: Common & { htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
        {label} {required && <span className="text-orange">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  )
}

export function Input({
  label,
  required,
  hint,
  error,
  ...props
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Shell label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={`${base} ${error ? 'border-rose-400' : ''}`}
        {...props}
      />
    </Shell>
  )
}

export function Textarea({
  label,
  required,
  hint,
  error,
  ...props
}: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Shell label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <textarea
        id={id}
        required={required}
        rows={4}
        aria-invalid={!!error}
        className={`${base} resize-y ${error ? 'border-rose-400' : ''}`}
        {...props}
      />
    </Shell>
  )
}

export function Select({
  label,
  required,
  hint,
  error,
  placeholder,
  options,
  ...props
}: Common & {
  placeholder: string
  options: { value: string; label: string }[]
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Shell label={label} required={required} hint={hint} error={error} htmlFor={id}>
      <select
        id={id}
        required={required}
        aria-invalid={!!error}
        className={`${base} ${error ? 'border-rose-400' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  )
}

export function Checkbox({
  label,
  error,
  ...props
}: { label: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-[#EB692E]"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  )
}

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-brand border border-grey bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      <div className="brand-rule mt-3 mb-5 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

/** Makes a field span both columns of <Section>'s grid. */
export function Wide({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}
