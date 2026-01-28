import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, ArrowRightLeft, PieChart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileMoreMenu } from "./MobileMoreMenu";

const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Accounts", url: "/accounts", icon: Wallet },
    { title: "Transactions", url: "/transactions", icon: ArrowRightLeft },
    { title: "Reports", url: "/reports", icon: PieChart },
    { title: "More", url: "/more", icon: Menu },
];

export function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    const handleNavClick = (url: string) => {
        if (url === "/more") {
            setMoreMenuOpen(true);
            return;
        }
        navigate(url);
    };

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = item.url === "/more"
                            ? false
                            : location.pathname === item.url ||
                            (item.url !== "/" && location.pathname.startsWith(item.url));

                        return (
                            <button
                                key={item.url}
                                onClick={() => handleNavClick(item.url)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] min-h-[44px]",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground active:scale-95"
                                )}
                                aria-label={item.title}
                            >
                                <item.icon
                                    className={cn(
                                        "w-6 h-6 transition-all",
                                        isActive && "scale-110"
                                    )}
                                />
                                <span className={cn(
                                    "text-xs font-medium transition-all",
                                    isActive && "font-semibold"
                                )}>
                                    {item.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <MobileMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
        </>
    );
}
