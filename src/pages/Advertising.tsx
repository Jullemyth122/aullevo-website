import SEO from '../components/SEO';
import { PASS_ADS, PASS_HOURS } from '../config/rewards';

export default function Advertising() {
    return (
        <div className="legal-page">
            <SEO title="Advertising & Optional Rewards | Aullevo" description="How Aullevo's website advertising, optional reward passes, test promotions, and privacy choices work." canonicalPath="/advertising" />
            <header className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper"><span className="legal-badge">Advertising &amp; your choices</span></div>
                    <h1 className="legal-title">Understand ads and rewards</h1>
                    <p>Last updated October 19, 2026</p>
                </div>
            </header>
            <main className="container policy-readable legal-content">
                <section className="legal-section" id="website-ads">
                    <h2>Advertising on the website</h2>
                    <p>Aullevo uses Google AdSense code on its main website. Ad availability depends on Google's approval, advertiser demand, and your privacy choices. The extension itself does not load advertising code. Our privacy, terms, contact, and advertising-information pages are published without advertising or analytics scripts.</p>
                    <p>Ads are separate from Aullevo's product information. An advertiser's offer is not an endorsement by Aullevo, and visiting an advertiser is your choice.</p>
                </section>
                <section className="legal-section" id="optional-rewards">
                    <h2>Optional reward passes</h2>
                    <p>The Free plan includes daily allowances without watching ads. If you choose a reward pass, completing {PASS_ADS} rewarded ads on the <a className="legal-link" href="/rewards">rewards page</a> unlocks all features for {PASS_HOURS} hours. The second completion must follow within an hour of the first; another completed pair adds {PASS_HOURS} hours.</p>
                    <p>The choice is yours: you can decline or close a rewarded ad and keep the Free plan. An unfinished ad does not count toward the pass. Passes belong to your signed-in Aullevo account, cannot be transferred, and have no cash value.</p>
                    <p><strong>Clicks are never required.</strong> Clicking a banner or an advertiser's link does not unlock a pass. Rewards apply only to the clearly offered rewarded flow, not ordinary display ads. Please do not use bots or artificial views or clicks.</p>
                </section>
                <section className="legal-section" id="test-promotions">
                    <h2>Test promotions</h2>
                    <p>When live rewarded advertising is not connected, the rewards page can show an Aullevo test promotion with a countdown. It is labelled as a test, is not a paid Google ad, and generates no Google advertising revenue. Completing the test can still grant the stated Aullevo pass.</p>
                </section>
                <section className="legal-section" id="privacy-choices">
                    <h2>Cookies and privacy choices</h2>
                    <p>Google and its partners may use cookies or identifiers for advertising, measurement, and fraud prevention. Read our <a className="legal-link" href="/privacy#cookies">cookie and advertising disclosure</a> for details and opt-out links.</p>
                    <p>If Google presents a consent message, use its controls to accept, decline, or manage the available purposes. The main website's “Privacy &amp; cookie settings” link reopens Google's consent controls when available; otherwise it opens the cookie disclosure. These information pages do not load that consent message or advertising tags.</p>
                </section>
                <section className="legal-section" id="questions">
                    <h2>Questions or concerns?</h2>
                    <p><a className="legal-link" href="/contact#report">Contact Aullevo</a> to report an advertising issue or ask about a reward. Your <a className="legal-link" href="/terms#pro-payments">plan and payment terms</a> explain what happens when a pass expires.</p>
                </section>
            </main>
        </div>
    );
}
