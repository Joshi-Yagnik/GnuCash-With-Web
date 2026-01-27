import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PreferencesTab() {
    return (
        <div className="space-y-6">
            <Card className="opacity-75 relative overflow-hidden">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold border border-primary/20 shadow-sm">
                        Coming Soon
                    </div>
                </div>
                <CardHeader>
                    <CardTitle>Regional Preferences</CardTitle>
                    <CardDescription>Customize how data is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 filter blur-[2px]">
                    <div className="h-10 w-full bg-muted rounded-md" />
                    <div className="h-10 w-3/4 bg-muted rounded-md" />
                    <div className="h-10 w-1/2 bg-muted rounded-md" />
                </CardContent>
            </Card>

            <Card className="opacity-75 relative overflow-hidden">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    {/* Overlay handled by first card visually */}
                </div>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage your alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 filter blur-[2px]">
                    <div className="h-20 w-full bg-muted rounded-md" />
                </CardContent>
            </Card>
        </div>
    );
}
