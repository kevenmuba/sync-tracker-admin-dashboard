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

interface DashboardOverviewProps {
    searchValue?: string;
}

export function DashboardOverview({ searchValue = "" }: DashboardOverviewProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<{
        projects: any[];
        tasks: any[];
    }>({ projects: [], tasks: [] });

    useEffect(() => {
        const fetchStatsAndResults = async () => {
            try {
                if (!searchValue) {
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
                } else {
                    // Fetch Search Results
                    const [projectsRes, tasksRes] = await Promise.all([
                        supabase
                            .from('projects')
                            .select('*, project_admin:users!project_admin(full_name)')
                            .ilike('name', `%${searchValue}%`),
                        supabase
                            .from('tasks')
                            .select('*, projects(name)')
                            .ilike('title', `%${searchValue}%`)
                    ]);

                    setSearchResults({
                        projects: projectsRes.data || [],
                        tasks: tasksRes.data || []
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatsAndResults();
    }, [searchValue]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (searchValue) {
        const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0;

        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h2 className="text-3xl font-black text-brand-primary tracking-tight">Search results for "{searchValue}"</h2>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] mt-1">
                        Found {searchResults.projects.length} projects and {searchResults.tasks.length} tasks
                    </p>
                </div>

                {!hasResults ? (
                    <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-brand-primary mb-2">No matches found</h3>
                        <p className="text-text-muted font-medium max-w-sm">Try using different keywords or check for spelling errors.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Projects Column */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
                                <FolderKanban className="w-4 h-4 text-brand-secondary" />
                                Matching Projects
                            </h3>
                            <div className="space-y-4">
                                {searchResults.projects.map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-brand-primary/10 transition-colors" />
                                        <div className="flex justify-between items-start mb-2 relative">
                                            <h4 className="font-black text-brand-primary group-hover:text-brand-secondary transition-colors">{project.name}</h4>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest shrink-0">
                                                {project.status || "Active"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted font-bold line-clamp-1 mb-4">{project.project_admin?.full_name || "Unassigned"}</p>
                                        <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest">
                                            View Pipeline
                                            <TrendingUp className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                                {searchResults.projects.length === 0 && (
                                    <p className="text-sm font-bold text-text-muted/40 italic py-10 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">No projects match this search</p>
                                )}
                            </div>
                        </div>

                        {/* Tasks Column */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
                                <ListTodo className="w-4 h-4 text-brand-primary" />
                                Matching Tasks
                            </h3>
                            <div className="space-y-4">
                                {searchResults.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-black text-brand-primary line-clamp-1">{task.title}</h4>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
                                                    {task.projects?.name || "Global Task"}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shrink-0",
                                                task.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                                                    task.status === 'blocked' ? "bg-red-50 text-red-600" :
                                                        "bg-blue-50 text-blue-600"
                                            )}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {searchResults.tasks.length === 0 && (
                                    <p className="text-sm font-bold text-text-muted/40 italic py-10 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">No tasks match this search</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
