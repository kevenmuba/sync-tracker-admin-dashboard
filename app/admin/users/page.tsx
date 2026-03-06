"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { Users as UsersIcon, Shield, UserCog, User, Plus, Search, Loader2, Trash2, X, Mail, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// The shape of our user from public.users table
type AppUser = {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string;
    created_at: string;
};

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newFullName, setNewFullName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("team_member");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setUsers(data as AppUser[]);
            if (error) console.error(error);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel('public:users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getAvatar = (user: AppUser) => {
        if (user?.avatar_url) return user.avatar_url;
        const name = user?.full_name || user?.email || "Unknown";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&bold=true`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleAddUser = async () => {
        if (!newEmail || !newPassword || !newFullName) {
            alert("Please fill all required fields.");
            return;
        }

        setAdding(true);
        try {
            // Note: Since we are using standard auth on the client side without Service Role,
            // signUp will insert into auth.users and trigger public.users creation via your DB triggers.
            // WARNING in standard Supabase: signing up a user from client-side logs out the active session!
            const { data, error } = await supabase.auth.signUp({
                email: newEmail,
                password: newPassword,
                options: {
                    data: {
                        full_name: newFullName,
                    }
                }
            });

            if (error) throw error;

            // Wait for trigger to fire, then update the user role manually since signUp metadata mappings might be restricted
            if (data.user) {
                await supabase.from('users').update({ role: newRole }).eq('id', data.user.id);
            }

            alert("User created successfully! Note: For security reasons, creating a user from an admin client logs you into their account by default unless using Supabase Admin API.");
            setShowAddMenu(false);
            setNewEmail("");
            setNewPassword("");
            setNewFullName("");
            setNewRole("team_member");
            fetchUsers();

        } catch (error: any) {
            alert(error.message || "Could not add user.");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteUser = async (user: AppUser) => {
        const confirmDelete = window.confirm(`Are you absolutely sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            // Because your DB has onDelete cascade on 'projects.created_by' / 'time_logs.user_id' but potentially not ALL foreign keys,
            // we will delete from public.users table. 
            // NOTE: Full proper deletion requires deleting from 'auth.users' via admin api.
            const { error } = await supabase.from('users').delete().eq('id', user.id);

            if (error) {
                alert("Failed to delete user profile. They might be assigned to a Task as a responsible_owner or admin which prevents deletion due to foreign key constraints.");
                console.error(error);
                return;
            }

            alert("User removed successfully.");
            fetchUsers();
        } catch (error: any) {
            alert(error.message || "An error occurred while deleting.");
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const superAdmins = users.filter(u => u.role === 'super_admin').length;
    const projectAdmins = users.filter(u => u.role === 'project_admin').length;
    const teamMembers = users.filter(u => u.role === 'team_member').length;

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen relative">
            <Topbar />

            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full space-y-8 pb-12">

                {/* Header Area */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                            <UsersIcon className="w-7 h-7 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-primary">Team Management</h1>
                            <p className="text-text-secondary mt-1">Add, remove, and track users across your organization</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddMenu(true)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition",
                            "shadow-lg shadow-brand-primary/30 font-semibold"
                        )}
                    >
                        <Plus className="w-5 h-5" /> Add New User
                    </button>
                </div>

                {/* KPI Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                            <UsersIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Total Users</p>
                            <h3 className="text-3xl font-black text-brand-primary">{users.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                            <Shield className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Super Admins</p>
                            <h3 className="text-3xl font-black text-brand-primary">{superAdmins}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                            <UserCog className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Project Admins</p>
                            <h3 className="text-3xl font-black text-brand-primary">{projectAdmins}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <User className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Team Members</p>
                            <h3 className="text-3xl font-black text-brand-primary">{teamMembers}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-primary">All Organization Members</h2>
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-80 shadow-sm"
                        />
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-gray-100">
                        <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 mb-2">No users found</h3>
                        <p className="text-gray-400">Try adjusting your search criteria or add a new user.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-3xl p-6 shadow-sm shadow-black/5 border border-gray-100 relative group overflow-hidden">

                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="absolute top-4 right-4 p-2.5 bg-red-50 text-red-600 rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-red-600 hover:text-white"
                                    title="Remove User"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={getAvatar(user)}
                                        alt={user.full_name || "User"}
                                        className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover shadow-sm mb-4"
                                    />
                                    <h3 className="text-lg font-bold text-brand-primary truncate w-full mb-1">
                                        {user.full_name || "Unnamed User"}
                                    </h3>

                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-4",
                                        user.role === 'super_admin' ? "bg-purple-100 text-purple-700" :
                                            user.role === 'project_admin' ? "bg-orange-100 text-orange-700" :
                                                "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-5 border-t border-gray-50 w-full text-left">
                                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate flex-1">{user.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Joined: {formatDate(user.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showAddMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                                <User className="w-5 h-5" /> Add New Team Member
                            </h3>
                            <button
                                onClick={() => setShowAddMenu(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="e.g. john@yourcompany.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Temporary Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Must be at least 6 characters"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Organization Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-800 bg-white"
                                >
                                    <option value="team_member">Team Member</option>
                                    <option value="project_admin">Project Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowAddMenu(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={adding}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold transition-all shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90",
                                    adding && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
