"use client";

import React from "react";

interface StatCardProps {
    label: string;
    value: number;
    type: "done" | "progress";
}

export function StatCard({ label, value, type }: StatCardProps) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-w-[120px] shadow-sm shadow-black/5 hover:shadow-md transition-shadow">
            <span className="text-4xl font-bold text-brand-primary mb-1">{value}</span>
            <span className="text-sm font-medium text-text-muted whitespace-nowrap">{label}</span>
        </div>
    );
}

export function StatsGroup() {
    return (
        <div className="flex gap-4">
            <StatCard label="Done" value={94} type="done" />
            <StatCard label="In progress" value={23} type="progress" />
        </div>
    );
}
