export const PLAN_LIMITS = {
  free: 10000,
  starter: 100000,
  unlimited: Infinity,
};

export function getCurrentMonthString() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}