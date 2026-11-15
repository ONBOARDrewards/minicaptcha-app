import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Check, RotateCw, Trash2, ExternalLink } from "lucide-react";

export function SiteCard({
  site,
  planLimits,
  currentMonth,
  onRollSecret,
  onDeleteSite,
  onChangePlan,
}) {
  const [copiedKey, setCopiedKey] = useState(false);
  const limit = planLimits[site.plan] ?? planLimits.free;
  const solves = Number(site.solves_this_month) || 0;
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((solves / limit) * 100));

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-5 rounded-lg border border-border bg-card shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base">{site.name}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                site.plan === "unlimited"
                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                  : site.plan === "starter"
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              }`}
            >
              {site.plan} tier
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Owner: <span className="font-mono">{site.owner_email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/solve"
            search={{ sitekey: site.sitekey }}
            className="px-2.5 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-mono inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Solve
          </Link>
          <Link
            to="/embed"
            search={{ sitekey: site.sitekey }}
            className="px-2.5 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-mono inline-flex items-center gap-1 transition-colors"
          >
            Embed
          </Link>
          <button
            onClick={() => onRollSecret(site)}
            title="Roll secret key"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteSite(site)}
            title="Delete site"
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded border border-border bg-muted/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
            <span>Public Sitekey</span>
            <button
              onClick={() => handleCopy(site.sitekey)}
              className="inline-flex items-center gap-1 text-foreground hover:underline"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedKey ? "Copied" : "Copy"}
            </button>
          </div>
          <code className="font-mono text-xs font-bold text-foreground block break-all">
            {site.sitekey}
          </code>
        </div>

        <div className="p-3 rounded border border-border bg-muted/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
            <span>Site Secret Key Hint</span>
            <button
              onClick={() => onRollSecret(site)}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" /> Roll
            </button>
          </div>
          <code className="font-mono text-xs font-medium text-muted-foreground block break-all">
            {site.secret_hint || "mc_sec_••••••••••••"}
          </code>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">Monthly Solves ({currentMonth})</span>
          <span className="font-semibold">
            {solves.toLocaleString()} / {limit === Infinity ? "Unlimited" : limit.toLocaleString()}
          </span>
        </div>

        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              pct > 90 ? "bg-destructive" : pct > 75 ? "bg-amber-500" : "bg-foreground"
            }`}
            style={{ width: `${limit === Infinity ? 5 : Math.max(2, pct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span>
            {limit === Infinity
              ? "No monthly limit"
              : `${(limit - solves).toLocaleString()} solves left`}
          </span>
          <div className="flex items-center gap-2">
            <span>Tier:</span>
            <select
              value={site.plan}
              onChange={(e) => onChangePlan(site.id, e.target.value)}
              className="bg-background border border-border rounded px-1.5 py-0.5 text-[11px] font-mono"
            >
              <option value="free">Free (10k)</option>
              <option value="starter">Starter (100k)</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}