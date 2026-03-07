"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { supabase } from "@/lib/supabase";
import {
    Bell, CheckCircle2, Clock, XCircle, Trash2, MailOpen, Mail,
    ShieldCheck, ListFilter, Search, Info, ExternalLink, Filter,
    Briefcase, User, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link"; // Added Link import

type Notification = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    recipient_role?: string;
    recipient_name?: string;
    is_project_assignment?: boolean;
    project_id?: string;
};

type ProjectStatusRow = {
    id: string;
    name: string;
    project_admin_id: string;
    project_admin_name: string;
    admin_accepted: boolean;
    created_at: string;
    status: string;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatusRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"activity" | "unread" | "status" | "global">("activity");
    const [searchValue, setSearchValue] = useState("");
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                const { data: userData } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (userData) {
                    setUserRole(userData.role);
                    await Promise.all([
                        fetchNotifications(user.id, userData.role),
                        fetchProjectStatuses(user.id)
                    ]);
                }
            }
        };
        init();
    }, []);

    const fetchNotifications = async (id: string, role: string) => {
        setLoading(true);

        // 1. Fetch real notifications from table
        let { data: dbNotifs } = await supabase
            .from("notifications")
            .select(`
                *,
                users!notifications_user_id_fkey (
                    full_name,
                    role
                )
            `)
            .or(`user_id.eq.${id}, user_id.neq.${id}`) // Fetch all if super_admin logic allows
            .order("created_at", { ascending: false })
            .limit(100);

        let result: Notification[] = (dbNotifs || []).map((n: any) => ({
            ...n,
            recipient_name: n.users?.full_name,
            recipient_role: n.users?.role
        }));

        // 2. Synthesize notifications from "projects" table for assignments
        // This solves the user's issue of "couldn't see notifications sent before" 
        // because projects exist even if notification records weren't created.
        const { data: projectsData } = await supabase
            .from("projects")
            .select(`
                id, 
                name, 
                project_admin, 
                created_at, 
                admin_accepted,
                users!projects_project_admin_fkey (full_name)
            `)
            .eq("created_by", id)
            .not("project_admin", "is", null);

        if (projectsData) {
            const synthesized: Notification[] = projectsData.map((p: any) => {
                const adminUser = Array.isArray(p.users) ? p.users[0] : p.users;
                return {
                    id: `syn-${p.id}`,
                    user_id: id,
                    title: "Project Admin Assigned",
                    message: `You assigned ${adminUser?.full_name || 'an admin'} to the project "${p.name}".`,
                    is_read: true,
                    created_at: p.created_at,
                    is_project_assignment: true,
                    project_id: p.id,
                    recipient_name: adminUser?.full_name,
                    recipient_role: "project_admin"
                };
            });

            result = [...result, ...synthesized].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        }

        setNotifications(result);
        setLoading(false);
    };

    const fetchProjectStatuses = async (ownerId: string) => {
        const { data } = await supabase
            .from("projects")
            .select(`
                id, name, admin_accepted, created_at, project_admin, status,
                users!projects_project_admin_fkey (full_name)
            `)
            .eq("created_by", ownerId)
            .order("created_at", { ascending: false });

        if (data) {
            setProjectStatuses(data.map((p: any) => {
                const adminUser = Array.isArray(p.users) ? p.users[0] : p.users;
                return {
                    id: p.id,
                    name: p.name,
                    project_admin_id: p.project_admin,
                    project_admin_name: adminUser?.full_name || "Unassigned",
                    admin_accepted: p.admin_accepted,
                    created_at: p.created_at,
                    status: p.status
                };
            }));
        }
    };

    useEffect(() => {
        if (!userId || !userRole) return;

        const channel = supabase.channel("notif_updates")
            .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications(userId, userRole))
            .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => fetchNotifications(userId, userRole))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, userRole]);

    const markAsRead = async (id: string) => {
        if (id.startsWith('syn-')) return; // Can't mark synthesized as read in DB
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllAsRead = async () => {
        if (!userId) return;
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
        if (!error) setNotifications(prev => prev.map(n => n.user_id === userId ? { ...n, is_read: true } : n));
    };

    const getStatusIcon = (n: Notification) => {
        if (n.is_project_assignment) return <div className="bg-orange-50 p-3 rounded-2xl"><Briefcase className="w-6 h-6 text-orange-500" /></div>;
        const text = (n.title + n.message).toLowerCase();
        if (text.includes("accepted")) return <div className="bg-emerald-50 p-3 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>;
        if (text.includes("rejected")) return <div className="bg-rose-50 p-3 rounded-2xl"><XCircle className="w-6 h-6 text-rose-500" /></div>;
        return <div className="bg-indigo-50 p-3 rounded-2xl"><Bell className="w-6 h-6 text-indigo-500" /></div>;
    };

    const filteredByTab = () => {
        switch (activeTab) {
            case "unread": return notifications.filter(n => !n.is_read && n.user_id === userId);
            case "global": return notifications.filter(n => n.user_id !== userId || n.is_project_assignment);
            case "activity": return notifications.filter(n => n.user_id === userId);
            default: return notifications;
        }
    };

    const finalFiltered = filteredByTab().filter(n =>
        n.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        n.message.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen">
            <Topbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            <div className="flex-1 p-8 max-w-[1400px] mx-auto w-full">

                {/* Header Area styled like Users page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                            <Bell className="w-7 h-7 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-primary">Activity Log & Tracking</h1>
                            <p className="text-text-secondary mt-1">Review system notifications and project admin assignments ({finalFiltered.length})</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={markAllAsRead}
                            className="bg-brand-primary text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-primary/20 text-sm font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2"
                        >
                            <MailOpen className="w-4 h-4" />
                            Clear Unread
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm">
                            {[
                                { id: 'activity', label: 'My Activity', icon: ListFilter, count: notifications.filter(n => n.user_id === userId).length },
                                { id: 'unread', label: 'Unread Only', icon: Bell, count: notifications.filter(n => !n.is_read && n.user_id === userId).length },
                                { id: 'global', label: 'Global Audit', icon: ShieldCheck, count: notifications.filter(n => n.user_id !== userId || n.is_project_assignment).length },
                                { id: 'status', label: 'Assignment Status', icon: Briefcase, count: projectStatuses.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all font-bold text-sm mb-1",
                                        activeTab === tab.id
                                            ? "bg-brand-primary/10 text-brand-primary"
                                            : "text-text-secondary hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-brand-primary" : "text-gray-400")} />
                                        {tab.label}
                                    </div>
                                    {tab.count > 0 && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[10px]",
                                            activeTab === tab.id ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-text-secondary">Assignments</span>
                                    <span className="text-sm font-bold text-brand-primary">{projectStatuses.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-text-secondary">Accepted</span>
                                    <span className="text-sm font-bold text-emerald-600">{projectStatuses.filter(p => p.admin_accepted).length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-text-secondary">Pending</span>
                                    <span className="text-sm font-bold text-orange-500">{projectStatuses.filter(p => !p.admin_accepted).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="xl:col-span-9">
                        {activeTab === "status" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projectStatuses.map((p) => (
                                    <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative group">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                p.admin_accepted ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700 animate-pulse"
                                            )}>
                                                {p.admin_accepted ? "Active Admin" : "Awaiting Acceptance"}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">ID: {p.id.slice(0, 8)}</span>
                                        </div>

                                        <h4 className="text-lg font-bold text-brand-primary mb-1">{p.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Assigned {format(new Date(p.created_at), "MMM d, yyyy")}
                                        </div>

                                        <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-primary font-bold border border-gray-100">
                                                    {p.project_admin_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Project Admin</p>
                                                    <p className="text-sm font-bold text-brand-primary">{p.project_admin_name}</p>
                                                </div>
                                            </div>
                                            <Link href={`/admin/projects/${p.id}`} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {loading && (
                                    Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
                                    ))
                                )}

                                {!loading && finalFiltered.length === 0 && (
                                    <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm">
                                        <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-500">No activity matching filter</h3>
                                        <p className="text-gray-400 mt-1">Try switching tabs or adjusting search</p>
                                    </div>
                                )}

                                {viewMode === 'card' ? (
                                    finalFiltered.map((n) => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "bg-white rounded-3xl p-6 border transition-all flex items-start gap-6 group relative overflow-hidden",
                                                n.is_read ? "border-gray-50 opacity-70" : "border-brand-primary/20 shadow-sm shadow-black/5"
                                            )}
                                        >
                                            {/* Status Icon */}
                                            {getStatusIcon(n)}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-bold text-brand-primary">{n.title}</h4>
                                                        {n.is_project_assignment && (
                                                            <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-orange-100">
                                                                Project Sync
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                                        {format(new Date(n.created_at), "HH:mm · MMM d")}
                                                    </span>
                                                </div>

                                                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-4">
                                                    {n.message}
                                                </p>

                                                <div className="flex items-center gap-4">
                                                    {!n.is_read && n.user_id === userId && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-lg hover:bg-brand-primary hover:text-white transition-all"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                    {n.recipient_name && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                                            <User className="w-3 h-3" />
                                                            Target: {n.recipient_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* List View */
                                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 text-text-muted text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                                    <th className="px-8 py-5">Activity</th>
                                                    <th className="px-8 py-5">Timestamp</th>
                                                    <th className="px-8 py-5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {finalFiltered.map(n => (
                                                    <tr key={n.id} className={cn("group hover:bg-gray-50/30 transition-colors", n.is_read ? "opacity-60" : "opacity-100")}>
                                                        <td className="px-8 py-5 text-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="shrink-0">
                                                                    {n.is_project_assignment ? <Briefcase className="w-4 h-4 text-orange-500" /> : <Bell className="w-4 h-4 text-indigo-500" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-brand-primary">{n.title}</p>
                                                                    <p className="text-xs text-text-muted line-clamp-1">{n.message}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-xs text-text-muted font-bold">
                                                            {format(new Date(n.created_at), "MMM d, HH:mm")}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {!n.is_read && n.user_id === userId && (
                                                                <button onClick={() => markAsRead(n.id)} className="text-[10px] font-black text-brand-primary hover:underline">Mark read</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
