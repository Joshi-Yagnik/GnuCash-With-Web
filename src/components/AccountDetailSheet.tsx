import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Edit,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Activity,
    Settings,
} from "lucide-react";
import { Account } from "@/lib/firebaseTypes";
import { formatCurrency, formatWithINREquivalent } from "@/lib/currencyUtils";
import { AccountTransactionList } from "./AccountTransactionList";
import { AccountActivityList } from "./AccountActivityList";
import { EditAccountDialog } from "./EditAccountDialog";
import { QuickTransactionDialog } from "./QuickTransactionDialog";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";

interface AccountDetailSheetProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AccountDetailSheet({
    account,
    open,
    onOpenChange,
}: AccountDetailSheetProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [quickTransactionOpen, setQuickTransactionOpen] = useState(false);
    const { transactions } = useFinance();

    if (!account) return null;

    const accountTransactions = transactions.filter((t) =>
        t.splits.some((s) => s.accountId === account.id)
    );

    const isPositive = account.balance >= 0;
    const transactionCount = accountTransactions.length;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "p-2.5 rounded-lg",
                                        isPositive
                                            ? "bg-success/10 text-success"
                                            : "bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {isPositive ? (
                                        <TrendingUp className="w-5 h-5" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl">{account.name}</h2>
                                    <Badge variant="outline" className="mt-1 capitalize">
                                        {account.type} Account
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditOpen(true)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            View and manage account details, transactions, and activity
                        </SheetDescription>
                    </SheetHeader>

                    {/* Account Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground font-medium">
                                Current Balance
                            </span>
                            <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-display font-bold text-foreground">
                                {formatCurrency(account.balance, account.currency || "INR")}
                            </p>
                            {account.currency && account.currency !== "INR" && (
                                <p className="text-sm text-muted-foreground">
                                    {formatWithINREquivalent(account.balance, account.currency)}
                                </p>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-primary/10">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <Activity className="w-3.5 h-3.5" />
                                    Transactions
                                </div>
                                <p className="text-lg font-semibold">{transactionCount}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Created
                                </div>
                                <p className="text-lg font-semibold">
                                    {(() => {
                                        const date = account.createdAt;
                                        // Handle Firestore Timestamp
                                        if (date && typeof (date as any).toDate === 'function') {
                                            return (date as any).toDate().toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            });
                                        }
                                        // Handle Date object or string
                                        const parsedDate = new Date(date);
                                        if (isNaN(parsedDate.getTime())) return "Unknown";
                                        return parsedDate.toLocaleDateString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                        });
                                    })()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <Separator className="my-6" />

                    {/* Tabbed Content */}
                    <Tabs defaultValue="transactions" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="transactions">
                                Transactions ({transactionCount})
                            </TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="transactions" className="mt-4">
                            <AccountTransactionList
                                accountId={account.id}
                                transactions={accountTransactions}
                            />
                        </TabsContent>

                        <TabsContent value="activity" className="mt-4">
                            <AccountActivityList accountId={account.id} />
                        </TabsContent>
                    </Tabs>

                    {/* Floating Action Button */}
                    <AnimatePresence>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: 0.2 }}
                            className="fixed bottom-8 right-8"
                        >
                            <Button
                                size="lg"
                                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
                                onClick={() => setQuickTransactionOpen(true)}
                            >
                                <Plus className="w-6 h-6" />
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </SheetContent>
            </Sheet>

            {/* Dialogs */}
            <EditAccountDialog
                account={account}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <QuickTransactionDialog
                open={quickTransactionOpen}
                onOpenChange={setQuickTransactionOpen}
                defaultAccountId={account.id}
            />
        </>
    );
}
