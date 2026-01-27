import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ArrowRight, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionType, Currency, Account } from "@/lib/firebaseTypes";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencyUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuickTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultAccountId?: string;
}

const transactionTypes: { value: TransactionType; label: string; color: string; icon: any }[] = [
    { value: "income", label: "Income", color: "bg-income text-income-foreground", icon: ArrowDownRight },
    { value: "expense", label: "Expense", color: "bg-expense text-expense-foreground", icon: ArrowUpRight },
    { value: "transfer", label: "Transfer", color: "bg-transfer text-transfer-foreground", icon: ArrowLeftRight },
];

export function QuickTransactionDialog({
    open,
    onOpenChange,
    defaultAccountId,
}: QuickTransactionDialogProps) {
    const { addTransaction, allAccounts } = useFinance(); // allAccounts includes categories
    const [type, setType] = useState<TransactionType>("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<Currency>("INR");
    const [notes, setNotes] = useState("");

    // Explicit Source/Destination
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");

    const [fromSearchOpen, setFromSearchOpen] = useState(false);
    const [toSearchOpen, setToSearchOpen] = useState(false);

    // Initialize/Reset State
    useEffect(() => {
        if (open) {
            // Set default account based on context and type
            if (defaultAccountId) {
                const acct = allAccounts.find(a => a.id === defaultAccountId);
                if (acct) {
                    setCurrency(acct.currency || "INR"); // Inherit currency
                }

                if (type === 'income') {
                    // Income: Money goes TO the default account (e.g. Bank)
                    setToId(defaultAccountId);
                    setFromId("");
                } else {
                    // Expense/Transfer: Money comes FROM the default account
                    setFromId(defaultAccountId);
                    setToId("");
                }
            } else {
                setFromId("");
                setToId("");
            }
        } else {
            // Reset on close
            setDescription("");
            setAmount("");
            setNotes("");
            // Don't reset type, keeps user context
        }
    }, [open, defaultAccountId, type]); // Dependencies: if Type changes, we might re-evaluate defaults? 
    // Actually, re-evaluating on Type change might be annoying if user already selected something.
    // So let's limit the re-set logic to just 'open' or explicit type switching if needed.
    // For now, simple is better.

    // Filter accounts based on type
    const getAccountOptions = (side: "from" | "to") => {
        return allAccounts.filter(account => {
            if (type === 'income') {
                // Income: From = Income Category, To = Asset/Liability
                if (side === "from") return account.type === 'income';
                if (side === "to") return account.type === 'asset' || account.type === 'liability';
            } else if (type === 'expense') {
                // Expense: From = Asset/Liability, To = Expense Category
                if (side === "from") return account.type === 'asset' || account.type === 'liability';
                if (side === "to") return account.type === 'expense';
            } else {
                // Transfer: From = Asset/Liability, To = Asset/Liability
                return account.type === 'asset' || account.type === 'liability';
            }
            return false;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !fromId || !toId) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await addTransaction({
                description,
                amount: parseFloat(amount),
                fromAccountId: fromId,
                toAccountId: toId,
                date: new Date(),
                notes: notes || undefined,
            });

            onOpenChange(false);
        } catch (error) {
            console.error("Transaction failed:", error);
        }
    };

    const fromAccount = allAccounts.find(a => a.id === fromId);
    const toAccount = allAccounts.find(a => a.id === toId);

    // Dynamic Labels
    const getLabels = () => {
        if (type === 'income') return { from: "Source (Category)", to: "Deposit To" };
        if (type === 'expense') return { from: "Payment Account", to: "Expense (Category)" };
        return { from: "Transfer From", to: "Transfer To" };
    };

    const labels = getLabels();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Quick Transaction
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Type Selector */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        {transactionTypes.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                                    type === t.value
                                        ? t.color
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <t.icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="What is this for?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Amount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                        {getCurrencySymbol(currency)}
                                    </span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                            <SelectItem key={code} value={code}>
                                                {info.symbol} {code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Source / Destination Selection */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{labels.from}</Label>
                                <Popover open={fromSearchOpen} onOpenChange={setFromSearchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {fromAccount ? (
                                                <span className="flex items-center gap-2 truncate">
                                                    {fromAccount.icon && <span>{fromAccount.icon}</span>}
                                                    <span className="truncate">{fromAccount.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Select...</span>
                                            )}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search..." />
                                            <CommandList>
                                                <CommandEmpty>No account found.</CommandEmpty>
                                                <CommandGroup>
                                                    {getAccountOptions("from").map((account) => (
                                                        <CommandItem
                                                            key={account.id}
                                                            value={account.name}
                                                            onSelect={() => {
                                                                setFromId(account.id);
                                                                setFromSearchOpen(false);
                                                            }}
                                                        >
                                                            <span>{account.name}</span>
                                                            {account.currency && account.currency !== currency && (
                                                                <Badge variant="outline" className="ml-auto text-xs">{account.currency}</Badge>
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>{labels.to}</Label>
                                <Popover open={toSearchOpen} onOpenChange={setToSearchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {toAccount ? (
                                                <span className="flex items-center gap-2 truncate">
                                                    {toAccount.icon && <span>{toAccount.icon}</span>}
                                                    <span className="truncate">{toAccount.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Select...</span>
                                            )}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search..." />
                                            <CommandList>
                                                <CommandEmpty>No account found.</CommandEmpty>
                                                <CommandGroup>
                                                    {getAccountOptions("to").map((account) => (
                                                        <CommandItem
                                                            key={account.id}
                                                            value={account.name}
                                                            onSelect={() => {
                                                                setToId(account.id);
                                                                setToSearchOpen(false);
                                                            }}
                                                        >
                                                            <span>{account.name}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Visual Flow Hint */}
                        {fromAccount && toAccount && (
                            <div className="rounded-lg bg-muted p-3 text-sm flex items-center justify-center gap-2 text-muted-foreground">
                                <span className="font-medium text-foreground">{fromAccount.name}</span>
                                <ArrowRight className="w-4 h-4" />
                                <span className="font-medium text-foreground">{toAccount.name}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Optional details..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Save Transaction
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
