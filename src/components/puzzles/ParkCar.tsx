import { useEffect, useRef, useState } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }

const W = 360
const H = 260

const BAYS = [
  { x: 242, y: 26, w: 86, h: 120, dir: 0 },
  { x: 30, y: 22, w: 86, h: 120, dir: 0 },
  { x: 124, y: 152, w: 122, h: 72, dir: 90 },
]

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const wrap180 = (deg: number) => ((deg % 180) + 180) % 180
const axisDelta = (a: number, b: number) => {
  const d = Math.abs(wrap180(a) - wrap180(b))
  return Math.min(d, 180 - d)
}

type Key = 'up' | 'down' | 'left' | 'right'

export function ParkCar({ onSolved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bay] = useState(() => BAYS[Math.floor(Math.random() * BAYS.length)])
  const [parked, setParked] = useState(false)
  const car = useRef({ x: 56, y: 206, heading: 0, speed: 0 })
  const keys = useRef<Record<Key, boolean>>({ up: false, down: false, left: false, right: false })
  const parkedRef = useRef(false)
  const holdRef = useRef(0)
  const cb = useRef({ onSolved })
  cb.current = { onSolved }

  useEffect(() => {
    const map: Record<string, Key> = {
      arrowup: 'up',
      w: 'up',
      arrowdown: 'down',
      s: 'down',
      arrowleft: 'left',
      a: 'left',
      arrowright: 'right',
      d: 'right',
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()]
      if (!k) return
      e.preventDefault()
      keys.current[k] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = map[e.key.toLowerCase()]
      if (!k) return
      keys.current[k] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    let raf = 0
    let last = performance.now()

    const update = (dt: number) => {
      const c = car.current
      if (parkedRef.current) return
      const drive = (keys.current.up ? 1 : 0) - (keys.current.down ? 1 : 0)
      const steer = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)

      c.speed += drive * (drive > 0 ? 0.13 : 0.1) * dt
      c.speed = clamp(c.speed, -1.4, 2.4)
      c.speed *= Math.pow(0.945, dt)
      if (Math.abs(c.speed) < 0.02) c.speed = 0

      const turn = steer * 0.055 * Math.min(1, Math.abs(c.speed) / 1.1) * (c.speed < 0 ? -1 : 1)
      c.heading += turn * dt
      c.x += Math.sin(c.heading) * c.speed * dt * 1.7
      c.y += -Math.cos(c.heading) * c.speed * dt * 1.7
      c.x = clamp(c.x, 24, W - 24)
      c.y = clamp(c.y, 24, H - 24)

      const inside =
        c.x > bay.x + 12 &&
        c.x < bay.x + bay.w - 12 &&
        c.y > bay.y + 12 &&
        c.y < bay.y + bay.h - 12
      const aligned = axisDelta((c.heading * 180) / Math.PI, bay.dir) < 32

      if (inside && aligned && Math.abs(c.speed) < 0.6) {
        holdRef.current += dt
        if (holdRef.current > 24) {
          parkedRef.current = true
          setParked(true)
          window.setTimeout(() => cb.current.onSolved(), 750)
        }
      } else {
        holdRef.current = 0
      }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#121417')
      bg.addColorStop(1, '#0a0b0d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(244,244,239,0.055)'
      for (let y = 14; y < H; y += 22) {
        for (let x = 14; x < W; x += 22) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.save()
      if (parkedRef.current) {
        ctx.fillStyle = 'rgba(201,247,93,0.18)'
        ctx.beginPath()
        ctx.roundRect(bay.x, bay.y, bay.w, bay.h, 10)
        ctx.fill()
      }
      ctx.setLineDash([9, 7])
      ctx.strokeStyle = parkedRef.current ? '#c9f75d' : 'rgba(244,244,239,0.45)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(bay.x, bay.y, bay.w, bay.h, 10)
      ctx.stroke()
      ctx.restore()

      ctx.font = '500 34px Lexend, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = parkedRef.current ? 'rgba(201,247,93,0.55)' : 'rgba(244,244,239,0.14)'
      ctx.fillText('P', bay.x + bay.w / 2, bay.y + bay.h / 2)

      const c = car.current
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(c.heading)
      ctx.fillStyle = '#f4f4ef'
      ctx.beginPath()
      ctx.roundRect(-10, -18, 20, 36, 6)
      ctx.fill()
      ctx.fillStyle = '#0b0c0e'
      ctx.beginPath()
      ctx.roundRect(-7, -9, 14, 11, 3)
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(-7, 7, 14, 7, 2)
      ctx.fill()
      ctx.fillStyle = '#c9f75d'
      ctx.beginPath()
      ctx.arc(-6, -16, 2.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(6, -16, 2.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.font = '500 9.5px Lexend, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = parkedRef.current ? '#c9f75d' : 'rgba(244,244,239,0.4)'
      ctx.fillText(parkedRef.current ? 'PARKED' : 'PARK INSIDE THE BAY', 16, 22)
    }

    const step = (now: number) => {
      const dt = clamp((now - last) / 16.667, 0.2, 2.4)
      last = now
      update(dt)
      draw()
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [bay])

  const hold = (key: Key, value: boolean) => () => {
    keys.current[key] = value
  }

  return (
    <div className="parkWrap">
      <canvas ref={canvasRef} className="parkCanvas" />
      <div className="parkPad">
        <button
          type="button"
          className="padBtn padUp"
          aria-label="accelerate"
          onPointerDown={hold('up', true)}
          onPointerUp={hold('up', false)}
          onPointerLeave={hold('up', false)}
          onPointerCancel={hold('up', false)}
        >
          ↑
        </button>
        <button
          type="button"
          className="padBtn padLeft"
          aria-label="steer left"
          onPointerDown={hold('left', true)}
          onPointerUp={hold('left', false)}
          onPointerLeave={hold('left', false)}
          onPointerCancel={hold('left', false)}
        >
          ←
        </button>
        <button
          type="button"
          className="padBtn padDown"
          aria-label="reverse"
          onPointerDown={hold('down', true)}
          onPointerUp={hold('down', false)}
          onPointerLeave={hold('down', false)}
          onPointerCancel={hold('down', false)}
        >
          ↓
        </button>
        <button
          type="button"
          className="padBtn padRight"
          aria-label="steer right"
          onPointerDown={hold('right', true)}
          onPointerUp={hold('right', false)}
          onPointerLeave={hold('right', false)}
          onPointerCancel={hold('right', false)}
        >
          →
        </button>
      </div>
      <span className="parkHint">{parked ? 'parked cleanly' : 'arrow keys / WASD, or use the pad'}</span>
    </div>
  )
}
