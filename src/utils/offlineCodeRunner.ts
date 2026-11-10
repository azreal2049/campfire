function evaluateArithmetic(source: string): number {
  const tokens = source.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? []
  if (tokens.length === 0 || tokens.join('') !== source.replace(/\s+/g, '')) {
    throw new Error('Offline runner accepts arithmetic expressions only.')
  }

  let cursor = 0
  const parsePrimary = (): number => {
    const token = tokens[cursor]
    if (token === '+' || token === '-') {
      cursor += 1
      const value = parsePrimary()
      return token === '-' ? -value : value
    }
    if (token === '(') {
      cursor += 1
      const value = parseExpression()
      if (tokens[cursor] !== ')') throw new Error('Unclosed parenthesis.')
      cursor += 1
      return value
    }
    if (token === undefined || !/^\d/.test(token)) throw new Error('Expected a number.')
    cursor += 1
    return Number(token)
  }
  const parseTerm = (): number => {
    let value = parsePrimary()
    while (tokens[cursor] === '*' || tokens[cursor] === '/') {
      const operator = tokens[cursor]
      cursor += 1
      const next = parsePrimary()
      if (operator === '/' && next === 0) throw new Error('Division by zero.')
      value = operator === '*' ? value * next : value / next
    }
    return value
  }
  const parseExpression = (): number => {
    let value = parseTerm()
    while (tokens[cursor] === '+' || tokens[cursor] === '-') {
      const operator = tokens[cursor]
      cursor += 1
      const next = parseTerm()
      value = operator === '+' ? value + next : value - next
    }
    return value
  }

  const result = parseExpression()
  if (cursor !== tokens.length || !Number.isFinite(result)) throw new Error('Unsupported or invalid arithmetic expression.')
  return result
}

export function runOfflineSnippet(source: string): string {
  const code = source.trim().replace(/;$/, '').trim()
  const printMatch = code.match(/^print\(\s*(?:"([^"]*)"|'([^']*)'|([\s\S]*))\s*\)$/)
  if (printMatch) {
    if (printMatch[1] !== undefined) return printMatch[1]
    if (printMatch[2] !== undefined) return printMatch[2]
    return String(evaluateArithmetic(printMatch[3] ?? ''))
  }
  return String(evaluateArithmetic(code))
}
