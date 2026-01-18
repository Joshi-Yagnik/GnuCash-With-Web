import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserInitials, getDisplayName } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}


// // Helper function to get user initials
// const getUserInitials = (name?: string | null, email?: string | null): string => {
//   if (name) {
//     const parts = name.trim().split(/\s+/);
//     if (parts.length >= 2) {
//       return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
//     }
//     return name.substring(0, 2).toUpperCase();
//   }
//   if (email) {
//     return email.substring(0, 2).toUpperCase();
//   }
//   return "U";
// };

// // Helper function to get display name
// const getDisplayName = (user: any): string => {
//   return user?.displayName || user?.email?.split('@')[0] || "User";
// };
export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const displayName = profile?.displayName || getDisplayName(user);
  const userEmail = user?.email || "";
  const userInitials = getUserInitials(profile?.displayName || user?.displayName, user?.email);
  const photoURL = profile?.photoURL;

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

              {/* Search Bar */}
              <div className="flex-1 max-w-md hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions, accounts..."
                    className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="flex-1 md:hidden" />

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        {photoURL ? (
                          <AvatarImage src={photoURL} alt={displayName} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {userInitials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={handleLogout}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
