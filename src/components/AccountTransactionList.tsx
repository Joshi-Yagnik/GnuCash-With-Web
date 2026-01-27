import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight,
    MoreVertical,
    Edit,
    Trash2,
    Split,
    MoveRight,
    Search,
} from "lucide-react";
import { Transaction } from "@/lib/firebaseTypes";
import {
    getDisplayAmount,
    inferTransactionType,
    getOtherAccountPath
} from "@/lib/accountingUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { cn } from "@/lib/utils";

type TransactionFilterType = "income" | "expense" | "transfer";

interface AccountTransactionListProps {
    accountId: string;
    transactions: Transaction[];
}

const typeIcons = {
    income: ArrowDownRight,
    expense: ArrowUpRight,
    transfer: ArrowLeftRight,
};

const typeColors = {
    income: "text-income",
    expense: "text-expense",
    transfer: "text-transfer",
};

export function AccountTransactionList({
    accountId,
    transactions,
}: AccountTransactionListProps) {
    const { deleteTransaction, getAccountById } = useFinance();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<TransactionFilterType | "all">("all");
    const [editingTransaction, setEditingTransaction] =
        useState<Transaction | null>(null);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const filtered = transactions.filter((t) => {
            const matchesSearch = t.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const transactionType = inferTransactionType(t.splits, accountId);
            const matchesType = typeFilter === "all" || transactionType === typeFilter;

            return matchesSearch && matchesType;
        });

        const groups: Record<string, Transaction[]> = {};
        const now = new Date();
        const today = now.toDateString();
        const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();
        const weekAgo = new Date(now.setDate(now.getDate() - 6));

        filtered.forEach((t) => {
            const date = new Date(t.date);
            const dateString = date.toDateString();

            let groupKey: string;
            if (dateString === today) {
                groupKey = "Today";
            } else if (dateString === yesterday) {
                groupKey = "Yesterday";
            } else if (date >= weekAgo) {
                groupKey = "This Week";
            } else {
                groupKey = date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                });
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(t);
        });

        return groups;
    }, [transactions, searchQuery, typeFilter, accountId]);

    const handleDelete = (transactionId: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction(transactionId);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as TransactionFilterType | "all")}
                >
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Transaction Groups */}
            {Object.keys(groupedTransactions).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm mt-1">
                        Try adjusting your search or add a new transaction.
                    </p>
                </div>
            ) : (
                Object.entries(groupedTransactions).map(([groupKey, groupTransactions]) => (
                    <div key={groupKey}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                            {groupKey}
                        </h3>
                        <div className="space-y-2">
                            {groupTransactions.map((transaction, index) => {
                                const transactionType = inferTransactionType(transaction.splits, accountId);
                                const Icon = typeIcons[transactionType];

                                const amount = getDisplayAmount(transaction.splits, accountId);
                                const isPositive = amount > 0; // Positive means money coming into the account (Debit for Asset)

                                // For display, we want to show category or "To/From Account"
                                const otherParams = getOtherAccountPath(transaction.splits, accountId);
                                const otherAccountName = otherParams.split(':').pop() || otherParams;

                                return (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                                    >
                                        <div
                                            className={cn(
                                                "p-2 rounded-lg bg-muted",
                                                typeColors[transactionType]
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {transaction.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-xs">
                                                    {otherAccountName}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={cn(
                                                    "font-semibold",
                                                    isPositive ? "text-income" : "text-expense"
                                                )}
                                            >
                                                {isPositive ? "+" : ""}
                                                {formatCurrency(
                                                    amount,
                                                    transaction.currency || "INR"
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(transaction.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setEditingTransaction(transaction)}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled>
                                                    <Split className="w-4 h-4 mr-2" />
                                                    Split Transaction
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled>
                                                    <MoveRight className="w-4 h-4 mr-2" />
                                                    Move to Account
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* Edit Transaction Dialog */}
            {editingTransaction && (
                <EditTransactionDialog
                    transaction={editingTransaction}
                    open={!!editingTransaction}
                    onOpenChange={(open) => !open && setEditingTransaction(null)}
                />
            )}
        </div>
    );
}
