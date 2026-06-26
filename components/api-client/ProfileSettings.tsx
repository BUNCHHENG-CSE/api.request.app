'use client'

import { useState } from 'react'
import { X, Save, Camera, Bell, Shield, Palette, User, Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileSettingsProps {
  onClose: () => void
}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'security'

const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#ec4899', // pink
  '#6366f1', // indigo
]

const NAV: { id: SettingsSection; label: string; Icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'security', label: 'Security', Icon: Shield },
]

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [section, setSection] = useState<SettingsSection>('profile')

  // Profile state
  const [name, setName] = useState('Developer')
  const [email, setEmail] = useState('developer@flowapi.dev')
  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState('#3b82f6')
  const [saved, setSaved] = useState(false)

  // Appearance
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')

  // Notifications
  const [notifyRequests, setNotifyRequests] = useState(true)
  const [notifyMembers, setNotifyMembers] = useState(true)
  const [notifyUpdates, setNotifyUpdates] = useState(false)

  const initials = name.substring(0, 2).toUpperCase()

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Left nav */}
        <div className="w-48 shrink-0 border-r border-border flex flex-col bg-card">
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Settings</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Manage your account</p>
          </div>
          <nav className="p-2 flex-1">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left',
                  section === id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h3 className="text-sm font-semibold capitalize text-foreground">
              {NAV.find((n) => n.id === section)?.label}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* ── Profile ── */}
            {section === 'profile' && (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div
                      className="size-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                      style={{ background: avatarColor }}
                    >
                      {initials}
                    </div>
                    <button
                      className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="size-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{name || 'Your Name'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAvatarColor(c)}
                          className={cn(
                            'size-5 rounded-full transition-all',
                            avatarColor === c && 'ring-2 ring-offset-1 ring-offset-card ring-white/50 scale-110',
                          )}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Display Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="A short bio about yourself..."
                      rows={3}
                      className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Appearance ── */}
            {section === 'appearance' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dark', 'light', 'system'] as const).map((t) => {
                      const Icon = t === 'dark' ? Moon : t === 'light' ? Sun : Monitor
                      return (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                            theme === t
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground',
                          )}
                        >
                          <Icon className="size-5" />
                          <span className="text-xs font-medium capitalize">{t}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Editor Font Size
                  </label>
                  <div className="flex items-center gap-2">
                    {(['sm', 'md', 'lg'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={cn(
                          'flex-1 py-2 rounded-xl border text-xs font-medium transition-all',
                          fontSize === s
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-surface text-muted-foreground hover:bg-accent',
                        )}
                      >
                        {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {section === 'notifications' && (
              <div className="space-y-1">
                {[
                  { label: 'Request completion alerts', desc: 'Get notified when long-running requests complete', val: notifyRequests, set: setNotifyRequests },
                  { label: 'Team member activity', desc: 'Notify when team members join or make changes', val: notifyMembers, set: setNotifyMembers },
                  { label: 'Product updates', desc: 'Receive news about new features and improvements', val: notifyUpdates, set: setNotifyUpdates },
                ].map(({ label, desc, val, set }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={val}
                      onClick={() => set(!val)}
                      className={cn(
                        'relative inline-flex w-8 h-4 rounded-full border-2 transition-colors duration-200 shrink-0 mt-0.5',
                        val ? 'bg-primary border-primary' : 'bg-muted border-border',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block size-3 rounded-full bg-white shadow-sm transform transition-transform duration-200',
                          val ? 'translate-x-4' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Security ── */}
            {section === 'security' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 mt-4">
                  <p className="text-[11px] text-muted-foreground">
                    Password must be at least 8 characters and include a number and special character.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0 bg-card/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md',
                saved
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20',
              )}
            >
              <Save className="size-3.5" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
