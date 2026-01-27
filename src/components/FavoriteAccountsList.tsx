import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AccountCard } from "./AccountCard";
import { useFavoriteAccounts } from "@/hooks/useFavoriteAccounts";
import { useFinance } from "@/contexts/FinanceContext";
import { Star } from "lucide-react";

export function FavoriteAccountsList() {
    const { favoriteAccountIds, loading } = useFavoriteAccounts();
    const { accounts } = useFinance();

    const favoriteAccounts = accounts.filter((account) =>
        favoriteAccountIds.includes(account.id)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        );
    }

    if (favoriteAccounts.length === 0) {
        return (
            <div className="text-center py-8 px-4 rounded-lg border border-dashed border-muted-foreground/30">
                <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    No favorite accounts yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    Click the star icon on an account to add it to favorites
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-xl font-display font-semibold text-foreground">
                    Favorite Accounts
                </h2>
                <span className="text-sm text-muted-foreground">
                    ({favoriteAccounts.length})
                </span>
            </div>

            <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                    {favoriteAccounts.map((account, index) => (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[280px] sm:min-w-[320px]"
                        >
                            <AccountCard account={account} index={index} />
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
