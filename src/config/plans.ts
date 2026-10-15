// Aullevo Pro plans as shown on the site. The amount actually charged for GCash / Maya / QR Ph
// is decided by PLANS in api/paymongo.ts; keep both in sync when a price changes.
export type PlanId = 'monthly' | 'yearly' | 'lifetime';

// PayPal checkout is turned off while the PayPal account is under review. Set back to true to
// show the PayPal / card option again. Admin review of existing PayPal claims keeps working.
export const PAYPAL_ENABLED = true;

export interface Plan {
    id: PlanId;
    name: string;
    usd: string;    // PayPal amount, e.g. '2.50'
    php: string;    // display only, e.g. '154.29'
    days: number | null; // null = lifetime
    period: string; // e.g. '/ 30 days'
    note: string;
    badge?: string;
}

export const PLANS: Record<PlanId, Plan> = {
    monthly: { id: 'monthly', name: 'Monthly', usd: '2.50', php: '154.29', days: 30, period: '/ 30 days', note: 'No auto-renewal' },
    yearly: { id: 'yearly', name: 'Yearly', usd: '20.00', php: '1,234.32', days: 365, period: '/ year', note: 'No auto-renewal', badge: 'Save 33%' },
    lifetime: { id: 'lifetime', name: 'Lifetime', usd: '50.00', php: '3,085.80', days: null, period: 'once', note: 'Pay once, Pro forever', badge: 'Best value' },
};

export const PLAN_ORDER: PlanId[] = ['monthly', 'yearly', 'lifetime'];

export const isPlanId = (value: unknown): value is PlanId =>
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);

// '$2.50' / '$20' / '$50'
export const formatUsd = (plan: Plan) => `$${plan.usd.replace(/\.00$/, '')}`;
