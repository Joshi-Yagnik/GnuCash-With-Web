import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    HelpCircle,
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    Target,
    PieChart,
    Tag,
    BookOpen,
    Repeat,
    Upload,
    Hash,
    Settings,
    User,
} from "lucide-react";

export default function Help() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <AppLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Header */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                    >
                        <HelpCircle className="w-8 h-8" />
                        Help & Documentation
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        A complete guide to managing your finances with FinanceFlow.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2"
                >
                    {/* Finance Section */}
                    <motion.div variants={item} className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            Finance
                        </h2>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <LayoutDashboard className="w-5 h-5 text-blue-500" />
                                    Dashboard
                                </CardTitle>
                                <CardDescription>Your financial overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="overview">
                                        <AccordionTrigger>What information is here?</AccordionTrigger>
                                        <AccordionContent>
                                            The dashboard displays your total Net Worth, Income, Expenses, and Savings. It also shows a spending chart, category breakdown, and recent activity.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Wallet className="w-5 h-5 text-emerald-500" />
                                    Accounts
                                </CardTitle>
                                <CardDescription>Managing assets and liabilities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="types">
                                        <AccordionTrigger>Account Types</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                <li><strong>Asset:</strong> Bank accounts, Cash, Savings.</li>
                                                <li><strong>Liability:</strong> Credit cards, Loans.</li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="create">
                                        <AccordionTrigger>Creating Accounts</AccordionTrigger>
                                        <AccordionContent>
                                            Go to the Accounts page, click "New Account", select the type, and enter the details. You can set an initial balance for existing accounts.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                                    Transactions
                                </CardTitle>
                                <CardDescription>Recording daily activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="add">
                                        <AccordionTrigger>Adding Transactions</AccordionTrigger>
                                        <AccordionContent>
                                            Click "New Transaction" to record income, expenses, or transfers. For complex entries involving multiple accounts, use the "Split Transaction" feature.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="w-5 h-5 text-destructive" />
                                    Budgets
                                </CardTitle>
                                <CardDescription>Planning your spending</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="manage">
                                        <AccordionTrigger>Setting Budgets</AccordionTrigger>
                                        <AccordionContent>
                                            Create monthly budgets for specific categories to track your spending limits. The progress bars clarify how much budget remains.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column: Analysis, Tools, Settings */}
                    <motion.div variants={item} className="space-y-6">

                        {/* Analysis Section */}
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            Analysis
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <PieChart className="w-5 h-5 text-purple-500" />
                                    Reports & Categories
                                </CardTitle>
                                <CardDescription>Deep dive into data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="reports">
                                        <AccordionTrigger>Reports</AccordionTrigger>
                                        <AccordionContent>
                                            View detailed charts for Income vs Expenses and Net Worth growth over time.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="categories">
                                        <AccordionTrigger>Categories</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag className="w-4 h-4" />
                                                <span>Organize transactions</span>
                                            </div>
                                            Manage your income and expense categories to keep reporting accurate. You can add custom icons and colors.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Tools Section */}
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary pt-2">
                            Tools
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BookOpen className="w-5 h-5 text-amber-500" />
                                    Books & Organization
                                </CardTitle>
                                <CardDescription>Advanced file management</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="books">
                                        <AccordionTrigger>Multiple Books</AccordionTrigger>
                                        <AccordionContent>
                                            Keep personal and business finances completely separate by creating different "Books". Switch between them using the sidebar book switcher.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="recurring">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Repeat className="w-4 h-4" />
                                                <span>Recurring Transactions</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Automate regular payments like rent or subscriptions. Set the frequency and let the app handle the creation.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="tags">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                <span>Tags</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Add tags to transactions for cross-category filtering (e.g., "#vacation2024").
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="import">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                <span>Import / Export</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Backup your data to JSON or import from other sources. Always keep backups of important financial data!
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Settings Section */}
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary pt-2">
                            Settings
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="w-5 h-5 text-slate-500" />
                                    Configuration
                                </CardTitle>
                                <CardDescription>App preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="profile">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>Profile & Preferences</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Update your name and default currency. Changes here affect your user profile across all books.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                    </motion.div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
