import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Settings,
    User,
    Palette,
    Database,
    Mail,
} from "lucide-react";
import { motion } from "framer-motion";

// Modular Tab Components
import { GeneralTab } from "@/components/settings/GeneralTab";
import { PreferencesTab } from "@/components/settings/PreferencesTab";
import { AccountTab } from "@/components/settings/AccountTab";
import { ThemeTab } from "@/components/settings/ThemeTab";
import { DataTab } from "@/components/settings/DataTab";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <AppLayout>
            <div className="space-y-4 md:space-y-6">
                {/* Header */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2"
                    >
                        <Settings className="w-6 h-6 md:w-8 md:h-8" />
                        Settings
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-base text-muted-foreground mt-1"
                    >
                        Manage your account and application preferences
                    </motion.p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4 h-auto">
                        <TabsTrigger value="general" className="flex items-center gap-1.5 md:gap-2 py-2 text-xs md:text-sm">
                            <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">General</span>
                            <span className="sm:hidden">Gen</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-1.5 md:gap-2 py-2 text-xs md:text-sm">
                            <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Preferences</span>
                            <span className="sm:hidden">Prefs</span>
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-1.5 md:gap-2 py-2 text-xs md:text-sm">
                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Account</span>
                            <span className="sm:hidden">Acct</span>
                        </TabsTrigger>
                        <TabsTrigger value="theme" className="flex items-center gap-1.5 md:gap-2 py-2 text-xs md:text-sm">
                            <Palette className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Theme</span>
                            <span className="sm:hidden">Theme</span>
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-1.5 md:gap-2 py-2 text-xs md:text-sm">
                            <Database className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Data</span>
                            <span className="sm:hidden">Data</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content Areas */}

                    {/* 1. General Tab */}
                    <TabsContent value="general" className="space-y-4">
                        <GeneralTab />
                    </TabsContent>

                    {/* 3. Preferences Tab (Coming Soon) */}
                    <TabsContent value="preferences" className="space-y-4">
                        <PreferencesTab />
                    </TabsContent>

                    {/* 4. Account Tab (Coming Soon) */}
                    <TabsContent value="account" className="space-y-4">
                        <AccountTab />
                    </TabsContent>

                    {/* 5. Theme Tab (Coming Soon) */}
                    <TabsContent value="theme" className="space-y-4">
                        <ThemeTab />
                    </TabsContent>

                    {/* 6. Data Tab */}
                    <TabsContent value="data" className="space-y-4">
                        <DataTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
