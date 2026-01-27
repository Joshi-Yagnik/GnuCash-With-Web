import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Repeat, Calendar, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecurring } from "@/hooks/useRecurring";
import { AddRecurringTransactionDialog } from "@/components/AddRecurringTransactionDialog";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "@/lib/currencyUtils";

export default function Recurring() {
    const { recurringTransactions, loading, deleteRecurringTransaction, processDueTransactions } = useRecurring();

    // Helper to safely convert Firestore timestamps or Dates to Date object
    const toDate = (date: any): Date => {
        if (!date) return new Date();
        if (date instanceof Date) return date;
        if (typeof date.toDate === 'function') return date.toDate(); // Firestore Timestamp
        if (date.seconds) return new Date(date.seconds * 1000); // Rough timestamp check
        return new Date(date);
    };

    // Check for due transactions on mount
    useEffect(() => {
        processDueTransactions();
    }, [processDueTransactions]);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">Loading...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                        >
                            <Repeat className="w-8 h-8" />
                            Recurring Transactions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Manage recurring transactions and subscriptions
                        </motion.p>
                    </div>
                    <AddRecurringTransactionDialog />
                </div>

                {recurringTransactions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Repeat className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No key recurring transactions</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                Set up rent, subscriptions, or salary to be recorded automatically.
                            </p>
                            <AddRecurringTransactionDialog />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {recurringTransactions.map((rt) => (
                            <motion.div
                                key={rt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${rt.template.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <Repeat className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{rt.template.description}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Badge variant="outline" className="capitalize">
                                                {rt.frequency}
                                            </Badge>
                                            <span>
                                                Next: {format(toDate(rt.nextRun), "PPP")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className={`font-bold text-lg ${rt.template.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {rt.template.type === 'income' ? '+' : '-'}
                                            {getCurrencySymbol("INR")} {rt.template.amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {rt.active ? "Active" : "Paused"}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => deleteRecurringTransaction(rt.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
