import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code2,
  KeyRound,
  Cpu,
  Terminal,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "minicaptcha — Lightweight, high-speed CAPTCHA service" },
      {
        name: "description",
        content: "Minimal, zero-bloat captcha infrastructure with 2-minute HMAC signed tokens.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [copied, setCopied] = useState(false);
  const [demoState, setDemoState] = useState("idle"); // idle, solving, solved, verified, error
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifyStatus, setVerifyStatus] = useState(null);

  const sampleSnippet = `// 1. Client completes challenge & receives token
const res = await fetch("/api/issue", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sitekey: "mc_demo_sandbox", host: window.location.hostname })
});
const { token } = await res.json();

// 2. Server verifies token with site secret
const verifyRes = await fetch("/api/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token, secret: "mc_sec_demo_secret_key_12345" })
});
const { success, sitekey } = await verifyRes.json();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLiveDemoSolve = async () => {
    setDemoState("solving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitekey: "mc_demo_sandbox",
          host: typeof window !== "undefined" ? window.location.hostname : "localhost",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to issue token");
        setDemoState("error");
        return;
      }

      setToken(data.token);
      setDemoState("solved");
    } catch (err) {
      setErrorMessage(err.message || "Network error");
      setDemoState("error");
    }
  };

  const handleLiveDemoVerify = async () => {
    if (!token) return;
    setDemoState("verifying");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          secret: "mc_sec_demo_secret_key_12345",
        }),
      });

      const data = await res.json();
      setVerifyStatus(data);
      if (data.success) {
        setDemoState("verified");
      } else {
        setErrorMessage(data.error || "Verification failed");
        setDemoState("error");
      }
    } catch (err) {
      setErrorMessage(err.message || "Verification failed");
      setDemoState("error");
    }
  };

  const handleResetDemo = () => {
    setDemoState("idle");
    setToken("");
    setVerifyStatus(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="space-y-4 max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Backend Ready • 2-minute HMAC tokens
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-heading">
            Minimal, zero-bloat captcha infrastructure.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Drop-in bot protection with straightforward endpoints. Issue signed verification tokens in milliseconds and validate securely on your backend.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/account"
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Get Sitekey & Secret <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/solve"
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded border border-border bg-card hover:bg-muted transition-colors text-foreground font-mono"
            >
              Interactive Solve Test
            </Link>
            <Link
              to="/embed"
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded border border-border bg-card hover:bg-muted transition-colors text-foreground font-mono"
            >
              Embed Guide
            </Link>
          </div>
        </div>

        {/* Live Interactive Demo & Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16">
          {/* Widget Preview Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Live Widget Simulator
            </div>

            <div className="p-5 rounded-lg border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
                <span className="font-mono">sitekey: mc_demo_sandbox</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">ready</span>
              </div>

              {/* Challenge Box */}
              <div className="p-4 rounded border border-border/80 bg-background flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {demoState === "verified" ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : demoState === "solved" ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold font-mono">
                        OK
                      </div>
                    ) : (
                      <button
                        onClick={handleLiveDemoSolve}
                        disabled={demoState === "solving"}
                        className="w-6 h-6 rounded border-2 border-foreground/30 hover:border-foreground flex items-center justify-center transition-colors cursor-pointer"
                        title="Click to solve"
                      >
                        {demoState === "solving" && (
                          <span className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                        )}
                      </button>
                    )}
                    <span className="text-xs font-medium">
                      {demoState === "verified"
                        ? "Verified human"
                        : demoState === "solved"
                        ? "Challenge passed — token issued"
                        : demoState === "solving"
                        ? "Issuing HMAC token..."
                        : "I am a human"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-bold tracking-tight">minicaptcha</span>
                    <span className="text-[9px] text-muted-foreground">privacy protected</span>
                  </div>
                </div>

                {demoState === "error" && (
                  <div className="p-2 rounded bg-destructive/10 text-destructive text-xs font-mono">
                    {errorMessage}
                    <button onClick={handleResetDemo} className="block mt-1 underline">
                      Retry
                    </button>
                  </div>
                )}

                {demoState === "solved" && (
                  <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                    <div className="text-[11px] font-mono text-muted-foreground break-all bg-muted/60 p-2 rounded">
                      <span className="text-foreground font-semibold">Token: </span>
                      {token}
                    </div>
                    <button
                      onClick={handleLiveDemoVerify}
                      className="w-full py-1.5 text-xs font-medium rounded bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                      Call Real POST /api/verify
                    </button>
                  </div>
                )}

                {demoState === "verified" && (
                  <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded font-mono">
                      ✓ HTTP 200: {JSON.stringify(verifyStatus)}
                    </div>
                    <button
                      onClick={handleResetDemo}
                      className="text-xs text-muted-foreground hover:text-foreground text-left underline"
                    >
                      Reset demo
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground leading-normal">
                Minicaptcha solves evaluate client interaction, compute an HMAC signature with timestamp and host binding, and expire automatically after 120 seconds.
              </div>
            </div>

            {/* Plan Specs */}
            <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-3">
              <div className="text-xs font-mono font-semibold uppercase text-muted-foreground">
                Tiers & Monthly Limits
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-xs font-bold">Free</div>
                  <div className="text-[11px] font-mono text-muted-foreground">10k / mo</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-xs font-bold">Starter</div>
                  <div className="text-[11px] font-mono text-muted-foreground">100k / mo</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-xs font-bold">Unlimited</div>
                  <div className="text-[11px] font-mono text-muted-foreground">No limit</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Overview Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                Two-Step Architecture
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy snippet"}
              </button>
            </div>

            {/* Code Block */}
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs overflow-x-auto text-foreground/90 shadow-sm leading-relaxed">
              <pre>{sampleSnippet}</pre>
            </div>

            {/* Endpoints specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded border border-border bg-card space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">POST</span>
                  /api/issue
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Validates sitekey & host, checks monthly quota, increments usage counter, and issues 2-min HMAC token.
                </p>
              </div>

              <div className="p-3.5 rounded border border-border bg-card space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">POST</span>
                  /api/verify
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Verifies HMAC signature, validates token expiry, matches secret against site hash, and yields {`{ success, sitekey }`}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
          <div className="p-4 rounded border border-border bg-card space-y-1">
            <KeyRound className="w-4 h-4 text-foreground mb-2" />
            <div className="text-xs font-semibold">Secure Key Pair</div>
            <div className="text-xs text-muted-foreground">
              Public sitekey for browser widget and private secret hash for backend verification.
            </div>
          </div>
          <div className="p-4 rounded border border-border bg-card space-y-1">
            <Cpu className="w-4 h-4 text-foreground mb-2" />
            <div className="text-xs font-semibold">HMAC Signed Tokens</div>
            <div className="text-xs text-muted-foreground">
              Tamper-proof tokens embedded with timestamp and site binding expiring in 120 seconds.
            </div>
          </div>
          <div className="p-4 rounded border border-border bg-card space-y-1">
            <ShieldCheck className="w-4 h-4 text-foreground mb-2" />
            <div className="text-xs font-semibold">Monthly Quota Enforcement</div>
            <div className="text-xs text-muted-foreground">
              Automatic usage metering tracked per YYYY-MM period against tier quotas.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>minicaptcha API & engine</span>
          <div className="flex items-center gap-4">
            <Link to="/solve" className="hover:underline">Solve</Link>
            <Link to="/embed" className="hover:underline">Embed</Link>
            <Link to="/account" className="hover:underline">Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}