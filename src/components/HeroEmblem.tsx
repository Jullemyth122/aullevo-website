import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface HeroEmblemProps {
    /** Receives a function that plays the "fire" animation (used by the hero shortcut). */
    playRef?: React.RefObject<(() => void) | null>;
}

// The Aullevo mark, rebuilt from its parts (800×800 logo space)
const A_BODY = 'M405 75 L656 575 L648 675 L405 187 L183 625 L320 625 L295 675 L100 675 Z';
const E_BARS = ['M540 360 H655 L637 400 H560 Z', 'M575 430 H670 L653 465 H592 Z'];
const V_ARM = 'M648 675 L656 575 L708 465 H748 Z';
const O = { cx: 403, cy: 489, r: 98, w: 40 };

// Each letterform: its solid fill plus the outlines the light traces (draw order = --i)
type Piece = { layer: 'a' | 'o' | 'e' | 'v'; fill: React.ReactElement[]; outlines: React.ReactElement[] };
const PIECES: Piece[] = [
    { layer: 'a', fill: [<path key="f" d={A_BODY} />], outlines: [<path key="t" d={A_BODY} />] },
    {
        layer: 'o',
        fill: [<circle key="f" className="he-ring" cx={O.cx} cy={O.cy} r={O.r} />],
        outlines: [
            <circle key="t1" cx={O.cx} cy={O.cy} r={O.r + O.w / 2} />,
            <circle key="t2" cx={O.cx} cy={O.cy} r={O.r - O.w / 2} />,
        ],
    },
    { layer: 'e', fill: E_BARS.map((d) => <path key={d} d={d} />), outlines: E_BARS.map((d) => <path key={d} d={d} />) },
    { layer: 'v', fill: [<path key="f" d={V_ARM} />], outlines: [<path key="t" d={V_ARM} />] },
];

type SvgEl = React.ReactElement<React.SVGProps<SVGElement>>;
const withClass = (el: React.ReactElement, className: string, extra?: React.SVGProps<SVGElement>) =>
    React.cloneElement(el as SvgEl, {
        className: [(el as SvgEl).props.className, className].filter(Boolean).join(' '),
        ...extra,
    });

/**
 * Hero emblem: the Aullevo mark, rebuilt from its parts. The intro (a light tracing
 * every outline, the solid mark materialising from it) and the recurring edge glint are
 * pure CSS, so they cost no JavaScript and never wait on the main thread. GSAP only
 * handles what the visitor triggers: the pointer tilt and the click / shortcut pulse.
 */
const HeroEmblem: React.FC<HeroEmblemProps> = ({ playRef }) => {
    const rootRef = useRef<HTMLDivElement>(null);

    // Pointer → CSS variables (--px / --py) that drive the tilt and per-letter depth.
    // Tweens are created on the first mouse move, never during page load.
    useEffect(() => {
        const root = rootRef.current;
        const section = root?.closest('.hero') as HTMLElement | null;
        if (!root || !section) return;

        let toX: ((v: number) => void) | null = null;
        let toY: ((v: number) => void) | null = null;

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            if (!toX || !toY) {
                toX = gsap.quickTo(root, '--px', { duration: 1, ease: 'power3.out' });
                toY = gsap.quickTo(root, '--py', { duration: 1, ease: 'power3.out' });
            }
            // Viewport-relative, so no layout reads on pointermove
            toX((e.clientX / window.innerWidth) * 2 - 1);
            toY((e.clientY / window.innerHeight) * 2 - 1);
        };
        const onLeave = () => {
            toX?.(0);
            toY?.(0);
        };

        section.addEventListener('pointermove', onMove, { passive: true });
        section.addEventListener('pointerleave', onLeave);
        return () => {
            section.removeEventListener('pointermove', onMove);
            section.removeEventListener('pointerleave', onLeave);
            gsap.killTweensOf(root);
        };
    }, []);

    // Recurring glint: a short one-off CSS animation every few seconds, so the mark is
    // completely idle in between (skipped while the tab is hidden or the hero is off-screen)
    useEffect(() => {
        const root = rootRef.current;
        const hero = root?.closest('.hero');
        if (!root || !hero) return;
        let next = 0;
        let clear = 0;
        const glint = () => {
            if (!document.hidden && !hero.classList.contains('is-offscreen')) {
                root.classList.add('is-glinting');
                clear = window.setTimeout(() => root.classList.remove('is-glinting'), 2300);
            }
            next = window.setTimeout(glint, 7000);
        };
        next = window.setTimeout(glint, 3800);
        return () => {
            window.clearTimeout(next);
            window.clearTimeout(clear);
        };
    }, []);

    // Click / shortcut: a fast pass of light through the mark, a pulse and one ripple
    const fire = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        const traces = root.querySelectorAll('.he-trace');
        const btn = root.querySelector('.hero-emblem__btn');
        const ripple = root.querySelector('.hero-emblem__ripple');
        gsap.killTweensOf([traces, btn, ripple]);

        gsap.timeline()
            .fromTo(traces, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: 'power3.inOut', stagger: 0.03 }, 0)
            .to(traces, { opacity: 0, duration: 0.7, ease: 'power1.out', clearProps: 'opacity,strokeDashoffset' }, 0.6)
            .fromTo(btn, { scale: 1 }, { scale: 1.05, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1, clearProps: 'transform' }, 0.45)
            .fromTo(ripple, { scale: 0.6, opacity: 0.5 }, { scale: 2.1, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity' }, 0.5);
    }, []);

    useLayoutEffect(() => {
        if (!playRef) return;
        playRef.current = fire;
        return () => {
            playRef.current = null;
        };
    }, [playRef, fire]);

    return (
        <div className="hero-emblem" data-hero="emblem" ref={rootRef} style={{ '--px': 0, '--py': 0 } as React.CSSProperties}>
            <div className="hero-emblem__aura" aria-hidden="true" />
            <span className="hero-emblem__ripple" aria-hidden="true" />

            <div className="hero-emblem__float">
                <button type="button" className="hero-emblem__btn" onClick={fire} aria-label="Aullevo logo: click to replay">
                    <svg className="hero-emblem__mark" viewBox="74 25 700 700" aria-hidden="true">
                        <defs>
                            <linearGradient id="he-fill" gradientUnits="userSpaceOnUse" x1="180" y1="90" x2="700" y2="680">
                                <stop offset="0%" className="he-stop-1" />
                                <stop offset="50%" className="he-stop-2" />
                                <stop offset="100%" className="he-stop-3" />
                            </linearGradient>
                        </defs>

                        {(() => {
                            let order = 0;
                            return PIECES.map((piece) => (
                                <g key={piece.layer} className={`he-layer he-layer--${piece.layer}`}>
                                    {piece.fill.map((el) => withClass(el, 'he-fill'))}
                                    {/* Light that draws the mark in, and the pale glint that recurs over it */}
                                    {piece.outlines.map((el) => {
                                        const i = order++;
                                        const style = { '--i': i } as React.CSSProperties;
                                        return (
                                            <React.Fragment key={i}>
                                                {withClass(el, 'he-trace', { pathLength: 1, style, key: `t${i}` })}
                                                {withClass(el, 'he-glint', { pathLength: 1, style, key: `g${i}` })}
                                            </React.Fragment>
                                        );
                                    })}
                                </g>
                            ));
                        })()}
                    </svg>
                </button>
            </div>

            <div className="hero-emblem__floor" aria-hidden="true" />
        </div>
    );
};

export default HeroEmblem;
