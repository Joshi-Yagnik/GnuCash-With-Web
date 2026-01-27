/**
 * Report Generator - Creates financial reports from double-entry accounting data
 */

import {
    Report,
    IncomeStatementReport,
    BalanceSheetReport,
    CashFlowReport,
    AccountSummaryReport,
    TransactionDetailReport,
    ReportLineItem,
    DateRange,
    ReportFilter,
    ReportConfig,
} from "./reportTypes";
import { Account, Transaction, AccountType } from "./firebaseTypes";
import { getDisplayAmount } from "./accountingUtils";

export class ReportGenerator {
    /**
     * Generate Income Statement (Profit & Loss Report)
     * Shows revenue, expenses, and net income for a period
     */
    static generateIncomeStatement(
        transactions: Transaction[],
        accounts: Account[],
        dateRange: DateRange,
        config?: ReportConfig
    ): IncomeStatementReport {
        const filteredTxns = this.filterTransactionsByDate(transactions, dateRange);

        // Group by income and expense accounts
        const revenueItems: ReportLineItem[] = [];
        const expenseItems: ReportLineItem[] = [];

        const accountTotals = new Map<string, number>();

        // Process all splits
        filteredTxns.forEach((txn) => {
            txn.splits.forEach((split) => {
                if (split.accountType === "income" || split.accountType === "expense") {
                    const currentTotal = accountTotals.get(split.accountPath) || 0;
                    accountTotals.set(split.accountPath, currentTotal + Math.abs(split.value));
                }
            });
        });

        // Organize into revenue and expenses
        accountTotals.forEach((amount, accountPath) => {
            const account = accounts.find((a) => a.path === accountPath || a.name === accountPath);
            const accountType = account?.type;

            const item: ReportLineItem = {
                accountPath,
                accountId: account?.id,
                amount,
            };

            if (accountType === "income") {
                revenueItems.push(item);
            } else if (accountType === "expense") {
                expenseItems.push(item);
            }
        });

        // Calculate totals
        const totalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        const netIncome = totalRevenue - totalExpenses;

        // Add percentages if configured
        if (config?.showPercentages) {
            revenueItems.forEach((item) => {
                item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
            });
            expenseItems.forEach((item) => {
                item.percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
            });
        }

        return {
            id: `income-statement-${Date.now()}`,
            name: "Income Statement",
            type: "income-statement",
            dateRange,
            generatedAt: new Date(),
            data: {
                revenue: {
                    items: revenueItems.sort((a, b) => b.amount - a.amount),
                    total: totalRevenue,
                },
                expenses: {
                    items: expenseItems.sort((a, b) => b.amount - a.amount),
                    total: totalExpenses,
                },
                netIncome,
                netIncomePercentage: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
            },
        };
    }

    /**
     * Generate Balance Sheet
     * Shows assets, liabilities, and equity at a point in time
     */
    static generateBalanceSheet(
        accounts: Account[],
        asOfDate: Date,
        config?: ReportConfig
    ): BalanceSheetReport {
        const assets: ReportLineItem[] = [];
        const liabilities: ReportLineItem[] = [];

        accounts.forEach((account) => {
            const item: ReportLineItem = {
                accountPath: account.path || account.name,
                accountId: account.id,
                amount: account.balance,
            };

            if (account.type === "asset") {
                assets.push(item);
            } else if (account.type === "liability") {
                liabilities.push(item);
            }
        });

        const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
        const equity = totalAssets - totalLiabilities;

        return {
            id: `balance-sheet-${Date.now()}`,
            name: "Balance Sheet",
            type: "balance-sheet",
            dateRange: { startDate: asOfDate, endDate: asOfDate },
            generatedAt: new Date(),
            data: {
                assets: {
                    current: assets,
                    nonCurrent: [],
                    total: totalAssets,
                },
                liabilities: {
                    current: liabilities,
                    nonCurrent: [],
                    total: totalLiabilities,
                },
                equity: {
                    items: [
                        {
                            accountPath: "Net Worth",
                            amount: equity,
                        },
                    ],
                    total: equity,
                },
                totalLiabilitiesAndEquity: totalLiabilities + equity,
            },
        };
    }

    /**
     * Generate Cash Flow Report
     * Shows inflows and outflows of cash during a period
     */
    static generateCashFlow(
        transactions: Transaction[],
        accounts: Account[],
        dateRange: DateRange,
        config?: ReportConfig
    ): CashFlowReport {
        const filteredTxns = this.filterTransactionsByDate(transactions, dateRange);

        // Get cash/bank accounts
        const cashAccounts = accounts.filter(
            (a) => a.type === "asset" && (a.name.toLowerCase().includes("cash") || a.name.toLowerCase().includes("bank"))
        );

        let operating = 0;
        let investing = 0;
        let financing = 0;

        // Simplified: categorize based on account types involved
        filteredTxns.forEach((txn) => {
            txn.splits.forEach((split) => {
                const isCashAccount = cashAccounts.some((a) => a.id === split.accountId);

                if (isCashAccount) {
                    // Cash account affected
                    if (split.accountType === "asset") {
                        // Cash flow from operations (income/expenses)
                        const otherSplits = txn.splits.filter((s) => s.id !== split.id);
                        const hasIncomeExpense = otherSplits.some(
                            (s) => s.accountType === "income" || s.accountType === "expense"
                        );

                        if (hasIncomeExpense) {
                            operating += split.value;
                        } else {
                            // Transfer between assets (investing/financing)
                            investing += split.value;
                        }
                    }
                }
            });
        });

        const netCashFlow = operating + investing + financing;

        return {
            id: `cash-flow-${Date.now()}`,
            name: "Cash Flow Statement",
            type: "cash-flow",
            dateRange,
            generatedAt: new Date(),
            data: {
                operating: {
                    items: [{ accountPath: "Operating Activities", amount: operating }],
                    total: operating,
                },
                investing: {
                    items: [{ accountPath: "Investing Activities", amount: investing }],
                    total: investing,
                },
                financing: {
                    items: [{ accountPath: "Financing Activities", amount: financing }],
                    total: financing,
                },
                netCashFlow,
                beginningCash: 0, // TODO: Calculate from previous period
                endingCash: netCashFlow,
            },
        };
    }

    /**
     * Generate Account Summary Report
     * Lists all accounts with balances and activity
     */
    static generateAccountSummary(
        accounts: Account[],
        transactions: Transaction[],
        dateRange: DateRange
    ): AccountSummaryReport {
        const filteredTxns = this.filterTransactionsByDate(transactions, dateRange);

        const accountSummaries = accounts.map((account) => {
            // Count transactions for this account
            const txnCount = filteredTxns.filter((txn) =>
                txn.splits.some((s) => s.accountId === account.id)
            ).length;

            // Find last activity
            const accountTxns = filteredTxns
                .filter((txn) => txn.splits.some((s) => s.accountId === account.id))
                .sort((a, b) => b.date.getTime() - a.date.getTime());

            const lastActivity = accountTxns[0]?.date;

            return {
                accountId: account.id,
                accountName: account.name,
                accountPath: account.path || account.name,
                accountType: account.type,
                balance: account.balance,
                currency: account.currency,
                lastActivity,
                transactionCount: txnCount,
            };
        });

        const totalAssets = accountSummaries
            .filter((a) => a.accountType === "asset")
            .reduce((sum, a) => sum + a.balance, 0);

        const totalLiabilities = accountSummaries
            .filter((a) => a.accountType === "liability")
            .reduce((sum, a) => sum + a.balance, 0);

        return {
            id: `account-summary-${Date.now()}`,
            name: "Account Summary",
            type: "account-summary",
            dateRange,
            generatedAt: new Date(),
            data: {
                accounts: accountSummaries,
                totalAssets,
                totalLiabilities,
                netWorth: totalAssets - totalLiabilities,
            },
        };
    }

    /**
     * Generate Transaction Detail Report
     * Lists all transactions in the period with details
     */
    static generateTransactionDetail(
        transactions: Transaction[],
        accounts: Account[],
        dateRange: DateRange,
        filter?: ReportFilter
    ): TransactionDetailReport {
        let filteredTxns = this.filterTransactionsByDate(transactions, dateRange);

        // Apply additional filters
        if (filter) {
            if (filter.accountIds && filter.accountIds.length > 0) {
                filteredTxns = filteredTxns.filter((txn) =>
                    txn.splits.some((s) => filter.accountIds?.includes(s.accountId))
                );
            }

            if (filter.searchTerm) {
                const term = filter.searchTerm.toLowerCase();
                filteredTxns = filteredTxns.filter((txn) =>
                    txn.description.toLowerCase().includes(term)
                );
            }
        }

        const transactionDetails = filteredTxns.map((txn) => {
            return {
                transactionId: txn.id,
                date: txn.date,
                description: txn.description,
                splits: txn.splits.map((split) => ({
                    accountPath: split.accountPath,
                    amount: Math.abs(split.value),
                    isDebit: split.value > 0,
                })),
                total: txn.splits[0] ? Math.abs(txn.splits[0].value) : 0,
            };
        });

        const totalIncome = transactionDetails
            .flatMap((t) => t.splits)
            .filter((s) => s.isDebit)
            .reduce((sum, s) => sum + s.amount, 0);

        const totalExpenses = transactionDetails
            .flatMap((t) => t.splits)
            .filter((s) => !s.isDebit)
            .reduce((sum, s) => sum + s.amount, 0);

        return {
            id: `transaction-detail-${Date.now()}`,
            name: "Transaction Detail",
            type: "transaction-detail",
            dateRange,
            generatedAt: new Date(),
            data: {
                transactions: transactionDetails,
                summary: {
                    totalIncome,
                    totalExpenses,
                    netChange: totalIncome - totalExpenses,
                    transactionCount: transactionDetails.length,
                },
            },
        };
    }

    // Helper: Filter transactions by date range
    private static filterTransactionsByDate(
        transactions: Transaction[],
        dateRange: DateRange
    ): Transaction[] {
        return transactions.filter((txn) => {
            const txnDate = txn.date instanceof Date ? txn.date : new Date(txn.date);
            return txnDate >= dateRange.startDate && txnDate <= dateRange.endDate;
        });
    }

    // Helper: Get date range for common periods
    static getDateRangeForPeriod(period: string): DateRange {
        const now = new Date();
        const startDate = new Date(now);
        const endDate = new Date(now);

        switch (period) {
            case "today":
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "this-week":
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "this-month":
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "this-year":
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "last-month":
                startDate.setMonth(now.getMonth() - 1, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(now.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                // Default to this month
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
        }

        return { startDate, endDate };
    }
}

