import { useState, useEffect } from "react";
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface RecentAccount {
    accountId: string;
    lastAccessed: Date;
}

const MAX_RECENT_ACCOUNTS = 10;

export function useRecentAccounts() {
    const { user } = useAuth();
    const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setRecentAccounts([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "recentAccounts"),
            orderBy("lastAccessed", "desc"),
            limit(MAX_RECENT_ACCOUNTS)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const recents: RecentAccount[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                recents.push({
                    accountId: doc.id,
                    lastAccessed: data.lastAccessed?.toDate() || new Date(),
                });
            });
            setRecentAccounts(recents);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const trackAccountAccess = async (accountId: string) => {
        if (!user) return;

        try {
            const recentRef = doc(
                db,
                "users",
                user.uid,
                "recentAccounts",
                accountId
            );

            await setDoc(
                recentRef,
                {
                    accountId,
                    lastAccessed: Timestamp.now(),
                },
                { merge: true }
            );
        } catch (error) {
            console.error("Error tracking account access:", error);
            // Silent fail - not critical for user experience
        }
    };

    const getRecentAccountIds = (): string[] => {
        return recentAccounts.map((r) => r.accountId);
    };

    return {
        recentAccounts,
        trackAccountAccess,
        getRecentAccountIds,
        loading,
    };
}
