import { useEffect, useRef, useState } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const W = 340
const H = 230
const BAND_HALF = 30
const MAX_MISSES = 3

type Cable = { id: number; y: number; bandX: number; cut: boolean }
type Point = { x: number; y: number; t: number }

function makeCables(): Cable[] {
  return [
    { id: 0, y: 84, bandX: 70 + Math.random() * 200, cut: false },
    { id: 1, y: 148, bandX: 70 + Math.random() * 200, cut: false },
  ]
}

export function SnipCables({ onSolved, onFailed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cutCount, setCutCount] = useState(0)
  const [misses, setMisses] = useState(0)
  const [done, setDone] = useState(false)

  const cablesRef = useRef<Cable[]>(makeCables())
  const strokeRef = useRef<Point[]>([])
  const drawingRef = useRef(false)
  const missesRef = useRef(0)
  const doneRef = useRef(false)
  const flashRef = useRef(0)
  const cb = useRef({ onSolved, onFailed })
  cb.current = { onSolved, onFailed }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr

    let raf = 0
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#121417')
      bg.addColorStop(1, '#0a0b0d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(244,244,239,0.05)'
      for (let y = 16; y < H; y += 22) {
        for (let x = 16; x < W; x += 22) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      cablesRef.current.forEach((cable) => {
        const left = 18
        const right = W - 18
        const gapStart = cable.bandX - BAND_HALF
        const gapEnd = cable.bandX + BAND_HALF

        // cut zone sleeve
        ctx.save()
        ctx.setLineDash([5, 4])
        ctx.strokeStyle = cable.cut ? 'rgba(201,247,93,0.35)' : '#c9f75d'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.roundRect(gapStart, cable.y - 11, gapEnd - gapStart, 22, 7)
        ctx.stroke()
        ctx.restore()
        if (!cable.cut) {
          ctx.fillStyle = 'rgba(201,247,93,0.14)'
          ctx.beginPath()
          ctx.roundRect(gapStart, cable.y - 11, gapEnd - gapStart, 22, 7)
          ctx.fill()
        }

        ctx.lineCap = 'round'
        ctx.lineWidth = 3.2
        ctx.strokeStyle = cable.cut ? 'rgba(244,244,239,0.3)' : 'rgba(244,244,239,0.85)'
        ctx.beginPath()
        if (cable.cut) {
          ctx.moveTo(left, cable.y)
          ctx.quadraticCurveTo(cable.bandX - 54, cable.y + 16, gapStart - 6, cable.y + 26)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(right, cable.y)
          ctx.quadraticCurveTo(cable.bandX + 54, cable.y + 16, gapEnd + 6, cable.y + 26)
        } else {
          ctx.moveTo(left, cable.y)
          ctx.lineTo(gapStart, cable.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(gapEnd, cable.y)
          ctx.lineTo(right, cable.y)
        }
        ctx.stroke()

        // end caps
        ctx.fillStyle = cable.cut ? 'rgba(201,247,93,0.5)' : '#c9f75d'
        ctx.beginPath()
        ctx.arc(left, cable.y, 3.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(right, cable.y, 3.4, 0, Math.PI * 2)
        ctx.fill()

        // spark at the fresh cut
        if (cable.cut && flashRef.current > 0) {
          const alpha = Math.min(1, flashRef.current)
          ctx.fillStyle = `rgba(201,247,93,${alpha})`
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2
            const distance = 8 + (1 - alpha) * 22
            ctx.beginPath()
            ctx.arc(cable.bandX + Math.cos(angle) * distance, cable.y + Math.sin(angle) * distance, 2.4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // the swipe itself
      const pts = strokeRef.current
      if (pts.length > 1) {
        ctx.strokeStyle = 'rgba(201,247,93,0.85)'
        ctx.lineWidth = 2.4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }

      flashRef.current = Math.max(0, flashRef.current - 0.02)

      ctx.font = '500 9.5px Lexend, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = doneRef.current ? '#c9f75d' : 'rgba(244,244,239,0.4)'
      ctx.fillText(doneRef.current ? 'BOTH CABLES CUT' : 'SWIPE ACROSS THE MARKED SEGMENT', 16, 24)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const toLocal = (clientX: number, clientY: number): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }

  const miss = (reason: string) => {
    missesRef.current += 1
    setMisses(missesRef.current)
    if (missesRef.current >= MAX_MISSES) {
      doneRef.current = true
      cb.current.onFailed(reason)
    }
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (doneRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toLocal(e.clientX, e.clientY)
    drawingRef.current = true
    strokeRef.current = [{ ...p, t: performance.now() }]
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || doneRef.current) return
    const p = toLocal(e.clientX, e.clientY)
    strokeRef.current.push({ ...p, t: performance.now() })
  }

  const onUp = () => {
    if (!drawingRef.current || doneRef.current) return
    drawingRef.current = false
    const pts = strokeRef.current
    strokeRef.current = []

    if (pts.length < 2) {
      miss('too slow to count')
      return
    }

    const duration = pts[pts.length - 1].t - pts[0].t
    const travel = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y)

    if (duration > 1400 || travel < 26) {
      miss('swipe was too short')
      return
    }

    const hit: number[] = []
    for (const cable of cablesRef.current) {
      if (cable.cut) continue
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        if (a.y === b.y) continue
        if ((a.y - cable.y) * (b.y - cable.y) > 0) continue
        const ratio = (cable.y - a.y) / (b.y - a.y)
        const crossX = a.x + (b.x - a.x) * ratio
        if (Math.abs(crossX - cable.bandX) <= BAND_HALF) hit.push(cable.id)
        break
      }
    }

    if (hit.length === 0) {
      miss('missed the marked segment')
      return
    }

    const next = cablesRef.current.map((cable) => (hit.includes(cable.id) ? { ...cable, cut: true } : cable))
    cablesRef.current = next
    flashRef.current = 1
    const total = next.filter((cable) => cable.cut).length
    setCutCount(total)
    if (total === next.length) {
      doneRef.current = true
      setDone(true)
      window.setTimeout(() => cb.current.onSolved(), 720)
    }
  }

  return (
    <div className="snipWrap">
      <canvas
        ref={canvasRef}
        className="snipCanvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        role="application"
        aria-label="Swipe across the highlighted segment of each cable to cut it"
      />
      <span className="snipHint">
        {done ? 'clean cut' : `${cutCount} of 2 cut · ${MAX_MISSES - misses} swipes left`}
      </span>
    </div>
  )
}
