"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/");
                return;
            }

            // Verify super_admin role
            const { data: userData } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (!userData || userData.role !== 'super_admin') {
                await supabase.auth.signOut();
                router.push("/");
                return;
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f4f6f9]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-brand-primary font-bold">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    return (
        <div className="flex min-h-screen bg-[#f4f6f9]">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
