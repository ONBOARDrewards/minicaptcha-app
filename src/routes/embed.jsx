import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Code2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Layers, FileCode2 } from "lucide-react";

export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [
      { title: "Embed & Integration Guide — minicaptcha" },
      { name: "description", content: "Client embed widgets, script snippets, and backend token verification examples." }
    ],
  }),
  validateSearch: (search) => ({
    sitekey: typeof search?.sitekey === "string" ? search.sitekey : undefined,
  }),
  component: EmbedPage,
});

function EmbedPage() {
  const search = Route.useSearch();
  const [sitekey, setSitekey] = useState(search?.sitekey || "mc_live_your_sitekey_here");
  const [activeTab, setActiveTab] = useState("html"); // html, react, iframe
  const [activeBackendTab, setActiveBackendTab] = useState("node"); // node, python, go, curl
  const [copiedKey, setCopiedKey] = useState("");

  const copyCode = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const clientSnippets = {
    html: `<!-- 1. Place the minicaptcha container in your form -->
<form id="signup-form" method="POST" action="/api/signup">
  <input type="email" name="email" placeholder="you@domain.com" required />
  
  <!-- minicaptcha widget container -->
  <div id="minicaptcha-container"></div>
  <input type="hidden" id="minicaptcha-token" name="captcha_token" />

  <button type="submit">Create Account</button>
</form>

<!-- 2. Minimal Client Script (approx. 20 lines) -->
<script>
async function renderMinicaptcha(containerId, sitekey) {
  const container = document.getElementById(containerId);
  container.innerHTML = \`
    <div style="border:1px solid #e5e7eb; border-radius:6px; padding:12px; display:flex; align-items:center; justify-content:space-between; max-width:300px; font-family:sans-serif; font-size:13px;">
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
        <input type="checkbox" id="mc-checkbox" style="cursor:pointer;" />
        <span>I am a human</span>
      </label>
      <span style="font-size:10px; color:#6b7280; font-family:monospace; font-weight:bold;">minicaptcha</span>
    </div>
  \`;

  document.getElementById("mc-checkbox").addEventListener("change", async (e) => {
    if (!e.target.checked) return;
    e.target.disabled = true;

    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitekey: "${sitekey}", host: window.location.hostname })
      });
      const data = await res.json();
      if (data.token) {
        document.getElementById("minicaptcha-token").value = data.token;
      }
    } catch (err) {
      console.error("minicaptcha issue failed", err);
      e.target.checked = false;
      e.target.disabled = false;
    }
  });
}

renderMinicaptcha("minicaptcha-container", "${sitekey}");
</script>`,

    react: `import React, { useState } from "react";

export function Minicaptcha({ sitekey = "${sitekey}", onSolved }) {
  const [status, setStatus] = useState("idle"); // idle, solving, solved

  const handleSolve = async () => {
    setStatus("solving");
    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitekey,
          host: typeof window !== "undefined" ? window.location.hostname : "localhost",
        }),
      });
      const data = await res.json();
      if (data.token) {
        setStatus("solved");
        onSolved?.(data.token);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("Failed to issue token:", err);
      setStatus("idle");
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md max-w-xs bg-card text-foreground font-sans">
      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
        <input
          type="checkbox"
          checked={status === "solved"}
          onChange={handleSolve}
          disabled={status !== "idle"}
          className="rounded"
        />
        <span>{status === "solved" ? "Verified" : status === "solving" ? "Verifying..." : "I am human"}</span>
      </label>
      <span className="font-mono text-[10px] text-muted-foreground font-semibold">minicaptcha</span>
    </div>
  );
}`,

    iframe: `<!-- Embed via responsive iframe widget -->
<iframe
  src="${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/solve?sitekey=${sitekey}&embed=1"
  width="320"
  height="70"
  frameborder="0"
  scrolling="no"
  style="border:none; overflow:hidden;"
></iframe>`
  };

  const backendSnippets = {
    node: `// Node.js (Express, Next.js, Fastify)
async function verifyCaptcha(token, secretKey = process.env.MINICAPTCHA_SECRET) {
  const response = await fetch("https://your-domain.com/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      secret: secretKey
    })
  });

  const { success, sitekey, error } = await response.json();
  if (!success) {
    throw new Error(error || "Captcha verification failed");
  }

  return { success, sitekey };
}`,

    python: `# Python 3 (requests or httpx)
import requests
import os

def verify_minicaptcha(token: str, secret_key: str = os.getenv("MINICAPTCHA_SECRET")):
    url = "https://your-domain.com/api/verify"
    payload = {
        "token": token,
        "secret": secret_key
    }
    response = requests.post(url, json=payload, timeout=5)
    data = response.json()
    
    if not data.get("success"):
        raise ValueError(data.get("error", "Captcha validation failed"))
        
    return data["sitekey"]`,

    go: `// Go (net/http)
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type VerifyResponse struct {
	Success bool   \`json:"success"\`
	Sitekey string \`json:"sitekey"\`
	Error   string \`json:"error"\`
}

func VerifyToken(token, secret string) (bool, error) {
	body, _ := json.Marshal(map[string]string{
		"token":  token,
		"secret": secret,
	})

	resp, err := http.Post("https://your-domain.com/api/verify", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result VerifyResponse
	json.NewDecoder(resp.Body).Decode(&result)
	return result.Success, nil
}`,

    curl: `# cURL / Command line test
curl -X POST https://your-domain.com/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "YOUR_CAPTCHA_TOKEN",
    "secret": "YOUR_SITE_SECRET"
  }'`
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading">
            Embed & Integration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Integrate minicaptcha into your forms in under two minutes with zero third-party dependencies.
          </p>
        </div>

        {/* Sitekey Configurator */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2 shadow-sm">
          <label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider block">
            Customize Sitekey in Snippets
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sitekey}
              onChange={(e) => setSitekey(e.target.value)}
              placeholder="e.g. mc_live_83fa9b..."
              className="flex-1 px-3 py-1.5 rounded border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            <Link
              to="/account"
              className="px-3 py-1.5 rounded border border-border bg-muted hover:bg-muted/80 text-xs font-mono transition-colors whitespace-nowrap"
            >
              View My Sitekeys
            </Link>
          </div>
        </div>

        {/* Client Embed Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-muted text-foreground flex items-center justify-center font-mono text-xs font-bold">1</span>
              <h2 className="text-sm sm:text-base font-semibold font-heading">
                Client-Side Widget (HTML / React / iFrame)
              </h2>
            </div>
            <div className="flex rounded border border-border bg-card p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab("html")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "html" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                HTML / JS
              </button>
              <button
                onClick={() => setActiveTab("react")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "react" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                React
              </button>
              <button
                onClick={() => setActiveTab("iframe")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "iframe" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                iFrame
              </button>
            </div>
          </div>

          <div className="relative rounded-lg border border-border bg-card p-4 font-mono text-xs overflow-x-auto text-foreground/90 shadow-sm leading-relaxed">
            <button
              onClick={() => copyCode(activeTab, clientSnippets[activeTab])}
              className="absolute top-3 right-3 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-mono flex items-center gap-1.5 border border-border"
            >
              {copiedKey === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === activeTab ? "Copied" : "Copy"}
            </button>
            <pre className="pr-16">{clientSnippets[activeTab]}</pre>
          </div>
        </div>

        {/* Backend Verification Section */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-muted text-foreground flex items-center justify-center font-mono text-xs font-bold">2</span>
              <h2 className="text-sm sm:text-base font-semibold font-heading">
                Backend Server Verification (POST /api/verify)
              </h2>
            </div>
            <div className="flex rounded border border-border bg-card p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveBackendTab("node")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBackendTab === "node" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setActiveBackendTab("python")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBackendTab === "python" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveBackendTab("go")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBackendTab === "go" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Go
              </button>
              <button
                onClick={() => setActiveBackendTab("curl")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBackendTab === "curl" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                cURL
              </button>
            </div>
          </div>

          <div className="relative rounded-lg border border-border bg-card p-4 font-mono text-xs overflow-x-auto text-foreground/90 shadow-sm leading-relaxed">
            <button
              onClick={() => copyCode(activeBackendTab, backendSnippets[activeBackendTab])}
              className="absolute top-3 right-3 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-mono flex items-center gap-1.5 border border-border"
            >
              {copiedKey === activeBackendTab ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === activeBackendTab ? "Copied" : "Copy"}
            </button>
            <pre className="pr-16">{backendSnippets[activeBackendTab]}</pre>
          </div>
        </div>

        {/* API Specification Table */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-sm sm:text-base font-semibold font-heading">
            API Endpoints Reference
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-muted font-mono font-bold text-xs">POST</span>
                <span className="font-mono text-xs font-semibold">/api/issue</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Called by client widget upon completing challenge. Looks up site, validates monthly quota, increments usage, and returns a signed HMAC token.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">REQUEST BODY</span>
                  {`{ "sitekey": "string", "host": "string" }`}
                </div>
                <div className="p-2 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">RESPONSE (200 OK)</span>
                  {`{ "token": "string" }`}
                </div>
              </div>
            </div>

            <div className="p-4 rounded border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-muted font-mono font-bold text-xs">POST</span>
                <span className="font-mono text-xs font-semibold">/api/verify</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Called by your backend server before accepting form data. Validates cryptographic HMAC signature, verifies 2-minute expiration timestamp, and checks site secret.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">REQUEST BODY</span>
                  {`{ "token": "string", "secret": "string" }`}
                </div>
                <div className="p-2 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[10px]">RESPONSE (200 OK)</span>
                  {`{ "success": true, "sitekey": "string" }`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}