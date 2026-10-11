'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { dict, type Dict, type Lang } from '@/lib/i18n'

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void; toggle: () => void }

const LangCtx = createContext<Ctx | null>(null)
const STORE_KEY = 'navita_lang'

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Arabic is the default; the first effect restores whatever the visitor chose
  // last time. Rendering starts from the server default to avoid a hydration
  // mismatch, then flips on the client.
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORE_KEY)
    if (saved === 'en' || saved === 'ar') setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dict[lang].dir
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(STORE_KEY, l)
      document.cookie = `${STORE_KEY}=${l}; path=/; max-age=31536000; samesite=lax`
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, [])

  const toggle = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang])

  return (
    <LangCtx.Provider value={{ lang, t: dict[lang] as unknown as Dict, setLang, toggle }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang(): Ctx {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
