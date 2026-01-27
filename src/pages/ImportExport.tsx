import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Upload, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackupRestore } from "@/components/BackupRestore";

export default function ImportExport() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                    >
                        <Upload className="w-8 h-8" />
                        Import/Export
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        Import and export your financial data
                    </motion.p>
                </div>

                <div className="space-y-8">
                    {/* System Backup Section */}
                    <BackupRestore />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Import Transactions
                                </CardTitle>
                                <CardDescription>Import from CSV or other formats</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Coming soon: Import transactions from bank statements, CSV files, and other finance apps.
                                </p>
                                <Button disabled className="w-full">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import File
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Export Reports
                                </CardTitle>
                                <CardDescription>Export reports for analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Coming soon: Export transactions to CSV, Excel, or PDF for analysis and record-keeping.
                                </p>
                                <Button disabled className="w-full">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
