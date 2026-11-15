import { useState } from "react";

export function CreateSiteModal({ isOpen, onClose, onSubmit, isPending }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), plan });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <h3 className="font-semibold text-sm sm:text-base font-heading">Register New Site</h3>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground font-mono"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-muted-foreground block">
              Site Name or Domain
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme SaaS Login"
              className="w-full px-3 py-2 rounded border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-muted-foreground block">
              Subscription Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "free", label: "Free", limit: "10k / mo" },
                { id: "starter", label: "Starter", limit: "100k / mo" },
                { id: "unlimited", label: "Unlimited", limit: "No limit" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setPlan(tier.id)}
                  className={`p-2.5 rounded border text-center transition-colors ${
                    plan === tier.id
                      ? "border-foreground bg-muted font-bold"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <div className="text-xs font-medium">{tier.label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{tier.limit}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Generating..." : "Create Site & Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}