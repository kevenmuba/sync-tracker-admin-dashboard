"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, ListTodo, Wrench, Bell, MessageSquare, Settings, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    isNotification?: boolean;
}

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications", isNotification: true },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<{ full_name: string; avatar_url: string; role: string } | null>(null);

    useEffect(() => {
        const fetchUserAndCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Fetch Profile
                const { data: userData } = await supabase
                    .from("users")
                    .select("full_name, avatar_url, role")
                    .eq("id", user.id)
                    .single();

                if (userData) setProfile(userData);

                // Fetch Notifications
                const { count } = await supabase
                    .from("notifications")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .eq("is_read", false);

                setUnreadCount(count || 0);
            }
        };

        fetchUserAndCount();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel("sidebar_notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                async () => {
                    const { count } = await supabase
                        .from("notifications")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", userId)
                        .eq("is_read", false);
                    setUnreadCount(count || 0);
                }
            )
            .subscribe();

        // Also subscribe to user profile changes
        const profileChannel = supabase
            .channel(`profile_${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "users",
                    filter: `id=eq.${userId}`,
                },
                (payload) => {
                    setProfile(payload.new as any);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(profileChannel);
        };
    }, [userId]);

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-8 pb-12 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center p-2 transform rotate-12">
                    <div className="w-full h-full bg-white rounded-sm opacity-20" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-brand-primary">BRESS</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href) || pathname === item.href;
                    const badgeCount = item.isNotification ? unreadCount : 0;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                    : "text-text-secondary hover:bg-gray-50 hover:text-brand-primary"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-text-muted group-hover:text-brand-primary")} />
                            <span className="font-medium">{item.label}</span>
                            {badgeCount > 0 && (
                                <span className={cn(
                                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                                    isActive ? "bg-white text-brand-primary" : "bg-brand-danger text-white"
                                )}>
                                    {badgeCount > 9 ? "9+" : badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto border-t border-gray-50 space-y-4">
                <Link href="/admin/settings" className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-brand-primary truncate">{profile?.full_name || "Super Admin"}</span>
                        <span className="text-xs text-text-muted capitalize">{profile?.role?.replace('_', ' ') || "Master Access"}</span>
                    </div>
                </Link>

                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-brand-danger hover:bg-brand-danger/5 transition-all text-sm font-bold"
                >
                    <Settings className="w-4 h-4 rotate-90" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
