import { useEffect, useRef, useState } from 'react'

export function WidgetDemo() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(62)
  const [token, setToken] = useState('')
  const [nonce, setNonce] = useState(0)
  const origin = typeof window === 'undefined' ? '' : window.location.origin

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return
      const data = event.data as { source?: string; type?: string; height?: number; token?: string } | null
      if (!data || data.source !== 'minicaptcha-widget') return
      if (data.type === 'resize' && typeof data.height === 'number') {
        setHeight(Math.max(62, Math.min(760, Math.round(data.height))))
      }
      if (data.type === 'success' && typeof data.token === 'string') {
        setToken(data.token)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="widgetDemo">
      <iframe
        key={nonce}
        ref={frameRef}
        src={`${origin}/widget?sitekey=demo&host=${encodeURIComponent(origin)}&r=${nonce}`}
        title="minicaptcha widget"
        scrolling="no"
        style={{ border: 0, display: 'block', width: 320, height }}
      />
      <div className="widgetDemoFoot">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setNonce((n) => n + 1)
            setHeight(62)
            setToken('')
          }}
        >
          Reset widget
        </button>
        <code className="demoToken">{token ? `token ${token.slice(0, 26)}…` : 'no token yet'}</code>
      </div>
    </div>
  )
}
