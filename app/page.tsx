"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkExistingSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // If already logged in, verify role
                const { data: userData } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();

                if (userData?.role === 'super_admin') {
                    router.push("/admin/dashboard");
                } else {
                    setCheckingAuth(false);
                }
            } else {
                setCheckingAuth(false);
            }
        };
        checkExistingSession();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate with Supabase
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;

            // 2. Check user role in database
            const { data: userData, error: roleError } = await supabase
                .from("users")
                .select("role, full_name")
                .eq("id", data.user?.id)
                .single();

            if (roleError || !userData) {
                await supabase.auth.signOut();
                throw new Error("User record not found. Please contact an administrator.");
            }

            // 3. ONLY allow super_admin
            if (userData.role !== 'super_admin') {
                await supabase.auth.signOut();
                throw new Error("Access Denied: Only Super Admins can access the dashboard.");
            }

            // Success redirect
            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "Invalid credentials. Please try again.");
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0b1e]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0b1e] relative overflow-hidden font-sans">
            {/* Background Image/Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img
                    src="/login_bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b1e] via-transparent to-[#0a0b1e]/80" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/50 overflow-hidden relative group">
                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" />

                    {/* Logo/Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Sync Admin</h1>
                        <p className="text-white/40 font-medium text-sm mt-2 uppercase tracking-widest">Super Admin Access Only</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Admin Email"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Security Key"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-rose-300">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group/btn"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Verify Identity
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

        
                </div>


            </div>
        </div>
    );
}
