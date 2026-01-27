import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBook } from "@/contexts/BookContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserInitials, getDisplayName } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Calendar, Mail, User, LogOut, BookOpen, Check } from "lucide-react";
import { format } from "date-fns";

export function GeneralTab() {
    const { user, logout } = useAuth();
    const { currentBook } = useBook();
    const { profile } = useUserProfile();
    const navigate = useNavigate();

    const displayName = profile?.displayName || getDisplayName(user);
    const userEmail = user?.email || "";
    const userInitials = getUserInitials(
        profile?.displayName || user?.displayName,
        user?.email
    );
    const photoURL = profile?.photoURL;
    const createdAt = profile?.createdAt || user?.metadata?.creationTime;

    const handleLogout = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            await logout();
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display">Profile Summary</CardTitle>
                    <CardDescription>
                        Your account overview and personal information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary/10">
                            {photoURL ? (
                                <AvatarImage src={photoURL} alt={displayName} />
                            ) : (
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                                    {userInitials}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-2xl font-semibold">{displayName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{userEmail}</span>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    Read-Only
                                </Badge>
                                {user?.emailVerified && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                        <Check className="w-3 h-3 mr-1" /> Verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Account Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Account Type
                            </p>
                            <p className="font-medium pl-6">
                                {user?.providerData[0]?.providerId === "google.com"
                                    ? "Google Account"
                                    : "Email/Password"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Member Since
                            </p>
                            <p className="font-medium pl-6">
                                {createdAt
                                    ? format(
                                        typeof createdAt === "string"
                                            ? new Date(createdAt)
                                            : createdAt,
                                        "MMMM d, yyyy"
                                    )
                                    : "Unknown"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Active Book
                            </p>
                            <p className="font-medium pl-6 text-primary">
                                {currentBook?.name || "None"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-display">Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks and account management
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate("/profile")}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
