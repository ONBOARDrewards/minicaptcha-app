import { createFileRoute } from "@tanstack/react-router";
import { verifyToken, hashSecret } from "@/lib/captcha.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/verify")({
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
              { success: false, error: "Invalid JSON body" },
              { status: 400, headers: corsHeaders }
            );
          }

          const { token, secret } = body || {};

          if (!token || typeof token !== "string") {
            return Response.json(
              { success: false, error: "Missing or invalid 'token'" },
              { status: 400, headers: corsHeaders }
            );
          }

          if (!secret || typeof secret !== "string") {
            return Response.json(
              { success: false, error: "Missing or invalid 'secret'" },
              { status: 400, headers: corsHeaders }
            );
          }

          // 1. Validate signature and expiry
          const verification = verifyToken(token);
          if (!verification.valid) {
            return Response.json(
              { success: false, error: verification.error || "Token verification failed" },
              { status: 200, headers: corsHeaders }
            );
          }

          const tokenSitekey = verification.payload?.sitekey;
          if (!tokenSitekey) {
            return Response.json(
              { success: false, error: "Token payload missing sitekey" },
              { status: 200, headers: corsHeaders }
            );
          }

          const base44 = context.getBase44();

          // 2. Look up the site by sitekey
          const sites = await base44.asServiceRole.entities.Site.filter({ sitekey: tokenSitekey });
          const site = sites?.[0];

          if (!site) {
            return Response.json(
              { success: false, error: "Site associated with token not found" },
              { status: 200, headers: corsHeaders }
            );
          }

          // 3. Check secret against the site
          const computedHash = hashSecret(secret.trim());
          if (computedHash !== site.secret_hash) {
            return Response.json(
              { success: false, error: "Secret key does not match site records" },
              { status: 200, headers: corsHeaders }
            );
          }

          // 4. Verification successful
          return Response.json(
            {
              success: true,
              sitekey: site.sitekey,
            },
            { status: 200, headers: corsHeaders }
          );
        } catch (err) {
          console.error("Error in /api/verify:", err);
          return Response.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500, headers: corsHeaders }
          );
        }
      },
    },
  },
});