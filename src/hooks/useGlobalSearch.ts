import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { useFinance } from "@/contexts/FinanceContext";
import { Account, Transaction, LegacyTransaction } from "@/lib/firebaseTypes";
import { useFavoriteAccounts } from "@/hooks/useFavoriteAccounts";
import { useRecentAccounts } from "@/hooks/useRecentAccounts";

export interface SearchResult {
    type: "account" | "transaction" | "action";
    id: string;
    title: string;
    subtitle?: string;
    data?: any;
    icon?: string;
    relevance?: number;
}

export function useGlobalSearch() {
    const { accounts, transactions } = useFinance();
    const { favoriteAccountIds } = useFavoriteAccounts();
    const { getRecentAccountIds } = useRecentAccounts();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    // Configure Fuse.js for fuzzy searching
    const accountFuse = useMemo(() => {
        return new Fuse(accounts, {
            keys: ["name", "type"],
            threshold: 0.3,
            includeScore: true,
        });
    }, [accounts]);

    const transactionFuse = useMemo(() => {
        return new Fuse(transactions, {
            keys: ["description", "category"],
            threshold: 0.4,
            includeScore: true,
        });
    }, [transactions]);

    useEffect(() => {
        console.log("Search query changed:", searchQuery);
        console.log("Accounts available:", accounts.length);
        console.log("Transactions available:", transactions.length);

        if (!searchQuery.trim()) {
            // Show suggested actions when no query
            const recentAccountIds = getRecentAccountIds();
            const recentResults: SearchResult[] = recentAccountIds
                .slice(0, 3)
                .map((id) => {
                    const account = accounts.find((a) => a.id === id);
                    if (!account) return null;
                    return {
                        type: "account" as const,
                        id: account.id,
                        title: account.name,
                        subtitle: `${account.type} account`,
                        data: account,
                        relevance: 100,
                    };
                })
                .filter(Boolean) as SearchResult[];

            const emptyResults = [
                {
                    type: "action" as const,
                    id: "add-transaction",
                    title: "Add New Transaction",
                    icon: "plus",
                    relevance: 200,
                },
                {
                    type: "action" as const,
                    id: "add-account",
                    title: "Add New Account",
                    icon: "plus",
                    relevance: 199,
                },
                ...recentResults,
            ];

            console.log("Empty query - showing default results:", emptyResults.length);
            setResults(emptyResults);
            return;
        }

        // Search accounts
        const accountResults = accountFuse.search(searchQuery).map((result) => {
            const account = result.item;
            let relevance = 100 - (result.score || 0) * 100;

            // Boost favorite accounts
            if (favoriteAccountIds.includes(account.id)) {
                relevance += 20;
            }

            // Boost recent accounts
            if (getRecentAccountIds().includes(account.id)) {
                relevance += 10;
            }

            return {
                type: "account" as const,
                id: account.id,
                title: account.name,
                subtitle: `${account.type} account - Balance: $${account.balance.toFixed(2)}`,
                data: account,
                relevance,
            };
        });

        console.log("Account search results:", accountResults.length);

        // Search transactions
        const transactionResults = transactionFuse
            .search(searchQuery)
            .slice(0, 5)
            .map((result) => {
                const transaction = result.item as any; // Handle both Transaction and LegacyTransaction types

                // Check if it's a legacy transaction (has accountId and amount directly)
                const isLegacy = 'accountId' in transaction && 'amount' in transaction;

                const primaryAccountId = isLegacy
                    ? transaction.accountId
                    : transaction.splits?.[0]?.accountId;
                const account = accounts.find((a) => a.id === primaryAccountId);
                const amount = isLegacy ? transaction.amount : 0;
                const type = isLegacy ? transaction.type : "transaction";

                return {
                    type: "transaction" as const,
                    id: transaction.id,
                    title: transaction.description || "Untitled Transaction",
                    subtitle: `${type} - ${account?.name || "Unknown"} - $${amount.toFixed(2)}`,
                    data: transaction,
                    relevance: 50 - (result.score || 0) * 50,
                };
            });

        console.log("Transaction search results:", transactionResults.length);

        // Action-oriented results
        const actions: SearchResult[] = [];

        if (searchQuery.toLowerCase().includes("add") || searchQuery.toLowerCase().includes("new")) {
            actions.push({
                type: "action",
                id: "add-transaction",
                title: "Add New Transaction",
                icon: "plus",
                relevance: 90,
            });
        }

        // Combine and sort by relevance
        const allResults = [...actions, ...accountResults, ...transactionResults];
        allResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

        console.log("Total search results:", allResults.length);
        setResults(allResults.slice(0, 10));
    }, [
        searchQuery,
        accounts,
        transactions,
        accountFuse,
        transactionFuse,
        favoriteAccountIds,
        getRecentAccountIds,
    ]);

    return {
        searchQuery,
        setSearchQuery,
        results,
    };
}
