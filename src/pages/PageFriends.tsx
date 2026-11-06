import { ArrowLeft, UserPlus, MessageSquare } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const friends = [
  { name: 'Nova', status: 'online', avatarColor: '#1A1A1A', inRoom: 'Late Night Python & DSA' },
  { name: 'Kai', status: 'online', avatarColor: '#2A2A2A', inRoom: null },
  { name: 'Rhea', status: 'idle', avatarColor: '#3F3F3F', inRoom: null },
  { name: 'Mira', status: 'offline', avatarColor: '#525252', inRoom: null },
  { name: 'Jules', status: 'online', avatarColor: '#404040', inRoom: 'Organic Chem Cram' },
  { name: 'Echo', status: 'dnd', avatarColor: '#171717', inRoom: 'Lo-Fi Beat Lab' },
  { name: 'Ash', status: 'online', avatarColor: '#262626', inRoom: null },
]

export function PageFriends() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)
  const rooms = useCampfireStore((state) => state.rooms)
  const setActiveRoom = useCampfireStore((state) => state.setActiveRoom)
  const setActiveWorkspaceView = useCampfireStore((state) => state.setActiveWorkspaceView)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-home')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white">
            <UserPlus className="h-3.5 w-3.5" />
            Add Friend
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 text-xs">
          {['Online', 'All', 'Pending', 'Add Friend'].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 rounded-md py-2 font-medium transition ${
                i === 0 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Friend List */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
          {friends.map((friend) => (
            <div
              key={friend.name}
              className="flex items-center justify-between px-4 py-3 transition hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: friend.avatarColor }}
                  >
                    {friend.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#050505] ${
                      friend.status === 'online'
                        ? 'bg-emerald-400'
                        : friend.status === 'idle'
                        ? 'bg-amber-400'
                        : friend.status === 'dnd'
                        ? 'bg-red-400'
                        : 'bg-zinc-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{friend.name}</p>
                  <p className="text-xs text-zinc-500">
                    {friend.inRoom ? `In ${friend.inRoom}` : friend.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {friend.inRoom ? (
                  <button
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200"
                    onClick={() => {
                      const room = rooms.find((r) => r.name === friend.inRoom)
                      if (room) {
                        setActiveRoom(room.id)
                        setActiveWorkspaceView('chat')
                        setActivePage('page-chat')
                      }
                    }}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Join Active Campfire
                  </button>
                ) : (
                  <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white">
                    Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}