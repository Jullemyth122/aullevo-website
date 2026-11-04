import SEO from '../components/SEO';

export default function Advertising() {
    return (
        <div className="legal-page">
            <SEO title="Advertising & Your Choices | Aullevo" description="How advertising works on the Aullevo website, what Aullevo does not do with ads, and how to manage your privacy choices." canonicalPath="/advertising" />
            <header className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper"><span className="legal-badge">Advertising &amp; your choices</span></div>
                    <h1 className="legal-title">How advertising works on Aullevo</h1>
                    <p>Last updated November 4, 2026</p>
                </div>
            </header>
            <main className="container policy-readable legal-content">
                <section className="legal-section" id="website-ads">
                    <h2>Advertising on the website</h2>
                    <p>Aullevo uses Google AdSense on its main website to help pay for hosting and development, which keeps the Free plan free. Ad availability depends on Google's approval, advertiser demand, and your privacy choices. Our privacy, terms, contact, and advertising-information pages are published without advertising or analytics scripts.</p>
                    <p>Ads are clearly separate from Aullevo's own product information. An advertiser's offer is not an endorsement by Aullevo, and visiting an advertiser is entirely your choice.</p>
                </section>
                <section className="legal-section" id="extension">
                    <h2>The extension never shows ads</h2>
                    <p>The Aullevo browser extension does not load advertising code, does not insert ads into the pages you visit, and never sends your saved profiles, form answers, or AI provider API keys to advertising networks.</p>
                </section>
                <section className="legal-section" id="no-rewards">
                    <h2>No rewards for viewing or clicking ads</h2>
                    <p>Aullevo does not pay, reward, or unlock features for viewing or clicking ads. Your Free plan allowances and Aullevo Pro do not depend on ads in any way. Please only click an ad if you are genuinely interested in what it offers, and never use bots or tools that generate artificial views or clicks.</p>
                </section>
                <section className="legal-section" id="privacy-choices">
                    <h2>Cookies and privacy choices</h2>
                    <p>Google and its partners may use cookies or identifiers for advertising, measurement, and fraud prevention. Read our <a className="legal-link" href="/privacy#cookies">cookie and advertising disclosure</a> for details and opt-out links.</p>
                    <p>If Google presents a consent message, use its controls to accept, decline, or manage the available purposes. The main website's “Privacy &amp; cookie settings” link reopens Google's consent controls when available; otherwise it opens the cookie disclosure. These information pages do not load that consent message or advertising tags.</p>
                </section>
                <section className="legal-section" id="questions">
                    <h2>Questions or concerns?</h2>
                    <p><a className="legal-link" href="/contact#report">Contact Aullevo</a> to report a misleading or inappropriate ad, or to ask how advertising works on this site.</p>
                </section>
            </main>
        </div>
    );
}
