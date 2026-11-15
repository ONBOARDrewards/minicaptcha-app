import { useState } from 'react'

export function Snippet({ code, label = 'html' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="codeCard snippetCard">
      <div className="codeTop">
        <span className="codeFile">{label}</span>
        <button className="copyBtn" type="button" onClick={copy}>
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="codeBody codeBody--plain">{code}</pre>
      <div className="codeFoot">
        <span className="codeFootDot" /> paste as-is · no build step
      </div>
    </div>
  )
}
