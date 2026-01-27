/**
 * Report Types and Interfaces for Dynamic Reporting System
 * Based on standard accounting reports using double-entry data
 */

import { Account, Transaction, Split } from "./firebaseTypes";

// Report time periods
export type ReportPeriod =
    | "today"
    | "this-week"
    | "this-month"
    | "this-quarter"
    | "this-year"
    | "last-month"
    | "last-quarter"
    | "last-year"
    | "custom";

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

// Base report interface
export interface Report {
    id: string;
    name: string;
    type: ReportType;
    description?: string;
    dateRange: DateRange;
    generatedAt: Date;
    data: any; // Report-specific data
}

// Report types
export type ReportType =
    | "income-statement"
    | "balance-sheet"
    | "cash-flow"
    | "profit-loss"
    | "account-summary"
    | "transaction-detail"
    | "budget-variance"
    | "custom";

// Income Statement (Profit & Loss)
export interface IncomeStatementReport extends Report {
    type: "income-statement";
    data: {
        revenue: {
            items: ReportLineItem[];
            total: number;
        };
        expenses: {
            items: ReportLineItem[];
            total: number;
        };
        netIncome: number;
        netIncomePercentage: number;
    };
}

// Balance Sheet
export interface BalanceSheetReport extends Report {
    type: "balance-sheet";
    data: {
        assets: {
            current: ReportLineItem[];
            nonCurrent: ReportLineItem[];
            total: number;
        };
        liabilities: {
            current: ReportLineItem[];
            nonCurrent: ReportLineItem[];
            total: number;
        };
        equity: {
            items: ReportLineItem[];
            total: number;
        };
        totalLiabilitiesAndEquity: number;
    };
}

// Cash Flow Statement
export interface CashFlowReport extends Report {
    type: "cash-flow";
    data: {
        operating: {
            items: ReportLineItem[];
            total: number;
        };
        investing: {
            items: ReportLineItem[];
            total: number;
        };
        financing: {
            items: ReportLineItem[];
            total: number;
        };
        netCashFlow: number;
        beginningCash: number;
        endingCash: number;
    };
}

// Account Summary Report
export interface AccountSummaryReport extends Report {
    type: "account-summary";
    data: {
        accounts: AccountSummaryItem[];
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
    };
}

// Transaction Detail Report
export interface TransactionDetailReport extends Report {
    type: "transaction-detail";
    data: {
        transactions: TransactionDetailItem[];
        summary: {
            totalIncome: number;
            totalExpenses: number;
            netChange: number;
            transactionCount: number;
        };
    };
}

// Report Line Item (for grouping)
export interface ReportLineItem {
    accountPath: string;
    accountId?: string;
    amount: number;
    percentage?: number;
    children?: ReportLineItem[]; // For hierarchical accounts
}

// Account Summary Item
export interface AccountSummaryItem {
    accountId: string;
    accountName: string;
    accountPath: string;
    accountType: string;
    balance: number;
    currency: string;
    lastActivity?: Date;
    transactionCount: number;
}

// Transaction Detail Item
export interface TransactionDetailItem {
    transactionId: string;
    date: Date;
    description: string;
    splits: {
        accountPath: string;
        amount: number;
        isDebit: boolean;
    }[];
    total: number;
}

// Report Filter Options
export interface ReportFilter {
    dateRange?: DateRange;
    accountIds?: string[];
    accountTypes?: string[];
    minAmount?: number;
    maxAmount?: number;
    searchTerm?: string;
    includeSubAccounts?: boolean;
}

// Report Export Format
export type ExportFormat = "pdf" | "csv" | "excel" | "json";

// Report Configuration
export interface ReportConfig {
    showPercentages?: boolean;
    showComparisons?: boolean; // Compare with previous period
    groupByAccount?: boolean;
    groupByCategory?: boolean;
    includeCharts?: boolean;
    currencyFormat?: string;
}

// Scheduled Report
export interface ScheduledReport {
    id: string;
    userId: string;
    bookId: string;
    reportType: ReportType;
    name: string;
    schedule: ReportSchedule;
    config: ReportConfig;
    filters: ReportFilter;
    emailTo?: string[];
    isActive: boolean;
    lastRun?: Date;
    nextRun?: Date;
}

export interface ReportSchedule {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time?: string; // HH:mm format
}
