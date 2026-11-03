export type RustCommandType =
  | 'new_session'
  | 'save_vault_item'
  | 'export_markdown'
  | 'download_file'
  | 'ai_prompt'
  | 'status_check'

export interface RustCommand<TPayload = Record<string, unknown>> {
  type: RustCommandType
  payload: TPayload
}

export interface RustCommandResult<TData = Record<string, unknown>> {
  ok: boolean
  message: string
  data?: TData
}

declare global {
  interface Window {
    __campfireRustBridge?: {
      invokeCommand?: <TData = Record<string, unknown>>(command: RustCommand) => Promise<RustCommandResult<TData>>
    }
  }
}

export async function invokeCommand<TData = Record<string, unknown>>(
  type: RustCommandType,
  payload: Record<string, unknown> = {},
): Promise<RustCommandResult<TData>> {
  const command: RustCommand = { type, payload }

  if (typeof window === 'undefined') {
    return { ok: true, message: 'Rust bridge not available in this environment.', data: {} as TData }
  }

  const bridge = window.__campfireRustBridge?.invokeCommand
  if (!bridge) {
    return {
      ok: true,
      message: 'Rust bridge will be connected in the native app shell.',
      data: { command, status: 'queued' } as TData,
    }
  }

  return bridge<TData>(command)
}
