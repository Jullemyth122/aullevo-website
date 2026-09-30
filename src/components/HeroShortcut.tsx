import React, { useCallback, useEffect, useRef, useState } from 'react';

interface HeroShortcutProps {
    /** Fired when the visitor presses Alt+Shift+L (or clicks the keycaps). */
    onTrigger: () => void;
}

type KeyId = 'alt' | 'shift' | 'l';
type HeldKeys = Record<KeyId, boolean>;

const KEYS: { id: KeyId; label: string }[] = [
    { id: 'alt', label: 'Alt' },
    { id: 'shift', label: 'Shift' },
    { id: 'l', label: 'L' },
];

const NONE_HELD: HeldKeys = { alt: false, shift: false, l: false };

const isTypingTarget = (el: EventTarget | null) =>
    el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Keycaps for the Aullevo shortcut. They light up as the real keys are held, and
 * pressing the full combo (or clicking) runs the autofill demo.
 *
 * The installed Aullevo extension registers Alt+Shift+L itself, and Windows can use
 * Alt+Shift to switch keyboard layouts. Either one can swallow the "L" keydown before
 * the page sees it, so the combo is also detected on the "L" keyup.
 */
const HeroShortcut: React.FC<HeroShortcutProps> = ({ onTrigger }) => {
    const [held, setHeld] = useState<HeldKeys>(NONE_HELD);
    const [fired, setFired] = useState(false);
    const heldRef = useRef<HeldKeys>(NONE_HELD);
    const lastFire = useRef(0);
    const timers = useRef<number[]>([]);

    const updateHeld = useCallback((next: HeldKeys) => {
        heldRef.current = next;
        setHeld(next);
    }, []);

    const fire = useCallback(() => {
        const now = Date.now();
        if (now - lastFire.current < 600) return;
        lastFire.current = now;
        onTrigger();
        setFired(true);
        timers.current.push(window.setTimeout(() => setFired(false), 2600));
    }, [onTrigger]);

    useEffect(() => {
        const keyOf = (e: KeyboardEvent): KeyId | null =>
            e.key === 'Alt' ? 'alt' : e.key === 'Shift' ? 'shift' : e.code === 'KeyL' ? 'l' : null;

        const isCombo = (e: KeyboardEvent) =>
            e.code === 'KeyL' && ((e.altKey && e.shiftKey) || (heldRef.current.alt && heldRef.current.shift));

        const onDown = (e: KeyboardEvent) => {
            if (isTypingTarget(e.target)) return;
            const k = keyOf(e);
            if (k && !heldRef.current[k]) updateHeld({ ...heldRef.current, [k]: true });
            if (isCombo(e) && !e.repeat) fire();
        };

        const onUp = (e: KeyboardEvent) => {
            if (!isTypingTarget(e.target) && isCombo(e)) fire();
            const k = keyOf(e);
            if (k) updateHeld({ ...heldRef.current, [k]: false });
        };

        const reset = () => updateHeld(NONE_HELD);

        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        window.addEventListener('blur', reset);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('blur', reset);
        };
    }, [fire, updateHeld]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((t) => window.clearTimeout(t));
    }, []);

    // Clicking plays the key presses in sequence, then fires
    const handleClick = () => {
        KEYS.forEach(({ id }, i) => {
            timers.current.push(
                window.setTimeout(() => updateHeld({ ...heldRef.current, [id]: true }), i * 110),
            );
        });
        timers.current.push(
            window.setTimeout(() => {
                fire();
                timers.current.push(window.setTimeout(() => updateHeld(NONE_HELD), 260));
            }, KEYS.length * 110),
        );
    };

    return (
        <div className={`hero-shortcut${fired ? ' is-fired' : ''}`}>
            <button
                type="button"
                className="hero-shortcut__keys"
                onClick={handleClick}
                aria-label="Try the Alt+Shift+L autofill shortcut"
            >
                {KEYS.map(({ id, label }, i) => (
                    <React.Fragment key={id}>
                        {i > 0 && <span className="hero-shortcut__plus">+</span>}
                        <kbd className={`hero-key${held[id] ? ' is-down' : ''}`}>{label}</kbd>
                    </React.Fragment>
                ))}
            </button>
            <span className="hero-shortcut__hint" aria-live="polite">
                {fired ? 'Filling the demo form below' : 'Try it: press the shortcut'}
            </span>
        </div>
    );
};

export default HeroShortcut;
