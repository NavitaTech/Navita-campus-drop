'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { AdminHeader } from './AdminChrome'
import { Logo } from './Brand'
import { useLang } from './LangProvider'

export function QrView({ user, baseUrl }: { user: { name: string }; baseUrl: string }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const [applyUrl, setApplyUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    const origin = baseUrl || window.location.origin
    const url = origin.replace(/\/$/, '')
    setApplyUrl(url)

    QRCode.toDataURL(url, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#1A3659', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [baseUrl])

  async function copy() {
    await navigator.clipboard.writeText(applyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-dvh">
      <AdminHeader user={user} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="no-print">
          <Link href="/admin" className="text-sm font-semibold text-navy hover:text-orange">
            ← {t.admin.detail.back}
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-navy">{t.admin.qr.title}</h1>
          <div className="brand-rule mt-3 w-32" />
          <p className="mt-4 text-[15px] text-muted">{t.admin.qr.subtitle}</p>
        </div>

        {/* The printable poster */}
        <div className="mt-7 overflow-hidden rounded-brand border border-grey bg-white shadow-sm">
          <div className="bg-navy px-8 py-8 text-center">
            <div className="mx-auto inline-block rounded-xl bg-white px-5 py-3">
              <Logo className="h-12 w-auto" />
            </div>
            <p className="mt-5 text-lg font-bold text-white">{t.home.badge}</p>
            <p className="mt-1 text-sm text-white/70">{t.tagline}</p>
          </div>

          <div className="flex flex-col items-center px-8 py-10">
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt={t.admin.qr.scan}
                width={320}
                height={320}
                className="size-64 sm:size-80"
              />
            ) : (
              <div className="size-64 animate-pulse rounded-xl bg-grey sm:size-80" />
            )}
            <p className="mt-6 text-center text-lg font-bold text-navy">{t.admin.qr.scan}</p>
            <p className="mt-2 break-all text-center text-xs text-muted" dir="ltr">
              {applyUrl}
            </p>
            <div className="brand-rule mt-6 w-32" />
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <a
            href={qrDataUrl || '#'}
            download="navita-apply-qr.png"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-600"
          >
            {t.admin.qr.download}
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-bold text-navy transition hover:bg-navy-050"
          >
            {t.admin.qr.print}
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-bold text-navy transition hover:bg-navy-050"
          >
            {copied ? t.admin.qr.copied : t.admin.qr.copy}
          </button>
        </div>
      </main>
    </div>
  )
}
