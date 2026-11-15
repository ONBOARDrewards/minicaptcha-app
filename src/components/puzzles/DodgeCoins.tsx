import { useEffect, useRef } from 'react'

type Props = { onSolved: () => void; onFailed: (reason: string) => void }
type Coin = { x: number; y: number; r: number; vy: number }
type Phase = 'run' | 'hit' | 'won'

const W = 360
const H = 260
const DURATION = 7000
const PLAYER_Y = 226

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function DodgeCoins({ onSolved, onFailed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerX = useRef(W / 2)
  const coins = useRef<Coin[]>([])
  const elapsed = useRef(0)
  const spawnAcc = useRef(0)
  const doneRef = useRef(false)
  const hitRef = useRef(false)
  const phaseRef = useRef<Phase>('run')
  const keys = useRef({ left: false, right: false })
  const cb = useRef({ onSolved, onFailed })
  cb.current = { onSolved, onFailed }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.current.left = true
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.current.right = true
        e.preventDefault()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.current.right = false
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

    const resetRun = () => {
      playerX.current = W / 2
      coins.current = []
      elapsed.current = 0
      spawnAcc.current = 0
      hitRef.current = false
      phaseRef.current = 'run'
    }

    const update = (dt: number) => {
      if (doneRef.current || hitRef.current) return

      elapsed.current += dt * 16.667
      if (keys.current.left) playerX.current -= 3.6 * dt
      if (keys.current.right) playerX.current += 3.6 * dt
      playerX.current = clamp(playerX.current, 22, W - 22)

      if (elapsed.current > 650) {
        spawnAcc.current += dt
        const interval = Math.max(16, 26 - elapsed.current / 900)
        if (spawnAcc.current > interval) {
          spawnAcc.current = 0
          coins.current.push({
            x: 26 + Math.random() * (W - 52),
            y: -14,
            r: 9,
            vy: 1.45 + (elapsed.current / DURATION) * 1.35 + Math.random() * 0.45,
          })
        }
      }

      for (const coin of coins.current) coin.y += coin.vy * dt
      coins.current = coins.current.filter((coin) => coin.y < H + 24)

      const hit = coins.current.some(
        (coin) => Math.hypot(coin.x - playerX.current, coin.y - PLAYER_Y) < coin.r + 13,
      )

      if (hit) {
        hitRef.current = true
        phaseRef.current = 'hit'
        cb.current.onFailed('hit a coin')
        window.setTimeout(resetRun, 850)
        return
      }

      if (elapsed.current >= DURATION) {
        doneRef.current = true
        phaseRef.current = 'won'
        window.setTimeout(() => cb.current.onSolved(), 550)
      }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0a0b0d')
      bg.addColorStop(1, '#141619')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(244,244,239,0.06)'
      ctx.lineWidth = 1
      for (let x = 30; x < W; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }

      for (const coin of coins.current) {
        ctx.beginPath()
        ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2)
        ctx.fillStyle = '#f4f4ef'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(coin.x, coin.y, coin.r * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = '#c9f75d'
        ctx.fill()
      }

      const px = playerX.current
      const glow = ctx.createRadialGradient(px, PLAYER_Y, 4, px, PLAYER_Y, 30)
      glow.addColorStop(0, 'rgba(201,247,93,0.35)')
      glow.addColorStop(1, 'rgba(201,247,93,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(px, PLAYER_Y, 30, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = hitRef.current ? '#ff5a4d' : '#c9f75d'
      ctx.beginPath()
      ctx.roundRect(px - 13, PLAYER_Y - 8, 26, 16, 7)
      ctx.fill()
      ctx.fillStyle = '#0b0c0e'
      ctx.beginPath()
      ctx.roundRect(px - 7, PLAYER_Y - 4, 14, 5, 2)
      ctx.fill()

      const remaining = Math.max(0, 1 - elapsed.current / DURATION)
      ctx.fillStyle = 'rgba(244,244,239,0.1)'
      ctx.beginPath()
      ctx.roundRect(16, 14, W - 32, 4, 2)
      ctx.fill()
      ctx.fillStyle = phaseRef.current === 'hit' ? '#ff5a4d' : '#c9f75d'
      ctx.beginPath()
      ctx.roundRect(16, 14, (W - 32) * remaining, 4, 2)
      ctx.fill()

      ctx.font = '500 9.5px Lexend, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(244,244,239,0.45)'
      ctx.fillText(
        phaseRef.current === 'won'
          ? 'SURVIVED'
          : phaseRef.current === 'hit'
            ? 'HIT'
            : 'SURVIVE THE COINS',
        16,
        34,
      )

      if (phaseRef.current === 'won') {
        ctx.textAlign = 'center'
        ctx.font = '600 22px Lexend, sans-serif'
        ctx.fillStyle = '#c9f75d'
        ctx.fillText('SURVIVED', W / 2, 118)
      }
      if (phaseRef.current === 'hit') {
        ctx.fillStyle = 'rgba(255,90,77,0.14)'
        ctx.fillRect(0, 0, W, H)
      }
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

  const track = (clientX: number, target: HTMLCanvasElement) => {
    if (doneRef.current || hitRef.current) return
    const rect = target.getBoundingClientRect()
    playerX.current = clamp(((clientX - rect.left) / rect.width) * W, 22, W - 22)
  }

  return (
    <div className="dodgeWrap">
      <canvas
        ref={canvasRef}
        className="dodgeCanvas"
        onPointerMove={(e) => track(e.clientX, e.currentTarget)}
        onPointerDown={(e) => track(e.clientX, e.currentTarget)}
      />
      <span className="dodgeHint">move with your pointer, or ← →</span>
    </div>
  )
}
