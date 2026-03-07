"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/Topbar";

export default function AnalyticsPage() {
    const [searchValue, setSearchValue] = useState("");
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen">
            <Topbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-brand-primary tracking-tight">Analytics Dashboard</h1>
                    <p className="text-text-secondary font-medium mt-2 text-lg">Detailed performance metrics are being prepared for your organization.</p>
                </div>
            </div>
        </div>
    );
}
