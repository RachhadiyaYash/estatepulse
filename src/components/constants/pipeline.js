/**
 * Shared pipeline/analytics constants.
 *
 * Replaces the deleted `src/data/seed.js` so that UI components no longer
 * depend on seed data. Kept in sync with the stage keys used by the
 * `leads.stage` column and the StageDot map in `ui/Badge.jsx`.
 */

/** Pipeline stages (order defines kanban column order). */
export const STAGES = [
  { key: "new", label: "New", step: "1. New", badge: "primary" },
  { key: "contacted", label: "Contacted", step: "2. Contacted", badge: "primary" },
  { key: "site_visit", label: "Site Visit", step: "3. Site Visit", badge: "warning" },
  { key: "negotiation", label: "Negotiation", step: "4. Negotiation", badge: "orange" },
  { key: "won", label: "Won", step: "5. Won", badge: "success" },
  { key: "lost", label: "Lost", step: "6. Lost", badge: "neutral" },
];

/**
 * Conversion funnel for the analytics page.
 * `color` must be a key of FUNNEL_STYLE in AnalyticsPage.jsx.
 */
export const FUNNEL = [
  { label: "New Leads", value: 128, color: "accent" },
  { label: "Contacted", value: 96, color: "stage-contacted" },
  { label: "Site Visits", value: 54, color: "warning" },
  { label: "Deals Won", value: 31, color: "success" },
];

/** Lead acquisition sources. `bar` is a full Tailwind bg class. */
export const LEAD_SOURCES = [
  { label: "Referrals", value: 48, pct: 78, bar: "bg-accent" },
  { label: "Website", value: 34, pct: 55, bar: "bg-stage-contacted" },
  { label: "Meta Ads", value: 26, pct: 42, bar: "bg-warning" },
  { label: "Walk-ins", value: 18, pct: 29, bar: "bg-success" },
];
