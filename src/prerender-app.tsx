import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Documentation from './pages/Documentation';
import About from './pages/About';
import { GuidesIndex, GuideArticle } from './pages/Guides';
import { GUIDES } from './content/guides';
import { ThemeProvider } from './context/ThemeContext';

/**
 * Public content pages rendered to HTML at build time (scripts/build-policy-pages.mjs). The browser app
 * (createRoot in main.tsx) replaces this markup when it starts, so visitors get the normal interactive site,
 * while crawlers and readers without JavaScript get the full text. Unlike the policy documents, these pages
 * keep the site's analytics and AdSense tags.
 */
export const appPaths: string[] = ['/', '/features', '/how-it-works', '/docs', '/about', '/guides', ...GUIDES.map(g => `/guides/${g.slug}`)];

export function renderAppPage(path: string): string {
    return renderToString(
        <ThemeProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="features" element={<Features />} />
                        <Route path="how-it-works" element={<HowItWorks />} />
                        <Route path="docs" element={<Documentation />} />
                        <Route path="about" element={<About />} />
                        <Route path="guides" element={<GuidesIndex />} />
                        <Route path="guides/:slug" element={<GuideArticle />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </ThemeProvider>
    );
}
