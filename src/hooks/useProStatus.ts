import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface ProStatus {
    loading: boolean;
    isPro: boolean;
    // Pro with no proExpiresAt (bought lifetime, or granted by hand)
    isLifetime: boolean;
    expiresAt: string | null;
}

const SIGNED_OUT: ProStatus = { loading: false, isPro: false, isLifetime: false, expiresAt: null };

// Live plan of the signed-in user, read from users/{uid} (same rules as the Account page)
export function useProStatus(): ProStatus {
    const [status, setStatus] = useState<ProStatus>({ ...SIGNED_OUT, loading: true });

    useEffect(() => {
        let unsubDoc: (() => void) | undefined;
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            unsubDoc?.();
            unsubDoc = undefined;
            if (!user || user.isAnonymous) {
                setStatus(SIGNED_OUT);
                return;
            }
            unsubDoc = onSnapshot(
                doc(db, 'users', user.uid),
                (snap) => {
                    const data = snap.data();
                    const expiresAt: string | null = data?.proExpiresAt || null;
                    const isPro = Boolean(data?.isPro) && (!expiresAt || new Date(expiresAt).getTime() > Date.now());
                    setStatus({ loading: false, isPro, isLifetime: isPro && !expiresAt, expiresAt });
                },
                () => setStatus(SIGNED_OUT)
            );
        });
        return () => {
            unsubDoc?.();
            unsubAuth();
        };
    }, []);

    return status;
}
