import { create } from 'zustand'
import type {
  CampfireRoom,
  CampfireStore,
  CodeLanguage,
  CreateCampfireInput,
  CampfireProfile,
  RoomCategory,
  SolverLesson,
  WorkspaceFile,
  QuizQuestion,
  WhiteboardMark,
  SupplyTab,
} from '../types/campfire'

const AVATAR_COLORS = [
  '#1A1A1A',
  '#2A2A2A',
  '#3F3F3F',
  '#525252',
  '#404040',
  '#171717',
  '#262626',
]

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function formatSeedMessage(
  author: string,
  content: string,
  minutesAgo: number,
  color: string,
) {
  return {
    id: uid('msg'),
    author,
    content,
    timestamp: Date.now() - minutesAgo * 60_000,
    avatarColor: color,
  }
}

function initialWorkspace(code: string, language: CodeLanguage): WorkspaceFile[] {
  const mainName = language === 'python' ? 'main.py' : `main.${language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'ts'}`
  return [
    { id: 'file-main', name: mainName, content: code },
    { id: 'file-tests', name: 'test_suite.py', content: '# Add focused tests here\n' },
    { id: 'file-algorithm', name: 'algorithm.ts', content: '// Shared algorithm notes\n' },
    { id: 'file-index', name: 'index.html', content: '<!doctype html>\\n<html><body><h1>Campfire preview</h1></body></html>' },
    { id: 'file-readme', name: 'README.md', content: '# Shared project\\n\\nRoom notes and project setup.' },
  ]
}

function buildDefaultRooms(): CampfireRoom[] {
  const now = Date.now()

  return [
    {
      id: 'room_python_dsa',
      name: 'Late Night Python & DSA',
      topic: 'Grind LeetCode mediums · share solutions in Dev Rig',
      timerMode: 'countdown',
      remainingSeconds: 2 * 3600 + 47 * 60 + 18,
      initialSeconds: 3 * 3600,
      isBurning: true,
      activeSupplyTab: 'dev-rig',
      code: `# Late Night Python & DSA
def max_sliding_window(nums: list[int], k: int) -> list[int]:
    """O(n) deque approach — drop your variant below."""
    from collections import deque
    dq, out = deque(), []
    for i, n in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))`,
      codeLanguage: 'python',
      scratchpad: '',
      pinnedLinks: [],
      createdAt: now - 40 * 60_000,
      lastActivityAt: now,
      category: 'DSA & Coding',
      slowmode: false,
      workspaceFiles: initialWorkspace(
        `# Late Night Python & DSA
def max_sliding_window(nums: list[int], k: int) -> list[int]:
    """O(n) deque approach — drop your variant below."""
    from collections import deque
    dq, out = deque(), []
    for i, n in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))`,
        'python',
      ),
      openFileIds: ['file-main'],
      activeFileId: 'file-main',
      snapshots: [],
      whiteboardMarks: [],
      solverQuestion: '',
      solverLesson: null,
      studyCards: [],
      quizQuestions: [],
      participants: [
        {
          id: 'p1',
          name: 'Nova',
          isSpeaking: true,
          isMuted: false,
          avatarColor: AVATAR_COLORS[0],
        },
        {
          id: 'p2',
          name: 'Kai',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[3],
        },
        {
          id: 'p3',
          name: 'Rhea',
          isSpeaking: false,
          isMuted: true,
          avatarColor: AVATAR_COLORS[5],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Nova',
          'Stuck on the sliding window variant — anyone free?',
          12,
          AVATAR_COLORS[0],
        ),
        formatSeedMessage(
          'Kai',
          'Drop it in Dev Rig. I just finished #424.',
          9,
          AVATAR_COLORS[3],
        ),
        formatSeedMessage(
          'Rhea',
          'Brown noise on, headphones in. Locking in 🔥',
          4,
          AVATAR_COLORS[5],
        ),
      ],
    },
    {
      id: 'room_ochem',
      name: 'Organic Chem Cram',
      topic: 'SN1/SN2 mechanisms · Study Board open',
      timerMode: 'pomodoro',
      remainingSeconds: 18 * 60 + 42,
      initialSeconds: 25 * 60,
      isBurning: true,
      pomodoroPhase: 'focus',
      activeSupplyTab: 'scratchpad',
      code: 'console.log("Organic chemistry study group")',
      codeLanguage: 'javascript',
      scratchpad: 'SN1: two-step, carbocation intermediate.\nSN2: one-step, backside attack.',
      pinnedLinks: [],
      createdAt: now - 25 * 60_000,
      lastActivityAt: now,
      category: 'Chem & Bio',
      slowmode: false,
      workspaceFiles: initialWorkspace('console.log("Organic chemistry study group")', 'javascript'),
      openFileIds: ['file-main'],
      activeFileId: 'file-main',
      snapshots: [],
      whiteboardMarks: [],
      solverQuestion: '',
      solverLesson: null,
      studyCards: [],
      quizQuestions: [],
      participants: [
        {
          id: 'p4',
          name: 'Mira',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[4],
        },
        {
          id: 'p5',
          name: 'Jules',
          isSpeaking: true,
          isMuted: false,
          avatarColor: AVATAR_COLORS[1],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Mira',
          'Carbocation rearrangements are evil tonight.',
          8,
          AVATAR_COLORS[4],
        ),
        formatSeedMessage(
          'Jules',
          'Sketching the energy diagram on the board — peek?',
          3,
          AVATAR_COLORS[1],
        ),
      ],
    },
    {
      id: 'room_lofi',
      name: 'Lo-Fi Beat Lab',
      topic: 'Sample flips · screen share your DAW',
      timerMode: 'deadman',
      remainingSeconds: 55 * 60 + 7,
      initialSeconds: 60 * 60,
      isBurning: true,
      activeSupplyTab: 'pinned-links',
      code: 'console.log("Welcome to the beat lab")',
      codeLanguage: 'javascript',
      scratchpad: '',
      pinnedLinks: [],
      createdAt: now - 15 * 60_000,
      lastActivityAt: now,
      category: 'Music & Beats',
      slowmode: false,
      workspaceFiles: initialWorkspace('console.log("Welcome to the beat lab")', 'javascript'),
      openFileIds: ['file-main'],
      activeFileId: 'file-main',
      snapshots: [],
      whiteboardMarks: [],
      solverQuestion: '',
      solverLesson: null,
      studyCards: [],
      quizQuestions: [],
      participants: [
        {
          id: 'p6',
          name: 'Echo',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[6],
        },
        {
          id: 'p7',
          name: 'Ash',
          isSpeaking: false,
          isMuted: true,
          avatarColor: AVATAR_COLORS[0],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Echo',
          'Deadman timer — keep chatting or we burn out.',
          6,
          AVATAR_COLORS[6],
        ),
        formatSeedMessage(
          'Ash',
          'Sharing Ableton now. Feedback welcome on the hats.',
          2,
          AVATAR_COLORS[0],
        ),
      ],
    },
  ]
}

const FUEL_SECONDS = 15 * 60

export const useCampfireStore = create<CampfireStore>((set, get) => ({
  rooms: buildDefaultRooms(),
  activeRoomId: 'room_python_dsa',
  activePage: 'page-1',
  isCreateModalOpen: false,
  profile: {
    displayName: 'You', username: 'you', pronouns: '', bio: '',
    customStatus: '', avatarInitials: 'YO', avatarColor: AVATAR_COLORS[2],
    status: 'online', muted: false, deafened: false, brownNoise: false,
    screenSharing: false, screenStream: null, simulatedStream: false, aiBaseUrl: 'http://127.0.0.1:31415/v1/chat/completions', aiModel: 'auto',
    rainVolume: 0, crackleVolume: 0, binauralVolume: 0, inputVolume: 80, outputVolume: 80,
    inputDeviceId: '', outputDeviceId: '', noiseVolume: 0,
    noiseTone: 'Balanced Rain', echoCancellation: true, noiseSuppression: true,
    autoGainControl: true, reducedMotion: false, highContrastBorders: false,
    messageDensity: 'cozy', fontScale: 13,
  },

  setActivePage: (page) => set({ activePage: page }),
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  addFuel: (roomId) => {
    const id = roomId ?? get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? {
              ...room,
              remainingSeconds: room.remainingSeconds + FUEL_SECONDS,
              initialSeconds: Math.max(
                room.initialSeconds,
                room.remainingSeconds + FUEL_SECONDS,
              ),
              isBurning: true,
              lastActivityAt: Date.now(),
            }
          : room,
      ),
    }))
  },

  updateProfile: (updates: Partial<CampfireProfile>) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
      rooms: state.rooms.map((room) => ({
        ...room,
        participants: room.participants.map((participant) =>
          participant.id === 'you'
            ? {
                ...participant,
                name: updates.displayName ?? state.profile.displayName,
                avatarColor: updates.avatarColor ?? state.profile.avatarColor,
                isMuted: updates.muted ?? state.profile.muted,
                status: updates.status ?? state.profile.status,
                customStatus: updates.customStatus ?? state.profile.customStatus,
              }
            : participant,
        ),
        messages: room.messages.map((message) =>
          message.author === state.profile.displayName || message.author === 'You'
            ? {
                ...message,
                author: updates.displayName ?? state.profile.displayName,
                avatarColor: updates.avatarColor ?? state.profile.avatarColor,
              }
            : message,
        ),
      })),
    })),

  updateRoom: (updates) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id === id ? { ...room, ...updates } : room),
    }))
  },

  adjustTimer: (seconds) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id === id
        ? { ...room, remainingSeconds: Math.max(0, room.remainingSeconds + seconds), initialSeconds: Math.max(room.initialSeconds, room.remainingSeconds + seconds), isBurning: true }
        : room),
    }))
  },

  resetTimer: () => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id === id
        ? { ...room, remainingSeconds: room.timerMode === 'pomodoro' ? 25 * 60 : room.initialSeconds, isBurning: true, pomodoroPhase: room.timerMode === 'pomodoro' ? 'focus' : room.pomodoroPhase }
        : room),
    }))
  },

  deleteRoom: (roomId) => set((state) => {
    const id = roomId ?? state.activeRoomId
    const rooms = state.rooms.filter((room) => room.id !== id)
    return { rooms, activeRoomId: state.activeRoomId === id ? rooms[0]?.id ?? null : state.activeRoomId }
  }),

  sendReply: (content, replyTo) => {
    const id = get().activeRoomId
    const trimmed = content.trim()
    if (!id || !trimmed) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room, lastActivityAt: Date.now(),
        messages: [...room.messages, {
          id: uid('msg'), author: state.profile.displayName, content: trimmed,
          timestamp: Date.now(), avatarColor: state.profile.avatarColor, replyTo,
        }],
      }),
    }))
  },

  toggleReaction: (messageId, emoji) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room,
        messages: room.messages.map((message) => {
          if (message.id !== messageId) return message
          const reactions = message.reactions ?? []
          const current = reactions.find((reaction) => reaction.emoji === emoji)
          const updated = current
            ? current.reacted
              ? reactions.filter((reaction) => reaction.emoji !== emoji || reaction.count > 1).map((reaction) => reaction.emoji === emoji ? { ...reaction, count: reaction.count - 1, reacted: false } : reaction)
              : reactions.map((reaction) => reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1, reacted: true } : reaction)
            : [...reactions, { emoji, count: 1, reacted: true }]
          return { ...message, reactions: updated }
        }),
      }),
    }))
  },

  toggleMessagePin: (messageId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room, messages: room.messages.map((message) => message.id === messageId ? { ...message, pinned: !message.pinned } : message),
      }),
    }))
  },

  deleteMessage: (messageId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room, messages: room.messages.filter((message) => message.id !== messageId || message.author !== state.profile.displayName),
      }),
    }))
  },

  clearMessages: () => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({ rooms: state.rooms.map((room) => room.id === id ? { ...room, messages: [] } : room) }))
  },

  addParticipant: (name) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id || room.participants.some((participant) => participant.name === name) ? room : {
        ...room, participants: [...room.participants, { id: uid('participant'), name, isSpeaking: false, isMuted: false, avatarColor: AVATAR_COLORS[room.participants.length % AVATAR_COLORS.length] }],
      }),
    }))
  },

  setActiveFile: (fileId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id || !room.workspaceFiles.some((file) => file.id === fileId)) return room
        const file = room.workspaceFiles.find((item) => item.id === fileId)
        const extension = file?.name.split('.').pop()?.toLowerCase()
        const codeLanguage: CodeLanguage = extension === 'js' || extension === 'ts' ? 'javascript' : extension === 'cpp' ? 'cpp' : 'python'
        return {
          ...room,
          activeFileId: fileId,
          openFileIds: room.openFileIds.includes(fileId) ? room.openFileIds : [...room.openFileIds, fileId],
          code: file?.content ?? '',
          codeLanguage,
        }
      }),
    }))
  },

  closeWorkspaceFile: (fileId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id) return room
        const openFileIds = room.openFileIds.filter((openId) => openId !== fileId)
        const activeFileId = room.activeFileId === fileId
          ? (openFileIds.at(-1) ?? room.workspaceFiles.find((file) => file.id !== fileId)?.id ?? '')
          : room.activeFileId
        const nextFile = room.workspaceFiles.find((file) => file.id === activeFileId)
        return { ...room, openFileIds, activeFileId, code: nextFile?.content ?? '' }
      }),
    }))
  },

  addWorkspaceFile: (name) => {
    const id = get().activeRoomId
    const trimmed = name.trim()
    if (!id || !trimmed || !/^[\w.-]+\.(py|js|ts|cpp|html|css|json|md)$/.test(trimmed)) return
    const fileId = uid('file')
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room,
        workspaceFiles: [...room.workspaceFiles, { id: fileId, name: trimmed, content: '' }],
        openFileIds: [...room.openFileIds, fileId],
        activeFileId: fileId,
        code: '',
      }),
    }))
  },

  deleteWorkspaceFile: (fileId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id) return room
        const workspaceFiles = room.workspaceFiles.filter((file) => file.id !== fileId)
        const openFileIds = room.openFileIds.filter((openId) => openId !== fileId)
        const activeFileId = room.activeFileId === fileId ? (openFileIds.at(-1) ?? workspaceFiles[0]?.id ?? '') : room.activeFileId
        const activeFile = workspaceFiles.find((file) => file.id === activeFileId)
        return { ...room, workspaceFiles, openFileIds, activeFileId, code: activeFile?.content ?? '' }
      }),
    }))
  },

  updateWorkspaceFile: (fileId, content) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room,
        code: room.activeFileId === fileId ? content : room.code,
        workspaceFiles: room.workspaceFiles.map((file) => file.id === fileId ? { ...file, content } : file),
      }),
    }))
  },

  saveSnapshot: (message) => {
    const id = get().activeRoomId
    const trimmed = message.trim()
    if (!id || !trimmed) return
    set((state) => ({
      rooms: state.rooms.map((room) => room.id !== id ? room : {
        ...room,
        snapshots: [{ id: uid('snapshot'), message: trimmed, createdAt: Date.now(), files: room.workspaceFiles.map((file) => ({ ...file })) }, ...room.snapshots],
      }),
    }))
  },

  restoreSnapshot: (snapshotId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id) return room
        const snapshot = room.snapshots.find((item) => item.id === snapshotId)
        if (!snapshot) return room
        const workspaceFiles = snapshot.files.map((file) => ({ ...file }))
        const activeFileId = workspaceFiles.some((file) => file.id === room.activeFileId) ? room.activeFileId : workspaceFiles[0]?.id ?? ''
        return { ...room, workspaceFiles, openFileIds: workspaceFiles.map((file) => file.id), activeFileId, code: workspaceFiles.find((file) => file.id === activeFileId)?.content ?? '' }
      }),
    }))
  },

  setSolverQuestion: (question) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({ rooms: state.rooms.map((room) => room.id === id ? { ...room, solverQuestion: question } : room) }))
  },

  saveSolverLesson: (lesson: SolverLesson) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({ rooms: state.rooms.map((room) => room.id === id ? { ...room, solverLesson: lesson } : room) }))
  },

  setStudyContent: (cards: { question: string; answer: string }[], quiz: QuizQuestion[]) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({ rooms: state.rooms.map((room) => room.id === id ? { ...room, studyCards: cards, quizQuestions: quiz } : room) }))
  },

  setWhiteboardMarks: (marks: WhiteboardMark[]) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({ rooms: state.rooms.map((room) => room.id === id ? { ...room, whiteboardMarks: marks } : room) }))
  },

  updateCode: (code) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? {
          ...room, code,
          workspaceFiles: room.workspaceFiles.map((file) => file.id === room.activeFileId ? { ...file, content: code } : file),
        } : room,
      ),
    }))
  },

  setCodeLanguage: (codeLanguage: CodeLanguage) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, codeLanguage } : room,
      ),
    }))
  },

  updateScratchpad: (scratchpad) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, scratchpad } : room,
      ),
    }))
  },

  addPinnedLink: (url) => {
    const id = get().activeRoomId
    if (!id) return
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Only http and https links can be pinned.')
    }
    const link = {
      id: uid('link'),
      url: parsed.href,
      title: parsed.hostname,
    }
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? { ...room, pinnedLinks: [...room.pinnedLinks, link] }
          : room,
      ),
    }))
  },

  removePinnedLink: (linkId) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? {
              ...room,
              pinnedLinks: room.pinnedLinks.filter((link) => link.id !== linkId),
            }
          : room,
      ),
    }))
  },

  createRoom: (input: CreateCampfireInput) => {
    const profile = get().profile
    const seconds = Math.max(1, input.durationMinutes) * 60
    const room: CampfireRoom = {
      id: uid('room'),
      name: input.name.trim() || 'Untitled Campfire',
      topic: input.topic.trim() || 'No topic set',
      timerMode: input.timerMode,
      remainingSeconds: seconds,
      initialSeconds: seconds,
      isBurning: true,
      activeSupplyTab: 'dev-rig',
      code: '',
      codeLanguage: 'python',
      scratchpad: '',
      pinnedLinks: [],
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      category: 'General Grind' as RoomCategory,
      slowmode: false,
      workspaceFiles: initialWorkspace('', 'python'),
      openFileIds: ['file-main'],
      activeFileId: 'file-main',
      snapshots: [],
      whiteboardMarks: [],
      solverQuestion: '',
      solverLesson: null,
      studyCards: [],
      quizQuestions: [],
      pomodoroPhase: input.timerMode === 'pomodoro' ? 'focus' : undefined,
      participants: [
        {
          id: 'you',
          name: profile.displayName,
          isSpeaking: false,
          isMuted: false,
          avatarColor: profile.avatarColor,
          status: profile.status,
          customStatus: profile.customStatus,
        },
      ],
      messages: [
        {
          id: uid('msg'),
          author: 'System',
          content: `Campfire lit · ${input.timerMode} · ${input.durationMinutes}m fuel`,
          timestamp: Date.now(),
          avatarColor: '#FF8A00',
        },
      ],
    }

    set((state) => ({
      rooms: [room, ...state.rooms],
      activeRoomId: room.id,
      isCreateModalOpen: false,
    }))
  },

  setActiveSupplyTab: (tab: SupplyTab) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? { ...room, activeSupplyTab: tab, lastActivityAt: Date.now() }
          : room,
      ),
    }))
  },

  sendMessage: (content) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const id = get().activeRoomId
    if (!id) return

    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id) return room

        const next = {
          ...room,
          lastActivityAt: Date.now(),
          messages: [
            ...room.messages,
            {
              id: uid('msg'),
            author: state.profile.displayName,
              content: trimmed,
              timestamp: Date.now(),
            avatarColor: state.profile.avatarColor,
            },
          ],
        }

        // Deadman: activity refuels a slice of the timer
        if (room.timerMode === 'deadman') {
          next.remainingSeconds = Math.min(
            room.initialSeconds,
            room.remainingSeconds + 5 * 60,
          )
        }

        return next
      }),
    }))
  },

  bumpActivity: (roomId) => {
    const id = roomId ?? get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, lastActivityAt: Date.now() } : room,
      ),
    }))
  },

  tick: () => {
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (!room.isBurning || room.remainingSeconds <= 0) {
          return room.remainingSeconds <= 0
            ? { ...room, isBurning: false, remainingSeconds: 0 }
            : room
        }

        const remainingSeconds = room.remainingSeconds - 1

        if (remainingSeconds <= 0) {
          // Pomodoro: flip phase and refill once when focus ends
          if (room.timerMode === 'pomodoro' && room.pomodoroPhase === 'focus') {
            return {
              ...room,
              remainingSeconds: 5 * 60,
              initialSeconds: 5 * 60,
              pomodoroPhase: 'break',
              isBurning: true,
            }
          }
          return { ...room, remainingSeconds: 0, isBurning: false }
        }

        return { ...room, remainingSeconds }
      }),
    }))
  },
}))

/** Live 1Hz countdown for all burning rooms. */
let tickStarted = false
export function startCampfireTicker() {
  if (tickStarted || typeof window === 'undefined') return
  tickStarted = true
  window.setInterval(() => {
    useCampfireStore.getState().tick()
  }, 1000)
}

export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
