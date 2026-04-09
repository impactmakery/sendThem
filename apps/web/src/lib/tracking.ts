const STORAGE_KEY = 'wb_funnel';
const VISITOR_KEY = 'wb_visitor_id';

export type FunnelStep =
  | 'page_view'
  | 'scroll_50'
  | 'cta_click'
  | 'register_start'
  | 'register_complete'
  | 'checkout_view'
  | 'notify_submit';

interface FunnelEvent {
  step: FunnelStep;
  timestamp: string;
  meta?: Record<string, string>;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getFunnel(): FunnelEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function trackStep(step: FunnelStep, meta?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  const funnel = getFunnel();
  const event: FunnelEvent = {
    step,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  funnel.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funnel));

  // Also push to dataLayer for Google Tag Manager if present
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'funnel_step',
      funnel_step: step,
      visitor_id: getVisitorId(),
      ...meta,
    });
  }
}

export function getVisitorData() {
  return {
    visitorId: getVisitorId(),
    funnel: getFunnel(),
  };
}
