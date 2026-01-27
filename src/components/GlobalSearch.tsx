import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Search,
    Plus,
    TrendingUp,
    Receipt,
    Wallet,
    Star,
    Clock,
} from "lucide-react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currencyUtils";
import { cn } from "@/lib/utils";
import { AccountDetailSheet } from "./AccountDetailSheet";
import { QuickTransactionDialog } from "./QuickTransactionDialog";
import { AddAccountDialog } from "./AddAccountDialog";

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery, results } = useGlobalSearch();
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [accountDetailOpen, setAccountDetailOpen] = useState(false);
    const [quickTransactionOpen, setQuickTransactionOpen] = useState(false);
    const [addAccountOpen, setAddAccountOpen] = useState(false);

    // Reset search when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open, setSearchQuery]);

    const handleSelect = (result: any) => {
        onOpenChange(false);

        switch (result.type) {
            case "account":
                setSelectedAccount(result.data);
                setAccountDetailOpen(true);
                break;

            case "transaction":
                // Navigate to transactions page with filter
                navigate("/transactions");
                break;

            case "action":
                if (result.id === "add-transaction") {
                    setQuickTransactionOpen(true);
                } else if (result.id === "add-account") {
                    setAddAccountOpen(true);
                }
                break;
        }
    };

    const getResultIcon = (type: string, icon?: string) => {
        if (icon === "plus") return Plus;

        switch (type) {
            case "account":
                return Wallet;
            case "transaction":
                return Receipt;
            case "action":
                return TrendingUp;
            default:
                return Search;
        }
    };

    // Group results by type
    const groupedResults = results.reduce((acc, result) => {
        const key = result.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
    }, {} as Record<string, typeof results>);

    return (
        <>
            <CommandDialog open={open} onOpenChange={onOpenChange}>
                <CommandInput
                    placeholder="Search accounts, transactions, or type a command..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {/* Actions */}
                    {groupedResults.action && (
                        <>
                            <CommandGroup heading="Actions">
                                {groupedResults.action.map((result) => {
                                    const Icon = getResultIcon(result.type, result.icon);
                                    return (
                                        <CommandItem
                                            key={result.id}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-center gap-3 py-3"
                                        >
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{result.title}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                        </>
                    )}

                    {/* Accounts */}
                    {groupedResults.account && (
                        <>
                            <CommandGroup heading="Accounts">
                                {groupedResults.account.map((result) => {
                                    const Icon = getResultIcon(result.type);
                                    const account = result.data;
                                    return (
                                        <CommandItem
                                            key={result.id}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-center gap-3 py-3"
                                        >
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    account.balance >= 0
                                                        ? "bg-success/10 text-success"
                                                        : "bg-destructive/10 text-destructive"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{result.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                        {account.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatCurrency(account.balance, account.currency || "INR")}
                                                    </span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {groupedResults.transaction && <CommandSeparator />}
                        </>
                    )}

                    {/* Transactions */}
                    {groupedResults.transaction && (
                        <CommandGroup heading="Recent Transactions">
                            {groupedResults.transaction.map((result) => {
                                const Icon = getResultIcon(result.type);
                                const transaction = result.data;
                                return (
                                    <CommandItem
                                        key={result.id}
                                        onSelect={() => handleSelect(result)}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {result.subtitle}
                                            </p>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </CommandList>

                {/* Keyboard hint */}
                <div className="border-t p-2 text-xs text-muted-foreground text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to close •{" "}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> to navigate
                </div>
            </CommandDialog>

            {/* Detail Dialogs */}
            {selectedAccount && (
                <AccountDetailSheet
                    account={selectedAccount}
                    open={accountDetailOpen}
                    onOpenChange={setAccountDetailOpen}
                />
            )}

            <QuickTransactionDialog
                open={quickTransactionOpen}
                onOpenChange={setQuickTransactionOpen}
            />

            <AddAccountDialog
                open={addAccountOpen}
                onOpenChange={setAddAccountOpen}
            />
        </>
    );
}
