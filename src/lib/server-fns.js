import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { PLAN_LIMITS, getCurrentMonthString } from "@/lib/constants";

export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const user = context.user;
    const currentMonth = getCurrentMonthString();

    // Query sites owned by user (either owner_email or created_by_id)
    const sites = await base44.entities.Site.filter({
      $or: [{ owner_email: user.email }, { created_by_id: user.id }],
    });

    const siteList = sites || [];

    // Fetch usage records for all these sites for the current and recent months
    const siteIds = siteList.map((s) => s.id);
    let usageRecords = [];
    if (siteIds.length > 0) {
      usageRecords = await base44.entities.Usage.filter({
        site_id: { $in: siteIds },
      });
    }

    const totalSolvesThisMonth = siteList.reduce(
      (acc, s) => acc + (Number(s.solves_this_month) || 0),
      0
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      currentMonth,
      totalSolvesThisMonth,
      sites: siteList,
      usage: usageRecords || [],
      planLimits: PLAN_LIMITS,
    };
  });

export const createNewSite = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      name: z.string().min(1, "Site name is required").max(100),
      plan: z.enum(["free", "starter", "unlimited"]).default("free"),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const user = context.user;

    const { generateSiteCredentials } = await import("@/lib/captcha.server");
    const { sitekey, secret, secret_hash, secret_hint } = generateSiteCredentials();

    const site = await base44.entities.Site.create({
      name: data.name.trim(),
      sitekey,
      secret_hash,
      secret_hint,
      plan: data.plan,
      owner_email: user.email,
      solves_this_month: 0,
    });

    return {
      success: true,
      site,
      // Raw secret returned once upon generation
      secret,
    };
  });

export const rollSiteSecret = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      siteId: z.string().min(1),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const user = context.user;

    const site = await base44.entities.Site.get(data.siteId);
    if (!site) {
      throw new Error("Site not found");
    }

    // Verify ownership
    if (site.owner_email !== user.email && site.created_by_id !== user.id && user.role !== "admin") {
      throw new Error("Forbidden: You do not own this site");
    }

    const { generateSiteCredentials } = await import("@/lib/captcha.server");
    const { secret, secret_hash, secret_hint } = generateSiteCredentials();

    await base44.entities.Site.update(site.id, {
      secret_hash,
      secret_hint,
    });

    return {
      success: true,
      secret,
      secret_hint,
    };
  });

export const updateSitePlan = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      siteId: z.string().min(1),
      plan: z.enum(["free", "starter", "unlimited"]),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const user = context.user;

    const site = await base44.entities.Site.get(data.siteId);
    if (!site) {
      throw new Error("Site not found");
    }

    if (site.owner_email !== user.email && site.created_by_id !== user.id && user.role !== "admin") {
      throw new Error("Forbidden: You do not own this site");
    }

    const updated = await base44.entities.Site.update(site.id, {
      plan: data.plan,
    });

    return { success: true, site: updated };
  });

export const deleteSite = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      siteId: z.string().min(1),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const user = context.user;

    const site = await base44.entities.Site.get(data.siteId);
    if (!site) {
      throw new Error("Site not found");
    }

    if (site.owner_email !== user.email && site.created_by_id !== user.id && user.role !== "admin") {
      throw new Error("Forbidden: You do not own this site");
    }

    await base44.entities.Site.delete(site.id);
    await base44.entities.Usage.deleteMany({ site_id: site.id });

    return { success: true };
  });