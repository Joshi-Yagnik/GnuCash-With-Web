import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { CategoryCard } from "@/components/CategoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileFAB } from "@/components/mobile/MobileFAB";

export default function Categories() {
    const { getIncomeCategories, getExpenseCategories } = useFinance();

    const incomeCategories = getIncomeCategories();
    const expenseCategories = getExpenseCategories();

    return (
        <AppLayout>
            <div className="space-y-6 md:space-y-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2"
                    >
                        <Tag className="w-6 h-6 md:w-8 md:h-8" />
                        Categories
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-base text-muted-foreground mt-1"
                    >
                        Manage your income and expense categories
                    </motion.p>
                </div>

                <div className="flex justify-between items-center">
                    <Tabs defaultValue="expense" className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4">
                            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                                <TabsTrigger value="expense" className="text-xs md:text-sm">Expenses</TabsTrigger>
                                <TabsTrigger value="income" className="text-xs md:text-sm">Income</TabsTrigger>
                            </TabsList>
                            <div className="hidden md:block">
                                <AddCategoryDialog />
                            </div>
                        </div>

                        <TabsContent value="expense" className="space-y-4">
                            {expenseCategories.length === 0 ? (
                                <div className="text-center py-12 text-sm md:text-base text-muted-foreground border-2 border-dashed rounded-xl">
                                    No expense categories yet. Create one to start tracking.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {expenseCategories.map((category) => (
                                        <CategoryCard key={category.id} category={category} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="income" className="space-y-4">
                            {incomeCategories.length === 0 ? (
                                <div className="text-center py-12 text-sm md:text-base text-muted-foreground border-2 border-dashed rounded-xl">
                                    No income categories yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {incomeCategories.map((category) => (
                                        <CategoryCard key={category.id} category={category} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Mobile FAB */}
            <MobileFAB icon={<Tag className="w-6 h-6" />} onClick={() => {/* Open add category */ }} />
        </AppLayout>
    );
}
