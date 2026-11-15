export type PuzzleKind =
  | 'maze'
  | 'sort'
  | 'rotate'
  | 'recall'
  | 'link'
  | 'park'
  | 'dodge'
  | 'stack'
  | 'pour'
  | 'weigh'
  | 'putt'
  | 'snip'

export const PUZZLE_KINDS: PuzzleKind[] = [
  'maze',
  'sort',
  'rotate',
  'recall',
  'link',
  'park',
  'dodge',
  'stack',
  'pour',
  'weigh',
  'putt',
  'snip',
]

export const PUZZLE_META: Record<PuzzleKind, { name: string; tag: string; task: string }> = {
  maze: {
    name: 'Trace',
    tag: 'motor',
    task: 'Drag from the start dot to the end dot without touching a wall.',
  },
  sort: {
    name: 'Scale',
    tag: 'ordering',
    task: 'Click the shapes from smallest to largest.',
  },
  rotate: {
    name: 'Rotate',
    tag: 'rotation',
    task: 'Drag the dial until the three symbols drop into their slots.',
  },
  recall: {
    name: 'Recall',
    tag: 'memory',
    task: 'Watch the pattern, then click the cells back in the same order.',
  },
  link: {
    name: 'Link',
    tag: 'sequencing',
    task: 'Drag from 1 to 5 in order, linking every dot.',
  },
  park: {
    name: 'Park',
    tag: 'control',
    task: 'Drive into the bay and stop inside the lines. Arrow keys or the pad.',
  },
  dodge: {
    name: 'Dodge',
    tag: 'reflex',
    task: 'Survive seven seconds. Steer clear of the falling coins.',
  },
  stack: {
    name: 'Stack',
    tag: 'timing',
    task: 'Drop three blocks on the tower without missing.',
  },
  pour: {
    name: 'Pour',
    tag: 'control',
    task: 'Hold to pour, then release on both drifting marks — the lower one first.',
  },
  weigh: {
    name: 'Weigh',
    tag: 'balance',
    task: 'Tap weights until the scale balances the target.',
  },
  putt: {
    name: 'Putt',
    tag: 'aim',
    task: 'Drag back from the ball and release to sink the putt.',
  },
  snip: {
    name: 'Snip',
    tag: 'gesture',
    task: 'Swipe through the marked segment of both cables.',
  },
}

export function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function shuffle<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

export function pickPuzzleKind(exclude?: PuzzleKind): PuzzleKind {
  const pool = exclude ? PUZZLE_KINDS.filter((k) => k !== exclude) : PUZZLE_KINDS
  return pool[randInt(pool.length)]
}

const key = (x: number, y: number) => `${x},${y}`

/**
 * Randomized depth-first search from the top-left cell to the bottom-right one.
 * The visited chain becomes the only walkable corridor, everything else is wall.
 */
export function generateMazePath(width: number, height: number): Set<string> {
  const start = key(0, 0)
  const goal = key(width - 1, height - 1)
  const parent = new Map<string, string | null>()
  const visited = new Set<string>([start])
  const stack: string[] = [start]
  parent.set(start, null)

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    if (current === goal) break
    const [cx, cy] = current.split(',').map(Number)
    const neighbours = shuffle([
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ]).filter(([x, y]) => x >= 0 && x < width && y >= 0 && y < height && !visited.has(key(x, y)))

    if (neighbours.length === 0) {
      stack.pop()
      continue
    }
    const [nx, ny] = neighbours[0]
    const nk = key(nx, ny)
    visited.add(nk)
    parent.set(nk, current)
    stack.push(nk)
  }

  const corridor = new Set<string>()
  let cursor: string | null = goal
  while (cursor) {
    corridor.add(cursor)
    cursor = parent.get(cursor) ?? null
  }
  return corridor
}

export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

export function sessionId(): string {
  return Math.random().toString(16).slice(2, 8)
}

export function normalizeAngle(a: number): number {
  return ((a % 360) + 360) % 360
}

export function angleDistance(a: number, b: number): number {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b))
  return d > 180 ? 360 - d : d
}
