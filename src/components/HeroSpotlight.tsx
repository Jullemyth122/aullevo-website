import React, { useEffect, useRef } from 'react';

const LENS = 560;

/**
 * Minimal hero backdrop: the Aullevo triangle lattice, revealed only in a soft
 * spotlight that follows the mouse. The lens is a fixed-size layer moved with a
 * transform (composited), and only its own small area repaints to keep the lattice
 * pinned in place — the rest of the hero is never repainted on pointer move.
 */
const HeroSpotlight: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const lensRef = useRef<HTMLDivElement>(null);
    const latticeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = ref.current;
        const section = root?.parentElement;
        const lens = lensRef.current;
        const lattice = latticeRef.current;
        if (!root || !section || !lens || !lattice) return;

        let frame = 0;
        let x = 0;
        let y = 0;
        let rect: DOMRect | null = null;

        const apply = () => {
            frame = 0;
            const lx = x - LENS / 2;
            const ly = y - LENS / 2;
            lens.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
            const pos = `${-lx}px ${-ly}px`;
            lattice.style.maskPosition = pos;
            lattice.style.webkitMaskPosition = pos;
        };

        const onEnter = () => {
            rect = section.getBoundingClientRect();
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            if (!rect) rect = section.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            root.classList.add('is-active');
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onLeave = () => {
            root.classList.remove('is-active');
            rect = null;
        };
        // The cached rect goes stale on scroll/resize
        const invalidate = () => {
            rect = null;
        };

        section.addEventListener('pointerenter', onEnter);
        section.addEventListener('pointermove', onMove, { passive: true });
        section.addEventListener('pointerleave', onLeave);
        window.addEventListener('scroll', invalidate, { passive: true });
        window.addEventListener('resize', invalidate);
        return () => {
            cancelAnimationFrame(frame);
            section.removeEventListener('pointerenter', onEnter);
            section.removeEventListener('pointermove', onMove);
            section.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('scroll', invalidate);
            window.removeEventListener('resize', invalidate);
        };
    }, []);

    return (
        <div ref={ref} className="hero-spotlight" aria-hidden="true">
            <div ref={lensRef} className="hero-spotlight__lens">
                <div ref={latticeRef} className="hero-spotlight__lattice" />
            </div>
        </div>
    );
};

export default HeroSpotlight;
