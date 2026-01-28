import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileFABProps {
    onClick: () => void;
    icon?: ReactNode;
    label?: string;
    className?: string;
}

export function MobileFAB({
    onClick,
    icon = <Plus className="w-6 h-6" />,
    label,
    className
}: MobileFABProps) {
    return (
        <Button
            onClick={onClick}
            size="lg"
            className={cn(
                "md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "transition-all duration-200 active:scale-95",
                "flex items-center justify-center",
                label && "w-auto px-4 gap-2",
                className
            )}
            aria-label={label || "Quick action"}
        >
            {icon}
            {label && <span className="font-medium">{label}</span>}
        </Button>
    );
}
