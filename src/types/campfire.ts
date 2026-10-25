/** Timer modes that drive how a Campfire self-destructs. */
export type TimerMode = 'countdown' | 'deadman' | 'pomodoro'

/** Tabs available inside the Supply Dock. */
export type SupplyTab = 'dev-rig' | 'solvely' | 'whiteboard' | 'scratchpad' | 'pinned-links' | 'live-stage'
export type UserStatus = 'online' | 'idle' | 'dnd' | 'invisible'
export type CampfireRole = 'developer' | 'student'
export type RoomCategory = 'DSA & Coding' | 'Chem & Bio' | 'Music & Beats' | 'General Grind'

export interface CampfireProfile {
  displayName: string
  username: string
  role: CampfireRole
  pronouns: string
  bio: string
  customStatus: string
  avatarInitials: string
  avatarColor: string
  status: UserStatus
  muted: boolean
  deafened: boolean
  brownNoise: boolean
  screenSharing: boolean
  screenStream: MediaStream | null
  simulatedStream: boolean
  aiBaseUrl: string
  aiModel: string
  rainVolume: number
  crackleVolume: number
  binauralVolume: number
  inputVolume: number
  outputVolume: number
  inputDeviceId: string
  outputDeviceId: string
  noiseVolume: number
  noiseTone: 'Deep Sub' | 'Balanced Rain' | 'Soft Static'
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
  reducedMotion: boolean
  highContrastBorders: boolean
  messageDensity: 'cozy' | 'compact'
  fontScale: 12 | 13 | 14
}

export type CodeLanguage = 'python' | 'javascript' | 'typescript' | 'cpp'

export type PomodoroPhase = 'focus' | 'break'

export interface ChatMessage {
  id: string
  author: string
  content: string
  timestamp: number
  avatarColor: string
  replyTo?: { author: string; content: string }
  reactions?: { emoji: string; count: number; reacted: boolean }[]
  pinned?: boolean
}

export interface CampfireParticipant {
  id: string
  name: string
  isSpeaking: boolean
  isMuted: boolean
  avatarColor: string
  status?: UserStatus
  customStatus?: string
}

export interface PinnedLink {
  id: string
  url: string
  title: string
}

export interface WorkspaceFile {
  id: string
  name: string
  content: string
}

export interface CodeSnapshot {
  id: string
  message: string
  createdAt: number
  files: WorkspaceFile[]
}

export interface SolverLesson {
  question: string
  concept: string
  formula: string
  steps: { title: string; content: string; why: string }[]
  finalAnswer: string
  source: 'local model' | 'offline guide'
}

export interface WhiteboardMark {
  id: string
  tool: 'pen' | 'highlighter' | 'line' | 'rectangle' | 'circle' | 'text' | 'laser' | 'eraser'
  color: string
  points: { x: number; y: number }[]
  text?: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  rationale: string
}

export interface CampfireRoom {
  id: string
  name: string
  topic: string
  timerMode: TimerMode
  /** Seconds left until the campfire burns out. */
  remainingSeconds: number
  /** Original fuel duration in seconds (for progress UI). */
  initialSeconds: number
  isBurning: boolean
  participants: CampfireParticipant[]
  messages: ChatMessage[]
  activeSupplyTab: SupplyTab
  code: string
  codeLanguage: CodeLanguage
  scratchpad: string
  pinnedLinks: PinnedLink[]
  createdAt: number
  lastActivityAt: number
  pomodoroPhase?: PomodoroPhase
  category: RoomCategory
  slowmode: boolean
  workspaceFiles: WorkspaceFile[]
  openFileIds: string[]
  activeFileId: string
  snapshots: CodeSnapshot[]
  whiteboardMarks: WhiteboardMark[]
  solverQuestion: string
  solverLesson: SolverLesson | null
  studyCards: { question: string; answer: string }[]
  quizQuestions: QuizQuestion[]
}

export interface CreateCampfireInput {
  name: string
  topic: string
  timerMode: TimerMode
  /** Duration in minutes (countdown / deadman / pomodoro focus). */
  durationMinutes: number
}

export type PageSlot = `page-${number}` | 'page-signin' | 'page-lobby'

export interface CampfireStore {
  rooms: CampfireRoom[]
  activeRoomId: string | null
  activePage: PageSlot
  isCreateModalOpen: boolean
  profile: CampfireProfile
  setActivePage: (page: PageSlot) => void
  setActiveRoom: (roomId: string) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  addFuel: (roomId?: string) => void
  createRoom: (input: CreateCampfireInput) => void
  setActiveSupplyTab: (tab: SupplyTab) => void
  updateCode: (code: string) => void
  setCodeLanguage: (language: CodeLanguage) => void
  updateScratchpad: (content: string) => void
  addPinnedLink: (url: string) => void
  removePinnedLink: (linkId: string) => void
  sendMessage: (content: string) => void
  tick: () => void
  bumpActivity: (roomId?: string) => void
  updateProfile: (updates: Partial<CampfireProfile>) => void
  updateRoom: (updates: Partial<Pick<CampfireRoom, 'name' | 'topic' | 'timerMode' | 'category' | 'slowmode'>>) => void
  adjustTimer: (seconds: number) => void
  resetTimer: () => void
  deleteRoom: (roomId?: string) => void
  sendReply: (content: string, replyTo?: { author: string; content: string }) => void
  toggleReaction: (messageId: string, emoji: string) => void
  toggleMessagePin: (messageId: string) => void
  deleteMessage: (messageId: string) => void
  clearMessages: () => void
  addParticipant: (name: string) => void
  setActiveFile: (fileId: string) => void
  closeWorkspaceFile: (fileId: string) => void
  addWorkspaceFile: (name: string) => void
  deleteWorkspaceFile: (fileId: string) => void
  updateWorkspaceFile: (fileId: string, content: string) => void
  saveSnapshot: (message: string) => void
  restoreSnapshot: (snapshotId: string) => void
  setSolverQuestion: (question: string) => void
  saveSolverLesson: (lesson: SolverLesson) => void
  setStudyContent: (cards: { question: string; answer: string }[], quiz: QuizQuestion[]) => void
  setWhiteboardMarks: (marks: WhiteboardMark[]) => void
}
