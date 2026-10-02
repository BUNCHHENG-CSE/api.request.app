'use client'

import { useActionState, useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { useSync } from '@/hooks/useSync'

type FormState = { error: string | null }

export function AuthScreen() {
  const sync = useSync()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [state, submit, pending] = useActionState(async (_previous: FormState, formData: FormData): Promise<FormState> => {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const error = mode === 'login'
      ? await sync.login({ email, password })
      : await sync.register({ username: String(formData.get('username') ?? ''), email, password })
    return { error }
  }, { error: null })

  return (
    <main className="min-h-screen grid place-items-center bg-background p-6">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary"><Zap className="size-5 text-primary-foreground" /></div>
          <div><h1 className="font-bold">FlowAPI</h1><p className="text-xs text-muted-foreground">Connect to your API workspace</p></div>
        </div>
        <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted/50 p-1 text-xs">
          <button type="button" onClick={() => setMode('login')} className={`rounded-md py-2 ${mode === 'login' ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}>Sign in</button>
          <button type="button" onClick={() => setMode('register')} className={`rounded-md py-2 ${mode === 'register' ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}>Register</button>
        </div>
        <form action={submit} className="space-y-4">
          {mode === 'register' && <Field name="username" label="Username" autoComplete="username" />}
          <Field name="email" label="Email" type="email" autoComplete="email" />
          <Field name="password" label="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} />
          {state.error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-500">{state.error}</p>}
          <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {pending && <Loader2 className="size-4 animate-spin" />}{mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  const { label, ...inputProps } = props
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span><input required {...inputProps} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" /></label>
}
