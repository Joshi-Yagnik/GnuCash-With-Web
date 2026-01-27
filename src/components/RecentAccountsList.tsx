import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";
import { useRecentAccounts } from "@/hooks/useRecentAccounts";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AccountDetailSheet } from "./AccountDetailSheet";

export function RecentAccountsList() {
    const { recentAccounts, loading } = useRecentAccounts();
    const { getAccountById } = useFinance();
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        );
    }

    const validRecentAccounts = recentAccounts
        .map((recent) => ({
            ...recent,
            account: getAccountById(recent.accountId),
        }))
        .filter((item) => item.account !== undefined);

    if (validRecentAccounts.length === 0) {
        return (
            <div className="text-center py-8 px-4 rounded-lg border border-dashed border-muted-foreground/30">
                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    No recent account activity
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    Accounts you view will appear here
                </p>
            </div>
        );
    }

    const handleAccountClick = (account: any) => {
        setSelectedAccount(account);
        setDetailOpen(true);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-display font-semibold text-foreground">
                        Recent Accounts
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        ({validRecentAccounts.length})
                    </span>
                </div>

                <div className="space-y-2">
                    {validRecentAccounts.map((item, index) => {
                        const account = item.account!;
                        const isPositive = account.balance >= 0;

                        return (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleAccountClick(account)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border border-border",
                                    "hover:border-primary/50 hover:bg-accent/5 cursor-pointer transition-all"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-2.5 rounded-lg",
                                        isPositive
                                            ? "bg-success/10 text-success"
                                            : "bg-destructive/10 text-destructive"
                                    )}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{account.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {account.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.lastAccessed).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatCurrency(account.balance, account.currency || "INR")}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {selectedAccount && (
                <AccountDetailSheet
                    account={selectedAccount}
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                />
            )}
        </>
    );
}
