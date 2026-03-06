"use client";

import React from "react";
import { Search, ChevronDown, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar() {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-transparent">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm shadow-black/5"
                    />
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer hover:text-brand-primary">
                    <span>Monday, 6th March</span>
                    <ChevronDown className="w-4 h-4" />
                </div>

                <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/20">
                        <LayoutGrid className="w-4 h-4" />
                        Card
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted text-sm font-bold hover:bg-gray-50">
                        <List className="w-4 h-4" />
                        List
                    </button>
                </div>
            </div>
        </header>
    );
}
