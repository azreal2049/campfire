import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  ExternalLink,
  Globe,
  HardDrive,
  LockKeyhole,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const tabs = [
  'General',
  'Workspace & Audio',
  'Connections & AI',
  'Apps & Integrations',
  'Notifications & Privacy',
  'Developer & Rust Bridge',
] as const

type SettingsTab = (typeof tabs)[number]

const cardClass = 'border border-white/[0.09] bg-[#0C0C0C] rounded-[2px]'
const inputClass = 'h-9 w-full border border-white/[0.1] bg-[#080808] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-[#606060] focus:border-white/30'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? 'justify-end bg-white' : 'justify-start bg-white/[0.15]'}`}
    >
      <span className={`h-4 w-4 rounded-full transition-colors ${checked ? 'bg-[#080808]' : 'bg-[#777]'}`} />
    </button>
  )
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/[0.07] py-4 last:border-b-0">
      <div>
        <p className="text-[13px] font-medium text-white">{title}</p>
        <p className="mt-1 text-[12px] text-[#707070]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

function IntegrationMark({ id }: { id: string }) {
  const className = 'h-5 w-5 text-zinc-300'
  if (id === 'github') return <Code2 className={className} />
  if (id === 'vscode') return <Code2 className={className} />
  if (id === 'brave') return <Globe className={className} />
  if (id === 'solvely') return <Zap className={className} />
  if (id === 'discord') return <MessageCircle className={className} />
  return <BookOpen className={className} />
}

export function PageSettings() {
  const displayName = useCampfireStore((state) => state.displayName)
  const email = useCampfireStore((state) => state.email)
  const handle = useCampfireStore((state) => state.handle)
  const avatarUrl = useCampfireStore((state) => state.avatarUrl)
  const preferences = useCampfireStore((state) => state.preferences)
  const accounts = useCampfireStore((state) => state.accounts)
  const apps = useCampfireStore((state) => state.apps)
  const toastMessage = useCampfireStore((state) => state.toastMessage)
  const setDisplayName = useCampfireStore((state) => state.setDisplayName)
  const setEmail = useCampfireStore((state) => state.setEmail)
  const setHandle = useCampfireStore((state) => state.setHandle)
  const setAvatarUrl = useCampfireStore((state) => state.setAvatarUrl)
  const setPreference = useCampfireStore((state) => state.setPreference)
  const toggleAccount = useCampfireStore((state) => state.toggleAccount)
  const toggleAccountExpanded = useCampfireStore((state) => state.toggleAccountExpanded)
  const refreshAccount = useCampfireStore((state) => state.refreshAccount)
  const removeAccount = useCampfireStore((state) => state.removeAccount)
  const addAccount = useCampfireStore((state) => state.addAccount)
  const toggleApp = useCampfireStore((state) => state.toggleApp)
  const showToast = useCampfireStore((state) => state.showToast)
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const logOut = useCampfireStore((state) => state.logOut)

  const [activeTab, setActiveTab] = useState<SettingsTab>('General')
  const [isShimmering, setIsShimmering] = useState(false)
  const [nameDraft, setNameDraft] = useState(displayName)
  const [emailDraft, setEmailDraft] = useState(email)
  const [handleDraft, setHandleDraft] = useState(handle)
  const [search, setSearch] = useState('')
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountEndpoint, setNewAccountEndpoint] = useState('')
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isShimmering) return
    const timer = window.setTimeout(() => setIsShimmering(false), 180)
    return () => window.clearTimeout(timer)
  }, [activeTab, isShimmering])

  const changeTab = (tab: SettingsTab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setIsShimmering(true)
  }

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Choose an image file')
      return
    }
    if (file.size > 1024 * 1024) {
      showToast('Profile images must be smaller than 1 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarUrl(reader.result)
      else showToast('Could not read the selected image')
    }
    reader.onerror = () => showToast('Could not read the selected image')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const saveProfile = () => {
    const trimmedName = nameDraft.trim()
    if (!trimmedName || trimmedName.length > 32) {
      showToast('Display name must be between 1 and 32 characters')
      return
    }
    setDisplayName(trimmedName)
    setEmail(emailDraft.trim())
    const trimmedHandle = handleDraft.trim()
    setHandle(trimmedHandle ? (trimmedHandle.startsWith('@') ? trimmedHandle : `@${trimmedHandle}`) : '@you')
  }

  const handleRefresh = (id: string) => {
    if (refreshingId) return
    setRefreshingId(id)
    window.setTimeout(() => {
      refreshAccount(id)
      setRefreshingId(null)
    }, 500)
  }

  const addConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newAccountName.trim()
    const endpoint = newAccountEndpoint.trim()
    if (!name || !endpoint) return
    addAccount({
      name,
      subtitle: endpoint,
      status: 'CONNECTED · CUSTOM',
      details: endpoint,
    })
    setNewAccountName('')
    setNewAccountEndpoint('')
    setAddModalOpen(false)
  }

  const exportSettings = () => {
    const payload = {
      profile: { displayName, email, handle },
      preferences,
      accounts,
      apps,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'campfire-canvas.json'
    anchor.click()
    URL.revokeObjectURL(url)
    showToast('Settings exported')
  }

  const filteredApps = apps.filter((app) =>
    `${app.name} ${app.description}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F4F4F6] antialiased">
      <div className="max-w-[720px] px-8 py-7">
        <div className="mb-8 overflow-x-auto border-b border-white/[0.07] pb-4">
          <nav aria-label="Settings sections" className="flex min-w-max items-center gap-7 text-[13px]">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => changeTab(tab)}
                className={`whitespace-nowrap transition-colors ${activeTab === tab ? 'font-medium text-white' : 'cursor-pointer text-[#707070] hover:text-zinc-300'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {isShimmering ? (
          <div className="space-y-6" aria-label="Loading settings">
            {[0, 1, 2].map((item) => (
              <div key={item} className={`${cardClass} p-6`}>
                <div className="h-4 w-48 animate-pulse bg-white/[0.04]" />
                <div className="mt-3 h-3 w-72 max-w-full animate-pulse bg-white/[0.04]" />
                <div className="mt-6 h-9 w-full animate-pulse bg-white/[0.04]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'General' && (
              <div>
                <section className={`${cardClass} mb-6`}>
                  <div className="flex items-start justify-between gap-6 p-6">
                    <div>
                      <h1 className="text-[15px] font-medium text-white">Profile &amp; workspace logo</h1>
                      <p className="mt-1.5 text-[13px] text-[#707070]">
                        This is your Campfire avatar. Click on the logo to upload a custom one from your files.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload profile image"
                      className="flex h-14 w-14 shrink-0 items-center justify-center bg-white text-2xl font-bold text-[#080808] transition-colors hover:bg-zinc-200"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        displayName.trim().charAt(0).toUpperCase() || 'U'
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={chooseAvatar}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-3.5">
                    <span className="text-[12px] text-[#606060]">An avatar is optional but strongly recommended.</span>
                  </div>
                </section>

                <section className={`${cardClass} mb-6`}>
                  <div className="p-6">
                    <h2 className="text-[15px] font-medium text-white">Display name</h2>
                    <p className="mt-1.5 text-[13px] text-[#707070]">
                      This is your visible name within Campfire. For example, the name of your squad, study group, or handle.
                    </p>
                    <input
                      value={nameDraft}
                      maxLength={32}
                      onChange={(event) => setNameDraft(event.target.value)}
                      aria-label="Display name"
                      className={`${inputClass} mt-4`}
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-3">
                    <span className="text-[12px] text-[#606060]">Please use 32 characters at maximum.</span>
                    <button type="button" onClick={saveProfile} className="bg-white px-4 py-1.5 text-[12px] font-medium text-[#080808] transition-all hover:bg-zinc-200 active:scale-[0.98]">
                      Save
                    </button>
                  </div>
                </section>

                <section className={cardClass}>
                  <div className="p-6">
                    <h2 className="text-[15px] font-medium text-white">Account email</h2>
                    <p className="mt-1.5 text-[13px] text-[#707070]">
                      This is the email address that will be used to receive session invites and Personal Vault digests.
                    </p>
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(event) => setEmailDraft(event.target.value)}
                      aria-label="Account email"
                      className={`${inputClass} mt-4`}
                    />
                    <label className="mt-4 block text-[12px] text-[#707070]" htmlFor="account-handle">Account handle</label>
                    <input
                      id="account-handle"
                      value={handleDraft}
                      onChange={(event) => setHandleDraft(event.target.value)}
                      aria-label="Account handle"
                      className={`${inputClass} mt-1.5`}
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-3">
                    <span className="text-[12px] text-[#606060]">Changes immediately sync across your active rooms.</span>
                    <button type="button" onClick={saveProfile} className="bg-white px-4 py-1.5 text-[12px] font-medium text-[#080808] transition-all hover:bg-zinc-200 active:scale-[0.98]">
                      Save
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'Workspace & Audio' && (
              <section className={cardClass}>
                <div className="border-b border-white/[0.07] p-6">
                  <h1 className="text-[15px] font-medium text-white">Workspace &amp; audio defaults</h1>
                  <p className="mt-1 text-[13px] text-[#707070]">Choose how new Campfires start and sound.</p>
                </div>
                <div className="space-y-5 p-6">
                  <label className="block text-[13px] text-white">
                    Default Campfire mode
                    <select
                      value={preferences.defaultMode}
                      onChange={(event) => setPreference('defaultMode', event.target.value as typeof preferences.defaultMode)}
                      className={`${inputClass} mt-2`}
                    >
                      <option value="countdown">Countdown</option>
                      <option value="deadman">Deadman</option>
                      <option value="pomodoro">Pomodoro</option>
                    </select>
                  </label>
                  <label className="block text-[13px] text-white">
                    Burn timer duration
                    <select
                      value={preferences.burnTimerMinutes}
                      onChange={(event) => setPreference('burnTimerMinutes', Number(event.target.value))}
                      className={`${inputClass} mt-2`}
                    >
                      {[15, 25, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                    </select>
                  </label>
                  <label className="block text-[13px] text-white">
                    Web Audio soundscape
                    <select
                      value={preferences.soundscape}
                      onChange={(event) => setPreference('soundscape', event.target.value as typeof preferences.soundscape)}
                      className={`${inputClass} mt-2`}
                    >
                      <option value="off">Off</option>
                      <option value="rain">Rain</option>
                      <option value="fire">Campfire</option>
                      <option value="cafe">Cafe ambience</option>
                    </select>
                  </label>
                  <p className="flex items-center gap-2 text-[12px] text-[#707070]">
                    <Volume2 className="h-3.5 w-3.5" /> Soundscapes start only when enabled in a room.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 'Connections & AI' && (
              <section className={`${cardClass} max-w-[680px]`}>
                <div className="px-6 pb-4 pt-6">
                  <h1 className="text-[15px] font-medium text-white">Accounts &amp; Connected Engines</h1>
                  <p className="mt-1 text-[13px] text-[#707070]">Manage AI model endpoints, update local proxies, or connect new services.</p>
                </div>
                <div className="divide-y divide-white/[0.07] px-6">
                  {accounts.length === 0 && <p className="py-6 text-[13px] text-[#707070]">No connected accounts yet.</p>}
                  {accounts.map((account) => (
                    <div key={account.id}>
                      <div className="flex items-center justify-between gap-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] text-xs font-semibold">
                            {account.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-white">{account.name}</p>
                            <p className="mt-0.5 truncate text-[12px] text-[#707070]">{account.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-[#808080]">
                          <button type="button" onClick={() => toggleAccountExpanded(account.id)} aria-label={`Show details for ${account.name}`} title="Connection details" className="hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleRefresh(account.id)} aria-label={`Refresh ${account.name}`} title="Refresh connection" className="hover:text-white">
                            <RefreshCw className={`h-4 w-4 ${refreshingId === account.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button type="button" onClick={() => removeAccount(account.id)} aria-label={`Disconnect ${account.name}`} title="Disconnect" className="hover:text-white">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {account.expanded && (
                        <div className="flex items-center justify-between gap-4 py-3.5 pl-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <button type="button" onClick={() => toggleAccountExpanded(account.id)} aria-label={`Collapse ${account.name}`} className="text-[#808080] hover:text-white">
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <span className="truncate text-[12px] text-[#A0A0A0]">{account.details}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-4">
                            <span className="font-mono text-[12px] text-[#808080]">{account.active ? account.status : 'DISABLED'}</span>
                            <Toggle checked={account.active} onChange={() => toggleAccount(account.id)} label={`Enable ${account.name}`} />
                          </div>
                        </div>
                      )}
                      {!account.expanded && (
                        <button type="button" onClick={() => toggleAccountExpanded(account.id)} className="flex w-full items-center gap-2 py-2 text-left text-[11px] text-[#606060] hover:text-zinc-300">
                          <ChevronRight className="h-3.5 w-3.5" /> Show account settings
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end border-t border-white/[0.07] px-6 py-3.5">
                  <button type="button" onClick={() => setAddModalOpen(true)} className="flex items-center gap-1.5 bg-white px-4 py-1.5 text-[12px] font-medium text-[#080808] transition-colors hover:bg-zinc-200">
                    <Plus className="h-3.5 w-3.5" /> Add account
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'Apps & Integrations' && (
              <div>
                <div className="relative mb-6 max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#707070]" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search apps..." aria-label="Search apps" className={`${inputClass} border-white/[0.09] bg-[#0C0C0C] pl-9`} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredApps.map((app) => (
                    <article key={app.id} className={`${cardClass} flex flex-col justify-between p-5`}>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex h-9 w-9 items-center justify-center border border-white/[0.08] bg-white/[0.03]">
                            <IntegrationMark id={app.id} />
                          </span>
                          {app.installed && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">Installed</span>}
                        </div>
                        <h2 className="mt-4 text-[14px] font-medium text-white">{app.name}</h2>
                        <p className="mt-1.5 min-h-10 text-[12px] leading-relaxed text-[#707070]">{app.description}</p>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-2.5">
                        <button type="button" onClick={() => toggleApp(app.id)} className="border border-white/[0.12] bg-transparent py-1.5 text-[12px] text-white hover:bg-white/[0.05]">
                          {app.installed ? 'Disconnect' : 'Install'}
                        </button>
                        <button type="button" onClick={() => setSelectedApp(app.id)} className="border border-white/[0.12] bg-transparent py-1.5 text-[12px] text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white">
                          Details
                        </button>
                      </div>
                    </article>
                  ))}
                  {filteredApps.length === 0 && <p className="text-[13px] text-[#707070]">No apps match your search.</p>}
                </div>
              </div>
            )}

            {activeTab === 'Notifications & Privacy' && (
              <section className={cardClass}>
                <div className="border-b border-white/[0.07] p-6">
                  <h1 className="text-[15px] font-medium text-white">Notifications &amp; privacy</h1>
                  <p className="mt-1 text-[13px] text-[#707070]">Control what Campfire surfaces and stores for you.</p>
                </div>
                <div className="px-6">
                  <SettingRow title="Unread mention alerts" description="Show a notification when someone mentions you in a room." checked={preferences.unreadMentionAlerts} onChange={() => setPreference('unreadMentionAlerts', !preferences.unreadMentionAlerts)} />
                  <SettingRow title="Peer radar visibility" description="Let people in your workspace see when you are active." checked={preferences.peerRadarVisible} onChange={() => setPreference('peerRadarVisible', !preferences.peerRadarVisible)} />
                  <SettingRow title="Vault auto-save" description="Automatically save useful session notes to your Personal Vault." checked={preferences.vaultAutoSave} onChange={() => setPreference('vaultAutoSave', !preferences.vaultAutoSave)} />
                </div>
              </section>
            )}

            {activeTab === 'Developer & Rust Bridge' && (
              <section className={cardClass}>
                <div className="border-b border-white/[0.07] p-6">
                  <h1 className="text-[15px] font-medium text-white">Developer &amp; Rust Bridge</h1>
                  <p className="mt-1 text-[13px] text-[#707070]">Manage local diagnostics and session data.</p>
                </div>
                <div className="px-6">
                  <SettingRow title="IPC telemetry" description="Share local bridge performance diagnostics with this app." checked={preferences.ipcTelemetry} onChange={() => setPreference('ipcTelemetry', !preferences.ipcTelemetry)} />
                </div>
                <div className="flex flex-wrap gap-3 border-t border-white/[0.07] p-6">
                  <button type="button" onClick={exportSettings} className="flex items-center gap-2 border border-white/[0.12] px-3 py-2 text-[12px] text-zinc-200 transition-colors hover:bg-white/[0.05]">
                    <HardDrive className="h-3.5 w-3.5" /> Export campfire-canvas.json
                  </button>
                  <button type="button" onClick={() => { setActivePage('page-home'); showToast('Session reset') }} className="flex items-center gap-2 border border-white/[0.12] px-3 py-2 text-[12px] text-zinc-200 transition-colors hover:bg-white/[0.05]">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset session
                  </button>
                  <button type="button" onClick={logOut} className="flex items-center gap-2 border border-white/[0.12] px-3 py-2 text-[12px] text-zinc-200 transition-colors hover:bg-white/[0.05]">
                    <LockKeyhole className="h-3.5 w-3.5" /> Log out
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {toastMessage && (
        <div role="status" className="fixed bottom-5 right-5 z-[70] border border-white/[0.12] bg-[#111] px-4 py-2.5 text-[12px] text-white shadow-none">
          {toastMessage}
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddModalOpen(false) }}>
          <form onSubmit={addConnection} className={`${cardClass} w-full max-w-md p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-medium text-white">Add connection</h2>
                <p className="mt-1 text-[12px] text-[#707070]">Add a custom local service or AI endpoint.</p>
              </div>
              <button type="button" onClick={() => setAddModalOpen(false)} aria-label="Close dialog" className="text-[#707070] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-5 block text-[12px] text-[#A0A0A0]">
              Connection name
              <input value={newAccountName} onChange={(event) => setNewAccountName(event.target.value)} required className={`${inputClass} mt-1.5`} />
            </label>
            <label className="mt-4 block text-[12px] text-[#A0A0A0]">
              Endpoint or description
              <input value={newAccountEndpoint} onChange={(event) => setNewAccountEndpoint(event.target.value)} required placeholder="http://127.0.0.1:31415" className={`${inputClass} mt-1.5`} />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setAddModalOpen(false)} className="border border-white/[0.12] px-4 py-1.5 text-[12px] text-zinc-300 hover:bg-white/[0.05]">Cancel</button>
              <button type="submit" className="bg-white px-4 py-1.5 text-[12px] font-medium text-[#080808] hover:bg-zinc-200">Add connection</button>
            </div>
          </form>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApp(null) }}>
          <div className={`${cardClass} w-full max-w-md p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <IntegrationMark id={selectedApp} />
                <h2 className="text-[15px] font-medium text-white">{apps.find((app) => app.id === selectedApp)?.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedApp(null)} aria-label="Close details" className="text-[#707070] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-[#808080]">{apps.find((app) => app.id === selectedApp)?.description}</p>
            <button type="button" onClick={() => setSelectedApp(null)} className="mt-6 w-full border border-white/[0.12] py-2 text-[12px] text-white hover:bg-white/[0.05]">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
