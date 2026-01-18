import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, X, Upload } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserInitials } from "@/lib/utils";

export default function Profile() {
    const { user } = useAuth();
    const { profile, loading, updateProfile, uploadProfilePhoto, deleteProfilePhoto } = useUserProfile();
    const [displayName, setDisplayName] = useState(profile?.displayName || "");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccess(null);
        setUploading(true);

        try {
            await uploadProfilePhoto(file, (progress) => {
                setUploadProgress(progress);
            });
            setSuccess("Profile photo updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to upload photo");
        } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = ""; // Reset input
        }
    };

    const handleRemovePhoto = async () => {
        if (!confirm("Are you sure you want to remove your profile photo?")) return;

        setError(null);
        setSuccess(null);

        try {
            await deleteProfilePhoto();
            setSuccess("Profile photo removed successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to remove photo");
        }
    };

    const handleSaveName = async () => {
        if (!displayName.trim()) {
            setError("Display name cannot be empty");
            return;
        }

        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            await updateProfile({ displayName: displayName.trim() });
            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    const userInitials = getUserInitials(profile?.displayName, profile?.email);
    const hasPhoto = !!profile?.photoURL;

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-display font-bold text-foreground"
                    >
                        Profile Settings
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        Manage your profile information and preferences
                    </motion.p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert>
                        <AlertDescription className="text-green-600">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Profile Photo Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                        <CardDescription>
                            Upload a photo to personalize your profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar Display */}
                            <div className="relative">
                                <Avatar className="w-32 h-32">
                                    {hasPhoto ? (
                                        <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                                    ) : (
                                        <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
                                            {userInitials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                {!uploading && (
                                    <label
                                        htmlFor="photo-upload"
                                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                            aria-label="Upload profile photo"
                                        />
                                    </label>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 flex-1">
                                <label htmlFor="photo-upload-btn">
                                    <Button asChild variant="outline" disabled={uploading}>
                                        <span className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {hasPhoto ? "Change Photo" : "Upload Photo"}
                                        </span>
                                    </Button>
                                    <input
                                        id="photo-upload-btn"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>

                                {hasPhoto && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRemovePhoto}
                                        disabled={uploading}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Remove Photo
                                    </Button>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG or WebP. Max size 5MB.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed from this page
                            </p>
                        </div>

                        <Button
                            onClick={handleSaveName}
                            disabled={saving || displayName === profile?.displayName}
                        >
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            View your account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Email Verified</span>
                            <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                {user?.emailVerified ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Account Created</span>
                            <span className="text-sm font-medium">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-muted-foreground">Last Updated</span>
                            <span className="text-sm font-medium">
                                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
