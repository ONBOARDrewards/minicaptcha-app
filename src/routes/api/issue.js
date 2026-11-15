import { createFileRoute } from "@tanstack/react-router";
import { signToken, PLAN_LIMITS, getCurrentMonthString } from "@/lib/captcha.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/issue")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },
      POST: async ({ request, context }) => {
        try {
          let body = {};
          try {
            body = await request.json();
          } catch {
            return Response.json(
              { error: "Invalid JSON body" },
              { status: 400, headers: corsHeaders }
            );
          }

          const { sitekey, host } = body || {};

          if (!sitekey || typeof sitekey !== "string") {
            return Response.json(
              { error: "Missing or invalid 'sitekey'" },
              { status: 400, headers: corsHeaders }
            );
          }

          const base44 = context.getBase44();
          const currentMonth = getCurrentMonthString();

          // Look up site by sitekey
          const sites = await base44.asServiceRole.entities.Site.filter({ sitekey: sitekey.trim() });
          let site = sites?.[0];

          // If demo site requested and not found, auto-create a sandbox record
          if (!site && (sitekey === "mc_demo_sandbox" || sitekey === "demo-sandbox")) {
            const { hashSecret } = await import("@/lib/captcha.server");
            site = await base44.asServiceRole.entities.Site.create({
              name: "Public Demo Sandbox",
              sitekey: "mc_demo_sandbox",
              secret_hash: hashSecret("mc_sec_demo_secret_key_12345"),
              secret_hint: "mc_sec_demo...2345",
              plan: "free",
              owner_email: "demo@minicaptcha.io",
              solves_this_month: 0,
            });
          }

          if (!site) {
            return Response.json(
              { error: `Site with sitekey '${sitekey}' not found` },
              { status: 404, headers: corsHeaders }
            );
          }

          // Enforce plan limits
          const plan = site.plan || "free";
          const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
          const currentSolves = Number(site.solves_this_month) || 0;

          if (currentSolves >= limit) {
            return Response.json(
              {
                error: `Monthly solve limit exceeded for plan '${plan}' (${currentSolves}/${limit})`,
                plan,
                current_solves: currentSolves,
                limit,
              },
              { status: 429, headers: corsHeaders }
            );
          }

          // Increment site's solves_this_month
          const newSolvesCount = currentSolves + 1;
          await base44.asServiceRole.entities.Site.update(site.id, {
            solves_this_month: newSolvesCount,
          });

          // Record / increment in Usage entity for current month
          try {
            const usageRecords = await base44.asServiceRole.entities.Usage.filter({
              site_id: site.id,
              month: currentMonth,
            });

            if (usageRecords && usageRecords.length > 0) {
              const existingUsage = usageRecords[0];
              await base44.asServiceRole.entities.Usage.update(existingUsage.id, {
                solves: (Number(existingUsage.solves) || 0) + 1,
              });
            } else {
              await base44.asServiceRole.entities.Usage.create({
                site_id: site.id,
                month: currentMonth,
                solves: 1,
              });
            }
          } catch (usageErr) {
            console.error("Failed to update usage record:", usageErr);
          }

          // Generate HMAC-signed token with 2-minute expiry
          const token = signToken({
            sitekey: site.sitekey,
            host: host || request.headers.get("origin") || request.headers.get("host") || "unknown",
          });

          return Response.json({ token }, { status: 200, headers: corsHeaders });
        } catch (err) {
          console.error("Error in /api/issue:", err);
          return Response.json(
            { error: err.message || "Internal server error" },
            { status: 500, headers: corsHeaders }
          );
        }
      },
    },
  },
});