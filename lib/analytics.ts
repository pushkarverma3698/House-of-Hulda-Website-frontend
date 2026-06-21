/**
 * Analytics event funnel (build spec §9). Day-one instrumentation so the
 * portfolio case study has real before/after numbers.
 *
 * Phase 1: events are pushed to dataLayer (GA4) + logged in dev. Wiring GA4 /
 * Meta Pixel / Vercel Analytics is a config step, not a code change — the call
 * sites below are the contract.
 */

export type FunnelEvent =
  | "view_hero"
  | "reach_arrival"
  | "open_booking"
  | "select_mood"
  | "request_dates"
  | "whatsapp_click"
  | "enquiry_sent"
  | "check_availability"
  | "payment"
  | "confirmed"
  | "cta_click";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: FunnelEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const payload = { event, ...params, ts: Date.now() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", payload);
  }
}
