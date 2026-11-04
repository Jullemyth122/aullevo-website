import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { GUIDES, findGuide, type GuideBlock } from '../content/guides';

const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export function GuidesIndex() {
    return (
        <div className="legal-page guides-page">
            <SEO title="Guides: Faster, Safer Online Forms | Aullevo" description="Practical guides on filling job applications, government forms, and online paperwork faster and more safely, from the team behind Aullevo." canonicalPath="/guides" />
            <header className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper"><span className="legal-badge">Guides</span></div>
                    <h1 className="legal-title">Guides for faster, safer online forms</h1>
                    <p>Practical advice for job applications, government paperwork, and everyday forms, whether or not you use Aullevo.</p>
                </div>
            </header>
            <main className="container policy-readable legal-content">
                <ul className="guides-list">
                    {GUIDES.map(g => (
                        <li key={g.slug} className="legal-section">
                            <h2><Link className="legal-link" to={`/guides/${g.slug}`}>{g.title}</Link></h2>
                            <p>{g.description}</p>
                            <p className="guide-meta">{formatDate(g.published)} · {g.readMinutes} min read</p>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

function Block({ block }: { block: GuideBlock }) {
    switch (block.type) {
        case 'h2': return <h2>{block.text}</h2>;
        case 'p': return <p>{block.text}</p>;
        case 'tip': return <p className="guide-tip"><strong>Tip: </strong>{block.text}</p>;
        case 'ul': return <ul>{block.items.map(i => <li key={i}>{i}</li>)}</ul>;
        case 'ol': return <ol>{block.items.map(i => <li key={i}>{i}</li>)}</ol>;
    }
}

export function GuideArticle() {
    const { slug } = useParams();
    const guide = findGuide(slug);
    if (!guide) {
        return (
            <div className="legal-page">
                <main className="container policy-readable legal-content">
                    <h1 className="legal-title">Guide not found</h1>
                    <p><Link className="legal-link" to="/guides">See all guides</Link></p>
                </main>
            </div>
        );
    }
    const others = GUIDES.filter(g => g.slug !== guide.slug).slice(0, 3);
    return (
        <div className="legal-page guides-page">
            <SEO title={`${guide.title} | Aullevo Guides`} description={guide.description} canonicalPath={`/guides/${guide.slug}`} ogType="article" />
            <header className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper"><Link className="legal-badge" to="/guides">Guides</Link></div>
                    <h1 className="legal-title">{guide.title}</h1>
                    <p>{formatDate(guide.published)} · {guide.readMinutes} min read · By the Aullevo team</p>
                </div>
            </header>
            <main className="container policy-readable legal-content">
                <article className="legal-section guide-article">
                    {guide.body.map((block, i) => <Block key={i} block={block} />)}
                </article>
                <aside className="legal-section">
                    <h2>More guides</h2>
                    <ul>
                        {others.map(g => <li key={g.slug}><Link className="legal-link" to={`/guides/${g.slug}`}>{g.title}</Link></li>)}
                    </ul>
                </aside>
            </main>
        </div>
    );
}
