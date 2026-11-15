import { useEffect, useRef, useState } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const W = 340
const H = 230
const START = { x: 170, y: 196 }
const MAX_PUTTS = 3
const MAX_POWER = 13

type Vec = { x: number; y: number }

export function PuttGreen({ onSolved, onFailed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hole] = useState(() => ({ x: 66 + Math.random() * 208, y: 46 + Math.random() * 48 }))
  const [attempt, setAttempt] = useState(1)
  const [made, setMade] = useState(false)

  const shot = useRef({ ball: { ...START }, vel: { x: 0, y: 0 }, aim: null as Vec | null, dragging: false, live: false, done: false })
  const attempts = useRef(0)
  const cb = useRef({ onSolved, onFailed })
  cb.current = { onSolved, onFailed }

  const toLocal = (clientX: number, clientY: number): Vec => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr

    let raf = 0

    const update = () => {
      const s = shot.current
      if (s.done) return
      const speed = Math.hypot(s.vel.x, s.vel.y)
      if (speed > 0) {
        s.ball.x += s.vel.x
        s.ball.y += s.vel.y
        s.vel.x *= 0.977
        s.vel.y *= 0.977
        s.live = true
        if (s.ball.x < 14) {
          s.ball.x = 14
          s.vel.x *= -0.62
        }
        if (s.ball.x > W - 14) {
          s.ball.x = W - 14
          s.vel.x *= -0.62
        }
        if (s.ball.y < 14) {
          s.ball.y = 14
          s.vel.y *= -0.62
        }
        if (s.ball.y > H - 14) {
          s.ball.y = H - 14
          s.vel.y *= -0.62
        }

        const d = Math.hypot(s.ball.x - hole.x, s.ball.y - hole.y)
        if (d < 16 && speed < 9) {
          s.done = true
          s.vel = { x: 0, y: 0 }
          setMade(true)
          window.setTimeout(() => cb.current.onSolved(), 720)
          return
        }
      }

      if (Math.hypot(s.vel.x, s.vel.y) < 0.06 && s.live) {
        s.vel = { x: 0, y: 0 }
        s.live = false
        attempts.current += 1
        if (attempts.current >= MAX_PUTTS) {
          attempts.current = 0
          setAttempt(1)
          cb.current.onFailed('missed three putts')
        } else {
          setAttempt(attempts.current + 1)
        }
        s.ball = { ...START }
      }
    }

    const draw = () => {
      const s = shot.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#121417')
      bg.addColorStop(1, '#0a0b0d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(244,244,239,0.05)'
      for (let y = 18; y < H; y += 24) {
        for (let x = 18; x < W; x += 24) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // hole + flag
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 15, 0, Math.PI * 2)
      ctx.fillStyle = s.done ? 'rgba(201,247,93,0.25)' : 'rgba(0,0,0,0.65)'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = s.done ? '#c9f75d' : 'rgba(244,244,239,0.45)'
      ctx.stroke()

      ctx.strokeStyle = s.done ? '#c9f75d' : 'rgba(244,244,239,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(hole.x, hole.y - 4)
      ctx.lineTo(hole.x, hole.y - 34)
      ctx.stroke()
      ctx.fillStyle = '#c9f75d'
      ctx.beginPath()
      ctx.moveTo(hole.x, hole.y - 34)
      ctx.lineTo(hole.x + 20, hole.y - 28)
      ctx.lineTo(hole.x, hole.y - 22)
      ctx.closePath()
      ctx.fill()

      // aim guide
      if (s.dragging && s.aim) {
        const dx = s.ball.x - s.aim.x
        const dy = s.ball.y - s.aim.y
        const power = Math.min(1, Math.hypot(dx, dy) / 120)
        ctx.save()
        ctx.setLineDash([5, 7])
        ctx.strokeStyle = 'rgba(201,247,93,0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.ball.x, s.ball.y)
        ctx.lineTo(s.ball.x + dx * 2.4, s.ball.y + dy * 2.4)
        ctx.stroke()
        ctx.restore()

        ctx.fillStyle = 'rgba(201,247,93,0.9)'
        ctx.fillRect(16, H - 22, 6 + power * 96, 6)
        ctx.strokeStyle = 'rgba(244,244,239,0.25)'
        ctx.lineWidth = 1
        ctx.strokeRect(16, H - 22, 102, 6)
      }

      // ball
      ctx.beginPath()
      ctx.arc(s.ball.x, s.ball.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#f4f4ef'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(s.ball.x - 2.4, s.ball.y - 2.4, 2.4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(10,11,13,0.18)'
      ctx.fill()

      ctx.font = '500 9.5px Lexend, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = s.done ? '#c9f75d' : 'rgba(244,244,239,0.4)'
      ctx.fillText(s.done ? 'IN THE HOLE' : 'DRAG BACK FROM THE BALL TO AIM', 16, 24)
    }

    const step = () => {
      update()
      draw()
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [hole])

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = shot.current
    if (s.done) return
    e.currentTarget.setPointerCapture(e.pointerId)
    s.dragging = true
    s.aim = toLocal(e.clientX, e.clientY)
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = shot.current
    if (!s.dragging) return
    s.aim = toLocal(e.clientX, e.clientY)
  }

  const onUp = () => {
    const s = shot.current
    if (!s.dragging) return
    s.dragging = false
    const aim = s.aim
    s.aim = null
    if (!aim) return
    const dx = (s.ball.x - aim.x) * 0.105
    const dy = (s.ball.y - aim.y) * 0.105
    const power = Math.hypot(dx, dy)
    if (power < 0.8) return
    const scale = power > MAX_POWER ? MAX_POWER / power : 1
    s.vel = { x: dx * scale, y: dy * scale }
    s.live = true
  }

  return (
    <div className="puttWrap">
      <canvas
        ref={canvasRef}
        className="puttCanvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        role="application"
        aria-label="Drag back from the ball and release to putt it into the hole"
      />
      <span className="puttHint">{made ? 'one putt' : `putt ${attempt} of ${MAX_PUTTS}`}</span>
    </div>
  )
}
