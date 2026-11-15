import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getAccountOverview,
  createNewSite,
  rollSiteSecret,
  updateSitePlan,
  deleteSite,
} from "@/lib/server-fns";
import { Navbar } from "@/components/Navbar";
import { SiteCard } from "@/components/account/SiteCard";
import { CreateSiteModal } from "@/components/account/CreateSiteModal";
import { SecretRevealedBanner } from "@/components/account/SecretRevealedBanner";
import { Plus, ShieldCheck, Activity } from "lucide-react";

export const Route = createFileRoute("/_authed/account")({
  head: () => ({
    meta: [
      { title: "Account & Sites — minicaptcha" },
      { name: "description", content: "Manage your sites, public sitekeys, secret keys, and track monthly captcha solves." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const queryClient = useQueryClient();
  const getAccountOverviewFn = useServerFn(getAccountOverview);
  const createNewSiteFn = useServerFn(createNewSite);
  const rollSiteSecretFn = useServerFn(rollSiteSecret);
  const updateSitePlanFn = useServerFn(updateSitePlan);
  const deleteSiteFn = useServerFn(deleteSite);

  const { data, isLoading } = useQuery({
    queryKey: ["account-overview"],
    queryFn: () => getAccountOverviewFn(),
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState(null);

  const createMutation = useMutation({
    mutationFn: (siteData) => createNewSiteFn({ data: siteData }),
    onSuccess: (result) => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
      setRevealedSecret({
        secret: result.secret,
        siteName: result.site.name,
        sitekey: result.site.sitekey,
      });
    },
  });

  const rollMutation = useMutation({
    mutationFn: (siteId) => rollSiteSecretFn({ data: { siteId } }),
    onSuccess: (result, siteId) => {
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
      const site = data?.sites?.find((s) => s.id === siteId);
      setRevealedSecret({
        secret: result.secret,
        siteName: site?.name || "Site",
        sitekey: site?.sitekey,
        isRolled: true,
      });
    },
  });

  const planMutation = useMutation({
    mutationFn: ({ siteId, plan }) => updateSitePlanFn({ data: { siteId, plan } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account-overview"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (siteId) => deleteSiteFn({ data: { siteId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account-overview"] }),
  });

  const sites = data?.sites || [];
  const planLimits = data?.planLimits || { free: 10000, starter: 100000, unlimited: Infinity };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading">
                Account & Sites
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {data?.currentMonth || "Current Month"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Signed in as <span className="font-mono text-foreground font-medium">{data?.user?.email}</span>
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Site
          </button>
        </div>

        <SecretRevealedBanner
          revealedSecret={revealedSecret}
          onDismiss={() => setRevealedSecret(null)}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card space-y-1 shadow-sm">
            <div className="text-[11px] font-mono uppercase text-muted-foreground">Active Sites</div>
            <div className="text-2xl font-bold font-mono">{sites.length}</div>
            <div className="text-[11px] text-muted-foreground">Websites protected with minicaptcha</div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-1 shadow-sm">
            <div className="text-[11px] font-mono uppercase text-muted-foreground">This Month's Solves</div>
            <div className="text-2xl font-bold font-mono">{data?.totalSolvesThisMonth ?? 0}</div>
            <div className="text-[11px] text-muted-foreground">
              Total issued tokens across all sites ({data?.currentMonth})
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-1 shadow-sm">
            <div className="text-[11px] font-mono uppercase text-muted-foreground">Verification Engine</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-[11px] text-muted-foreground">HMAC sha256 token verification ready</div>
          </div>
        </div>

        {/* Sites Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold font-heading">
              Your Registered Sites
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {sites.length} {sites.length === 1 ? "site" : "sites"}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-muted-foreground border rounded-lg bg-card">
              Loading your sites and usage stats...
            </div>
          ) : sites.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-border bg-card space-y-3">
              <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto" />
              <div className="text-sm font-semibold">No sites registered yet</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Register your first website to generate a unique sitekey and private secret key.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                Register First Site
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  planLimits={planLimits}
                  currentMonth={data?.currentMonth}
                  onRollSecret={(s) => {
                    if (window.confirm(`Regenerate secret for "${s.name}"? The previous secret will stop working.`)) {
                      rollMutation.mutate(s.id);
                    }
                  }}
                  onDeleteSite={(s) => {
                    if (window.confirm(`Delete site "${s.name}"?`)) {
                      deleteMutation.mutate(s.id);
                    }
                  }}
                  onChangePlan={(siteId, plan) => planMutation.mutate({ siteId, plan })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Monthly Historical Usage Logs */}
        {data?.usage && data.usage.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-border">
            <h2 className="text-sm sm:text-base font-semibold font-heading flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monthly Historical Usage Records
            </h2>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3">Site ID</th>
                    <th className="p-3">Month</th>
                    <th className="p-3 text-right">Successful Solves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.usage.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono">{u.site_id}</td>
                      <td className="p-3">{u.month}</td>
                      <td className="p-3 text-right font-bold">{u.solves?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <CreateSiteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(vals) => createMutation.mutate(vals)}
          isPending={createMutation.isPending}
        />
      </main>
    </div>
  );
}