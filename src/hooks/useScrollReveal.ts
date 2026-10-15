import { useEffect } from 'react';

const STAGGER_MS = 90;

/**
 * Scroll reveals + offscreen animation pausing for a page, driven by
 * IntersectionObserver (no scroll listeners, no layout reads).
 *
 * - `[data-reveal]` elements start hidden (see `_reveal.scss`) and play a compositor-only
 *   rise-in when they enter the viewport. Elements entering together cascade in document
 *   order. Once finished, the attribute is removed so the element's own transitions and
 *   hover transforms take over again.
 * - `[data-anim-scope]` containers get `.is-offscreen` while out of view, which pauses
 *   their decorative CSS animations.
 */
export function useScrollReveal(root: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = root.current;
        if (!el || !('IntersectionObserver' in window)) {
            el?.querySelectorAll('[data-reveal]').forEach((n) => n.removeAttribute('data-reveal'));
            return;
        }

        const finish = (target: HTMLElement) => {
            target.removeAttribute('data-reveal');
            target.classList.remove('is-revealed');
            target.style.removeProperty('--reveal-delay');
        };

        const reveal = new IntersectionObserver(
            (entries) => {
                entries
                    .filter((e) => e.isIntersecting)
                    .map((e) => e.target as HTMLElement)
                    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
                    .forEach((target, i) => {
                        reveal.unobserve(target);
                        target.style.setProperty('--reveal-delay', `${i * STAGGER_MS}ms`);
                        target.classList.add('is-revealed');
                        const onEnd = (e: AnimationEvent) => {
                            if (e.target !== target || e.animationName !== 'revealRise') return;
                            target.removeEventListener('animationend', onEnd);
                            finish(target);
                        };
                        target.addEventListener('animationend', onEnd);
                    });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
        );

        const scopes = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
            { rootMargin: '150px 0px' },
        );

        el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((n) => reveal.observe(n));
        el.querySelectorAll<HTMLElement>('[data-anim-scope]').forEach((n) => scopes.observe(n));

        return () => {
            reveal.disconnect();
            scopes.disconnect();
        };
    }, [root]);
}
