"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Plus, FolderKanban, User, Calendar, Flag, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    estimated_end_date: string;
    admin_accepted: boolean;
    project_admin: { full_name: string } | null;
};

type AppUser = {
    id: string;
    full_name: string;
    role: string;
};

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [newProjectAdmin, setNewProjectAdmin] = useState("");
    const [admins, setAdmins] = useState<AppUser[]>([]);
    const [creating, setCreating] = useState(false);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*, project_admin:users!project_admin(full_name)')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setProjects(data as any);
            }

            // Fetch potential admins
            const { data: adminData } = await supabase
                .from('users')
                .select('*')
                .in('role', ['project_admin', 'super_admin']);
            if (adminData) {
                setAdmins(adminData);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        // Real-time subscription
        const channel = supabase
            .channel('public:projects')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                () => {
                    fetchProjects();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return alert("Project name is required.");

        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('projects').insert({
                name: newProjectName,
                description: newProjectDesc,
                project_admin: newProjectAdmin || null,
                status: 'active',
                created_by: user?.id || null
            }).select().single();

            if (error) throw error;

            setShowCreateMenu(false);
            setNewProjectName("");
            setNewProjectDesc("");
            setNewProjectAdmin("");

            if (data) {
                router.push(`/admin/projects/${data.id}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to create project");
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen relative">
            <Topbar />

            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Area */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-primary flex items-center gap-3">
                            <FolderKanban className="w-8 h-8 text-brand-secondary" />
                            All Projects
                        </h1>
                        <p className="text-text-secondary mt-1">Manage and track all organizational projects</p>
                    </div>
                    <button
                        onClick={() => setShowCreateMenu(true)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition",
                            "shadow-lg shadow-brand-primary/30 font-semibold"
                        )}
                    >
                        <Plus className="w-5 h-5" /> New Project
                    </button>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-secondary" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <FolderKanban className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-500">No projects found.</h3>
                        <p className="text-gray-400">Create a new project to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Link
                                href={`/admin/projects/${project.id}`}
                                key={project.id}
                                className="bg-white rounded-[1.25rem] p-6 shadow-sm shadow-black/5 hover:shadow-md transition-shadow border border-gray-100 group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1 flex-1 mr-4">
                                        {project.name}
                                    </h2>
                                    <span className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide",
                                        "bg-[#ecfccb] text-[#4d7c0f]" // Matching the mobile app's #ECFCCB and #4D7C0F
                                    )}>
                                        {project.status || "UNKNOWN"}
                                    </span>
                                </div>

                                <p className="text-sm text-text-secondary mb-6 line-clamp-2 flex-1">
                                    {project.description || "No description provided."}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-brand-primary" />
                                        </div>
                                        <span className="font-semibold text-text-secondary">Admin:</span>
                                        <span className="text-brand-primary font-medium truncate flex-1">
                                            {project.project_admin?.full_name || "Unassigned"}
                                            {project.project_admin && (
                                                <span className="text-xs text-text-muted font-normal ml-1">
                                                    ({project.admin_accepted ? "Accepted" : "Pending"})
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-text-secondary pl-1">
                                        <Calendar className="w-4 h-4 text-text-muted" />
                                        <span className="font-medium">Created:</span>
                                        <span>{formatDate(project.created_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-[#ea580c] pl-1">
                                        <Flag className="w-4 h-4" />
                                        <span className="font-semibold">Ends:</span>
                                        <span className="font-semibold">{formatDate(project.estimated_end_date)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-brand-primary">Create New Project</h3>
                            <button
                                onClick={() => setShowCreateMenu(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="E.g., Website Redesign"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    placeholder="Brief details about the project..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800 h-28 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Assign Project Admin</label>
                                <select
                                    value={newProjectAdmin}
                                    onChange={(e) => setNewProjectAdmin(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800 bg-white"
                                >
                                    <option value="">-- Leave Unassigned --</option>
                                    {admins.map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.full_name || 'Unnamed User'} ({admin.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowCreateMenu(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={creating}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold transition-all shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90",
                                    creating && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
