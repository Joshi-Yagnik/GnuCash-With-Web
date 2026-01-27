import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { AddBudgetDialog } from "@/components/AddBudgetDialog";
import { BudgetCard } from "@/components/BudgetCard";

export default function Budgets() {
    const { budgets } = useFinance();

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                        >
                            <Target className="w-8 h-8" />
                            Budgets
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Track your spending against monthly limits
                        </motion.p>
                    </div>
                    <AddBudgetDialog />
                </div>

                {/* Content */}
                {(budgets?.length || 0) === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-12 rounded-xl border-2 border-dashed"
                    >
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No Budgets Set</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                            Create a budget for a category to start tracking your monthly spending.
                        </p>
                        <AddBudgetDialog />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {budgets.map((budget) => (
                            <BudgetCard key={budget.id} budget={budget} />
                        ))}
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
