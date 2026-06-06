/**
 * Lightweight analytics event helper for EZPOS.
 * Pushes ke window.dataLayer (kompatibel dengan GA4 / GTM bila dipasang nanti).
 * Jika tidak ada GA/GTM, tetap aman — hanya menumpuk event di memory.
 */
export type EventName =
  | "primary_cta_click"
  | "secondary_cta_click"
  | "lead_form_submit"
  | "contact_click"
  | "pricing_page_view"
  | "demo_request_click"
  | "signup_click"
  | "faq_expand"
  | "internal_link_click"
  | "scroll_depth"
  | "outbound_link_click";

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

export function trackEvent(
  name: EventName,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: name, ...params, ts: Date.now() });
}
