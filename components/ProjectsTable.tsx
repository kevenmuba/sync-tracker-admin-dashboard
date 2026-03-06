"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Edit, Eye } from "lucide-react";

// Mock data for projects
const initialProjects = [
    {
        id: 1,
        name: "Sync Tracker",
        admin: { name: "Alice M.", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=150" },
        totalTasks: 42,
        status: "Active",
        createdAt: "2024-08-12",
    },
    {
        id: 2,
        name: "Marketing Campaign",
        admin: { name: "Bob L.", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=150" },
        totalTasks: 27,
        status: "Paused",
        createdAt: "2024-09-03",
    },
];

export function ProjectsTable() {
    const [projects, setProjects] = useState(initialProjects);
    const [showCreate, setShowCreate] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", adminName: "" });

    const handleCreate = () => {
        if (!newProject.name) return;
        const newId = projects.length + 1;
        const admin = {
            name: newProject.adminName || "Unassigned",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        };
        const created = new Date().toISOString().split("T")[0];
        setProjects([
            ...projects,
            { id: newId, name: newProject.name, admin, totalTasks: 0, status: "New", createdAt: created },
        ]);
        setNewProject({ name: "", adminName: "" });
        setShowCreate(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-brand-primary">Projects</h2>
                <button
                    onClick={() => setShowCreate(true)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition",
                        "shadow-lg shadow-brand-primary/30"
                    )}
                >
                    <Plus className="w-5 h-5" /> Create Project
                </button>
            </div>

            {/* Projects Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-text-muted">
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4">Project Name</th>
                            <th className="px-6 py-4">Project Admin</th>
                            <th className="px-6 py-4">Total Tasks</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projects.map((proj) => (
                            <tr key={proj.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-brand-primary">{proj.name}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <img src={proj.admin.avatar} alt={proj.admin.name} className="w-8 h-8 rounded-full" />
                                    <span className="text-sm text-text-secondary">{proj.admin.name}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary">{proj.totalTasks}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={cn(
                                            "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                                            proj.status === "Active"
                                                ? "bg-[#e8f5e9] text-brand-success"
                                                : proj.status === "Paused"
                                                    ? "bg-[#fff3e0] text-brand-warning"
                                                    : "bg-[#e1e1e1] text-text-muted"
                                        )}
                                    >
                                        {proj.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary">{proj.createdAt}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <a href={`/admin/projects/${proj.id}`} className={cn("p-2 rounded-lg hover:bg-gray-200")}>
                                        <Eye className="w-5 h-5 text-brand-primary" />
                                    </a>
                                    <button className={cn("p-2 rounded-lg hover:bg-gray-200")}>
                                        <Edit className="w-5 h-5 text-brand-primary" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Project Modal */}
            {showCreate && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
                        <h3 className="text-xl font-bold mb-4">New Project</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Project name"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <input
                                type="text"
                                placeholder="Admin name (optional)"
                                value={newProject.adminName}
                                onChange={(e) => setNewProject({ ...newProject, adminName: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
