import { useFinance } from "@/contexts/FinanceContext";
import { Budget } from "@/lib/firebaseTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BudgetCardProps {
    budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
    const { categories, getBudgetProgress, deleteBudget } = useFinance();
    const category = categories.find((c) => c.id === budget.categoryId);
    const { spent, remaining, percentage } = getBudgetProgress(budget.categoryId, budget.amount);

    if (!category) return null;

    const isOverBudget = spent > budget.amount;
    const progressColor = isOverBudget
        ? "bg-destructive"
        : percentage > 85
            ? "bg-yellow-500"
            : "bg-primary";

    return (
        <Card className="overflow-hidden shadow-soft hover:shadow-medium transition-all group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                        if (confirm("Delete this budget?")) {
                            deleteBudget(budget.id);
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-2xl font-bold">
                                ${spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                                / ${budget.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className={`text-sm font-medium ${isOverBudget ? "text-destructive" : "text-green-600"}`}>
                            {isOverBudget ? (
                                <span>Over by ${Math.abs(remaining).toFixed(0)}</span>
                            ) : (
                                <span>${remaining.toFixed(0)} left</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Progress value={percentage} className={`h-2 ${progressColor}`} />
                        <p className="text-xs text-right text-muted-foreground">
                            {percentage.toFixed(0)}% used
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
