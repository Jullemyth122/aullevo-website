import SEO from '../components/SEO';
import { PRIVACY_EMAIL, SUPPORT_EMAIL } from '../config/contact';

export default function Contact() {
    return (
        <div className="legal-page">
            <SEO title="Contact & Support | Aullevo" description="Contact Aullevo for extension help, payment problems, privacy requests, or an issue with website content or advertising." canonicalPath="/contact" />
            <header className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper"><span className="legal-badge">Aullevo Support</span></div>
                    <h1 className="legal-title">How can we help?</h1>
                    <p>Help with your extension, account, payments, and privacy.</p>
                </div>
            </header>
            <main className="container policy-readable legal-content">
                <section className="legal-section" id="support">
                    <h2>Extension and account support</h2>
                    <p>Email <a className="legal-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your browser, extension version, what you tried, and what happened. You can find setup steps and troubleshooting in our <a className="legal-link" href="/docs">documentation</a>.</p>
                    <p>If you include a screenshot, remove personal information and form answers first. Never send passwords, API keys, sign-in tokens, or full payment-card details.</p>
                </section>
                <section className="legal-section" id="payments">
                    <h2>Payments and Pro activation</h2>
                    <p>If Pro has not activated, or you were charged by mistake, email support with your transaction or payment ID and the email address on your Aullevo account. Our <a className="legal-link" href="/terms#pro-payments">payment and refund terms</a> explain activation and how payment problems are handled.</p>
                    <p>Monthly and yearly Pro plans do not renew automatically. You choose whether to purchase more time.</p>
                </section>
                <section className="legal-section" id="privacy">
                    <h2>Privacy and account deletion</h2>
                    <p>For a privacy question, a request to access your account records, or account deletion, email <a className="legal-link" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Use the email address associated with your account so we can help identify the request.</p>
                    <p>Your saved extension profiles remain on your device. See the <a className="legal-link" href="/privacy#user-control">privacy policy</a> for local deletion controls and account-record retention.</p>
                </section>
                <section className="legal-section" id="report">
                    <h2>Report a content or advertising issue</h2>
                    <p>Send support the page URL, a description, and the approximate time of the issue. To report a misleading or inappropriate ad, use its own reporting control when available; you do not need to click the advertised website. Read <a className="legal-link" href="/advertising">how advertising and optional rewards work</a>.</p>
                </section>
            </main>
        </div>
    );
}
