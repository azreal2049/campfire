export interface OfflineCodeOutput {
  stdout: string
  stderr: string
  exitCode: number
}

export function offlineOutput(source: string, extension: string): OfflineCodeOutput {
  const outputs: string[] = []
  const pattern = extension === 'py' ? /^\s*print\((.*)\)\s*$/ : /^\s*console\.log\((.*)\)\s*;?\s*$/
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(pattern)
    if (!match) continue
    const value = match[1].trim()
    if (/^(['"]).*\1$/.test(value)) outputs.push(value.slice(1, -1))
    else if (/^-?\d+(?:\.\d+)?\s*[+\-*/]\s*-?\d+(?:\.\d+)?$/.test(value)) {
      const [, left, operator, right] = value.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/) ?? []
      const a = Number(left)
      const b = Number(right)
      if (operator === '/' && b === 0) return { stdout: outputs.join('\n'), stderr: 'Division by zero in offline evaluator.', exitCode: 1 }
      const result = operator === '+' ? a + b : operator === '-' ? a - b : operator === '*' ? a * b : a / b
      outputs.push(String(result))
    } else {
      return { stdout: outputs.join('\n'), stderr: 'Offline evaluator supports literal print/console.log and basic arithmetic only.', exitCode: 1 }
    }
  }
  return outputs.length
    ? { stdout: outputs.join('\n'), stderr: '', exitCode: 0 }
    : { stdout: '', stderr: 'No supported output statements found by the offline evaluator.', exitCode: 1 }
}
