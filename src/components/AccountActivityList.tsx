import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    DollarSign,
    Edit,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { AccountActivity } from "@/lib/firebaseTypes";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currencyUtils";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface AccountActivityListProps {
    accountId: string;
}

export function AccountActivityList({ accountId }: AccountActivityListProps) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<AccountActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !accountId) return;

        const q = query(
            collection(db, "accountActivities"),
            where("userId", "==", user.uid),
            where("accountId", "==", accountId),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData: AccountActivity[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                activitiesData.push({
                    ...data,
                    id: doc.id,
                    date: data.date?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AccountActivity);
            });
            setActivities(activitiesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, accountId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">No activity yet</p>
                <p className="text-sm mt-1">
                    Account changes and updates will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                >
                    <div className="flex items-start gap-3">
                        {/* Icon based on activity type */}
                        <div className="p-2 rounded-lg bg-muted">
                            {activity.type === "balance_update" ? (
                                activity.changes.balance &&
                                    activity.changes.balance.new > activity.changes.balance.old ? (
                                    <TrendingUp className="w-4 h-4 text-income" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-expense" />
                                )
                            ) : activity.type === "currency_update" ? (
                                <DollarSign className="w-4 h-4 text-accent" />
                            ) : (
                                <Edit className="w-4 h-4 text-primary" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                    {activity.type.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(activity.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            {/* Activity Details */}
                            {activity.type === "balance_update" && activity.changes.balance && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Balance changed from </span>
                                    <span className="font-medium">
                                        {formatCurrency(activity.changes.balance.old, "INR")}
                                    </span>
                                    <span className="text-muted-foreground"> to </span>
                                    <span className="font-medium">
                                        {formatCurrency(activity.changes.balance.new, "INR")}
                                    </span>
                                </div>
                            )}

                            {activity.type === "currency_update" && activity.changes.currency && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Currency changed from </span>
                                    <span className="font-medium">
                                        {activity.changes.currency.old}
                                    </span>
                                    <span className="text-muted-foreground"> to </span>
                                    <span className="font-medium">
                                        {activity.changes.currency.new}
                                    </span>
                                </div>
                            )}

                            {activity.type === "account_update" && activity.changes.name && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Name changed from </span>
                                    <span className="font-medium">"{activity.changes.name.old}"</span>
                                    <span className="text-muted-foreground"> to </span>
                                    <span className="font-medium">"{activity.changes.name.new}"</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
