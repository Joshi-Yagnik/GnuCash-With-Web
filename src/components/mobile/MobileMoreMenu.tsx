import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Target,
    Tag,
    Repeat,
    Upload,
    Hash,
    BookOpen,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const moreMenuItems = [
    { title: "Budgets", url: "/budgets", icon: Target },
    { title: "Categories", url: "/categories", icon: Tag },
    { title: "Tags", url: "/tags", icon: Hash },
    { title: "Books", url: "/books", icon: BookOpen },
    { title: "Recurring", url: "/recurring", icon: Repeat },
    { title: "Import/Export", url: "/import-export", icon: Upload },
    { title: "Help", url: "/help", icon: HelpCircle },
];

interface MobileMoreMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileMoreMenu({ open, onOpenChange }: MobileMoreMenuProps) {
    const navigate = useNavigate();

    const handleNavClick = (url: string) => {
        navigate(url);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                <SheetHeader>
                    <SheetTitle className="text-left">More Options</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                    {moreMenuItems.map((item) => (
                        <button
                            key={item.url}
                            onClick={() => handleNavClick(item.url)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-lg",
                                "text-foreground hover:bg-accent transition-colors",
                                "active:scale-[0.98] min-h-[52px]"
                            )}
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-left">{item.title}</span>
                        </button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
