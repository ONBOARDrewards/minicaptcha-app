import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CheckCircle2, ShieldCheck, Clock, RefreshCw, Copy, Check, Terminal, AlertCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/solve")({
  head: () => ({
    meta: [
      { title: "Solve — minicaptcha" },
      { name: "description", content: "Interactive captcha verification test and token issuance." }
    ],
  }),
  validateSearch: (search) => ({
    sitekey: typeof search?.sitekey === "string" ? search.sitekey : undefined,
    embed: search?.embed === "1" || search?.embed === "true" ? "1" : undefined,
  }),
  component: SolvePage,
});

function SolvePage() {
  const search = Route.useSearch();
  const isEmbedMode = search?.embed === "1";

  const [sitekey, setSitekey] = useState(search?.sitekey || "mc_demo_sandbox");
  const [solveState, setSolveState] = useState("idle"); // idle, solving, solved, error
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState("");
  const [issuedAt, setIssuedAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(120);

  // Verification testing state
  const [secretInput, setSecretInput] = useState(
    sitekey === "mc_demo_sandbox" ? "mc_sec_demo_secret_key_12345" : ""
  );
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLatency, setVerifyLatency] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Countdown timer for 2-minute token validity
  useEffect(() => {
    if (solveState !== "solved" || !issuedAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - issuedAt) / 1000);
      const remaining = Math.max(0, 120 - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [solveState, issuedAt]);

  const handleStartSolve = async () => {
    if (!sitekey.trim()) {
      setErrorMessage("Please enter a sitekey");
      return;
    }

    setSolveState("solving");
    setErrorMessage("");
    setVerifyResult(null);

    try {
      // Simulate client interaction delay (300ms)
      await new Promise((r) => setTimeout(r, 450));

      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitekey: sitekey.trim(),
          host: window.location.hostname || "localhost",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `HTTP ${res.status}: Failed to issue token`);
        setSolveState("error");
        return;
      }

      if (data.token) {
        setToken(data.token);
        setIssuedAt(Date.now());
        setSecondsLeft(120);
        setSolveState("solved");
      } else {
        setErrorMessage("Server did not return a verification token");
        setSolveState("error");
      }
    } catch (err) {
      setErrorMessage(err.message || "Network error while connecting to /api/issue");
      setSolveState("error");
    }
  };

  const handleVerify = async () => {
    if (!token) return;
    if (!secretInput.trim()) {
      setVerifyResult({ success: false, error: "Please enter your site secret" });
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          secret: secretInput.trim(),
        }),
      });

      const duration = Math.round(performance.now() - start);
      setVerifyLatency(duration);

      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({ success: false, error: err.message || "Verification request failed" });
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleReset = () => {
    setSolveState("idle");
    setToken("");
    setIssuedAt(null);
    setSecondsLeft(120);
    setVerifyResult(null);
    setErrorMessage("");
  };

  // Embed mode rendering (for clean iframe embeds)
  if (isEmbedMode) {
    return (
      <div className="p-3 bg-card text-foreground font-sans min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[320px] rounded border border-border bg-background p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {solveState === "solved" ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={handleStartSolve}
                  disabled={solveState === "solving"}
                  className="w-6 h-6 rounded border-2 border-foreground/30 hover:border-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  {solveState === "solving" && (
                    <span className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              )}
              <span className="text-xs font-medium">
                {solveState === "solved"
                  ? "Verification complete"
                  : solveState === "solving"
                  ? "Checking..."
                  : "I am a human"}
              </span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold">minicaptcha</div>
              <div className="text-[8px] text-muted-foreground">privacy protected</div>
            </div>
          </div>

          {token && (
            <input type="hidden" name="minicaptcha_token" value={token} />
          )}

          {solveState === "error" && (
            <div className="text-[11px] text-destructive font-mono">{errorMessage}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading">
            Solve & Token Issuance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Test the live captcha solve workflow and verify HMAC tokens against /api/verify.
          </p>
        </div>

        {/* Sitekey Config Bar */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2 shadow-sm">
          <label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider block">
            Target Sitekey
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={sitekey}
              onChange={(e) => {
                setSitekey(e.target.value);
                if (e.target.value === "mc_demo_sandbox") {
                  setSecretInput("mc_sec_demo_secret_key_12345");
                }
              }}
              placeholder="e.g. mc_live_83fa9b..."
              className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            <button
              onClick={() => {
                setSitekey("mc_demo_sandbox");
                setSecretInput("mc_sec_demo_secret_key_12345");
                handleReset();
              }}
              className="px-3 py-1.5 rounded border border-border bg-muted hover:bg-muted/80 text-xs font-mono transition-colors whitespace-nowrap"
            >
              Use Demo Sandbox
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Using sandbox sitekey <code className="font-mono text-foreground font-semibold">mc_demo_sandbox</code>. To use your own sitekey, visit the{" "}
            <a href="/account" className="underline hover:text-foreground">
              Account
            </a>{" "}
            dashboard.
          </div>
        </div>

        {/* Challenge Widget Simulator Box */}
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                Interactive Captcha Box
              </span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Status: <span className="text-foreground font-semibold">{solveState}</span>
            </div>
          </div>

          {/* Widget Box */}
          <div className="max-w-md mx-auto p-4 rounded-lg border-2 border-border bg-background flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {solveState === "solved" ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in-50 duration-200">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    onClick={handleStartSolve}
                    disabled={solveState === "solving"}
                    className="w-7 h-7 rounded border-2 border-foreground/40 hover:border-foreground flex items-center justify-center transition-all cursor-pointer bg-card active:scale-95"
                    title="Click to pass captcha challenge"
                  >
                    {solveState === "solving" ? (
                      <span className="w-3.5 h-3.5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                    ) : null}
                  </button>
                )}
                <div>
                  <div className="text-xs font-medium">
                    {solveState === "solved"
                      ? "Challenge Completed"
                      : solveState === "solving"
                      ? "Evaluating interaction & issuing token..."
                      : "I am a human"}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {solveState === "solved" ? "HMAC signed token ready" : "Click checkbox to verify"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-mono font-bold tracking-tight">minicaptcha</div>
                <div className="text-[9px] text-muted-foreground">zero tracking</div>
              </div>
            </div>

            {solveState === "error" && (
              <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Solved Output & Token Details */}
          {solveState === "solved" && token && (
            <div className="space-y-4 pt-2 border-t border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-mono">
                    Token Expiry:{" "}
                    <strong className={secondsLeft < 20 ? "text-destructive" : "text-foreground"}>
                      {secondsLeft}s remaining
                    </strong>{" "}
                    (2 min window)
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  New Challenge
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsLeft < 20 ? "bg-destructive" : "bg-emerald-500"
                  }`}
                  style={{ width: `${(secondsLeft / 120) * 100}%` }}
                />
              </div>

              {/* Token Display */}
              <div className="rounded border border-border bg-muted/40 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Issued Token (POST /api/issue response)</span>
                  <button
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 hover:text-foreground text-[11px]"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedToken ? "Copied" : "Copy token"}
                  </button>
                </div>
                <div className="text-xs font-mono break-all text-foreground/90 bg-background p-2 rounded border border-border select-all">
                  {token}
                </div>
              </div>

              {/* Backend Verification Simulator */}
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Verify Token (POST /api/verify)
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Backend validation test
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-muted-foreground block">
                    Site Secret Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      placeholder="e.g. mc_sec_49a2b8..."
                      className="flex-1 px-3 py-1.5 rounded border border-border bg-card text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <button
                      onClick={handleVerify}
                      disabled={verifying || secondsLeft === 0}
                      className="px-4 py-1.5 rounded bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                    >
                      {verifying ? "Verifying..." : "Verify Token"}
                    </button>
                  </div>
                  {secondsLeft === 0 && (
                    <div className="text-xs text-destructive font-mono">
                      Token has expired. Issue a new token above before verifying.
                    </div>
                  )}
                </div>

                {verifyResult && (
                  <div
                    className={`p-3 rounded border text-xs font-mono space-y-1 ${
                      verifyResult.success
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>
                        {verifyResult.success ? "✓ Verification Passed" : "✗ Verification Failed"}
                      </span>
                      {verifyLatency && <span>{verifyLatency}ms</span>}
                    </div>
                    <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap pt-1">
                      {JSON.stringify(verifyResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Terminal cURL Preview */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2 shadow-sm">
          <div className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
            cURL Equivalent
          </div>
          <div className="rounded border border-border bg-muted/60 p-3 font-mono text-[11px] overflow-x-auto select-all text-foreground/90">
            {`# Verify token from your backend server
curl -X POST https://your-domain.com/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{"token": "${token || "<TOKEN>"}", "secret": "${secretInput || "<SECRET>"}"}'`}
          </div>
        </div>
      </main>
    </div>
  );
}