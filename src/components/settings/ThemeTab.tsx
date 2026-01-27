import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemeTab() {
    return (
        <div className="space-y-6">
            <Card className="opacity-75 relative overflow-hidden">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold border border-primary/20 shadow-sm">
                        Coming Soon
                    </div>
                </div>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 filter blur-[2px]">
                    <div className="flex gap-4">
                        <div className="h-32 w-1/3 bg-muted rounded-md border-2 border-primary" />
                        <div className="h-32 w-1/3 bg-muted rounded-md" />
                        <div className="h-32 w-1/3 bg-muted rounded-md" />
                    </div>
                    <div className="h-10 w-full bg-muted rounded-md" />
                </CardContent>
            </Card>
        </div>
    );
}
