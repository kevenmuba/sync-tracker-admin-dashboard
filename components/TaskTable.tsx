"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, Calendar } from "lucide-react";

const tasks = [
    {
        id: 1,
        name: "ClientOnboarding - Circle",
        admin: { name: "Samanta J.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
        members: 3,
        status: "In progress",
        runtime: "6 hours",
        finishDate: "6 Mon",
    },
    {
        id: 2,
        name: "Meeting with Webflow & Notion",
        admin: { name: "Bob P.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
        members: 4,
        status: "Done",
        runtime: "2 hours",
        finishDate: "7 Tue",
    },
    {
        id: 3,
        name: "First Handoff with Engineers",
        admin: { name: "Kate O.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
        members: 10,
        status: "In progress",
        runtime: "3 days",
        finishDate: "10 Fri",
    },
    {
        id: 4,
        name: "Client Drafting (2) with Lawrence",
        admin: { name: "Jack F.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
        members: 7,
        status: "In progress",
        runtime: "1 week",
        finishDate: "19 Sun",
    },
];

export function TaskTable() {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm shadow-black/5 h-full">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-4xl font-bold text-brand-primary mb-2">Last tasks</h2>
                    <p className="text-text-muted text-sm flex items-center gap-1">
                        <span className="font-bold text-brand-primary">117 total</span>,
                        <span>proceed to resolve them</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white border rounded-[2rem] p-6 flex flex-col items-center min-w-[100px]">
                        <span className="text-3xl font-bold">94</span>
                        <span className="text-xs text-text-muted">Done</span>
                    </div>
                    <div className="bg-white border rounded-[2rem] p-6 flex flex-col items-center min-w-[100px]">
                        <span className="text-3xl font-bold">23</span>
                        <span className="text-xs text-text-muted">In progress</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-text-muted text-sm font-medium border-b border-gray-50">
                            <th className="pb-6 w-12">
                                <div className="w-5 h-5 border-2 border-gray-200 rounded-md"></div>
                            </th>
                            <th className="pb-6 font-medium">Name</th>
                            <th className="pb-6 font-medium">Admin</th>
                            <th className="pb-6 font-medium">Members</th>
                            <th className="pb-6 font-medium">Status</th>
                            <th className="pb-6 font-medium">Run time</th>
                            <th className="pb-6 font-medium">Finish date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.map((task) => (
                            <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-6">
                                    <div className="w-5 h-5 border-2 border-gray-200 rounded-md"></div>
                                </td>
                                <td className="py-6 font-bold text-brand-primary">{task.name}</td>
                                <td className="py-6">
                                    <div className="flex items-center gap-3">
                                        <img src={task.admin.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        <span className="text-sm font-medium text-text-secondary">{task.admin.name}</span>
                                    </div>
                                </td>
                                <td className="py-6 text-sm font-medium text-text-secondary">{task.members}</td>
                                <td className="py-6">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold",
                                        task.status === "Done"
                                            ? "bg-[#e8f5e9] text-brand-success"
                                            : "bg-[#e1f5fe] text-brand-secondary"
                                    )}>
                                        {task.status === "Done" ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        {task.status}
                                    </div>
                                </td>
                                <td className="py-6 text-sm font-medium text-text-secondary">{task.runtime}</td>
                                <td className="py-6">
                                    <div className="bg-gray-100/50 px-3 py-1 rounded-lg inline-block text-xs font-bold text-text-muted">
                                        {task.finishDate}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
