"use client";

import React, { useEffect, useState, use } from "react";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Users, ArrowLeft, Activity, ListTodo, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ProjectAdmin = { id: string; full_name: string; role: string; avatar_url: string };

type Task = {
    id: string;
    title: string;
    status: string;
    responsible_owner: { id: string; full_name: string; avatar_url: string } | null;
};

type SyncLog = {
    id: string;
    action: string;
    status: string;
    message: string;
    created_at: string;
    user: { full_name: string; avatar_url: string };
    task: { title: string };
};

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Project details
            const { data: projectData } = await supabase
                .from('projects')
                .select('*, project_admin:users!project_admin(id, full_name, role, avatar_url)')
                .eq('id', id)
                .single();

            if (projectData) setProject(projectData);

            // Fetch Tasks
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('id, title, status, responsible_owner:users!responsible_owner(id, full_name, avatar_url)')
                .eq('project_id', id);

            if (tasksData) setTasks(tasksData as any);

            // Fetch Participants (users assigned to tasks in this project)
            if (tasksData && tasksData.length > 0) {
                const taskIds = tasksData.map(t => t.id);
                const { data: participantsData } = await supabase
                    .from('participants')
                    .select('id, role, user:users!user_id(id, full_name, role, avatar_url)')
                    .in('task_id', taskIds);

                if (participantsData) {
                    // Deduplicate users (since a user can be participant in multiple tasks)
                    const uniqueUsers = new Map();
                    participantsData.forEach((p: any) => {
                        if (p.user && !uniqueUsers.has(p.user.id)) {
                            uniqueUsers.set(p.user.id, p);
                        }
                    });
                    setParticipants(Array.from(uniqueUsers.values()));
                }

                // Fetch Sync Logs
                const { data: logsData } = await supabase
                    .from('sync_logs')
                    .select('id, status, message, created_at, user:users!user_id(full_name, avatar_url), task:tasks!task_id(title)')
                    .in('task_id', taskIds)
                    .order('created_at', { ascending: false });

                if (logsData) setLogs(logsData as any);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listeners for real-time updates could go here
    }, [id]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
                <Topbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
                <Topbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-text-muted">Project not found.</p>
                </div>
            </div>
        );
    }

    // Default Avatar helper
    const getAvatar = (user: any) => user?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150";

    // Progress calculation based on tasks completion
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const projectProgress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
            <Topbar />

            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full space-y-8 pb-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/projects" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition">
                        <ArrowLeft className="w-6 h-6 text-brand-primary" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-brand-primary">{project.name}</h1>
                        <p className="text-text-secondary mt-1 flex items-center gap-2">
                            <span className="bg-[#ecfccb] text-[#4d7c0f] px-3 py-1 rounded-full text-xs font-bold uppercase">
                                {project.status}
                            </span>
                            • Ends: {formatDate(project.estimated_end_date)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Left Column: Project Info & Tasks */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* Overview Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4 text-brand-primary">Project Overview</h2>
                            <p className="text-text-secondary leading-relaxed mb-6">
                                {project.description || "No description available."}
                            </p>

                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-text-secondary">Overall Progress</span>
                                <span className="text-sm font-bold text-brand-primary">{projectProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-brand-primary h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${projectProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                                    <ListTodo className="w-6 h-6 text-brand-secondary" /> Tasks ({tasks.length})
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {tasks.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500 font-medium italic border border-dashed rounded-xl border-gray-200 bg-gray-50/50">
                                        There is no task data attached to this project yet.
                                    </div>
                                ) : tasks.map(task => {
                                    const isDone = task.status === 'completed';
                                    const inProgress = task.status === 'in_sync';
                                    return (
                                        <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                                                    isDone ? "bg-brand-success/20 text-brand-success" :
                                                        inProgress ? "bg-[#e1f5fe] text-blue-600" :
                                                            "bg-gray-200 text-gray-500"
                                                )}>
                                                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-brand-primary">{task.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-text-muted">Owner:</span>
                                                        <span className="text-sm text-text-secondary font-medium">{task.responsible_owner?.full_name || "Unassigned"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "px-3 py-1 text-xs font-bold rounded-full uppercase",
                                                    isDone ? "bg-brand-success/10 text-brand-success" :
                                                        inProgress ? "bg-blue-100 text-blue-700" :
                                                            "bg-gray-200 text-gray-600"
                                                )}>
                                                    {task.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Participants & Activity Log */}
                    <div className="space-y-8">

                        {/* Participants (Admin + Dynamic Teams) */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-brand-secondary" /> Team
                            </h2>

                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Project Admin</p>
                                <div className="flex items-center gap-4">
                                    <img src={getAvatar(project.project_admin)} alt="Admin" className="w-12 h-12 rounded-full border-2 border-brand-primary shadow-sm object-cover" />
                                    <div>
                                        <h4 className="font-bold text-brand-primary">{project.project_admin?.full_name || "Unassigned"}</h4>
                                        <p className="text-xs text-text-secondary capitalize">{project.project_admin?.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Task Participants</p>
                                <div className="space-y-4">
                                    {participants.length === 0 ? (
                                        <p className="text-sm italic text-gray-400">No active task participants.</p>
                                    ) : participants.map(p => (
                                        <div key={p.id} className="flex items-center gap-4">
                                            <img src={getAvatar(p.user)} alt={p.user?.full_name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <h4 className="font-bold text-brand-primary text-sm">{p.user?.full_name || "Unnamed User"}</h4>
                                                <p className="text-xs text-text-secondary capitalize">{p.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Activity Log (Sync Logs mapped) */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-brand-secondary" /> Activity Log
                            </h2>

                            {logs.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No activity logged for this project yet.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {logs.slice(0, 10).map((log) => (
                                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-brand-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>

                                            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl shadow-sm bg-gray-50 border border-gray-100">
                                                <p className="text-sm font-medium text-brand-primary">
                                                    {log.user?.full_name || 'User'} <span className="font-normal text-text-secondary">synced task</span> "{log.task?.title}"
                                                </p>
                                                {log.message && (
                                                    <p className="text-xs mt-1 text-gray-600 italic">"{log.message}"</p>
                                                )}
                                                <time className="block mb-1 text-xs font-bold text-text-muted mt-2">
                                                    {formatTimeAgo(log.created_at)}
                                                </time>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
