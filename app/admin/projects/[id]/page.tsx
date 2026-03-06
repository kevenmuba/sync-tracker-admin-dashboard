import React from "react";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Users, ArrowLeft, Activity, ListTodo } from "lucide-react";
import Link from "next/link";

// Mock Data for Project Details
const projectData = {
    id: 1,
    name: "Sync Tracker Internal Dashboard",
    description: "Building the new admin dashboard with real-time stats, task tracking, and project progress monitoring for the super admin panel.",
    status: "In Progress",
    dueDate: "Oct 24, 2026",
    progress: 68,
    admin: { name: "Alice M.", role: "Super Admin", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=150" },
    participants: [
        { id: 1, name: "Bob L.", role: "Frontend Lead", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=150" },
        { id: 2, name: "Charlie K.", role: "Backend Dev", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
        { id: 3, name: "Diana S.", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
    ],
    tasks: [
        { id: 101, title: "Design System Implementation", assignee: "Diana S.", status: "Done", priority: "High" },
        { id: 102, title: "API Integrations for Tasks", assignee: "Charlie K.", status: "In Progress", priority: "High" },
        { id: 103, title: "Auth Flow Testing", assignee: "Bob L.", status: "Pending", priority: "Medium" },
        { id: 104, title: "Create Project Details View", assignee: "Bob L.", status: "In Progress", priority: "High" },
    ],
    activityLog: [
        { id: 1, action: "Alice M. created the project", time: "2 weeks ago" },
        { id: 2, action: "Diana S. completed task 'Design System Implementation'", time: "1 week ago" },
        { id: 3, action: "Charlie K. changed status of 'API Integrations' to In Progress", time: "3 days ago" },
        { id: 4, action: "Alice M. added Bob L. to the project", time: "2 days ago" },
    ],
};

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    // In a real app we would fetch the project data based on params.id
    const project = projectData;

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
            <Topbar />

            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full space-y-8 pb-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition">
                        <ArrowLeft className="w-6 h-6 text-brand-primary" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-brand-primary">{project.name}</h1>
                        <p className="text-text-secondary mt-1 flex items-center gap-2">
                            <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-bold">
                                {project.status}
                            </span>
                            • Due: {project.dueDate}
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
                                {project.description}
                            </p>

                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-text-secondary">Overall Progress</span>
                                <span className="text-sm font-bold text-brand-primary">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-brand-primary h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                                    <ListTodo className="w-6 h-6 text-brand-secondary" /> Tasks
                                </h2>
                                <button className="text-sm font-bold text-brand-primary hover:underline">View All</button>
                            </div>

                            <div className="space-y-4">
                                {project.tasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                                                task.status === "Done" ? "bg-brand-success/20 text-brand-success" :
                                                    task.status === "In Progress" ? "bg-brand-secondary/20 text-brand-secondary" :
                                                        "bg-gray-200 text-gray-500"
                                            )}>
                                                {task.status === "Done" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-brand-primary">{task.title}</h4>
                                                <p className="text-sm text-text-secondary">Assignee: {task.assignee}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-bold rounded-full",
                                                task.priority === "High" ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-warning/10 text-brand-warning"
                                            )}>
                                                {task.priority} Priority
                                            </span>
                                            <span className="text-sm font-bold text-text-muted">{task.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Participants & Activity Log */}
                    <div className="space-y-8">

                        {/* Participants */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-brand-secondary" /> Team
                            </h2>

                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Project Admin</p>
                                <div className="flex items-center gap-4">
                                    <img src={project.admin.avatar} alt="Admin" className="w-12 h-12 rounded-full border-2 border-brand-primary shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-brand-primary">{project.admin.name}</h4>
                                        <p className="text-xs text-text-secondary">{project.admin.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Participants</p>
                                <div className="space-y-4">
                                    {project.participants.map(member => (
                                        <div key={member.id} className="flex items-center gap-4">
                                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <h4 className="font-bold text-brand-primary text-sm">{member.name}</h4>
                                                <p className="text-xs text-text-secondary">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-brand-secondary" /> Activity Log
                            </h2>

                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                {project.activityLog.map((log, i) => (
                                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-brand-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>

                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl shadow-sm bg-gray-50 border border-gray-100">
                                            <p className="text-sm font-medium text-brand-primary">{log.action}</p>
                                            <time className="block mb-1 text-xs font-bold text-text-muted mt-2">{log.time}</time>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
