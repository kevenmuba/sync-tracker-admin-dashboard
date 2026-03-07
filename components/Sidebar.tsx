"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, ListTodo, Wrench, Bell, MessageSquare, Settings, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
    { icon: Users, label: "Users", href: "/admin/users" },
    // { icon: Bell, label: "Notifications", href: "/admin/notifications", isNotification: true },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAndCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
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

        return () => {
            supabase.removeChannel(channel);
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

            <div className="p-6 mt-auto border-t border-gray-50">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-brand-primary transition-all"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-danger border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-primary">Emily Jonson</span>
                        <span className="text-xs text-text-muted">jonson@bress.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
