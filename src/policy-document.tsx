import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import Advertising from './pages/Advertising';

const pages = { privacy: PrivacyPolicy, terms: TermsOfService, contact: Contact, advertising: Advertising };
export const policyPaths = Object.keys(pages) as Array<keyof typeof pages>;

/** Public policy documents work without JavaScript and never import the app's ad/analytics tags. */
export function renderPolicyDocument(path: keyof typeof pages, stylesheets: string[]) {
    const Page = pages[path];
    return '<!doctype html>\n' + renderToStaticMarkup(
        <html lang="en" className="policy-document-root">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="index, follow" />
                <meta name="google-adsense-account" content="ca-pub-4867997588858944" />
                <link rel="icon" href="/icon48.png" type="image/png" />
                {stylesheets.map(href => <link key={href} rel="stylesheet" href={href} />)}
            </head>
            <body className="policy-document">
                <a className="policy-skip" href="#document-content">Skip to content</a>
                <header className="policy-document-nav">
                    <nav className="container" aria-label="Main navigation">
                        <a href="/" className="policy-brand"><img src="/icon48.png" width="28" height="28" alt="" /> Aullevo</a>
                        <a href="/docs">Documentation</a>
                        <a href="/guides">Guides</a>
                        <a href="/contact" aria-current={path === 'contact' ? 'page' : undefined}>Contact</a>
                        <a href="/">Back to website</a>
                    </nav>
                </header>
                <div id="document-content">
                    <MemoryRouter initialEntries={['/' + path]}><Page /></MemoryRouter>
                </div>
                <footer className="policy-document-footer container">
                    <p>© {new Date().getFullYear()} Aullevo</p>
                    <nav aria-label="Policies and support">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                        <a href="/advertising">Advertising</a>
                        <a href="/contact">Contact</a>
                    </nav>
                </footer>
            </body>
        </html>
    );
}
