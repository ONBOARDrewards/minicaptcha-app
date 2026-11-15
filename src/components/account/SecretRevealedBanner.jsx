import { useState } from "react";
import { CheckCircle2, Copy, Check } from "lucide-react";

export function SecretRevealedBanner({ revealedSecret, onDismiss }) {
  const [copied, setCopied] = useState(false);
  if (!revealedSecret) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(revealedSecret.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-lg border-2 border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {revealedSecret.isRolled
              ? `New Secret Key Rolled for "${revealedSecret.siteName}"`
              : `Site "${revealedSecret.siteName}" Registered`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground font-mono"
        >
          Dismiss
        </button>
      </div>

      <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80">
        Copy your private secret key now. It is stored as a SHA-256 hash and <strong>will not be displayed again</strong>.
      </p>

      <div className="p-3 rounded bg-background border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between gap-2">
        <code className="text-xs font-mono font-bold break-all select-all text-foreground">
          {revealedSecret.secret}
        </code>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-foreground text-background text-xs font-mono font-medium whitespace-nowrap hover:opacity-90"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy Secret"}
        </button>
      </div>
    </div>
  );
}