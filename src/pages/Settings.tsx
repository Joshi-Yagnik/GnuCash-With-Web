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
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                    >
                        <Settings className="w-8 h-8" />
                        Settings
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        Manage your account and application preferences
                    </motion.p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-4 h-auto">
                        <TabsTrigger value="general" className="flex items-center gap-2 py-2">
                            <User className="w-4 h-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2 py-2">
                            <Settings className="w-4 h-4" />
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-2 py-2">
                            <Mail className="w-4 h-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="theme" className="flex items-center gap-2 py-2">
                            <Palette className="w-4 h-4" />
                            Theme
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-2 py-2">
                            <Database className="w-4 h-4" />
                            Data
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
