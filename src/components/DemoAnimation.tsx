import React, { useState, useEffect, useRef, useCallback } from 'react';
import AullevoLatticeShader from './AullevoLatticeShader';

// Crisp inline SVG icons matching rebuilt extension and curated platforms
const ZapIcon = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const UsersIcon = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const BotIcon = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const ShieldIcon = ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const LockIcon = ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CheckCircleIcon = ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const RefreshIcon = ({ size = 11 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
    </svg>
);

const SaveIcon = ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const BriefcaseIcon = ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const FileTextIcon = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const GoogleFormsIcon = ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
);

const MicrosoftIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 1h10v10H1zM13 1h10v10H13zM1 13h10v10H1zM13 13h10v10H13z" />
    </svg>
);

const MaximizeIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

export type TestSampleId = 'workday' | 'google' | 'microsoft' | 'indeed' | 'gov';

export interface CuratedTestMeta {
    id: TestSampleId;
    name: string;
    url: string;
    fieldCount: number;
    profilePill: string;
    profileName: string;
    profileSub: string;
}

const TEST_METAS: Record<TestSampleId, CuratedTestMeta> = {
    workday: {
        id: 'workday',
        name: 'Workday',
        url: 'apply.workday.com/c/acme/jobs/senior-full-stack-engineer',
        fieldCount: 5,
        profilePill: 'JOB',
        profileName: 'Julian Mythic — Senior Dev',
        profileSub: '8 fields • 1 doc ready',
    },
    google: {
        id: 'google',
        name: 'Google Forms',
        url: 'docs.google.com/forms/d/e/1FAIpQLSc-AullevoTechEval/viewform',
        fieldCount: 4,
        profilePill: 'DEV',
        profileName: 'Julian Mythic — Tech & Dev Profile',
        profileSub: '6 fields • Dev Profile',
    },
    microsoft: {
        id: 'microsoft',
        name: 'Microsoft Forms',
        url: 'forms.office.com/r/ContosoWorkspaceEquipment2026',
        fieldCount: 5,
        profilePill: 'CORP',
        profileName: 'Julian Mythic — Contoso Corp',
        profileSub: '7 fields • Corporate SSO',
    },
    indeed: {
        id: 'indeed',
        name: 'Indeed Apply',
        url: 'indeed.com/apply/v2/viewjob?jk=98a7bc4e021a&from=vj',
        fieldCount: 5,
        profilePill: 'CAREER',
        profileName: 'Julian Mythic — Career Profile',
        profileSub: '9 fields • Verified Indeed',
    },
    gov: {
        id: 'gov',
        name: 'Gov / Tax W-9',
        url: 'portal.gov/taxpayer/w9-certification-and-vendor-id',
        fieldCount: 5,
        profilePill: 'TAX',
        profileName: 'Julian Mythic — Tax & Legal',
        profileSub: '5 fields • Encrypted Local',
    },
};

interface DemoAnimationProps {
    /** Receives a function that re-runs the autofill on the active sample (used by the hero shortcut). */
    triggerRef?: React.RefObject<(() => void) | null>;
}

const DemoAnimation: React.FC<DemoAnimationProps> = ({ triggerRef }) => {
    // Current step in the sequence
    const [step, setStep] = useState(0);
    const [activeSampleId, setActiveSampleId] = useState<TestSampleId>('workday');
    const [demoWidth, setDemoWidth] = useState<'standard' | 'wide' | 'expanded'>('wide');
    const [userTabOverride, setUserTabOverride] = useState<'fill' | 'profiles' | 'settings' | null>(null);

    // Timeout tracker ref to guarantee clean cancellation with zero collisions
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const currentMeta = TEST_METAS[activeSampleId];

    // Precision DOM element targeting refs
    const containerRef = useRef<HTMLDivElement>(null);
    // Off-screen, the tour keeps stepping but never measures: each getBoundingClientRect would
    // force a layout of the (content-visibility skipped) demo. The observer reports the real
    // state as soon as it's attached, so this starts false.
    const demoVisibleRef = useRef(false);
    const cursorRef = useRef<HTMLDivElement>(null);

    // Chrome scene refs
    const loadUnpackedBtnRef = useRef<HTMLButtonElement>(null);
    const extCardToggleRef = useRef<HTMLDivElement>(null);
    const toolbarExtIconRef = useRef<HTMLDivElement>(null);

    // Test bench button refs for mouse to click on!
    const workdayPillRef = useRef<HTMLButtonElement>(null);
    const googlePillRef = useRef<HTMLButtonElement>(null);
    const microsoftPillRef = useRef<HTMLButtonElement>(null);
    const indeedPillRef = useRef<HTMLButtonElement>(null);
    const govPillRef = useRef<HTMLButtonElement>(null);

    // Sidebar panel refs
    const settingsTabBtnRef = useRef<HTMLButtonElement>(null);
    const aiFillToggleRef = useRef<HTMLDivElement>(null);
    const profilesTabBtnRef = useRef<HTMLButtonElement>(null);
    const saveProfileBtnRef = useRef<HTMLButtonElement>(null);
    const autofillTabBtnRef = useRef<HTMLButtonElement>(null);
    const heroFillBtnRef = useRef<HTMLButtonElement>(null);

    // Dynamic field targeting refs inside active forms
    const activeFieldRef1 = useRef<HTMLDivElement>(null);
    const activeFieldRef2 = useRef<HTMLDivElement>(null);
    const activeFieldRef3 = useRef<HTMLDivElement>(null);

    // Coordinates for RAF 60fps lerp cursor
    const currentPos = useRef<{ x: number; y: number }>({ x: 280, y: 320 });
    const targetPos = useRef<{ x: number; y: number }>({ x: 280, y: 320 });

    const clearAllTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    // ── MASTER AUTOMATED TOUR SEQUENCE ──
    const startMasterTour = useCallback(() => {
        clearAllTimers();
        setUserTabOverride(null);

        const schedule = (fn: () => void, delay: number) => {
            const t = setTimeout(fn, delay);
            timersRef.current.push(t);
        };

        // --- Scene 1: Chrome Extensions Installation ---
        setStep(0);
        setActiveSampleId('workday');

        schedule(() => setStep(1), 800);    // Lerp to "Load unpacked"
        schedule(() => setStep(2), 1700);   // Click "Load unpacked"
        schedule(() => setStep(3), 2200);   // Aullevo appears
        schedule(() => setStep(4), 3000);   // Lerp to toggle
        schedule(() => setStep(5), 3700);   // Click toggle — Aullevo enabled!

        // --- Scene 2: Load Workday Candidate Portal ---
        schedule(() => {
            setActiveSampleId('workday');
            setStep(6);                     // Crossfade to Workday
        }, 4600);
        schedule(() => setStep(7), 5400);   // Lerp to toolbar icon
        schedule(() => setStep(8), 6200);   // Click icon -> Sidebar opens!

        // --- Scene 3: Settings Tab ---
        schedule(() => setStep(9), 7000);   // Lerp to Settings tab & click
        schedule(() => setStep(10), 8000);  // Showcase AI Smart Fill

        // --- Scene 4: Profiles Tab ---
        schedule(() => setStep(11), 8800);  // Lerp to Profiles tab & click
        schedule(() => setStep(12), 9800);  // Click Save Profile "Saved ✓"

        // --- Scene 5: Fill Workday Form ---
        schedule(() => setStep(13), 10800); // Lerp to Autofill tab & click
        schedule(() => setStep(14), 11600); // Lerp to Hero Fill Button (JOB)
        schedule(() => setStep(15), 12500); // Click Hero Fill Button!
        schedule(() => setStep(16), 13000); // Shimmer scanning starts
        schedule(() => setStep(17), 13700); // Workday Fields 1 & 2 fill
        schedule(() => setStep(18), 14500); // Workday Fields 3, 4, 5 fill
        schedule(() => setStep(19), 15300); // Success! "Filled 5 Fields!"

        // --- Scene 6: Demo animates to Google Forms! ---
        schedule(() => setStep(21), 17200); // Lerp UP to Google Forms pill in top bar!
        schedule(() => {
            setStep(22);                    // Click Google Forms pill!
            setActiveSampleId('google');    // URL -> docs.google.com, Page -> Authentic Google Forms!
        }, 18300);
        schedule(() => setStep(23), 19400); // Lerp down to Amber Fill Button (DEV)
        schedule(() => setStep(24), 20300); // Click Fill Button!
        schedule(() => setStep(25), 20800); // Google Cards shimmer scanning
        schedule(() => setStep(26), 21600); // Google questions fill!
        schedule(() => setStep(27), 22600); // Success! "Filled 4 Fields!"

        // --- Scene 7: Demo animates to Microsoft Forms! ---
        schedule(() => setStep(28), 24400); // Lerp UP to Microsoft Forms pill!
        schedule(() => {
            setStep(29);                    // Click Microsoft Forms pill!
            setActiveSampleId('microsoft'); // URL -> forms.office.com, Page -> Authentic MS Forms!
        }, 25500);
        schedule(() => setStep(30), 26600); // Lerp to Amber Fill Button (CORP)
        schedule(() => setStep(31), 27500); // Click Fill Button!
        schedule(() => setStep(32), 28000); // Fluent questions fill!
        schedule(() => setStep(33), 29100); // Success! "Filled 5 Fields!"

        // --- Scene 8: Demo animates to Indeed Quick Apply! ---
        schedule(() => setStep(34), 31000); // Lerp UP to Indeed Apply pill!
        schedule(() => {
            setStep(35);                    // Click Indeed Apply pill!
            setActiveSampleId('indeed');    // URL -> indeed.com, Page -> Authentic Indeed Apply!
        }, 32100);
        schedule(() => setStep(36), 33200); // Lerp to Amber Fill Button (CAREER)
        schedule(() => setStep(37), 34100); // Click Fill Button!
        schedule(() => setStep(38), 34600); // Indeed fields & resume fill!
        schedule(() => setStep(39), 35700); // Success! "Filled 5 Fields!"

        // --- Loop Tour ---
        schedule(() => {
            startMasterTour();
        }, 39000);
    }, [clearAllTimers]);

    useEffect(() => {
        startMasterTour();
        return () => clearAllTimers();
    }, [startMasterTour, clearAllTimers]);

    /* ── Smooth Manual User Interaction Handlers (Zero Collisions) ── */
    const handleManualSelectSample = (sampleId: TestSampleId) => {
        clearAllTimers();
        setActiveSampleId(sampleId);
        setUserTabOverride('fill');

        // Smoothly sequence: form loads -> lerp to Fill button -> click -> fill
        setStep(50); // intermediate state: sample active, resting
        const schedule = (fn: () => void, delay: number) => {
            const t = setTimeout(fn, delay);
            timersRef.current.push(t);
        };

        schedule(() => setStep(51), 300);  // Lerp to Amber Fill button
        schedule(() => setStep(52), 1100); // Click Fill button (ripple + press)
        schedule(() => setStep(53), 1500); // Shimmer scanning
        schedule(() => setStep(54), 2200); // Fields fill!
        schedule(() => setStep(55), 3000); // Success!

        // After 6 seconds, gracefully resume the automated tour
        schedule(() => {
            startMasterTour();
        }, 7500);
    };

    const handleManualTriggerFill = () => {
        handleManualSelectSample(activeSampleId);
    };

    useEffect(() => {
        if (!triggerRef) return;
        triggerRef.current = handleManualTriggerFill;
        return () => {
            triggerRef.current = null;
        };
    });

    /* ── Derived Animation States ── */
    const isExtensionView = step < 6;
    const isFormView = step >= 6;
    const isExtLoaded = step >= 3;
    const isExtEnabled = step >= 5;
    const isSidebarOpen = (step >= 8 && step < 99) || step >= 50;

    // Active Sidebar Tab
    let sequenceTab: 'fill' | 'profiles' | 'settings' = 'fill';
    if (step >= 9 && step < 11) sequenceTab = 'settings';
    if (step >= 11 && step < 13) sequenceTab = 'profiles';
    if (step >= 13) sequenceTab = 'fill';
    const activeTab = userTabOverride || sequenceTab;

    // Field Scanning State
    const isScanning = step === 16 || step === 25 || step === 32 || step === 38 || step === 53;

    // Field Filled State per form
    const isWorkdayFilled = (activeSampleId === 'workday' && ((step >= 17 && step <= 20) || (step >= 54 && step <= 55)));
    const isGoogleFilled = (activeSampleId === 'google' && ((step >= 26 && step <= 27) || (step >= 54 && step <= 55)));
    const isMicrosoftFilled = (activeSampleId === 'microsoft' && ((step >= 32 && step <= 33) || (step >= 54 && step <= 55)));
    const isIndeedFilled = (activeSampleId === 'indeed' && ((step >= 38 && step <= 39) || (step >= 54 && step <= 55)));
    const isGovFilled = (activeSampleId === 'gov' && ((step >= 54 && step <= 55)));

    const isCurrentFormFilled = isWorkdayFilled || isGoogleFilled || isMicrosoftFilled || isIndeedFilled || isGovFilled;

    // Button Filling / Success States
    const isFilling = isScanning;
    const isSuccess = (step === 19 || step === 20 || step === 27 || step === 33 || step === 39 || step === 55);
    const isProfileSaved = (step >= 12 && step < 13);

    // Mouse click ripple moments
    const isClicking = (
        step === 2 || step === 5 || step === 8 || step === 9 || step === 11 ||
        step === 12 || step === 13 || step === 15 || step === 22 || step === 24 ||
        step === 29 || step === 31 || step === 35 || step === 37 || step === 52
    );

    // Interactive WebGL Glass Water ripple trigger on click
    const [waterRipple, setWaterRipple] = useState<{ x: number; y: number; timestamp: number } | null>(null);

    useEffect(() => {
        if (isClicking && containerRef.current && demoVisibleRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setWaterRipple({
                x: rect.left + currentPos.current.x,
                y: rect.top + currentPos.current.y,
                timestamp: Date.now(),
            });
        }
    }, [isClicking]);

    /* ── Precise DOM Element Targeting for RAF Lerp ── */
    const getTargetElement = useCallback((s: number): HTMLElement | null => {
        // Scene 1: Extensions page
        if (s === 1 || s === 2) return loadUnpackedBtnRef.current;
        if (s === 4 || s === 5) return extCardToggleRef.current;

        // Scene 2: Toolbar & open sidebar
        if (s === 7 || s === 8) return toolbarExtIconRef.current;

        // Scene 3: Settings Tab
        if (s === 9) return settingsTabBtnRef.current;
        if (s === 10) return aiFillToggleRef.current;

        // Scene 4: Profiles Tab
        if (s === 11) return profilesTabBtnRef.current;
        if (s === 12) return saveProfileBtnRef.current;

        // Scene 5: Autofill Tab
        if (s === 13) return autofillTabBtnRef.current;
        if (s === 14 || s === 15) return heroFillBtnRef.current;
        if (s === 17) return activeFieldRef1.current;
        if (s === 18) return activeFieldRef2.current;

        // Scene 6: Google Forms tour
        if (s === 21 || s === 22) return googlePillRef.current;
        if (s === 23 || s === 24) return heroFillBtnRef.current;
        if (s === 26) return activeFieldRef1.current;

        // Scene 7: Microsoft Forms tour
        if (s === 28 || s === 29) return microsoftPillRef.current;
        if (s === 30 || s === 31) return heroFillBtnRef.current;
        if (s === 32) return activeFieldRef1.current;

        // Scene 8: Indeed Apply tour
        if (s === 34 || s === 35) return indeedPillRef.current;
        if (s === 36 || s === 37) return heroFillBtnRef.current;
        if (s === 38) return activeFieldRef1.current;

        // Manual interaction steps
        if (s === 51 || s === 52) return heroFillBtnRef.current;
        if (s === 54) return activeFieldRef1.current;

        return null;
    }, []);

    /* ── Recalculate Target Position using live getBoundingClientRect() ── */
    const updateTargetPos = useCallback(() => {
        if (!containerRef.current || !demoVisibleRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetEl = getTargetElement(step);

        if (targetEl) {
            const elRect = targetEl.getBoundingClientRect();
            // Mathematical exact center of target relative to demo container:
            targetPos.current = {
                x: elRect.left - containerRect.left + elRect.width / 2,
                y: elRect.top - containerRect.top + elRect.height / 2,
            };
        } else {
            // Natural resting spot
            const isExt = step < 6;
            targetPos.current = {
                x: containerRect.width * (isExt ? 0.44 : 0.32),
                y: containerRect.height * (isExt ? 0.5 : 0.46),
            };
        }
    }, [step, getTargetElement]);

    const updateTargetPosRef = useRef(updateTargetPos);
    useEffect(() => {
        updateTargetPosRef.current = updateTargetPos;
    }, [updateTargetPos]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => {
            demoVisibleRef.current = entry.isIntersecting;
            if (entry.isIntersecting) updateTargetPosRef.current();
        });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Recalculate target whenever step, active form, or demo width changes
    useEffect(() => {
        updateTargetPos();
        const t1 = setTimeout(updateTargetPos, 50);
        const t2 = setTimeout(updateTargetPos, 150);
        const t3 = setTimeout(updateTargetPos, 350);
        window.addEventListener('resize', updateTargetPos);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener('resize', updateTargetPos);
        };
    }, [step, isSidebarOpen, activeTab, activeSampleId, demoWidth, updateTargetPos]);

    // ── Continuous 60fps RequestAnimationFrame Lerp Loop ──
    useEffect(() => {
        let animId: number;
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

        const tick = () => {
            const dx = targetPos.current.x - currentPos.current.x;
            const dy = targetPos.current.y - currentPos.current.y;

            // Settled: skip the style write so an idle cursor costs nothing per frame
            if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
                // 0.12 lerp factor gives a smooth, organic ease-out glide
                currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.12);
                currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.12);

                if (cursorRef.current) {
                    cursorRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`;
                }
            }

            animId = requestAnimationFrame(tick);
        };

        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, []);

    // ── Liquid glass sheen: expose pointer position to CSS as --glass-mx / --glass-my ──
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        // One read + one write per frame, rather than per raw pointer event
        let frame = 0;
        let cx = 0;
        let cy = 0;
        const apply = () => {
            frame = 0;
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--glass-mx', `${cx - rect.left}px`);
            el.style.setProperty('--glass-my', `${cy - rect.top}px`);
            el.style.setProperty('--glass-hover', '1');
        };
        const handleMove = (e: PointerEvent) => {
            cx = e.clientX;
            cy = e.clientY;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const handleLeave = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            el.style.setProperty('--glass-hover', '0');
        };
        el.addEventListener('pointermove', handleMove, { passive: true });
        el.addEventListener('pointerleave', handleLeave);
        return () => {
            cancelAnimationFrame(frame);
            el.removeEventListener('pointermove', handleMove);
            el.removeEventListener('pointerleave', handleLeave);
        };
    }, []);

    return (
        <div className={`demo-outer-container demo-width--${demoWidth}`}>
            {/* ═══════════ WebGL Prism Lattice Shader Stage ═══════════ */}
            <AullevoLatticeShader className="demo-stage-water-canvas" rippleTrigger={waterRipple} />

            {/* ═══════════ TOP CURATED TEST BENCH BAR ═══════════ */}
            <div className="demo-test-bench-bar">
                <div className="test-bench-left">
                    <div className="test-bench-title">
                        <span className="pulse-dot" />
                        <span>Curated Tests</span>
                    </div>

                    <div className="test-bench-pills">
                        <button
                            ref={workdayPillRef}
                            type="button"
                            className={`test-sample-pill ${activeSampleId === 'workday' ? 'active active--workday' : ''}`}
                            onClick={() => handleManualSelectSample('workday')}
                            title="Test with Workday Job Application"
                        >
                            <BriefcaseIcon size={12} />
                            <span>Workday</span>
                        </button>

                        <button
                            ref={googlePillRef}
                            type="button"
                            className={`test-sample-pill ${activeSampleId === 'google' ? 'active active--google' : ''}`}
                            onClick={() => handleManualSelectSample('google')}
                            title="Test with Google Forms Survey"
                        >
                            <GoogleFormsIcon size={12} />
                            <span>Google Forms</span>
                        </button>

                        <button
                            ref={microsoftPillRef}
                            type="button"
                            className={`test-sample-pill ${activeSampleId === 'microsoft' ? 'active active--microsoft' : ''}`}
                            onClick={() => handleManualSelectSample('microsoft')}
                            title="Test with Microsoft Forms Enterprise Portal"
                        >
                            <MicrosoftIcon size={11} />
                            <span>Microsoft Forms</span>
                        </button>

                        <button
                            ref={indeedPillRef}
                            type="button"
                            className={`test-sample-pill ${activeSampleId === 'indeed' ? 'active active--indeed' : ''}`}
                            onClick={() => handleManualSelectSample('indeed')}
                            title="Test with Indeed 1-Click Quick Apply"
                        >
                            <span style={{ fontWeight: 800, fontSize: 11 }}>in</span>
                            <span>Indeed Apply</span>
                        </button>

                        <button
                            ref={govPillRef}
                            type="button"
                            className={`test-sample-pill ${activeSampleId === 'gov' ? 'active active--gov' : ''}`}
                            onClick={() => handleManualSelectSample('gov')}
                            title="Test with Official Gov / Tax Form W-9"
                        >
                            <ShieldIcon size={11} />
                            <span>Gov / Tax W-9</span>
                        </button>
                    </div>
                </div>

                <div className="test-bench-right">
                    {/* Adjustable Width Switcher */}
                    <div className="width-selector" title="Adjust Demo Width">
                        <button
                            type="button"
                            className={`width-btn ${demoWidth === 'standard' ? 'active' : ''}`}
                            onClick={() => setDemoWidth('standard')}
                            title="Standard Width (1040px)"
                        >
                            1040px
                        </button>
                        <button
                            type="button"
                            className={`width-btn ${demoWidth === 'wide' ? 'active' : ''}`}
                            onClick={() => setDemoWidth('wide')}
                            title="Wide Width (1160px - Recommended)"
                        >
                            Wide (1160px)
                        </button>
                        <button
                            type="button"
                            className={`width-btn ${demoWidth === 'expanded' ? 'active' : ''}`}
                            onClick={() => setDemoWidth('expanded')}
                            title="Max Expanded Width (1240px)"
                        >
                            <MaximizeIcon size={10} />
                            Max (1240px)
                        </button>
                    </div>

                    {/* Instant Re-test Button */}
                    <button
                        type="button"
                        className="test-bench-action-btn"
                        onClick={handleManualTriggerFill}
                        title="Re-run AI Autofill test on active form"
                    >
                        <RefreshIcon size={11} />
                        <span>Run Test</span>
                    </button>
                </div>
            </div>

            {/* ═══════════ MAIN DEMO BROWSER MOCKUP ═══════════ */}
            <div className="demo-animation-wrapper" ref={containerRef}>
                {/* Precision Lerp OS Mouse Cursor */}
                <div
                    ref={cursorRef}
                    className={`demo-cursor ${isClicking ? 'clicking' : ''}`}
                >
                    {isClicking && <span key={`ripple-${step}`} className="demo-click-ripple" />}
                    <svg className="demo-cursor-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0.5 0.5L0.5 18L5.2 13.5L9.6 22.5L12.8 20.9L8.4 12.2L15 12.2L0.5 0.5Z"
                            fill="#0f172a"
                        />
                        <path
                            d="M2 3.2L2 15.5L5.4 12.3L5.7 12H6.2L9.6 19.1L11 18.4L7.6 11.4L7.3 10.9L7.8 10.6L12.4 10.6L2 3.2Z"
                            fill="#ffffff"
                        />
                    </svg>
                </div>

                {/* Browser Chrome Header */}
                <div className="demo-browser-header">
                    <div className="browser-dots">
                        <div className="dot-r" />
                        <div className="dot-y" />
                        <div className="dot-g" />
                    </div>
                    <div className="browser-url-bar">
                        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>
                            {isExtensionView ? '' : 'https://'}
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>
                            {isExtensionView ? 'chrome://extensions' : currentMeta.url}
                        </span>
                    </div>
                    {isFormView && (
                        <div className="browser-extensions">
                            <div
                                ref={toolbarExtIconRef}
                                className={`ext-icon aullevo-icon ${isSidebarOpen ? 'active' : ''}`}
                                title="Aullevo AI Form Filler (Alt+Q)"
                            >
                                <img src="/icon16.png" alt="Aullevo" width="18" height="18" style={{ borderRadius: '4px', display: 'block' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════ MAIN CONTENT ═══════════ */}
                <div className="demo-browser-content">

                    {/* ── SCENE 1: Chrome Extensions Page ── */}
                    <div className={`demo-view-layer demo-extensions-page ${isExtensionView ? 'active' : ''}`}>
                        <div className="ext-header">
                            <div className="ext-header-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8eaed" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <h2>Extensions</h2>
                            </div>
                            <div className="ext-search">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <span>Search extensions</span>
                            </div>
                            <div className="ext-dev-mode">
                                <span>Developer mode</span>
                                <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                            </div>
                        </div>

                        <div className="ext-toolbar">
                            <button
                                ref={loadUnpackedBtnRef}
                                className={`ext-btn ${step === 2 ? 'ext-btn-clicked' : ''}`}
                            >
                                Load unpacked
                            </button>
                            <button className="ext-btn">Pack extension</button>
                            <button className="ext-btn">Update</button>
                        </div>

                        <div className="ext-main">
                            <div className="ext-sidebar-panel">
                                <ul>
                                    <li className="active">My extensions</li>
                                    <li>Keyboard shortcuts</li>
                                </ul>
                            </div>
                            <div className="ext-grid-container">
                                <div className="ext-grid-title">All Extensions</div>
                                <div className="ext-grid">
                                    {/* Aullevo card */}
                                    <div className={`ext-card ${isExtLoaded ? 'fade-in' : 'hidden'}`}>
                                        <div className="ext-card-header">
                                            <div className="ext-card-icon ext-card-icon--aullevo">
                                                <img src="/icon48.png" alt="Aullevo" width="44" height="44" style={{ borderRadius: '8px', display: 'block' }} />
                                            </div>
                                            <div className="ext-card-info">
                                                <h3>Aullevo - AI Form Filler <span className="ext-version">1.1.0</span></h3>
                                                <p>Fill forms from your saved profile with one shortcut. Press Alt+Q to open the side panel!</p>
                                            </div>
                                        </div>
                                        <div className="ext-card-footer">
                                            <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                            <div ref={extCardToggleRef} className={`ext-toggle ${isExtEnabled ? 'active' : ''}`}>
                                                <div className="ext-toggle-knob" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Model */}
                                    <div className="ext-card fade-in">
                                        <div className="ext-card-header">
                                            <div className="ext-card-icon" style={{ background: '#3b82f6', color: '#ffffff' }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 15h14M5 9h14M9 20h6" />
                                                </svg>
                                            </div>
                                            <div className="ext-card-info">
                                                <h3>Action Model <span className="ext-version">0.25.0</span></h3>
                                                <p>Train and automate browser interactions with optimized performance.</p>
                                            </div>
                                        </div>
                                        <div className="ext-card-footer">
                                            <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                            <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                                        </div>
                                    </div>

                                    {/* Google Translate */}
                                    <div className="ext-card fade-in">
                                        <div className="ext-card-header">
                                            <div className="ext-card-icon" style={{ background: '#10b981', color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>G</div>
                                            <div className="ext-card-info">
                                                <h3>Google Translate <span className="ext-version">2.0.16</span></h3>
                                                <p>View translations easily as you browse the web.</p>
                                            </div>
                                        </div>
                                        <div className="ext-card-footer">
                                            <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                            <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SCENE 2: Active Authentic Form View & Redesigned Aullevo Sidebar ── */}
                    <div className={`demo-view-layer demo-form-layer ${isFormView ? 'active' : ''}`}>

                        {/* Left: Authentic Platform Form Viewport */}
                        <div className="demo-page-viewport">

                            {/* ═══ 1. AUTHENTIC GOOGLE FORMS VIEW ═══ */}
                            {activeSampleId === 'google' && (
                                <div className="gf-view">
                                    <div className="gf-header-card">
                                        <div className="gf-top-banner" />
                                        <div className="gf-header-body">
                                            <h2>Annual Developer & AI Tools Survey 2026</h2>
                                            <p>This annual survey evaluates developer ergonomics, browser automation, and AI workflows.</p>
                                        </div>
                                        <div className="gf-account-strip">
                                            <span className="gf-account-email">julian@mythic.dev (Google Account • Shared)</span>
                                            <span className="gf-switch-acc">Switch account</span>
                                        </div>
                                        <div className="gf-required-line">* Indicates required question</div>
                                    </div>

                                    {/* Question Card 1: Full Legal Name */}
                                    <div className="gf-question-card">
                                        <div className="gf-q-title">
                                            <span>Full Legal Name</span>
                                            <span className="gf-star">*</span>
                                        </div>
                                        <div
                                            ref={activeFieldRef1}
                                            className={`gf-underline-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGoogleFilled ? 'filled' : ''}`}
                                        >
                                            <span className="filled-val">Julian Mythic</span>
                                            <span className="gf-ai-tag filled-tag">AI Filled</span>
                                        </div>
                                    </div>

                                    {/* Question Card 2: Primary Tech Stack */}
                                    <div className="gf-question-card">
                                        <div className="gf-q-title">
                                            <span>Primary Tech Stack & Expertise</span>
                                            <span className="gf-star">*</span>
                                        </div>
                                        <div
                                            ref={activeFieldRef2}
                                            className="gf-radio-options"
                                        >
                                            <div className="gf-radio-item">
                                                <div className={`gf-radio-dot ${isGoogleFilled ? 'selected' : ''}`} />
                                                <span>TypeScript, React & Rust (Full-Stack)</span>
                                            </div>
                                            <div className="gf-radio-item">
                                                <div className="gf-radio-dot" />
                                                <span>Python & Deep Learning</span>
                                            </div>
                                            <div className="gf-radio-item">
                                                <div className="gf-radio-dot" />
                                                <span>Go & Cloud Infrastructure</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Question Card 3: Portfolio / GitHub URL */}
                                    <div className="gf-question-card">
                                        <div className="gf-q-title">
                                            <span>Developer Portfolio or GitHub URL</span>
                                            <span className="gf-star">*</span>
                                        </div>
                                        <div
                                            ref={activeFieldRef3}
                                            className={`gf-underline-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGoogleFilled ? 'filled' : ''}`}
                                        >
                                            <span className="filled-val">https://github.com/mythic-dev</span>
                                            <span className="gf-ai-tag filled-tag">Verified</span>
                                        </div>
                                    </div>

                                    <div className="gf-bottom-bar">
                                        <button type="button" className="gf-submit-btn">Submit</button>
                                        <span className="gf-clear-link">Clear form</span>
                                    </div>
                                    <div className="gf-disclaimer">Never submit passwords through Google Forms.</div>
                                </div>
                            )}

                            {/* ═══ 2. AUTHENTIC MICROSOFT FORMS VIEW ═══ */}
                            {activeSampleId === 'microsoft' && (
                                <div className="msf-view">
                                    <div className="msf-header-hero">
                                        <div className="msf-brand-tag">
                                            <MicrosoftIcon size={12} />
                                            <span>Microsoft Forms • Office 365</span>
                                        </div>
                                        <h2>Enterprise Employee Onboarding & Equipment Request</h2>
                                        <p>Contoso Systems Global • Corporate IT & Workspace Operations • Auth ID: MSF-994</p>
                                    </div>

                                    <div className="msf-body-card">
                                        {/* Question 1 */}
                                        <div className="msf-question-item">
                                            <div className="msf-q-header">
                                                <span className="msf-num">1.</span>
                                                <span>Employee Legal Name</span>
                                                <span className="msf-star">*</span>
                                            </div>
                                            <div
                                                ref={activeFieldRef1}
                                                className={`msf-fluent-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isMicrosoftFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">Julian Mythic</span>
                                                <span className="msf-badge filled-tag">SSO Verified</span>
                                            </div>
                                        </div>

                                        {/* Question 2 */}
                                        <div className="msf-question-item">
                                            <div className="msf-q-header">
                                                <span className="msf-num">2.</span>
                                                <span>Corporate Email Address</span>
                                                <span className="msf-star">*</span>
                                            </div>
                                            <div
                                                ref={activeFieldRef2}
                                                className={`msf-fluent-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isMicrosoftFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">julian.mythic@contoso.com</span>
                                                <span className="msf-badge filled-tag">Corp Mail</span>
                                            </div>
                                        </div>

                                        {/* Question 3 */}
                                        <div className="msf-question-item">
                                            <div className="msf-q-header">
                                                <span className="msf-num">3.</span>
                                                <span>Department / Organization</span>
                                                <span className="msf-star">*</span>
                                            </div>
                                            <div
                                                className={`msf-fluent-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isMicrosoftFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">Core Cloud Infrastructure</span>
                                                <span className="msf-badge filled-tag">IT Org</span>
                                            </div>
                                        </div>

                                        {/* Question 4 */}
                                        <div className="msf-question-item">
                                            <div className="msf-q-header">
                                                <span className="msf-num">4.</span>
                                                <span>Primary Hardware Setup Choice</span>
                                                <span className="msf-star">*</span>
                                            </div>
                                            <div
                                                ref={activeFieldRef3}
                                                className={`msf-fluent-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isMicrosoftFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)</span>
                                                <span className="msf-badge filled-tag">Matched Kit</span>
                                            </div>
                                        </div>

                                        <div className="msf-submit-row">
                                            <button type="button" className="msf-submit-btn">Submit</button>
                                            <span className="msf-footer-note">This form was created inside Contoso Systems.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ 3. AUTHENTIC WORKDAY CANDIDATE VIEW ═══ */}
                            {activeSampleId === 'workday' && (
                                <div className="wd-view">
                                    <div className="wd-topbar">
                                        <div className="wd-brand-wrap">
                                            <BriefcaseIcon size={14} />
                                            <span>Acme Cloud Technologies Careers</span>
                                        </div>
                                        <div className="wd-top-user">Candidate Portal • Ref #WD-84291</div>
                                    </div>

                                    <div className="wd-stepper">
                                        <div className="wd-step-item active">
                                            <span className="wd-step-badge">1</span>
                                            <span>Candidate Information (Active)</span>
                                        </div>
                                        <div className="wd-step-item">
                                            <span className="wd-step-badge">2</span>
                                            <span>My Experience</span>
                                        </div>
                                        <div className="wd-step-item">
                                            <span className="wd-step-badge">3</span>
                                            <span>Review</span>
                                        </div>
                                    </div>

                                    <div className="wd-content-area">
                                        <div className="wd-card">
                                            <div className="wd-card-title">Senior Full Stack Engineer Application</div>

                                            <div className="wd-grid">
                                                <div className="wd-group">
                                                    <label>First Name <span className="wd-req">*</span></label>
                                                    <div
                                                        ref={activeFieldRef1}
                                                        className={`wd-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isWorkdayFilled ? 'filled' : ''}`}
                                                    >
                                                        <span className="filled-val">Julian</span>
                                                        <span className="wd-tag filled-tag">AI</span>
                                                    </div>
                                                </div>

                                                <div className="wd-group">
                                                    <label>Last Name <span className="wd-req">*</span></label>
                                                    <div
                                                        className={`wd-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isWorkdayFilled ? 'filled' : ''}`}
                                                    >
                                                        <span className="filled-val">Mythic</span>
                                                        <span className="wd-tag filled-tag">AI</span>
                                                    </div>
                                                </div>

                                                <div className="wd-group">
                                                    <label>Email Address <span className="wd-req">*</span></label>
                                                    <div
                                                        ref={activeFieldRef2}
                                                        className={`wd-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isWorkdayFilled ? 'filled' : ''}`}
                                                    >
                                                        <span className="filled-val">julian@mythic.dev</span>
                                                        <span className="wd-tag filled-tag">AI</span>
                                                    </div>
                                                </div>

                                                <div className="wd-group">
                                                    <label>Phone Number <span className="wd-req">*</span></label>
                                                    <div
                                                        className={`wd-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isWorkdayFilled ? 'filled' : ''}`}
                                                    >
                                                        <span className="filled-val">+1 (555) 234-5678</span>
                                                        <span className="wd-tag filled-tag">AI</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="wd-dropzone">
                                                <div className="wd-dropzone-left">
                                                    <FileTextIcon size={18} color="#0875e1" />
                                                    <div>
                                                        <div className="wd-dropzone-title">Resume / CV Document</div>
                                                        <div className="wd-dropzone-sub">
                                                            {isWorkdayFilled ? 'Julian_Mythic_Resume.pdf (Auto-Matched)' : 'Drop files here or Select Files'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isWorkdayFilled && (
                                                    <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <CheckCircleIcon size={12} color="#10b981" /> Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="wd-action-row">
                                            <button type="button" className="wd-save-btn">Save and Continue</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ 4. AUTHENTIC INDEED QUICK APPLY VIEW ═══ */}
                            {activeSampleId === 'indeed' && (
                                <div className="ind-view">
                                    <div className="ind-card">
                                        <div className="ind-header">
                                            <span className="ind-logo">indeed</span>
                                            <span className="ind-apply-badge">1-Click Apply</span>
                                        </div>

                                        <div className="ind-job-banner">
                                            <h3>Lead Frontend & Extension Engineer</h3>
                                            <p>Nova AI Labs &bull; Austin, TX (Remote) &bull; $165,000 - $195,000 a year</p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div className="ind-group">
                                                <label>First Name</label>
                                                <div
                                                    ref={activeFieldRef1}
                                                    className={`ind-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isIndeedFilled ? 'filled' : ''}`}
                                                >
                                                    <span className="filled-val">Julian</span>
                                                    <span className="ind-tag filled-tag">AI</span>
                                                </div>
                                            </div>

                                            <div className="ind-group">
                                                <label>Last Name</label>
                                                <div
                                                    className={`ind-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isIndeedFilled ? 'filled' : ''}`}
                                                >
                                                    <span className="filled-val">Mythic</span>
                                                    <span className="ind-tag filled-tag">AI</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ind-group">
                                            <label>Email Address</label>
                                            <div
                                                ref={activeFieldRef2}
                                                className={`ind-input form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isIndeedFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">julian@mythic.dev</span>
                                                <span className="ind-tag filled-tag">AI</span>
                                            </div>
                                        </div>

                                        <div className="ind-resume-box">
                                            <div className="ind-resume-info">
                                                <div className="ind-radio-dot" />
                                                <div>
                                                    <div className="ind-resume-name">
                                                        {isIndeedFilled ? 'Julian_Mythic_Resume.pdf' : 'Select Indeed Resume'}
                                                    </div>
                                                    <div className="ind-resume-sub">
                                                        {isIndeedFilled ? 'Parsed from Aullevo Vault • Updated today' : 'No resume attached'}
                                                    </div>
                                                </div>
                                            </div>
                                            {isIndeedFilled && (
                                                <span className="ind-ready-tag">Ready</span>
                                            )}
                                        </div>

                                        <button type="button" className="ind-submit-btn">
                                            <span>Continue to application</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ═══ 5. AUTHENTIC GOV / TAX W-9 VIEW ═══ */}
                            {activeSampleId === 'gov' && (
                                <div className="gov-view">
                                    <div className="gov-paper">
                                        <div className="gov-header">
                                            <div className="gov-h-left">Form W-9 (Rev. 2024)</div>
                                            <div className="gov-h-mid">
                                                <h3>Request for Taxpayer Identification Number and Certification</h3>
                                                <span>Department of the Treasury &bull; Internal Revenue Service</span>
                                            </div>
                                            <div className="gov-h-right">Give Form to Requester</div>
                                        </div>

                                        <div className="gov-line-row">
                                            <span className="gov-line-num">1</span>
                                            <span className="gov-line-label">Name (as on tax return):</span>
                                            <div
                                                ref={activeFieldRef1}
                                                className={`gov-line-box form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGovFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">Julian Mythic</span>
                                                <span className="gov-tag filled-tag">Individual</span>
                                            </div>
                                        </div>

                                        <div className="gov-line-row">
                                            <span className="gov-line-num">2</span>
                                            <span className="gov-line-label">Business / entity name:</span>
                                            <div
                                                className={`gov-line-box form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGovFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">Mythic Technologies LLC</span>
                                                <span className="gov-tag filled-tag">LLC</span>
                                            </div>
                                        </div>

                                        <div className="gov-line-row">
                                            <span className="gov-line-num">3</span>
                                            <span className="gov-line-label">Federal tax classification:</span>
                                            <div
                                                ref={activeFieldRef2}
                                                className={`gov-line-box form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGovFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">Individual / Sole proprietor or single-member LLC</span>
                                                <span className="gov-tag filled-tag">Auto</span>
                                            </div>
                                        </div>

                                        <div className="gov-tin-box">
                                            <div className="gov-tin-title">Part I &mdash; Taxpayer Identification Number (TIN)</div>
                                            <div
                                                ref={activeFieldRef3}
                                                className={`gov-line-box form-field-active-wrap ${isScanning ? 'scanning' : ''} ${isGovFilled ? 'filled' : ''}`}
                                            >
                                                <span className="filled-val">••• - •• - 5678 (Social Security Number)</span>
                                                <span className="gov-tag filled-tag">Encrypted & Masked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right: The Redesigned Aullevo Sidebar Panel */}
                        <div className={`demo-sidebar av-panel ${isSidebarOpen ? 'open' : ''}`}>

                            {/* 1. Header */}
                            <header className="av-panel__header">
                                <div className="av-panel__brand">
                                    <div className="av-panel__logo">
                                        <img src="/icon48.png" alt="Aullevo" width="24" height="24" />
                                    </div>
                                    <div>
                                        <div className="av-panel__brand-name">Aullevo</div>
                                        <div className="av-panel__brand-sub">v0.6.5 &bull; Autofill</div>
                                    </div>
                                </div>
                                <div className="av-panel__actions">
                                    <button className="av-panel__icon-btn" title="Theme toggle">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                    </button>
                                    <button className="av-panel__icon-btn" title="JSON Configuration">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="16 18 22 12 16 6" />
                                            <polyline points="8 6 2 12 8 18" />
                                        </svg>
                                    </button>
                                    <button className="av-panel__icon-btn" title="Close Panel">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            </header>

                            {/* 2. NavTabs */}
                            <nav className="av-panel__tabs">
                                <button
                                    ref={autofillTabBtnRef}
                                    className={`av-panel__tab ${activeTab === 'fill' ? 'av-panel__tab--active' : ''}`}
                                    onClick={() => setUserTabOverride('fill')}
                                >
                                    <ZapIcon size={12} color={activeTab === 'fill' ? '#3b82f6' : 'currentColor'} />
                                    <span>Autofill</span>
                                </button>
                                <button
                                    ref={profilesTabBtnRef}
                                    className={`av-panel__tab ${activeTab === 'profiles' ? 'av-panel__tab--active' : ''}`}
                                    onClick={() => setUserTabOverride('profiles')}
                                >
                                    <UsersIcon size={12} color={activeTab === 'profiles' ? '#3b82f6' : 'currentColor'} />
                                    <span>Profiles (4)</span>
                                </button>
                                <button
                                    ref={settingsTabBtnRef}
                                    className={`av-panel__tab ${activeTab === 'settings' ? 'av-panel__tab--active' : ''}`}
                                    onClick={() => setUserTabOverride('settings')}
                                >
                                    <SettingsIcon size={12} color={activeTab === 'settings' ? '#3b82f6' : 'currentColor'} />
                                    <span>Settings</span>
                                </button>
                            </nav>

                            {/* 3. Panel Body */}
                            <div className="av-panel__body">

                                {/* ── TAB 1: AUTOFILL TAB ── */}
                                {activeTab === 'fill' && (
                                    <>
                                        {/* Detection Card */}
                                        <div className="av-card av-detection">
                                            <div>
                                                <div className="av-detection__eyebrow">Form Detection</div>
                                                <div className="av-detection__count av-detection__count--active">
                                                    {currentMeta.fieldCount}
                                                </div>
                                                <div className="av-detection__sub">Fields on active tab</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button className={`av-detection__rescan ${isScanning ? 'active' : ''}`}>
                                                    <span>{isScanning ? 'Clear' : 'Highlight'}</span>
                                                </button>
                                                <button className="av-detection__rescan" onClick={handleManualTriggerFill}>
                                                    <RefreshIcon size={11} />
                                                    <span>Rescan</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Amber Hero Fill Button */}
                                        <button
                                            ref={heroFillBtnRef}
                                            className={`av-fill-btn ${step === 15 || step === 24 || step === 31 || step === 37 || step === 52 ? 'av-fill-btn--pressed' : ''} ${isFilling ? 'av-fill-btn--filling' : ''} ${isSuccess || isCurrentFormFilled ? 'av-fill-btn--success' : ''}`}
                                            onClick={handleManualTriggerFill}
                                        >
                                            {isSuccess || isCurrentFormFilled ? (
                                                <>
                                                    <CheckCircleIcon size={14} color="#ffffff" />
                                                    <span>Filled {currentMeta.fieldCount} Fields!</span>
                                                </>
                                            ) : isFilling ? (
                                                <>
                                                    <span className="av-demo-spinner" />
                                                    <span>Injecting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ZapIcon size={14} color="#0f172a" />
                                                    <span>Fill Form with AI ({currentMeta.profilePill})</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Active Profile Snapshot Card */}
                                        <div className="av-card">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div className="av-label">Active Profile</div>
                                                <span className="av-pill av-pill--active">{currentMeta.profilePill}</span>
                                            </div>
                                            <div className="av-active-profile-name">
                                                {currentMeta.profileName}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--av-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{currentMeta.profileSub}</span>
                                                <span style={{ color: 'var(--av-success)', fontWeight: 700, fontSize: 10 }}>
                                                    READY
                                                </span>
                                            </div>
                                        </div>

                                        {/* Shortcuts Helper */}
                                        <div className="av-card av-shortcuts">
                                            <div className="av-shortcuts__title">Keyboard Shortcuts</div>
                                            <div className="av-shortcuts__item">
                                                <span className="av-shortcuts__desc">Toggle Side Panel</span>
                                                <span className="av-shortcuts__key">Alt+Q / Option+Q</span>
                                            </div>
                                            <div className="av-shortcuts__item">
                                                <span className="av-shortcuts__desc">AI / Keyword Form Fill</span>
                                                <span className="av-shortcuts__key">Alt+Shift+L</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ── TAB 2: PROFILES TAB ── */}
                                {activeTab === 'profiles' && (
                                    <>
                                        <div className="av-profile-dropdown">
                                            <button type="button" className="av-profile-dropdown__trigger">
                                                <div className="av-profile-dropdown__current">
                                                    <BriefcaseIcon size={13} />
                                                    <span className="av-profile-dropdown__label">{currentMeta.profileName.split('—')[0]} Profile</span>
                                                    <span className="av-pill av-pill--active" style={{ fontSize: 9 }}>ACTIVE</span>
                                                </div>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="av-card">
                                            <div className="av-label">Profile Configuration</div>
                                            <div className="av-field-input-box">
                                                <span className="av-input-prefix">Name:</span>
                                                <span className="av-input-val">{currentMeta.profileName}</span>
                                            </div>
                                            <div className="av-toggle-row" style={{ marginTop: 2 }}>
                                                <span style={{ fontSize: 11, color: 'var(--av-text-mid)' }}>Enable Profile</span>
                                                <div className="av-toggle av-toggle--active">
                                                    <div className="av-toggle__thumb" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="av-card">
                                            <div className="av-label">Identity & Contact</div>
                                            <div className="av-mini-field">
                                                <span className="label">Full Name</span>
                                                <div className="box">Julian Mythic</div>
                                            </div>
                                            <div className="av-mini-field">
                                                <span className="label">Email Address</span>
                                                <div className="box">julian@mythic.dev</div>
                                            </div>
                                            <div className="av-mini-field">
                                                <span className="label">Phone Number</span>
                                                <div className="box">+1 (555) 234-5678</div>
                                            </div>
                                            <div className="av-mini-field">
                                                <span className="label">LinkedIn / Portfolio</span>
                                                <div className="box">linkedin.com/in/julian-mythic</div>
                                            </div>
                                        </div>

                                        <div className="av-card">
                                            <div className="av-label">Documents & Resumes (1)</div>
                                            <div className="av-file-row">
                                                <FileTextIcon size={14} color="#3b82f6" />
                                                <span className="filename">Julian_Mythic_Resume.pdf</span>
                                                <span className="pill green">Matches: Resume</span>
                                            </div>
                                        </div>

                                        <button
                                            ref={saveProfileBtnRef}
                                            className={`av-save-btn ${isProfileSaved ? 'av-save-btn--saved' : ''}`}
                                        >
                                            <SaveIcon size={13} />
                                            <span>{isProfileSaved ? 'Saved ✓' : `Save ${currentMeta.profilePill} Profile`}</span>
                                        </button>
                                    </>
                                )}

                                {/* ── TAB 3: SETTINGS TAB ── */}
                                {activeTab === 'settings' && (
                                    <>
                                        <div className="av-card">
                                            <div className="av-label">Theme Appearance</div>
                                            <div className="av-toggle-row">
                                                <div>
                                                    <div className="av-toggle-title">Dark Theme</div>
                                                    <div style={{ fontSize: 10, color: 'var(--av-text-muted)' }}>
                                                        Dark Slate optimized appearance
                                                    </div>
                                                </div>
                                                <div className="av-toggle av-toggle--active">
                                                    <div className="av-toggle__thumb" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="av-card">
                                            <div className="av-label">Autofill Engine Mode</div>
                                            <div className="av-toggle-row">
                                                <div>
                                                    <div className="av-toggle-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <BotIcon size={14} color="#3b82f6" />
                                                        <span>AI Smart Fill (Active)</span>
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--av-text-muted)' }}>
                                                        Uses AI reasoning to interpret questions & match complex fields
                                                    </div>
                                                </div>
                                                <div ref={aiFillToggleRef} className="av-toggle av-toggle--active">
                                                    <div className="av-toggle__thumb" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="av-card">
                                            <div className="av-label">Human Typing Speed</div>
                                            <div className="av-speed-presets">
                                                <button className="av-speed-preset-btn">
                                                    <ZapIcon size={10} />
                                                    <span>Instant (0ms)</span>
                                                </button>
                                                <button className="av-speed-preset-btn active">
                                                    <UsersIcon size={10} />
                                                    <span>Natural (25ms)</span>
                                                </button>
                                                <button className="av-speed-preset-btn">
                                                    <ShieldIcon size={10} />
                                                    <span>Slow (65ms)</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="av-card" style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--av-text-muted)' }}>
                                            <div className="av-label" style={{ color: 'var(--av-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <LockIcon size={11} color="var(--av-success)" />
                                                <span>Local & Encrypted</span>
                                            </div>
                                            All profile data and custom fields are stored strictly inside your browser's local encrypted storage.
                                        </div>
                                    </>
                                )}

                            </div>

                            {/* 4. Footer */}
                            <footer className="av-panel__footer">
                                <span className="av-panel__footer-text">Aullevo Autofill Engine</span>
                                <span className="av-panel__footer-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircleIcon size={11} color="var(--av-success)" />
                                    <span style={{ color: 'var(--av-success)', fontWeight: 600 }}>Ready</span>
                                </span>
                            </footer>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoAnimation;
