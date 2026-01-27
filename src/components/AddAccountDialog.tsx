import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { useBook } from "@/contexts/BookContext";
import { AccountType, Currency } from "@/lib/firebaseTypes";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencyUtils";

const accountTypes: {
    value: AccountType;
    label: string;
    description: string;
}[] = [
        { value: "asset", label: "Asset", description: "Cash, bank accounts, investments" },
        { value: "liability", label: "Liability", description: "Loans, credit cards, debts" },
        { value: "income", label: "Income", description: "Salary, business revenue" },
        { value: "expense", label: "Expense", description: "Bills, subscriptions, costs" },
    ];

const colorOptions = [
    { value: "#3b82f6", label: "Blue", className: "bg-blue-500" },
    { value: "#8b5cf6", label: "Purple", className: "bg-purple-500" },
    { value: "#10b981", label: "Green", className: "bg-green-500" },
    { value: "#ef4444", label: "Red", className: "bg-red-500" },
    { value: "#f59e0b", label: "Amber", className: "bg-amber-500" },
    { value: "#ec4899", label: "Pink", className: "bg-pink-500" },
    { value: "#06b6d4", label: "Cyan", className: "bg-cyan-500" },
];

const iconOptions = [
    { value: "wallet", label: "Wallet" },
    { value: "building-2", label: "Bank" },
    { value: "credit-card", label: "Credit Card" },
    { value: "trending-up", label: "Investment" },
    { value: "piggy-bank", label: "Savings" },
    { value: "home", label: "Home" },
    { value: "car", label: "Vehicle" },
    { value: "briefcase", label: "Business" },
];

interface AddAccountDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddAccountDialog({
    open: controlledOpen,
    onOpenChange,
}: AddAccountDialogProps = {}) {
    const { addAccount } = useFinance();
    const { currentBook, loading: bookLoading } = useBook();

    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("asset");
    const [balance, setBalance] = useState("0");
    const [color, setColor] = useState("#3b82f6");
    const [icon, setIcon] = useState("wallet");
    // Currency is derived from book, but we keep state for submission compatibility if needed
    // or just pass currentBook.defaultCurrency directly in handleSubmit
    const currency = currentBook?.defaultCurrency || "INR";

    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            await addAccount({
                name,
                type,
                balance: parseFloat(balance) || 0,
                color,
                icon,
                currency,
            });

            // Reset form
            setName("");
            setType("asset");
            setBalance("0");
            setColor("#3b82f6");
            setIcon("wallet");
            setIcon("wallet");
            // setCurrency("INR"); // No need to reset derived state
            setOpen(false);
        } catch (error) {
            console.error("Error adding account:", error);
            alert("Failed to add account");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!controlledOpen && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-md">
                {bookLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="ml-3 text-muted-foreground">
                            Initializing...
                        </span>
                    </div>
                ) : !currentBook ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Initializing your Main book...
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                Create New Account
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                            {/* Account Name */}
                            <div className="space-y-2">
                                <Label>Account Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Savings, Bank, Credit Card"
                                    required
                                />
                            </div>

                            {/* Account Type */}
                            <div className="space-y-2">
                                <Label>Account Type</Label>
                                <Select
                                    value={type}
                                    onValueChange={(v) =>
                                        setType(v as AccountType)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountTypes.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                            >
                                                <div className="font-medium">
                                                    {t.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t.description}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Balance */}
                            <div className="space-y-2">
                                <Label>Initial Balance</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {getCurrencySymbol(currency)}
                                    </span>
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        value={balance}
                                        onChange={(e) =>
                                            setBalance(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Currency (Fixed by Book) */}
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground">
                                    <span>{getCurrencySymbol(currentBook?.defaultCurrency || "INR")}</span>
                                    <span>{currentBook?.defaultCurrency || "INR"}</span>
                                    <span className="text-xs ml-auto">(Fixed by Book)</span>
                                </div>
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {colorOptions.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() =>
                                                setColor(c.value)
                                            }
                                            aria-label={`Select ${c.label} color`}
                                            className={cn(
                                                "w-8 h-8 rounded-full",
                                                c.className,
                                                color === c.value
                                                    ? "ring-2 ring-offset-2 ring-foreground"
                                                    : "opacity-60"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <Select value={icon} onValueChange={setIcon}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map((i) => (
                                            <SelectItem
                                                key={i.value}
                                                value={i.value}
                                            >
                                                {i.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                >
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
