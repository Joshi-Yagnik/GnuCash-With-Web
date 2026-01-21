import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { AccountActivity } from "@/lib/firebaseTypes";
import { formatCurrency } from "@/lib/currencyUtils";
import { cn } from "@/lib/utils";

interface AccountActivityItemProps {
    activity: AccountActivity;
    index: number;
}

export function AccountActivityItem({ activity, index }: AccountActivityItemProps) {
    const getActivityIcon = () => {
        if (activity.type === 'balance_update') {
            if (activity.changes.balance) {
                const increased = activity.changes.balance.new > activity.changes.balance.old;
                return increased ? TrendingUp : TrendingDown;
            }
        }
        if (activity.type === 'currency_update') {
            return DollarSign;
        }
        return RefreshCw;
    };

    const getActivityDescription = () => {
        const changes = [];

        if (activity.changes.balance) {
            const old = activity.changes.balance.old;
            const newVal = activity.changes.balance.new;
            const currency = activity.changes.currency?.new || 'INR';
            changes.push(
                `Balance: ${formatCurrency(old, currency)} → ${formatCurrency(newVal, currency)}`
            );
        }

        if (activity.changes.currency) {
            changes.push(
                `Currency: ${activity.changes.currency.old} → ${activity.changes.currency.new}`
            );
        }

        if (activity.changes.name) {
            changes.push(
                `Name: ${activity.changes.name.old} → ${activity.changes.name.new}`
            );
        }

        return changes.join(', ');
    };

    const getActivityColor = () => {
        if (activity.type === 'balance_update' && activity.changes.balance) {
            return activity.changes.balance.new > activity.changes.balance.old
                ? 'text-success'
                : 'text-destructive';
        }
        return 'text-primary';
    };

    const Icon = getActivityIcon();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    activity.type === 'balance_update' && activity.changes.balance
                        ? activity.changes.balance.new > activity.changes.balance.old
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        : "bg-primary/10"
                )}>
                    <Icon className={cn("w-5 h-5", getActivityColor())} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{activity.accountName}</p>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                            Account Updated
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {getActivityDescription()}
                    </p>
                </div>
            </div>

            <div className="text-right ml-4">
                <p className="text-xs text-muted-foreground">
                    {activity.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        </motion.div>
    );
}
