'use client'

import Link from 'next/link'
import { SiteFooter, SiteHeader } from './Brand'
import { useLang } from './LangProvider'
import type { Department, Position } from '@/lib/types'

/** One of the two entry points a visitor picks between. */
function TrackCard({
  href,
  title,
  desc,
  cta,
  icon,
  accent,
}: {
  href: string
  title: string
  desc: string
  cta: string
  icon: React.ReactNode
  accent: 'navy' | 'orange'
}) {
  const border = accent === 'orange' ? 'hover:border-orange' : 'hover:border-white/60'
  const badge = accent === 'orange' ? 'bg-orange/15 text-orange' : 'bg-white/15 text-white'
  const button =
    accent === 'orange'
      ? 'bg-orange text-white hover:bg-orange-600'
      : 'bg-white text-navy hover:bg-white/90'

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-brand border-2 border-white/20 bg-white/5 p-7 backdrop-blur transition hover:bg-white/10 ${border}`}
    >
      <span className={`grid size-14 place-items-center rounded-2xl ${badge}`}>{icon}</span>
      <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/75">{desc}</p>
      <span
        className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition ${button}`}
      >
        {cta}
      </span>
    </Link>
  )
}

export function HomeView({
  departments,
  positions,
}: {
  departments: Department[]
  positions: Position[]
}) {
  const { t, lang } = useLang()

  return (
    <div className="min-h-dvh">
      <SiteHeader showApply={false} />

      {/* The choice comes first, before anything else on the page. */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[-6rem] size-[26rem] rounded-full bg-orange/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/20">
              <span className="size-2 rounded-full bg-orange" />
              {t.brand} — {t.tagline}
            </span>
            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{t.chooser.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
              {t.chooser.subtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <TrackCard
              href="/apply/job"
              accent="navy"
              title={t.chooser.job.title}
              desc={t.chooser.job.desc}
              cta={t.chooser.job.cta}
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                  <path
                    d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v3M3 6a2 2 0 0 0-2 2v3m0 0v6a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-6m-22 0h22"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <TrackCard
              href="/apply/masters"
              accent="orange"
              title={t.chooser.masters.title}
              desc={t.chooser.masters.desc}
              cta={t.chooser.masters.cta}
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
                  <path
                    d="M12 4 2 9l10 5 10-5-10-5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5M21 9.5V15"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>

          {positions.length > 0 && (
            <p className="mt-7 text-center text-sm text-white/60">
              {positions.length} {t.home.openRoles}
            </p>
          )}
        </div>
      </section>

      {/* Supporting detail, for anyone who scrolls past the choice. */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-navy">{t.home.whyTitle}</h2>
        <div className="brand-rule mt-3 w-40" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {t.home.why.map((w) => (
            <div
              key={w.t}
              className="rounded-brand border border-grey bg-white p-6 shadow-sm"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-orange/10 text-orange">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                  <path
                    d="m12 3 2.4 5.3 5.6.6-4.2 3.9 1.2 5.7L12 15.7 6.9 18.5l1.2-5.7L4 8.9l5.6-.6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{w.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy">{t.home.departments}</h2>
          <div className="brand-rule mt-3 w-40" />

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {departments.map((d) => {
              const roles = positions.filter((p) => p.department_id === d.id)
              return (
                <div
                  key={d.id}
                  className="rounded-brand border border-grey p-6 transition hover:border-navy/30 hover:shadow-sm"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-bold text-navy">
                      {lang === 'ar' ? d.name_ar : d.name_en}
                    </h3>
                    <span className="shrink-0 rounded-full bg-navy-050 px-3 py-1 text-xs font-bold text-navy">
                      {roles.length}
                    </span>
                  </div>
                  {roles.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {roles.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-full bg-mist px-3 py-1.5 text-sm text-ink ring-1 ring-grey"
                        >
                          {lang === 'ar' ? p.title_ar : p.title_en}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-navy">{t.home.howTitle}</h2>
        <div className="brand-rule mt-3 w-40" />
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.how.map((s, i) => (
            <li key={s.t} className="rounded-brand border border-grey bg-white p-6 shadow-sm">
              <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold text-navy">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </div>
  )
}
