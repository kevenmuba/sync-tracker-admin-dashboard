"use client";

import React from "react";
import { Search, LayoutGrid, List, Calendar, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/context/SidebarContext";

interface TopbarProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    viewMode?: 'card' | 'list';
    onViewModeChange?: (mode: 'card' | 'list') => void;
}

export function Topbar({
    searchValue = "",
    onSearchChange,
    viewMode = "card",
    onViewModeChange,
}: TopbarProps) {
    const { toggle: onToggleSidebar } = useSidebar();

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-transparent sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
                {/* Mobile Hamburger Menu */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-primary hover:bg-gray-50 transition-colors active:scale-95 flex-shrink-0"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar */}
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-xs md:text-sm focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-sm shadow-black/5 font-medium placeholder:text-text-muted/60"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 ml-4">
                {/* Date Display - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-text-secondary cursor-default bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-brand-primary/40"><Calendar className="w-4 h-4" /></span>
                    <span className="whitespace-nowrap">{formattedDate}</span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100/50 backdrop-blur-md">
                    <button
                        onClick={() => onViewModeChange?.('card')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-black transition-all duration-300",
                            viewMode === 'card'
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                                : "text-text-muted hover:bg-gray-50"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Card</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange?.('list')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-black transition-all duration-300",
                            viewMode === 'list'
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                                : "text-text-muted hover:bg-gray-50"
                        )}
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">List</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
