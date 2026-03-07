"use client";

import React, { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import {
    User,
    Lock,
    Mail,
    Camera,
    Save,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    AlertCircle,
    KeyRound,
    UserCircle2,
    Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
};

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [fullName, setFullName] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Password States
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Feedback States
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data as UserProfile);
                setFullName(data.full_name || "");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSavingProfile(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    // updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, full_name: fullName });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update profile." });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: "Image size must be less than 2MB" });
            return;
        }

        setSavingProfile(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('sync-tracker-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('sync-tracker-assets')
                .getPublicUrl(filePath);

            // 3. Update User Table
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setProfile({ ...profile, avatar_url: publicUrl });
            setMessage({ type: 'success', text: "Avatar updated successfully!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to upload avatar." });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." });
            return;
        }

        setChangingPassword(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setNewPassword("");
            setConfirmPassword("");
            setMessage({ type: 'success', text: "Password updated successfully!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update password." });
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen">
                <Topbar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                </div>
            </div>
        );
    }

    const currentAvatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || "Admin")}&background=e2e8f0&color=475569&bold=true`;

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen">
            <Topbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <main className="flex-1 p-8 max-w-[1200px] mx-auto w-full space-y-8 pb-12">
                {/* Header Section */}
                <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                            <ShieldCheck className="w-8 h-8 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-brand-primary tracking-tight">System Settings</h1>
                            <p className="text-text-secondary font-medium">Manage your personal profile and account security</p>
                        </div>
                    </div>
                </div>

                {/* Feedback Message */}
                {message && (
                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300",
                        message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <p className="font-semibold text-sm">{message.text}</p>
                        <button onClick={() => setMessage(null)} className="ml-auto text-xs uppercase font-bold opacity-60 hover:opacity-100">Dismiss</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-40 h-40 rounded-full border-[6px] border-brand-primary/5 p-1 relative group">
                                    <img
                                        src={currentAvatar}
                                        alt={profile?.full_name}
                                        className="w-full h-full rounded-full object-cover shadow-inner"
                                    />
                                    <button
                                        onClick={handleAvatarClick}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                                    >
                                        <div className="bg-white/20 p-3 rounded-full border border-white/30 text-white">
                                            <Camera className="w-6 h-6" />
                                        </div>
                                    </button>
                                    <div className="absolute -bottom-1 -right-1 bg-brand-primary text-white p-2.5 rounded-2xl shadow-lg border-4 border-white">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <h3 className="text-2xl font-black text-brand-primary truncate w-full">{profile?.full_name}</h3>
                            <span className="px-5 py-1.5 bg-brand-primary/5 text-brand-primary text-xs font-black uppercase tracking-widest rounded-full mt-2">
                                {profile?.role?.replace('_', ' ')}
                            </span>

                            <div className="w-full mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-sm font-semibold text-text-secondary bg-gray-50/50 p-4 rounded-2xl group hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-start truncate">
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider leading-none mb-1">Email Address</span>
                                        <span className="truncate w-full">{profile?.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm font-semibold text-text-secondary bg-gray-50/50 p-4 rounded-2xl group hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-primary">
                                        <UserCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-start truncate">
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider leading-none mb-1">User ID</span>
                                        <span className="truncate w-full font-mono text-[11px]">{profile?.id.substring(0, 12)}...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Profile Details Form */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                                <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-brand-primary">Personal Information</h2>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">Full Name</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. Keven Muba"
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all font-medium text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 opacity-60 cursor-not-allowed">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">Email (Read Only)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profile?.email}
                                                readOnly
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 cursor-not-allowed font-medium text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className={cn(
                                            "flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-brand-primary/30 active:scale-95",
                                            savingProfile ? "opacity-70" : "hover:bg-brand-primary/90"
                                        )}
                                    >
                                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Form */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                                <div className="p-2.5 bg-brand-danger/10 rounded-xl text-brand-danger">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-brand-primary">Security & Password</h2>
                            </div>

                            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">New Password</label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all font-medium text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repeat new password"
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all font-medium text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex items-start gap-4">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-amber-900 mb-1">Important Security Note</h4>
                                        <p className="text-xs text-amber-700/80 font-medium leading-relaxed"> Changing your password will affect all connected devices. Use a strong combination of letters, numbers, and symbols to ensure maximum account protection.</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={changingPassword || !newPassword}
                                        className={cn(
                                            "flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-brand-primary/30 active:scale-95",
                                            (changingPassword || !newPassword) ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-primary/90"
                                        )}
                                    >
                                        {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                        Update Security Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Custom Icons to avoid conflicts with standard lucide imports if needed
function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

