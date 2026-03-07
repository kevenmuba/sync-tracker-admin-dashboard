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
    const [searchValue, setSearchValue] = useState("");
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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
                .eq('role', 'project_admin');
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

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (project.description || "").toLowerCase().includes(searchValue.toLowerCase()) ||
        (project.project_admin?.full_name || "").toLowerCase().includes(searchValue.toLowerCase())
    );

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

            if (newProjectAdmin) {
                await supabase.from('notifications').insert({
                    user_id: newProjectAdmin,
                    title: "New Project Assignment",
                    message: `You have been assigned as an admin for the project "${newProjectName}". Please accept the assignment.`,
                    is_read: false
                });
            }

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
            <Topbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Area */}
                <div className="flex justify-between items-center mb-10 bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100/50">
                    <div>
                        <h1 className="text-3xl font-black text-brand-primary flex items-center gap-3 tracking-tight">
                            <FolderKanban className="w-9 h-9 text-brand-secondary" />
                            Projects Pipeline
                        </h1>
                        <p className="text-text-secondary font-medium mt-1">Track and audit your organization's projects ({filteredProjects.length})</p>
                    </div>
                    <button
                        onClick={() => setShowCreateMenu(true)}
                        className={cn(
                            "flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary/90 transition-all",
                            "shadow-xl shadow-brand-primary/25 font-black uppercase text-xs tracking-widest active:scale-95"
                        )}
                    >
                        <Plus className="w-5 h-5" /> New Project
                    </button>
                </div>

                {/* Projects Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <FolderKanban className="w-12 h-12 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-brand-primary mb-2">No projects found</h3>
                        <p className="text-text-muted font-medium max-w-sm text-center">We couldn't find any projects matching your search or filters.</p>
                        <button
                            onClick={() => setSearchValue("")}
                            className="mt-6 text-brand-primary font-bold hover:underline"
                        >
                            Reset search filters
                        </button>
                    </div>
                ) : viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProjects.map(project => (
                            <Link
                                href={`/admin/projects/${project.id}`}
                                key={project.id}
                                className="bg-white rounded-[2rem] p-7 shadow-sm shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50 group flex flex-col h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-colors" />

                                <div className="flex justify-between items-start mb-4 relative">
                                    <h2 className="text-xl font-black text-brand-primary line-clamp-1 flex-1 mr-4 tracking-tight">
                                        {project.name}
                                    </h2>
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest shrink-0",
                                        project.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {project.status || "ACTIVE"}
                                    </span>
                                </div>

                                <p className="text-sm text-text-muted font-medium mb-8 line-clamp-3 flex-1 leading-relaxed">
                                    {project.description || "Optimize and track your project performance with our advanced tracking systems."}
                                </p>

                                <div className="space-y-4 pt-6 border-t border-gray-50 mt-auto relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                            <User className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Project Admin</span>
                                            <span className="text-sm font-bold text-brand-primary truncate max-w-[150px]">
                                                {project.project_admin?.full_name || "Unassigned"}
                                            </span>
                                        </div>
                                        {project.project_admin && (
                                            <div className={cn(
                                                "ml-auto w-2 h-2 rounded-full",
                                                project.admin_accepted ? "bg-emerald-500" : "bg-amber-500"
                                            )} title={project.admin_accepted ? "Accepted" : "Pending"} />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-bold bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Starts: {formatDate(project.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-brand-danger">
                                            <Flag className="w-3.5 h-3.5" />
                                            <span>{formatDate(project.estimated_end_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-text-muted text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-8 py-5">Project Name</th>
                                    <th className="px-8 py-5">Assigned Admin</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Timeline</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProjects.map(project => (
                                    <tr
                                        key={project.id}
                                        className="group hover:bg-gray-50/30 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                    <FolderKanban className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-brand-primary">{project.name}</p>
                                                    <p className="text-xs text-text-muted font-medium truncate max-w-xs">{project.description || "No description"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black">
                                                    {project.project_admin?.full_name?.charAt(0) || "U"}
                                                </div>
                                                <span className="text-sm font-bold text-text-secondary">{project.project_admin?.full_name || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", project.status === 'active' ? "bg-emerald-500" : "bg-gray-400")} />
                                                <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{project.status || "active"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase">
                                                    <Calendar className="w-3 h-3" /> {formatDate(project.created_at)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-danger uppercase">
                                                    <Flag className="w-3 h-3" /> {formatDate(project.estimated_end_date)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
