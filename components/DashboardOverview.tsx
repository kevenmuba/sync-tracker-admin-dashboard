"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    FolderKanban,
    ListTodo,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    Loader2,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

interface DashboardStats {
    totalProjects: number;
    activeTasks: number;
    blockedTasks: number;
    completedTasks: number;
    helpRequests: number;
}

export function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Projects Count
                const { count: projectsCount } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true });

                // Fetch Tasks Counts by Status
                const { data: tasksData, error: tasksError } = await supabase
                    .from("tasks")
                    .select("status");

                if (tasksError) throw tasksError;

                const counts = {
                    totalProjects: projectsCount || 0,
                    activeTasks: 0,
                    blockedTasks: 0,
                    completedTasks: 0,
                    helpRequests: 0,
                };

                tasksData?.forEach(task => {
                    if (task.status === 'in_sync' || task.status === 'pending') counts.activeTasks++;
                    else if (task.status === 'blocked') counts.blockedTasks++;
                    else if (task.status === 'completed') counts.completedTasks++;
                    else if (task.status === 'help_requested') counts.helpRequests++;
                });

                setStats(counts);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    const chartData = [
        { name: "Active", value: stats?.activeTasks || 0, color: "#3b82f6" },
        { name: "Blocked", value: stats?.blockedTasks || 0, color: "#ef4444" },
        { name: "Completed", value: stats?.completedTasks || 0, color: "#10b981" },
        { name: "Help", value: stats?.helpRequests || 0, color: "#f59e0b" },
    ];

    const cards = [
        {
            label: "Total Projects",
            value: stats?.totalProjects || 0,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Active Tasks",
            value: stats?.activeTasks || 0,
            icon: ListTodo,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            label: "Blocked Tasks",
            value: stats?.blockedTasks || 0,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50"
        },
        {
            label: "Completed Tasks",
            value: stats?.completedTasks || 0,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Help Requests",
            value: stats?.helpRequests || 0,
            icon: MessageSquare,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm shadow-black/5 flex flex-col items-center text-center group hover:shadow-md transition-all duration-300 active:scale-95"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12", card.bg, card.color)}>
                            <card.icon className="w-7 h-7" />
                        </div>
                        <span className="text-3xl font-black text-brand-primary">{card.value}</span>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{card.label}</span>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-brand-primary">Task Distribution</h2>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Real-time task status breakdown</p>
                        </div>
                        <div className="p-3 bg-brand-primary/5 rounded-2xl text-brand-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8993a4', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8993a4', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '1.5rem',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Legend / Breakdown List */}
                <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-primary/20 flex flex-col">
                    <h3 className="text-xl font-black mb-6">Status Overview</h3>
                    <div className="space-y-6 flex-1">
                        {chartData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                                        <span className="text-lg font-black">{item.value}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black opacity-100">{item.name}</p>
                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{item.value === 1 ? 'Task' : 'Tasks'}</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-xs font-bold opacity-60 italic">"Efficiency is doing things right; effectiveness is doing the right things."</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
