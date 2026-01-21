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
import { AccountType, Currency } from "@/lib/firebaseTypes";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencyUtils";

const accountTypes: { value: AccountType; label: string; description: string }[] = [
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

export function AddAccountDialog() {
    const { addAccount } = useFinance();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("asset");
    const [balance, setBalance] = useState("0");
    const [color, setColor] = useState("#3b82f6");
    const [icon, setIcon] = useState("wallet");
    const [currency, setCurrency] = useState<Currency>("INR");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Form submitted!");
        console.log("Account data:", { name, type, balance, color, icon, currency });

        if (!name) {
            console.error("Name is required");
            return;
        }

        try {
            console.log("Calling addAccount...");
            await addAccount({
                name,
                type,
                balance: parseFloat(balance) || 0,
                color,
                icon,
                currency,
            });

            console.log("Account added successfully!");

            // Reset form
            setName("");
            setType("asset");
            setBalance("0");
            setColor("#3b82f6");
            setIcon("wallet");
            setCurrency("INR");
            setOpen(false);
        } catch (error) {
            console.error("Error adding account:", error);
            alert("Failed to add account. Check console for details.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
                    <Plus className="w-4 h-4" />
                    Add Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">Create New Account</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input
                            id="account-name"
                            placeholder="e.g., Main Checking, Savings, Credit Card"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account-type">Account Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {accountTypes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        <div>
                                            <div className="font-medium">{t.label}</div>
                                            <div className="text-xs text-muted-foreground">{t.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account-balance">Initial Balance</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {getCurrencySymbol(currency)}
                            </span>
                            <Input
                                id="account-balance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-10"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter the current balance of this account
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account-currency">Currency</Label>
                        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                    <SelectItem key={code} value={code}>
                                        {info.flag} {info.symbol} {info.name} ({code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2 flex-wrap">
                            {colorOptions.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all",
                                        c.className,
                                        color === c.value
                                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                                            : "opacity-60 hover:opacity-100 hover:scale-105"
                                    )}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account-icon">Icon</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {iconOptions.map((i) => (
                                    <SelectItem key={i.value} value={i.value}>
                                        {i.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Create Account
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
