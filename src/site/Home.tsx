import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Reveal } from '@/components/Reveal'
import { Mark } from '@/components/Mark'
import { Snippet } from '@/components/Snippet'
import { WidgetDemo } from '@/components/WidgetDemo'
import { ArrowRight, Bolt, Bot, Check, Code, Cross, Cursor, Eye, Key, Shield, Sliders } from '@/components/Icons'

const NAV = [
  { label: 'How it works', href: '#how' },
  { label: 'Puzzles', href: '#puzzles' },
  { label: 'Features', href: '#features' },
  { label: 'Embed', href: '#embed' },
]

const PROBLEMS = [
  {
    icon: <Bot />,
    title: 'Every solve trained them',
    body: 'Image grids are free labelling. Each click you collect from a real person becomes another training sample for the automation you were trying to stop.',
  },
  {
    icon: <Eye />,
    title: 'Nuance became noise',
    body: 'Squinting at a crosswalk at midnight is not a security question. It is a guessing game with a 40% false-positive rate and no explanation.',
  },
  {
    icon: <Cross />,
    title: 'Real people got filtered',
    body: 'Low vision, slow connections, older hardware: the people who fail image captchas are usually the people who most needed to get through.',
  },
]

const STEPS = [
  {
    title: 'Add the script',
    body: 'One deferred tag. No build step, no bundler plugin, no CSS to import.',
  },
  {
    title: 'We serve a puzzle',
    body: 'A fresh spatial challenge is generated per session — one of nine families, never reused.',
  },
  {
    title: 'Verify the token',
    body: 'Your server posts the token to our endpoint and gets back a signed, short-lived verdict.',
  },
]

const FAMILIES = [
  {
    name: 'Trace',
    tag: 'motor',
    desc: 'Follow a winding corridor without touching a wall. Humans drift; scripts snap.',
    art: 'maze',
    level: 3,
  },
  {
    name: 'Rotate',
    tag: 'rotation',
    desc: 'Spin the dial until three symbols drop into their slots. Precision and patience.',
    art: 'rotate',
    level: 3,
  },
  {
    name: 'Recall',
    tag: 'memory',
    desc: 'Watch four cells flash, then repeat the sequence. Memory is hard to automate.',
    art: 'recall',
    level: 2,
  },
  {
    name: 'Scale',
    tag: 'ordering',
    desc: 'Click seven shapes from smallest to largest. Simple for eyes, clumsy for DOM.',
    art: 'scale',
    level: 1,
  },
  {
    name: 'Link',
    tag: 'sequencing',
    desc: 'Drag from 1 to 5 through scattered dots. No labels, just order.',
    art: 'link',
    level: 2,
  },
  {
    name: 'Park',
    tag: 'control',
    desc: 'Drive a car into the bay and stop inside the lines. Actual parking, no insurance.',
    art: 'park',
    level: 3,
  },
  {
    name: 'Dodge',
    tag: 'reflex',
    desc: 'Survive seven seconds of falling coins. Reflex, not recognition.',
    art: 'dodge',
    level: 3,
  },
  {
    name: 'Stack',
    tag: 'timing',
    desc: 'Drop three blocks on the tower. Timing, nerve and a steady hand.',
    art: 'stack',
    level: 2,
  },
  {
    name: 'Pour',
    tag: 'control',
    desc: 'Tip the bottle and hit two drifting marks, lower one first. No measuring.',
    art: 'pour',
    level: 1,
  },
  {
    name: 'Weigh',
    tag: 'balance',
    desc: 'Tap weights onto the pan until the scale levels out. Arithmetic you can feel.',
    art: 'weigh',
    level: 1,
  },
  {
    name: 'Putt',
    tag: 'aim',
    desc: 'Drag back, let go, sink the putt. One clean read of the green.',
    art: 'putt',
    level: 2,
  },
  {
    name: 'Snip',
    tag: 'gesture',
    desc: 'Swipe through the marked bit of both cables. One stroke each, no re-dos.',
    art: 'snip',
    level: 2,
  },
]

const FEATURES = [
  {
    icon: <Bolt />,
    title: '0.9s median solve',
    body: 'Fast enough to disappear into a signup form. No loading spinner, no retry loop.',
  },
  {
    icon: <Sliders />,
    title: 'Twelve puzzle families',
    body: 'Trace, rotate, recall, scale, link, park, dodge, stack, pour, weigh, putt and snip — mixed per session.',
  },
  {
    icon: <Eye />,
    title: 'Zero image labelling',
    body: 'We never collect a training set from your users. There is nothing to scrape and nothing to sell.',
  },
  {
    icon: <Shield />,
    title: 'Accessible by default',
    body: 'Keyboard paths, contrast-safe shapes and a low-motion mode ship with every challenge.',
  },
  {
    icon: <Key />,
    title: 'Signed verdicts',
    body: 'Each pass returns a 120-second, HMAC-signed token bound to your site key.',
  },
  {
    icon: <Code />,
    title: 'Drop in a minute',
    body: 'One tag on the client, one POST on the server. Works with any stack, including plain HTML.',
  },
]

const QUOTES = [
  {
    quote: 'We swapped the image grid for Trace and signup completion went up 11% in a week. Support tickets about "the picture thing" stopped entirely.',
    name: 'Nadia Rezaei',
    role: 'Platform engineering, Loopcast',
    initials: 'NR',
  },
  {
    quote: 'It is the first captcha I have ever seen a user smile at. That sounds trivial until you watch people abandon a form over one.',
    name: 'Tomas Vinter',
    role: 'Founding engineer, Pane',
    initials: 'TV',
  },
  {
    quote: 'Three rounds of spatial puzzles held up better against our red-team scripts than two years of image grids. And we stopped feeding the models.',
    name: 'Priya Menon',
    role: 'Head of trust, Northwind',
    initials: 'PM',
  },
]

function Counter({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1500)
        setValue(to * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (!('IntersectionObserver' in window)) {
      setValue(to)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to])

  return (
    <span ref={ref} className="statValue">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function ScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setP(max > 0 ? Math.min(1, doc.scrollTop / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div className="progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
}

function FamilyArt({ kind }: { kind: string }) {
  if (kind === 'maze') {
    return (
      <svg className="artSvg artMaze" viewBox="0 0 220 130" aria-hidden="true">
        <path
          className="artMazeBase"
          d="M18 112V70h34V38h46v34h34V20h46v58h-34v34"
          fill="none"
          stroke="#0b0c0e"
          strokeWidth="16"
          strokeLinecap="square"
          strokeLinejoin="round"
          opacity="0.12"
        />
        <path
          className="artMazeLine"
          d="M18 112V70h34V38h46v34h34V20h46v58h-34v34"
          fill="none"
          stroke="#0b0c0e"
          strokeWidth="5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <circle className="artDot" cx="18" cy="112" r="7" fill="#c9f75d" />
        <circle cx="194" cy="112" r="6" fill="#0b0c0e" />
      </svg>
    )
  }
  if (kind === 'rotate') {
    return (
      <svg className="artSvg artRotate" viewBox="0 0 220 130" aria-hidden="true">
        <circle cx="110" cy="65" r="40" fill="none" stroke="#0b0c0e" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="4 9" />
        <g className="artSpin">
          <circle cx="110" cy="65" r="40" fill="none" stroke="#0b0c0e" strokeWidth="9" strokeDasharray="9 18" strokeLinecap="round" />
          <circle cx="110" cy="26" r="7.5" fill="#c9f75d" stroke="#0b0c0e" strokeWidth="2" />
          <rect x="136" y="84" width="15" height="15" rx="4" fill="#0b0c0e" opacity="0.55" />
        </g>
        <path d="M168 44a42 42 0 0 1 4 42" fill="none" stroke="#0b0c0e" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
      </svg>
    )
  }
  if (kind === 'recall') {
    return (
      <svg className="artSvg artRecall" viewBox="0 0 220 130" aria-hidden="true">
        {Array.from({ length: 9 }, (_, idx) => {
          const lit = idx === 1 || idx === 5 || idx === 7
          return (
            <rect
              key={idx}
              x={67 + (idx % 3) * 31}
              y={28 + Math.floor(idx / 3) * 31}
              width="22"
              height="22"
              rx="6"
              fill={lit ? '#c9f75d' : '#0b0c0e'}
              opacity={lit ? 1 : 0.14}
              className={lit ? 'artCell' : ''}
              style={{ animationDelay: `${idx * 110}ms` }}
            />
          )
        })}
      </svg>
    )
  }
  if (kind === 'link') {
    return (
      <svg className="artSvg artLink" viewBox="0 0 220 130" aria-hidden="true">
        <path
          className="artLinkGhost"
          d="M46 96 L92 36 L140 84 L186 44"
          fill="none"
          stroke="#0b0c0e"
          strokeWidth="2"
          strokeDasharray="2 7"
          strokeLinecap="round"
          opacity="0.32"
        />
        <polyline
          className="artLinkTrail"
          points="46,96 92,36 140,84 186,44"
          fill="none"
          stroke="#8fce1b"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle className="artLinkHalo" r="11" fill="#c9f75d" opacity="0.3">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M46 96 L92 36 L140 84 L186 44" />
        </circle>
        <circle className="artLinkComet" r="4.5" fill="#c9f75d">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M46 96 L92 36 L140 84 L186 44" />
        </circle>
        {[
          [46, 96],
          [92, 36],
          [140, 84],
          [186, 44],
        ].map(([x, y], i) => (
          <g key={i} className="artLinkDot" style={{ animationDelay: `${i * 0.9}s` }}>
            <circle cx={x} cy={y} r="16" fill="none" stroke="#8fce1b" strokeWidth="1.4" opacity="0.35" />
            <circle cx={x} cy={y} r="11" fill={i === 0 ? '#c9f75d' : '#0b0c0e'} />
            <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="600" fill={i === 0 ? '#0b0c0e' : '#f5f5f1'} fontFamily="inherit">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    )
  }
  if (kind === 'park') {
    return (
      <svg className="artSvg artPark" viewBox="0 0 220 130" aria-hidden="true">
        <rect
          className="artParkBay"
          x="112"
          y="16"
          width="84"
          height="100"
          rx="11"
          fill="#8fce1b"
          fillOpacity="0.07"
          stroke="#0b0c0e"
          strokeWidth="1.8"
          strokeDasharray="7 6"
        />
        <text x="154" y="86" textAnchor="middle" fontSize="40" fontWeight="500" fill="#0b0c0e" opacity="0.12">
          P
        </text>
        <path className="artParkRoad" d="M24 114h172" stroke="#0b0c0e" strokeWidth="2" strokeDasharray="9 9" strokeLinecap="round" opacity="0.16" />
        <g className="artParkCar">
          <g transform="translate(154 66)">
            <rect x="-16" y="-15" width="4.5" height="11" rx="2" fill="#0b0c0e" opacity="0.8" />
            <rect x="11.5" y="-15" width="4.5" height="11" rx="2" fill="#0b0c0e" opacity="0.8" />
            <rect x="-16" y="6" width="4.5" height="11" rx="2" fill="#0b0c0e" opacity="0.8" />
            <rect x="11.5" y="6" width="4.5" height="11" rx="2" fill="#0b0c0e" opacity="0.8" />
            <rect x="-13" y="-23" width="26" height="46" rx="8" fill="#0b0c0e" />
            <rect x="-9" y="-11" width="18" height="12" rx="3" fill="#c9f75d" />
            <circle cx="-8" cy="-23" r="2.6" fill="#c9f75d" />
            <circle cx="8" cy="-23" r="2.6" fill="#c9f75d" />
            <rect x="-7" y="17" width="6" height="3.4" rx="1.7" fill="#ff6b5a" opacity="0.85" />
            <rect x="1" y="17" width="6" height="3.4" rx="1.7" fill="#ff6b5a" opacity="0.85" />
          </g>
        </g>
        <g className="artParkTick">
          <circle cx="192" cy="30" r="12" fill="#c9f75d" />
          <path d="M186 30l4.5 4.5 8-9" fill="none" stroke="#0b0c0e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    )
  }
  if (kind === 'dodge') {
    return (
      <svg className="artSvg artDodge" viewBox="0 0 220 130" aria-hidden="true">
        {[
          [62, 30],
          [106, 18],
          [150, 36],
          [84, 62],
          [134, 76],
        ].map(([x, y], i) => (
          <g key={i} className="artCoin" style={{ animationDelay: `${i * 280}ms` }}>
            <circle cx={x} cy={y} r="8" fill="none" stroke="#0b0c0e" strokeWidth="2" opacity="0.4" />
            <circle cx={x} cy={y} r="3" fill="#8fce1b" />
          </g>
        ))}
        <rect x="98" y="98" width="28" height="16" rx="8" fill="#0b0c0e" />
        <circle cx="105" cy="106" r="2.6" fill="#c9f75d" />
      </svg>
    )
  }
  if (kind === 'stack') {
    return (
      <svg className="artSvg artStack" viewBox="0 0 220 130" aria-hidden="true">
        <rect x="54" y="98" width="112" height="16" rx="5" fill="#0b0c0e" />
        <rect x="66" y="78" width="88" height="16" rx="5" fill="#0b0c0e" opacity="0.62" />
        <rect x="76" y="58" width="68" height="16" rx="5" fill="#0b0c0e" opacity="0.38" />
        <rect className="artStackBlock" x="86" y="22" width="48" height="16" rx="5" fill="#c9f75d" />
      </svg>
    )
  }
  if (kind === 'pour') {
    return (
      <svg className="artSvg artPour" viewBox="0 0 220 130" aria-hidden="true">
        <rect x="126" y="24" width="56" height="88" rx="9" fill="#fff" fillOpacity="0.6" />
        <rect x="126" y="24" width="56" height="88" rx="9" fill="none" stroke="#0b0c0e" strokeWidth="1.8" opacity="0.55" />
        <rect className="artPourWater" x="129" y="27" width="50" height="82" rx="7" fill="#c9f75d" />
        <rect x="129" y="49" width="50" height="15" fill="none" stroke="#0b0c0e" strokeWidth="1.1" strokeDasharray="3 4" opacity="0.5" />
        <g className="artPourBottle">
          <g transform="translate(84 56)">
            <rect x="-16" y="-30" width="32" height="56" rx="9" fill="#0b0c0e" />
            <rect x="-6" y="-52" width="12" height="24" rx="3" fill="#0b0c0e" />
            <rect x="-9" y="-12" width="18" height="14" rx="2.5" fill="#f7f7f2" opacity="0.45" />
          </g>
        </g>
        <path className="artPourStream" d="M122 16q7 13 13 26" fill="none" stroke="#8fce1b" strokeWidth="3" strokeLinecap="round" />
        <circle className="artPourDrop" cx="136" cy="42" r="3.2" fill="#8fce1b" />
        <circle className="artPourDrop artPourDrop--b" cx="143" cy="54" r="2.4" fill="#8fce1b" />
      </svg>
    )
  }
  if (kind === 'weigh') {
    return (
      <svg className="artSvg artWeigh" viewBox="0 0 220 130" aria-hidden="true">
        <path d="M110 34 L128 106 H92 Z" fill="#0b0c0e" opacity="0.13" />
        <rect x="92" y="102" width="36" height="9" rx="4.5" fill="#0b0c0e" opacity="0.85" />
        <g className="artWeighBeam">
          <rect x="34" y="30" width="152" height="5" rx="2.5" fill="#0b0c0e" />
          <circle cx="110" cy="32.5" r="7" fill="#0b0c0e" />
          <circle cx="110" cy="32.5" r="2.6" fill="#c9f75d" />
          <g transform="translate(46 33)">
            <path d="M0 0v10" stroke="#0b0c0e" strokeWidth="1.6" opacity="0.5" />
            <path d="M-21 10h42l-7 15h-28z" fill="#0b0c0e" opacity="0.16" stroke="#0b0c0e" strokeWidth="1.4" />
            <rect x="-7" y="3" width="14" height="13" rx="3" fill="#0b0c0e" />
          </g>
          <g transform="translate(174 33)">
            <path d="M0 0v10" stroke="#0b0c0e" strokeWidth="1.6" opacity="0.5" />
            <path d="M-21 10h42l-7 15h-28z" fill="#c9f75d" fillOpacity="0.45" stroke="#0b0c0e" strokeWidth="1.4" />
            <rect x="-10" y="2" width="9" height="9" rx="2" fill="#0b0c0e" />
            <rect x="2" y="0" width="10" height="10" rx="2" fill="#0b0c0e" opacity="0.65" />
          </g>
        </g>
      </svg>
    )
  }
  if (kind === 'putt') {
    return (
      <svg className="artSvg artPutt" viewBox="0 0 220 130" aria-hidden="true">
        <ellipse cx="162" cy="90" rx="18" ry="10" fill="#0b0c0e" opacity="0.14" />
        <ellipse cx="162" cy="88" rx="12" ry="7" fill="#0b0c0e" opacity="0.55" />
        <path d="M162 82V42" stroke="#0b0c0e" strokeWidth="1.8" opacity="0.5" />
        <path d="M162 42l21 6.5-21 6.5z" fill="#c9f75d" />
        <path
          className="artPuttAim"
          d="M54 104q42 -20 86 -20"
          fill="none"
          stroke="#8fce1b"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        <circle className="artPuttBall" cx="54" cy="104" r="6.5" fill="#0b0c0e" />
      </svg>
    )
  }
  if (kind === 'dial') {
    return (
      <svg className="artSvg artDial" viewBox="0 0 220 130" aria-hidden="true">
        <circle className="artRing" cx="70" cy="65" r="34" fill="none" stroke="#0b0c0e" strokeWidth="2" strokeDasharray="3 7" />
        <g className="artHand" style={{ transformOrigin: '70px 65px' }}>
          <path d="M70 65V35" stroke="#0b0c0e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="70" cy="65" r="5" fill="#0b0c0e" />
        </g>
        <circle className="artRing" cx="150" cy="65" r="34" fill="none" stroke="#0b0c0e" strokeWidth="2" opacity="0.25" />
        <g style={{ transformOrigin: '150px 65px', transform: 'rotate(70deg)' }}>
          <path d="M150 65V35" stroke="#c9f75d" strokeWidth="5" strokeLinecap="round" />
          <circle cx="150" cy="65" r="5" fill="#0b0c0e" />
        </g>
      </svg>
    )
  }
  if (kind === 'snip') {
    return (
      <svg className="artSvg artSnip" viewBox="0 0 220 130" aria-hidden="true">
        <path className="artSnipHalfL" d="M14 52h84" stroke="#0b0c0e" strokeWidth="2.6" strokeLinecap="round" opacity="0.62" />
        <path className="artSnipHalfR" d="M122 52h84" stroke="#0b0c0e" strokeWidth="2.6" strokeLinecap="round" opacity="0.62" />
        <path d="M14 94h192" stroke="#0b0c0e" strokeWidth="2.6" strokeLinecap="round" opacity="0.26" />
        <rect x="98" y="40" width="38" height="24" rx="8" fill="#c9f75d" fillOpacity="0.5" stroke="#0b0c0e" strokeWidth="1.6" strokeDasharray="5 4" />
        <rect x="44" y="82" width="38" height="24" rx="8" fill="#c9f75d" fillOpacity="0.26" stroke="#0b0c0e" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.75" />
        <circle cx="14" cy="52" r="3.4" fill="#8fce1b" />
        <circle cx="206" cy="52" r="3.4" fill="#8fce1b" />
        <path className="artSnipSwipe" d="M150 106 L74 8" stroke="#8fce1b" strokeWidth="3.2" strokeLinecap="round" />
        <circle className="artSnipSpark" cx="110" cy="52" r="3.6" fill="#8fce1b" />
      </svg>
    )
  }
  return (
    <svg className="artSvg artScale" viewBox="0 0 220 130" aria-hidden="true">
      <rect className="artBar" x="40" y="86" width="22" height="22" rx="7" fill="#0b0c0e" opacity="0.25" />
      <rect className="artBar" x="78" y="70" width="38" height="38" rx="12" fill="#0b0c0e" opacity="0.55" />
      <rect className="artBar" x="130" y="48" width="60" height="60" rx="18" fill="#c9f75d" />
    </svg>
  )
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const install = `<!-- load the widget once per page -->\n<script src="${origin}/embed.js" defer></script>\n\n<form action="/signup" method="post">\n  <input name="email" type="email" required />\n\n  <div data-minicaptcha data-sitekey="demo"></div>\n\n  <button>Create account</button>\n</form>`

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        el.style.setProperty('--my', `${e.clientY - rect.top}px`)
      })
    }
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="page">
      <ScrollProgress />

      <header className="siteHeader">
        <div className="wrap nav">
          <Link to="/" className="brand" aria-label="minicaptcha home">
            <Mark />
            <span className="brandText">
              mini<span>captcha</span>
            </span>
          </Link>
          <nav className="navLinks" aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="navRight">
            <span className="liveChip">
              <i />
              demo live
            </span>
            <Link className="navSignin" to="/account">
              Sign in
            </Link>
            <Link className="btn btn--primary btn--sm" to="/solve">
              Try it
              <ArrowRight className="btnArrow" />
            </Link>
          </div>
        </div>
      </header>

      <section className="hero" ref={heroRef}>
        <div className="heroGlow" aria-hidden="true" />
        <div className="wrap heroGrid">
          <div className="heroCopy">
            <span className="chip">
              <span className="chipPulse" />
              v2.4 · puzzle engine online
            </span>

            <h1 className="heroTitle">
              <span className="line">
                <span>Stop the bots.</span>
              </span>
              <span className="line">
                <span>
                  Keep the <em className="hl">humans</em>.
                </span>
              </span>
            </h1>

            <p className="lede">
              minicaptcha replaces blurry image grids with short spatial puzzles — tracing, aligning and sorting tasks
              that take a person two seconds and leave automation with nothing to train on.
            </p>

            <div className="heroActions">
              <Link className="btn btn--primary btn--lg" to="/solve">
                Solve a challenge
                <ArrowRight className="btnArrow" />
              </Link>
              <a className="btn btn--ghost btn--lg" href="#how">
                See how it works
              </a>
            </div>

            <ul className="heroMeta">
              <li>
                <Check /> No images
              </li>
              <li>
                <Check /> No tracking pixels
              </li>
              <li>
                <Check /> One script tag
              </li>
            </ul>
          </div>

          <div className="heroVisual">
            <div className="stageGlow" aria-hidden="true" />
            <div className="stage">
              <div className="stageGrid" aria-hidden="true" />
              <div className="stageTop">
                <span className="stageDots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="stageLabel">one challenge · rotate</span>
                <span className="stageTag">live</span>
              </div>

              <div className="dialArea">
                <svg className="dialArt" viewBox="0 0 320 320" aria-hidden="true">
                  <defs>
                    <linearGradient id="fadeRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#0a0b0d" stopOpacity="0.18" />
                      <stop offset="1" stopColor="#0a0b0d" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>
                  <circle cx="160" cy="160" r="146" fill="none" stroke="url(#fadeRing)" strokeWidth="1" />
                  <g className="spinSlow">
                    <circle
                      cx="160"
                      cy="160"
                      r="128"
                      fill="none"
                      stroke="#0a0b0d"
                      strokeOpacity="0.2"
                      strokeWidth="6"
                      strokeDasharray="2 16"
                      strokeLinecap="round"
                    />
                  </g>
                  <g className="spinMid">
                    <circle
                      cx="160"
                      cy="160"
                      r="100"
                      fill="none"
                      stroke="#c9f75d"
                      strokeWidth="11"
                      strokeDasharray="58 20 9 20"
                      strokeLinecap="round"
                    />
                  </g>
                  <g className="spinFast">
                    <circle cx="160" cy="160" r="74" fill="none" stroke="#0a0b0d" strokeWidth="1.4" strokeDasharray="1 9" strokeOpacity="0.35" />
                  </g>
                  <circle cx="160" cy="160" r="52" fill="#0a0b0d" />
                  <circle className="needle" cx="160" cy="118" r="6" fill="#c9f75d" />
                  <circle cx="160" cy="160" r="17" fill="#0a0b0d" stroke="#c9f75d" strokeWidth="2" />
                  <path d="M160 104v20" stroke="#0a0b0d" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                </svg>

                <div className="stageCaption">
                  <span className="stageCaptionLabel">align the marker</span>
                  <span className="stageCaptionValue">2 of 4 found</span>
                </div>
              </div>

              <div className="stageFoot">
                <div className="bar">
                  <span />
                </div>
                <span className="stageTime">00:04</span>
              </div>

              <div className="pill pillA">
                <Cursor /> pointer entropy ok
              </div>
              <div className="pill pillB">
                <Bot /> bot rejected · 18ms
              </div>
              <div className="pill pillC">
                <Check /> verified
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marqueeTrack">
          {[0, 1].map((group) => (
            <div className="marqueeGroup" key={group}>
              {['Trace', 'Rotate', 'Recall', 'Scale', 'Link', 'Park', 'Dodge', 'Stack', 'Pour', 'Weigh', 'Putt', 'Snip'].map(
                (word) => (
                <span key={word}>
                  {word}
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="statsBand">
        <div className="wrap stats">
          <div className="stat">
            <Counter to={12.4} decimals={1} suffix="M" />
            <span>challenges served</span>
          </div>
          <div className="stat">
            <Counter to={99.4} decimals={1} suffix="%" />
            <span>human pass rate</span>
          </div>
          <div className="stat">
            <Counter to={1.9} decimals={1} suffix="s" />
            <span>median solve time</span>
          </div>
          <div className="stat">
            <Counter to={0} suffix="" />
            <span>images harvested</span>
          </div>
        </div>
      </section>

      <section className="section" id="problem">
        <div className="wrap">
          <Reveal>
            <div className="sectionHead">
              <span className="kicker">the old way</span>
              <h2>Image grids made the internet worse.</h2>
              <p>
                A captcha should prove effort, not punish eyesight. The last decade of image labelling turned a
                security check into a free dataset pipeline — and it never worked that well to begin with.
              </p>
            </div>
          </Reveal>
          <div className="problemGrid">
            {PROBLEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="problemCard">
                  <span className="problemIcon">{item.icon}</span>
                  <span className="cardIndex">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="how">
        <div className="wrap howGrid">
          <div className="howCopy">
            <Reveal>
              <span className="kicker">integration</span>
              <h2>Live in about a minute.</h2>
              <p className="sectionSub">
                No SDK to audit, no vendor script sitting on your checkout page for 400ms. One tag in, one POST out.
              </p>
            </Reveal>
            <div className="steps">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 100}>
                  <div className="step">
                    <span className="stepNum">0{i + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120} className="codeWrap">
            <Snippet label="signup.html" code={install} />
          </Reveal>
        </div>
      </section>

      <section className="section" id="puzzles">
        <div className="wrap">
          <Reveal>
            <div className="sectionHead sectionHead--split">
              <div>
                <span className="kicker">the challenges</span>
                <h2>Puzzles a script can't fake.</h2>
              </div>
              <p>
                Every session draws one of twelve families at random. There is no answer key in the DOM, no image to
                classify, and no consistent pattern to learn between visits.
              </p>
            </div>
          </Reveal>
          <div className="familyGrid">
            {FAMILIES.map((family, i) => (
              <Reveal key={family.name} delay={i * 90}>
                <article className={`familyCard familyCard--${family.art}`}>
                  <div className="familyArt">
                    <FamilyArt kind={family.art} />
                  </div>
                  <div className="familyBody">
                    <div className="familyHead">
                      <h3>{family.name}</h3>
                      <span className="familyTag">{family.tag}</span>
                    </div>
                    <p>{family.desc}</p>
                    <div className="familyDots">
                      {[0, 1, 2, 3].map((d) => (
                        <i key={d} className={d < family.level ? 'is-on' : ''} />
                      ))}
                      <span>difficulty</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={80}>
            <div className="familyCta">
              <span>Want to try one right now?</span>
              <Link to="/solve" className="btn btn--ghost btn--sm">
                Open the live demo
                <ArrowRight className="btnArrow" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--tint" id="features">
        <div className="wrap">
          <Reveal>
            <div className="sectionHead">
              <span className="kicker">under the hood</span>
              <h2>Small enough to disappear.</h2>
              <p>18kb gzipped, zero dependencies, and it renders on the GPU while the rest of your page loads.</p>
            </div>
          </Reveal>
          <div className="features">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 80}>
                <article className="feature">
                  <span className="featureIcon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="embed">
        <div className="wrap">
          <Reveal>
            <div className="sectionHead sectionHead--split">
              <div>
                <span className="kicker">embed</span>
                <h2>Drop it into any site.</h2>
              </div>
              <p>
                One script tag, one empty div, one POST on your server. The challenge lives in an iframe, so there is no
                CSS to unwind and no globals to collide with.
              </p>
            </div>
          </Reveal>
          <div className="embedGrid">
            <Reveal>
              <div className="demoCard">
                <div className="demoCardTop">
                  <span>live widget</span>
                  <span className="demoCardDot" />
                </div>
                <div className="demoScreen">
                  <WidgetDemo />
                </div>
                <span className="demoCaption">
                  Click the checkbox — this is the real embed, iframed inside this page.
                </span>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="embedRight">
                <Snippet label="signup.html" code={install} />
                <div className="embedLinks">
                  <Link to="/embed" className="btn btn--ghost btn--sm">
                    Full integration guide
                    <ArrowRight className="btnArrow" />
                  </Link>
                  <a className="embedPlain" href="/embed-example.html" target="_blank" rel="noreferrer">
                    open a third-party example
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <Reveal>
            <div className="sectionHead">
              <span className="kicker">from the field</span>
              <h2>Teams who stopped feeding the machines.</h2>
            </div>
          </Reveal>
          <div className="quoteGrid">
            {QUOTES.map((quote, i) => (
              <Reveal key={quote.name} delay={i * 90}>
                <figure className="quoteCard">
                  <blockquote>{quote.quote}</blockquote>
                  <figcaption>
                    <span className="avatar">{quote.initials}</span>
                    <span>
                      <strong>{quote.name}</strong>
                      <em>{quote.role}</em>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ctaBand">
        <div className="wrap">
          <Reveal>
            <div className="ctaInner">
              <div className="ctaOrb" aria-hidden="true" />
              <div className="ctaGrid" aria-hidden="true" />
              <span className="ctaKicker">free tier</span>
              <h2>Your form, minus the bots.</h2>
              <p>10,000 solves a month on the house. No card, no cookie banner, no sales call.</p>
              <div className="ctaActions">
                <Link to="/solve" className="btn btn--light btn--lg">
                  Solve a sample challenge
                  <ArrowRight className="btnArrow" />
                </Link>
                <a href="#how" className="btn btn--outlineLight btn--lg">
                  Read the docs
                </a>
              </div>
              <span className="ctaTiny">sandbox mode · nothing is stored</span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="siteFooter">
        <div className="wrap footerGrid">
          <div className="footerBrand">
            <Link to="/" className="brand">
              <Mark size={24} />
              <span className="brandText">
                mini<span>captcha</span>
              </span>
            </Link>
            <p>A very small captcha for a slightly less hostile web.</p>
            <span className="footerStatus">
              <i /> all systems normal
            </span>
          </div>
          <div className="footerCol">
            <h4>Product</h4>
            <a href="#how">Overview</a>
            <a href="#puzzles">Puzzles</a>
            <a href="#features">Features</a>
            <a href="#how">Pricing</a>
          </div>
          <div className="footerCol">
            <h4>Developers</h4>
            <a href="#how">Docs</a>
            <a href="#how">API reference</a>
            <a href="#how">Changelog</a>
            <a href="#how">Status</a>
          </div>
          <div className="footerCol">
            <h4>Company</h4>
            <a href="#problem">About</a>
            <a href="#problem">Privacy</a>
            <a href="#problem">Accessibility</a>
            <a href="#problem">Contact</a>
          </div>
        </div>
        <div className="wrap footerBottom">
          <span>© 2026 minicaptcha labs</span>
          <span>made for humans, by humans</span>
        </div>
      </footer>
    </div>
  )
}
