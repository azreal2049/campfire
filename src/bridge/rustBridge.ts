export type CampfireSessionType =
  | 'study-group'
  | 'coders-developers'
  | 'fun-friends'
  | 'musicians'
  | 'content-creators'
  | 'editors-vfx'
  | 'official-works'
  | 'silent-coworking'

export type BurnMode = 'pomodoro' | 'countdown' | 'deadman'
export type AgentKind = 'study' | 'code-audit' | 'creator'
export type AgentStatus = 'running' | 'complete' | 'error'
export type WorkspaceRevisionKind = 'code' | 'note' | 'whiteboard'
export type ShopItemKind = 'theme' | 'soundscape' | 'agent'

export interface PortalDrop {
  id: string
  source: string
  kind: WorkspaceRevisionKind | 'reference'
  content: string
  createdAt: string
  inserted: boolean
}

export interface WorkspaceRevision {
  id: string
  kind: WorkspaceRevisionKind
  fileName: string
  content: string
  createdAt: number
}

export interface SparkContract {
  goal: string
  status: 'active' | 'verified'
  startedAt: number
  stake: number
  reward: number
}

export interface ShopItem {
  id: string
  name: string
  description: string
  kind: ShopItemKind
  price: number
  owned: boolean
}

export interface VaultItem {
  id: string
  title: string
  category: string
  snippet: string
  content: string
  fileName: string
  format: string
  date: string
}

export interface AgentTask {
  id: string
  kind: AgentKind
  title: string
  prompt: string
  output: string
  status: AgentStatus
  createdAt: string
  read: boolean
}

export interface WorkspaceSnapshot {
  id: string
  name: string
  createdAt: string
  sessionType: CampfireSessionType
  openCards: string
  ideCode: string
  noteText: string
  whiteboardText: string
  blueprintMode: boolean
  timerSeconds: number
  elapsedSeconds: number
}

export interface BurnTimerState {
  mode: BurnMode
  phase: 'focus' | 'break'
  secondsRemaining: number
  elapsedSeconds: number
  running: boolean
  warning: boolean
  lastActivityAt: number
  focusMinutes: number
  breakMinutes: number
}

export interface AgentRequest {
  kind: AgentKind
  context: string
}

const FALLBACK_OUTPUTS: Record<AgentKind, (context: string) => string> = {
  study: (context) => {
    const topic = context.trim() || 'Current Campfire topic'
    return `# ${topic}: Study Pack

## Step-by-step summary
1. State the core idea in one sentence.
2. Identify the key terms, assumptions, and relationships.
3. Work through one example, checking each intermediate step.
4. Explain the result in your own words and note any uncertainty.

## Active recall cards
1. **Prompt:** What is the central idea of ${topic}? **Answer:** Explain its definition and why it matters.
2. **Prompt:** Which assumptions or steps support ${topic}? **Answer:** List them in order and justify each one.
3. **Prompt:** How would you apply ${topic} to a new example? **Answer:** Give a worked example and verify the result.

## Mindmap
\`\`\`text
${topic}
├── Key concepts
├── Assumptions
├── Worked example
└── Open questions
\`\`\``
  },
  'code-audit': (context) => `# Code audit notes

## Suggested unit assertions
1. Assert the primary function returns the expected value for a representative input.
2. Assert empty and boundary inputs are handled without throwing unexpectedly.
3. Assert invalid input follows the documented error or validation behavior.

## Performance refactor
Profile the hot path first. Check for repeated work inside loops, avoid recomputing derived values, and add tests before changing behavior.

## Review context
\`\`\`
${context.slice(0, 1800) || 'No active code provided.'}
\`\`\``,
  creator: (context) => `# Creator hook & storyboard

## Three title / hook options
1. The surprising detail about ${context.slice(0, 60) || 'this idea'} nobody mentions
2. I tried this for one week — here is what actually changed
3. Stop scrolling: the simplest way to understand this in 30 seconds

## Two-column storyboard
| Time | Voice / on-screen action |
|---|---|
| 00:00–00:03 | Open with the clearest curiosity gap; show the result first. |
| 00:03–00:10 | State the problem and why the viewer should care. |
| 00:10–00:22 | Demonstrate the key steps with concise visual callouts. |
| 00:22–00:30 | Deliver the takeaway and invite one specific next action. |`,
}

export function generateLocalAgentOutput(request: AgentRequest): string {
  return FALLBACK_OUTPUTS[request.kind](request.context)
}

export async function runLocalAgent(request: AgentRequest): Promise<string> {
  const prompt = `You are a concise ${request.kind} assistant for a collaborative study and development workspace. Produce safe, non-executing suggestions; never claim to have run code. Context:\n${request.context}`
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 1800)

  try {
    const response = await fetch('http://127.0.0.1:31415/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'local',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
    })
    if (!response.ok) throw new Error(`Local agent endpoint returned ${response.status}`)
    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'choices' in data &&
      Array.isArray(data.choices)
    ) {
      const firstChoice: unknown = data.choices[0]
      if (
        typeof firstChoice === 'object' &&
        firstChoice !== null &&
        'message' in firstChoice &&
        typeof firstChoice.message === 'object' &&
        firstChoice.message !== null &&
        'content' in firstChoice.message &&
        typeof firstChoice.message.content === 'string' &&
        firstChoice.message.content.trim()
      ) {
        return firstChoice.message.content
      }
    }
    throw new Error('Local agent returned an invalid response')
  } catch {
    return generateLocalAgentOutput(request)
  } finally {
    window.clearTimeout(timeout)
  }
}
