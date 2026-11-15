import { Link } from '@tanstack/react-router'
import { Mark } from '@/components/Mark'
import { WidgetDemo } from '@/components/WidgetDemo'
import { Snippet } from '@/components/Snippet'
import { ArrowRight } from '@/components/Icons'

export default function Embed() {
  const origin = typeof window === 'undefined' ? '' : window.location.origin

  const client = `<!-- 1. load the widget once per page -->
<script src="${origin}/embed.js" defer></script>

<!-- 2. drop an empty div inside your form -->
<form action="/signup" method="post">
  <input name="email" type="email" required />

  <div data-minicaptcha data-sitekey="demo"></div>

  <button>Create account</button>
</form>`

  const server = `// 3. check the token on your server before trusting the request
const res = await fetch('${origin}/api/verify', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    token: req.body['minicaptcha-token'],
    secret: process.env.MINICAPTCHA_SECRET, // from your dashboard
  }),
})

const { success } = await res.json()
if (!success) return res.status(400).json({ error: 'captcha failed' })`

  const reset = `// reset after a failed submit
window.minicaptcha.reset()
// or target one container
window.minicaptcha.reset(document.querySelector('[data-minicaptcha]'))`

  return (
    <div className="page embedPage">
      <header className="siteHeader">
        <div className="wrap nav">
          <Link to="/" className="brand" aria-label="minicaptcha home">
            <Mark />
            <span className="brandText">
              mini<span>captcha</span>
            </span>
          </Link>
          <div className="navRight">
            <Link className="btn btn--ghost btn--sm" to="/">
              Back to site
            </Link>
            <Link className="btn btn--primary btn--sm" to="/solve">
              Try the demo
              <ArrowRight className="btnArrow" />
            </Link>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="embedHero">
          <span className="kicker">integration guide</span>
          <h1>Embed it in a minute.</h1>
          <p>
            The widget is a 320px iframe served from this origin. Your page gets a checkbox, the challenge opens inside
            it, and a signed token lands in your form as a hidden input. Nothing is injected into your DOM and no CSS
            leaks out.
          </p>
        </section>

        <section className="embedTop">
          <div className="demoCard">
            <div className="demoCardTop">
              <span>live widget</span>
              <span className="demoCardDot" />
            </div>
            <div className="demoScreen">
              <WidgetDemo />
            </div>
            <span className="demoCaption">
              This is the actual iframe embed running on this page. The token below comes back through postMessage.
            </span>
          </div>

          <div className="embedCopy">
            <h3>What you get</h3>
            <ul className="checkList">
              <li>One script tag, one empty div, zero build step.</li>
              <li>The challenge renders inside an isolated iframe.</li>
              <li>A hidden <code>minicaptcha-token</code> input appears in your form on success.</li>
              <li>A <code>minicaptcha:verified</code> event and optional <code>data-callback</code>.</li>
              <li>Server verification with a 120-second token.</li>
            </ul>
            <a className="embedPlain" href="/embed-example.html" target="_blank" rel="noreferrer">
              Open the third-party example page →
            </a>
            <br />
            <Link to="/account" className="btn btn--primary btn--sm acctCta">
              Get your site key
              <ArrowRight className="btnArrow" />
            </Link>
          </div>
        </section>

        <section className="embedStep">
          <div className="embedStepHead">
            <span className="embedStepNum">01</span>
            <div>
              <h3>Drop in the tag and a div</h3>
              <p>
                Anywhere inside your form. The script scans for <code>data-minicaptcha</code>, mounts the iframe and
                keeps watching for containers added later by your framework.
              </p>
            </div>
          </div>
          <Snippet label="signup.html" code={client} />
        </section>

        <section className="embedStep">
          <div className="embedStepHead">
            <span className="embedStepNum">02</span>
            <div>
              <h3>Verify the token server-side</h3>
              <p>
                Reject the request when <code>success</code> is false. Tokens are HMAC-signed, single-use by convention
                and expire after 120 seconds.
              </p>
            </div>
          </div>
          <Snippet label="server.ts" code={server} />
        </section>

        <section className="embedStep">
          <div className="embedStepHead">
            <span className="embedStepNum">03</span>
            <div>
              <h3>Reset it when you need to</h3>
              <p>Failed submits should hand the user a fresh challenge instead of a dead checkbox.</p>
            </div>
          </div>
          <Snippet label="client.js" code={reset} />
        </section>

        <section className="embedApi">
          <h2>Reference</h2>
          <div className="apiList">
            <div className="apiRow">
              <code>data-sitekey</code>
              <span>Your public site key. Use <code>demo</code> while testing.</span>
            </div>
            <div className="apiRow">
              <code>data-puzzle</code>
              <span>
                Optional. Force a family: trace, sort, rotate, recall, link, park, dodge, stack, pour, weigh, putt or
                snip (display names such as <code>scale</code> also work).
              </span>
            </div>
            <div className="apiRow">
              <code>data-callback</code>
              <span>Optional global function name that receives the token.</span>
            </div>
            <div className="apiRow">
              <code>minicaptcha:verified</code>
              <span>DOM event fired on the container with <code>detail.token</code>.</span>
            </div>
            <div className="apiRow">
              <code>POST /api/issue</code>
              <span>Issue a signed token. Called by the widget, not by you.</span>
            </div>
            <div className="apiRow">
              <code>POST /api/verify</code>
              <span>Verify a token. Accepts <code>{"{ token, secret? }"}</code> and returns <code>{"{ success, sitekey, expires }"}</code>.</span>
            </div>
          </div>
          <p className="embedNote">
            The <code>demo</code> key works without an account and is not metered. Real keys are created in your{' '}
            <Link to="/account">dashboard</Link>, are metered monthly (10k free, then $1 for 100k or $10 unlimited),
            and their tokens only verify with the matching secret.
          </p>
        </section>
      </main>

      <footer className="solveFooter">
        <div className="wrap solveFooterInner">
          <span>© 2026 minicaptcha labs</span>
          <span>built for humans</span>
        </div>
      </footer>
    </div>
  )
}
