import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateMazePath } from '../../lib/puzzles'

type Pt = { x: number; y: number }
type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const COLS = 11
const ROWS = 7
const CELL = 46
const PAD = 22
const LOGICAL_W = COLS * CELL + PAD * 2
const LOGICAL_H = ROWS * CELL + PAD * 2

const cellCenter = (cx: number, cy: number): Pt => ({
  x: PAD + cx * CELL + CELL / 2,
  y: PAD + cy * CELL + CELL / 2,
})

export function MazeTrace({ onSolved, onFailed }: Props) {
  const corridor = useMemo(() => generateMazePath(COLS, ROWS), [])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<Pt[]>([])
  const lastRef = useRef<Pt | null>(null)
  const activeRef = useRef(false)
  const solvedRef = useRef(false)
  const rafRef = useRef(0)
  const timeoutRef = useRef<number | undefined>(undefined)
  const [hint, setHint] = useState(true)
  const [flash, setFlash] = useState(false)

  const startPt = useMemo(() => cellCenter(0, 0), [])
  const endPt = useMemo(() => cellCenter(COLS - 1, ROWS - 1), [])

  const draw = useCallback(
    (trail: Pt[], done: boolean) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(LOGICAL_W * dpr)) {
        canvas.width = Math.round(LOGICAL_W * dpr)
        canvas.height = Math.round(LOGICAL_H * dpr)
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H)

      ctx.fillStyle = '#0b0c0e'
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)

      ctx.fillStyle = 'rgba(255,255,255,0.045)'
      for (let y = 6; y < LOGICAL_H; y += 11) {
        for (let x = 6; x < LOGICAL_W; x += 11) {
          ctx.beginPath()
          ctx.arc(x, y, 0.9, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.fillStyle = '#f4f4ef'
      for (const cellKey of corridor) {
        const [cx, cy] = cellKey.split(',').map(Number)
        ctx.beginPath()
        ctx.roundRect(PAD + cx * CELL + 1.5, PAD + cy * CELL + 1.5, CELL - 3, CELL - 3, 10)
        ctx.fill()
      }

      if (trail.length > 1) {
        ctx.strokeStyle = '#0b0c0e'
        ctx.lineWidth = 14
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(trail[0].x, trail[0].y)
        for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()

        ctx.strokeStyle = '#c9f75d'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(trail[0].x, trail[0].y)
        for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()
      }

      // start marker
      ctx.beginPath()
      ctx.arc(startPt.x, startPt.y, 12, 0, Math.PI * 2)
      ctx.fillStyle = '#f4f4ef'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(startPt.x, startPt.y, 6.5, 0, Math.PI * 2)
      ctx.fillStyle = '#8fce1b'
      ctx.fill()

      // end marker
      ctx.beginPath()
      ctx.arc(endPt.x, endPt.y, done ? 14 : 12, 0, Math.PI * 2)
      ctx.fillStyle = done ? '#c9f75d' : '#f4f4ef'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(endPt.x, endPt.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#0b0c0e'
      ctx.fill()
      if (!done) {
        ctx.beginPath()
        ctx.arc(endPt.x, endPt.y, 18, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(244,244,239,0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    },
    [corridor, startPt, endPt],
  )

  const schedule = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => draw(trailRef.current, solvedRef.current))
  }, [draw])

  useEffect(() => {
    draw([], false)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(timeoutRef.current)
    }
  }, [draw])

  const toLocal = (clientX: number, clientY: number): Pt => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * LOGICAL_W,
      y: ((clientY - rect.top) / rect.height) * LOGICAL_H,
    }
  }

  const isOpen = (p: Pt) => {
    const cx = Math.floor((p.x - PAD) / CELL)
    const cy = Math.floor((p.y - PAD) / CELL)
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return false
    return corridor.has(`${cx},${cy}`)
  }

  const fail = () => {
    if (!activeRef.current) return
    activeRef.current = false
    setFlash(true)
    onFailed('touched a wall')
    timeoutRef.current = window.setTimeout(() => {
      trailRef.current = []
      lastRef.current = null
      setFlash(false)
      schedule()
    }, 440)
  }

  const finish = () => {
    if (solvedRef.current) return
    solvedRef.current = true
    activeRef.current = false
    schedule()
    onSolved()
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (solvedRef.current) return
    const p = toLocal(e.clientX, e.clientY)
    if (Math.hypot(p.x - startPt.x, p.y - startPt.y) > CELL * 0.85) return
    e.currentTarget.setPointerCapture(e.pointerId)
    window.clearTimeout(timeoutRef.current)
    activeRef.current = true
    setHint(false)
    trailRef.current = [p]
    lastRef.current = p
    schedule()
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeRef.current || solvedRef.current) return
    const p = toLocal(e.clientX, e.clientY)
    const last = lastRef.current ?? p
    const dist = Math.hypot(p.x - last.x, p.y - last.y)
    const steps = Math.max(1, Math.ceil(dist / 5))
    for (let i = 1; i <= steps; i++) {
      const sample = {
        x: last.x + ((p.x - last.x) * i) / steps,
        y: last.y + ((p.y - last.y) * i) / steps,
      }
      if (!isOpen(sample)) {
        fail()
        return
      }
      trailRef.current.push(sample)
    }
    lastRef.current = p
    schedule()
    if (Math.hypot(p.x - endPt.x, p.y - endPt.y) < CELL * 0.62) finish()
  }

  const onUp = () => {
    if (solvedRef.current) return
    activeRef.current = false
    if (trailRef.current.length > 1) {
      timeoutRef.current = window.setTimeout(() => {
        trailRef.current = []
        lastRef.current = null
        schedule()
      }, 220)
    }
  }

  return (
    <div className={`maze ${flash ? 'is-flash' : ''}`}>
      <canvas
        ref={canvasRef}
        className="mazeCanvas"
        style={{ aspectRatio: `${LOGICAL_W} / ${LOGICAL_H}` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      />
      {hint && <div className="mazeHint">press and drag from the dot</div>}
      <div className="mazeBadge">
        <span className="mazeBadgeDot" /> trace the corridor
      </div>
    </div>
  )
}
