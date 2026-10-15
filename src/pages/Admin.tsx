import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { PLANS, PLAN_ORDER, formatUsd, type PlanId } from '../config/plans';

/* ── Data from /api/paymongo?action=admin-overview ── */

interface Claim {
    id: string;
    uid: string;
    email: string;
    provider: string;
    orderId: string;
    payerEmail: string;
    amount: string;
    currency: string;
    note: string;
    status: 'pending' | 'approved' | 'rejected';
    plan: PlanId | null;
    grantedUntil: string | null;
    reviewNote: string;
    reviewedBy: string;
    createdAt: string | null;
    reviewedAt: string | null;
    // Pending PayPal claims only: the server's own check with PayPal
    paypal?: PaypalCheck;
    alreadyUsed?: boolean;
}

interface PaypalCheck {
    configured: boolean;
    ok: boolean;
    captureId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    plan?: string | null;
    error?: string;
}

interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    isPro: boolean;
    proExpiresAt: string | null;
    subscriptionPlan: string | null;
    lastPaymentProvider: string | null;
    createdAt: string | null;
}

interface OpenCheckout {
    uid: string;
    email: string;
    sessionId: string;
    plan: PlanId;
    createdAt: string | null;
}

interface Overview {
    paypalApi: boolean;
    claims: Claim[];
    users: AdminUser[];
    openCheckouts: OpenCheckout[];
}

type Tab = 'pending' | 'history' | 'users';

const DAY_MS = 24 * 60 * 60 * 1000;

const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const fmtDay = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';

async function adminCall<T>(user: User, action: string, body?: unknown): Promise<T> {
    const res = await fetch(`/api/paymongo?action=${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status });
    return data as T;
}

// The plan the buyer picked: the note starts with it since plans exist; older claims only have the amount
function guessPlan(claim: Claim): PlanId | null {
    const fromNote = /^(Monthly|Yearly|Lifetime) plan/i.exec(claim.note)?.[1]?.toLowerCase();
    if (fromNote) return fromNote as PlanId;
    const amount = Number.parseFloat(claim.amount);
    if (claim.currency !== 'USD' || !Number.isFinite(amount)) return null;
    if (amount >= Number(PLANS.lifetime.usd)) return 'lifetime';
    if (amount >= Number(PLANS.yearly.usd)) return 'yearly';
    if (amount >= Number(PLANS.monthly.usd)) return 'monthly';
    return null;
}

// The biggest plan a verified PayPal amount pays for
function planForAmount(amount: number): PlanId | null {
    return [...PLAN_ORDER].reverse().find((id) => amount + 0.001 >= Number(PLANS[id].usd)) ?? null;
}

type ProKind ='free' | 'active' | 'expired' | 'lifetime' | 'open';

function proKind(user: AdminUser | undefined): ProKind {
    if (!user?.isPro) return 'free';
    if (!user.proExpiresAt) return user.subscriptionPlan === 'lifetime' ? 'lifetime' : 'open';
    return Date.parse(user.proExpiresAt) > Date.now() ? 'active' : 'expired';
}

function describePro(user: AdminUser | undefined): string {
    switch (proKind(user)) {
        case 'free': return 'Free';
        case 'lifetime': return 'Pro · Lifetime';
        case 'open': return 'Pro with no expiry date (shows as Lifetime)';
        case 'expired': return `Pro expired ${fmtDay(user!.proExpiresAt)}`;
        default: return `Pro until ${fmtDay(user!.proExpiresAt)}`;
    }
}

// Same rule as grantFields() on the server, so the preview matches what Approve does
function previewGrant(user: AdminUser | undefined, planId: PlanId, replaceOpen: boolean, paidAt: string | null): string {
    const days = PLANS[planId].days;
    const kind = proKind(user);
    const replacing = kind === 'open' && replaceOpen && days !== null;
    if ((kind === 'open' || kind === 'lifetime') && !replacing) return 'Stays Pro with no expiry (nothing is shortened)';
    if (days === null) return 'Pro forever (no expiry)';
    const now = Date.now();
    const current = user?.proExpiresAt ? Date.parse(user.proExpiresAt) : NaN;
    const base = replacing ? (paidAt ? Date.parse(paidAt) : now) : Number.isFinite(current) && current > now ? current : now;
    return `Pro until ${fmt(new Date(base + days * DAY_MS).toISOString())}`;
}

/* ── Pending claim card ── */

interface ClaimCardProps {
    claim: Claim;
    user: AdminUser | undefined;
    busy: boolean;
    onApprove: (claim: Claim, plan: PlanId, replaceOpenGrant: boolean) => void;
    onReject: (claim: Claim, reason: string) => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, user, busy, onApprove, onReject }) => {
    const check = claim.paypal;
    const verified = Boolean(check?.configured && check.ok);
    // Trust what PayPal received over what the buyer's browser wrote on the claim
    const guessed = verified ? planForAmount(check!.amount ?? 0) : guessPlan(claim);
    const [plan, setPlan] = useState<PlanId>(guessed ?? 'monthly');
    const affordable = (id: PlanId) => !verified || (check!.amount ?? 0) + 0.001 >= Number(PLANS[id].usd);
    const blocked = claim.alreadyUsed
        ? 'This PayPal payment was already used for another approval.'
        : check?.configured && !check.ok
            ? `PayPal check failed: ${check.error ?? 'payment not completed'}`
            : verified && !affordable(plan)
                ? `PayPal received $${check!.amount}, not enough for ${PLANS[plan].name}.`
                : null;
    const [replaceOpen, setReplaceOpen] = useState(true);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');
    const [copied, setCopied] = useState(false);
    const kind = proKind(user);
    const isPaypal = claim.provider === 'paypal';

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(claim.orderId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard blocked: the ID is still selectable */ }
    };

    return (
        <article className="account-card admin-claim">
            <div className="account-card-head">
                <h2 className="admin-claim-title">{claim.email || claim.uid}</h2>
                <span className="status-pill status-pill--pending"><span className="status-pill-dot" aria-hidden="true" />Pending</span>
            </div>

            <p className="admin-claim-amount">
                <strong>{claim.amount} {claim.currency}</strong>
                <span>reported by the buyer&apos;s browser · via {isPaypal ? 'PayPal' : claim.provider} · {fmt(claim.createdAt)}</span>
            </p>

            {claim.alreadyUsed ? (
                <p className="plan-note plan-note--warn admin-verify" role="alert">
                    ✗ This PayPal payment was already used for another approval. Reject this claim.
                </p>
            ) : !check?.configured ? (
                <p className="plan-note admin-verify admin-verify--manual">
                    ⚠ Not checked with PayPal automatically. The amount above comes from the buyer&apos;s browser and can be faked:
                    open the payment in PayPal and confirm the <strong>amount received</strong> before approving.
                </p>
            ) : check.ok ? (
                <p className="plan-note admin-notice-ok admin-verify">
                    ✓ Verified with PayPal: <strong>${check.amount} {check.currency}</strong> received, {check.status}
                    {check.plan ? ` · bought as ${PLANS[check.plan as PlanId]?.name ?? check.plan}` : ''}.
                </p>
            ) : (
                <p className="plan-note plan-note--warn admin-verify" role="alert">
                    ✗ PayPal check failed: {check.error ?? 'payment not completed'}. Don&apos;t approve unless you find the payment yourself.
                </p>
            )}

            <dl className="account-details admin-details">
                <div>
                    <dt>Transaction</dt>
                    <dd className="admin-txn">
                        <code>{claim.orderId}</code>
                        <button type="button" className="admin-link-btn" onClick={copyId}>{copied ? 'Copied' : 'Copy'}</button>
                        {isPaypal && (
                            <a className="admin-link-btn" href={`https://www.paypal.com/activity/payment/${encodeURIComponent(claim.orderId)}`} target="_blank" rel="noreferrer">
                                Open in PayPal ↗
                            </a>
                        )}
                    </dd>
                </div>
                <div><dt>Payer</dt><dd>{claim.payerEmail || '—'}</dd></div>
                <div><dt>Note</dt><dd>{claim.note || '—'}</dd></div>
                <div>
                    <dt>Account now</dt>
                    <dd className={kind === 'open' ? 'admin-warn-text' : undefined}>{describePro(user)}</dd>
                </div>
            </dl>

            <fieldset className="admin-plan-picker">
                <legend>Plan to give{guessed ? '' : ' (amount doesn’t match a plan, check it)'}</legend>
                {PLAN_ORDER.map((id) => (
                    <label key={id} className={`${id === plan ? 'is-selected' : ''} ${affordable(id) ? '' : 'is-disabled'}`}>
                        <input type="radio" name={`plan-${claim.id}`} value={id} checked={id === plan} disabled={!affordable(id)} onChange={() => setPlan(id)} />
                        {PLANS[id].name} <small>{formatUsd(PLANS[id])}</small>
                    </label>
                ))}
            </fieldset>

            {kind === 'open' && PLANS[plan].days !== null && (
                <label className="admin-check">
                    <input type="checkbox" checked={replaceOpen} onChange={(e) => setReplaceOpen(e.target.checked)} />
                    Replace their no-expiry Pro with this plan, counted from the payment date
                </label>
            )}

            <p className="plan-note admin-preview">After approving: <strong>{previewGrant(user, plan, replaceOpen, claim.createdAt)}</strong></p>

            {rejecting ? (
                <div className="admin-reject-row">
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Reason (optional), e.g. not found in PayPal"
                        value={reason}
                        maxLength={200}
                        onChange={(e) => setReason(e.target.value)}
                        aria-label="Reason for rejecting"
                        autoFocus
                    />
                    <button type="button" className="admin-btn admin-btn--danger" disabled={busy} onClick={() => onReject(claim, reason)}>Confirm reject</button>
                    <button type="button" className="admin-btn" disabled={busy} onClick={() => setRejecting(false)}>Cancel</button>
                </div>
            ) : (
                <div className="admin-actions">
                    <button type="button" className="admin-btn" disabled={busy} onClick={() => setRejecting(true)}>Reject</button>
                    {blocked && <span className="admin-blocked">{blocked}</span>}
                    <button type="button" className="admin-btn admin-btn--primary" disabled={busy || Boolean(blocked)} onClick={() => onApprove(claim, plan, kind === 'open' && replaceOpen)}>
                        {busy ? 'Saving…' : `Approve ${PLANS[plan].name}`}
                    </button>
                </div>
            )}
        </article>
    );
};

/* ── Page ── */

const Admin: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [data, setData] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ message: string; forbidden: boolean } | null>(null);
    const [tab, setTab] = useState<Tab>('pending');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u && !u.isAnonymous ? u : null);
        setAuthReady(true);
    }), []);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            setData(await adminCall<Overview>(user, 'admin-overview'));
            setError(null);
        } catch (err) {
            const status = (err as { status?: number }).status;
            setError({ message: err instanceof Error ? err.message : 'Could not load', forbidden: status === 403 });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) load();
        else setData(null);
    }, [user, load]);

    const usersById = useMemo(() => new Map((data?.users ?? []).map((u) => [u.uid, u])), [data]);
    const pending = useMemo(() => (data?.claims ?? []).filter((c) => c.status === 'pending').reverse(), [data]);
    const history = useMemo(() => (data?.claims ?? []).filter((c) => c.status !== 'pending'), [data]);
    const users = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = [...(data?.users ?? [])].sort((a, b) => Number(b.isPro) - Number(a.isPro) || a.email.localeCompare(b.email));
        return q ? list.filter((u) => `${u.email} ${u.displayName} ${u.uid}`.toLowerCase().includes(q)) : list;
    }, [data, search]);
    const openGrants = (data?.users ?? []).filter((u) => proKind(u) === 'open').length;

    const run = async (id: string, action: () => Promise<string>) => {
        setBusyId(id);
        setNotice(null);
        try {
            setNotice({ text: await action(), tone: 'ok' });
            await load();
        } catch (err) {
            setNotice({ text: err instanceof Error ? err.message : 'Something went wrong', tone: 'error' });
        } finally {
            setBusyId(null);
        }
    };

    const approve = (claim: Claim, plan: PlanId, replaceOpenGrant: boolean) =>
        run(claim.id, async () => {
            const res = await adminCall<{ proExpiresAt: string | null }>(user!, 'admin-approve', { claimId: claim.id, plan, replaceOpenGrant });
            return `Approved ${PLANS[plan].name} for ${claim.email}: ${res.proExpiresAt ? `Pro until ${fmt(res.proExpiresAt)}` : 'Pro with no expiry'}.`;
        });

    const reject = (claim: Claim, reason: string) =>
        run(claim.id, async () => {
            await adminCall(user!, 'admin-reject', { claimId: claim.id, reason });
            return `Rejected the claim from ${claim.email}. Their account was not changed.`;
        });

    const recheck = (checkout: OpenCheckout) =>
        run(checkout.uid, async () => {
            const res = await adminCall<{ status: string; paymongoStatus?: string; proExpiresAt?: string | null }>(user!, 'admin-recheck', { uid: checkout.uid });
            if (res.status === 'paid') return `${checkout.email} had paid: Pro is now active${res.proExpiresAt ? ` until ${fmt(res.proExpiresAt)}` : ''}.`;
            return `${checkout.email} has not paid (PayMongo says "${res.paymongoStatus}").${res.paymongoStatus === 'active' ? '' : ' Removed from the open list.'}`;
        });

    /* ── Gates ── */

    if (!authReady) {
        return <div className="login-page-container"><div className="login-card glass-card"><div className="spinner" /></div></div>;
    }

    if (!user) {
        return (
            <div className="login-page-container">
                <meta name="robots" content="noindex, nofollow" />
                <title>Admin · Aullevo</title>
                <div className="login-card glass-card">
                    <div className="login-prompt-view">
                        <h1>Aullevo Admin</h1>
                        <p>Sign in with the admin Google account to review payments.</p>
                        <button type="button" className="btn btn-google-login" onClick={() => signInWithPopup(auth, googleProvider).catch(console.error)}>
                            Sign In with Google
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page-container admin-page">
            <meta name="robots" content="noindex, nofollow" />
            <title>Admin · Aullevo</title>
            <div className="account-dashboard">
                <header className="account-header">
                    <div className="account-identity-text">
                        <p className="account-eyebrow">Admin</p>
                        <h1 className="account-name">Payments &amp; Pro</h1>
                        <p className="account-email">Signed in as {user.email}</p>
                    </div>
                    <div className="admin-header-actions">
                        <button type="button" className="account-signout admin-refresh" onClick={load} disabled={loading}>
                            {loading ? 'Loading…' : 'Refresh'}
                        </button>
                        <button type="button" className="account-signout" onClick={() => signOut(auth)}>Sign out</button>
                    </div>
                </header>

                {error ? (
                    <section className="account-card">
                        <p className="plan-note plan-note--warn" role="alert">
                            {error.forbidden
                                ? `${user.email} is not an admin. Sign out and use the admin account.`
                                : error.message}
                        </p>
                    </section>
                ) : !data ? (
                    <div className="spinner" />
                ) : (
                    <>
                        <div className="admin-stats">
                            <div><strong>{pending.length}</strong><span>Pending</span></div>
                            <div><strong>{data.users.filter((u) => ['active', 'lifetime', 'open'].includes(proKind(u))).length}</strong><span>Pro users</span></div>
                            <div><strong>{data.users.length}</strong><span>Accounts</span></div>
                            <div className={openGrants ? 'is-warn' : undefined}><strong>{openGrants}</strong><span>No-expiry Pro</span></div>
                        </div>

                        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
                            {([['pending', `Pending (${pending.length})`], ['history', 'History'], ['users', 'Users']] as const).map(([id, label]) => (
                                <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : undefined} onClick={() => setTab(id)}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {notice && (
                            <p className={`plan-note ${notice.tone === 'error' ? 'plan-note--warn' : 'admin-notice-ok'}`} role="status" aria-live="polite">
                                {notice.text}
                            </p>
                        )}

                        {tab === 'pending' && (
                            <div className="admin-stack">
                                <p className="admin-help">
                                    PayPal and card payments wait here. Open the payment in PayPal, check the amount arrived, then approve.
                                    GCash, Maya, and QR Ph activate automatically and never appear here.
                                </p>
                                {!data.paypalApi && pending.some((c) => c.provider === 'paypal') && (
                                    <p className="plan-note admin-verify--manual admin-banner">
                                        Automatic PayPal checking is off, so every amount below must be checked by hand. Turn it on by adding
                                        your PayPal <strong>live Secret</strong> as <code>PAYPAL_CLIENT_SECRET</code> in Vercel, then redeploying.
                                    </p>
                                )}
                                {pending.length === 0 && (
                                    <section className="account-card"><p className="admin-empty">Nothing to review. 🎉</p></section>
                                )}
                                {pending.map((claim) => (
                                    <ClaimCard
                                        key={claim.id}
                                        claim={claim}
                                        user={usersById.get(claim.uid)}
                                        busy={busyId === claim.id}
                                        onApprove={approve}
                                        onReject={reject}
                                    />
                                ))}

                                {data.openCheckouts.length > 0 && (
                                    <section className="account-card">
                                        <div className="account-card-head"><h2>Unfinished GCash / Maya checkouts</h2></div>
                                        <p className="admin-help">
                                            Someone opened a PayMongo checkout but it was never marked paid. Usually they just left.
                                            “Check with PayMongo” activates Pro if they did pay, or clears it if it expired.
                                        </p>
                                        <ul className="admin-list">
                                            {data.openCheckouts.map((c) => (
                                                <li key={c.uid}>
                                                    <div>
                                                        <strong>{c.email || c.uid}</strong>
                                                        <span>{PLANS[c.plan].name} · started {fmt(c.createdAt)}</span>
                                                    </div>
                                                    <button type="button" className="admin-btn" disabled={busyId === c.uid} onClick={() => recheck(c)}>
                                                        {busyId === c.uid ? 'Checking…' : 'Check with PayMongo'}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}

                        {tab === 'history' && (
                            <section className="account-card">
                                {history.length === 0 ? <p className="admin-empty">No reviewed claims yet.</p> : (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Account</th><th>Paid</th><th>Result</th><th>Granted</th><th>Reviewed</th></tr>
                                            </thead>
                                            <tbody>
                                                {history.map((c) => (
                                                    <tr key={c.id}>
                                                        <td>{c.email}<small>{c.orderId}</small></td>
                                                        <td>{c.amount} {c.currency}<small>{fmt(c.createdAt)}</small></td>
                                                        <td>
                                                            <span className={`status-pill status-pill--${c.status === 'approved' ? 'pro' : 'expired'}`}>
                                                                {c.status === 'approved' ? `Approved${c.plan ? ` · ${PLANS[c.plan]?.name ?? c.plan}` : ''}` : 'Rejected'}
                                                            </span>
                                                            {c.reviewNote && <small>{c.reviewNote}</small>}
                                                        </td>
                                                        <td>{c.status === 'approved' ? (c.grantedUntil ? `Until ${fmtDay(c.grantedUntil)}` : 'No expiry') : '—'}</td>
                                                        <td>{fmt(c.reviewedAt)}{c.reviewedBy && <small>{c.reviewedBy}</small>}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}

                        {tab === 'users' && (
                            <section className="account-card">
                                <input
                                    type="search"
                                    className="admin-input admin-search"
                                    placeholder="Search email, name, or uid"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    aria-label="Search users"
                                />
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Account</th><th>Status</th><th>Plan</th><th>Joined</th></tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => {
                                                const kind = proKind(u);
                                                const pill = kind === 'free' ? 'free' : kind === 'expired' ? 'expired' : kind === 'open' ? 'pending' : 'pro';
                                                return (
                                                    <tr key={u.uid}>
                                                        <td>{u.email || '—'}<small>{u.uid}</small></td>
                                                        <td><span className={`status-pill status-pill--${pill}`}>{describePro(u)}</span></td>
                                                        <td>{u.subscriptionPlan ?? '—'}{u.lastPaymentProvider && <small>via {u.lastPaymentProvider}</small>}</td>
                                                        <td>{fmtDay(u.createdAt)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;
