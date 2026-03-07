"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/lib/context/SidebarContext";

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useSidebar();
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

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname, setIsOpen]);

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
        <div className="flex min-h-screen bg-[#f4f6f9] overflow-x-hidden">
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300 w-full",
                "lg:ml-64" // Fixed margin on large screens
            )}>
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SidebarProvider>
    );
}
