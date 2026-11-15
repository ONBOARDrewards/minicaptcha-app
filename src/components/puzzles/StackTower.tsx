import { useCallback, useEffect, useRef } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }
type Block = { x: number; w: number; y: number }

const W = 360
const H = 260
const BH = 22
const BASE_Y = 226

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function StackTower({ onSolved, onFailed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tower = useRef<Block[]>([{ x: 120, w: 120, y: BASE_Y }])
  const moving = useRef<Block>({ x: 120, w: 120, y: BASE_Y - 96 })
  const phase = useRef(0)
  const dropping = useRef(false)
  const landings = useRef(0)
  const doneRef = useRef(false)
  const statusRef = useRef('tap to drop')
  const cb = useRef({ onSolved, onFailed })
  cb.current = { onSolved, onFailed }

  const drop = useCallback(() => {
    if (dropping.current || doneRef.current) return
    dropping.current = true
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        drop()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drop])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr

    let raf = 0
    let last = performance.now()

    const reset = () => {
      tower.current = [{ x: 120, w: 120, y: BASE_Y }]
      moving.current = { x: 120, w: 120, y: BASE_Y - 96 }
      phase.current = 0
      landings.current = 0
      dropping.current = false
      doneRef.current = false
      statusRef.current = 'tap to drop'
    }

    const resolve = (top: Block) => {
      const m = moving.current
      const left = Math.max(m.x, top.x)
      const right = Math.min(m.x + m.w, top.x + top.w)
      const overlap = right - left

      dropping.current = false

      if (overlap < 14) {
        statusRef.current = 'missed'
        cb.current.onFailed('missed the stack')
        window.setTimeout(reset, 850)
        return
      }

      const next: Block = { x: left, w: overlap, y: top.y - 24 }
      tower.current = [...tower.current, next]
      landings.current += 1

      if (landings.current >= 3) {
        doneRef.current = true
        statusRef.current = 'stacked'
        window.setTimeout(() => cb.current.onSolved(), 750)
        return
      }

      moving.current = { x: next.x, w: next.w, y: next.y - 84 }
      statusRef.current = `land ${landings.current} / 3`
    }

    const update = (dt: number) => {
      if (doneRef.current) return
      const m = moving.current

      if (!dropping.current) {
        phase.current += (0.045 + landings.current * 0.014) * dt
        const amp = Math.max(24, (W - m.w) / 2 - 18)
        m.x = W / 2 + Math.sin(phase.current) * amp - m.w / 2
        return
      }

      m.y += 15 * dt
      const top = tower.current[tower.current.length - 1]
      if (m.y + BH >= top.y) {
        m.y = top.y - BH
        resolve(top)
      }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0e1013')
      bg.addColorStop(1, '#0a0b0d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(244,244,239,0.07)'
      ctx.lineWidth = 1
      for (let y = 40; y < H; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      ctx.fillStyle = 'rgba(244,244,239,0.12)'
      ctx.fillRect(0, BASE_Y + BH, W, 1)

      tower.current.forEach((block, i) => {
        const isTop = i === tower.current.length - 1
        ctx.fillStyle = isTop && !doneRef.current ? '#c9f75d' : '#e9e9e2'
        ctx.beginPath()
        ctx.roundRect(block.x, block.y, block.w, BH, 6)
        ctx.fill()
      })

      if (!doneRef.current) {
        const m = moving.current
        if (!dropping.current) {
          const top = tower.current[tower.current.length - 1]
          ctx.save()
          ctx.setLineDash([4, 7])
          ctx.strokeStyle = 'rgba(201,247,93,0.35)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(m.x + m.w / 2, m.y + BH + 6)
          ctx.lineTo(m.x + m.w / 2, top.y - 4)
          ctx.stroke()
          ctx.restore()
        }
        ctx.fillStyle = '#c9f75d'
        ctx.beginPath()
        ctx.roundRect(m.x, m.y, m.w, BH, 6)
        ctx.fill()
        ctx.fillStyle = 'rgba(10,11,13,0.35)'
        ctx.beginPath()
        ctx.roundRect(m.x + 6, m.y + 6, Math.max(0, m.w - 12), 4, 2)
        ctx.fill()
      }

      ctx.font = '500 9.5px Lexend, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(244,244,239,0.45)'
      ctx.fillText(`LAND ${Math.min(landings.current, 3)} / 3`, 16, 22)

      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(244,244,239,0.3)'
      ctx.fillText(statusRef.current === 'stacked' ? '' : 'tap or press space', W / 2, H - 12)
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
  }, [])

  return (
    <div className="stackWrap">
      <canvas ref={canvasRef} className="stackCanvas" onPointerDown={drop} />
    </div>
  )
}
