import { useState } from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

export function PageUserSettings() {
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const logout = useCampfireStore((state) => state.logout)
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || '')

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ displayName, username, bio })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-home')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">User Settings</h1>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">Profile Information</h2>

            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: profile.avatarColor || '#3F3F3F' }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-zinc-500">@{username}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Display Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Username</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Bio</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white outline-none focus:border-white/25 h-20 resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief bio..."
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}