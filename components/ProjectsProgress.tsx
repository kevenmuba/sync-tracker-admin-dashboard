"use client";

import React from "react";
import { ChevronRight, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectsProgress() {
    return (
        <div className="bg-brand-primary rounded-[2.5rem] p-8 shadow-sm h-full relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold text-white">Projects in progress:</h2>
                <div className="w-2 h-2 bg-brand-danger rounded-full"></div>
            </div>

            <div className="relative h-64">
                {/* Background Cards Stack Effect */}
                <div className="absolute top-4 left-4 right-[-20px] bottom-0 bg-[#3d4251] rounded-3xl opacity-40 translate-x-12 scale-95"></div>
                <div className="absolute top-2 left-2 right-[-10px] bottom-0 bg-[#3d4251] rounded-3xl opacity-60 translate-x-6 scale-[0.97]"></div>

                {/* Main Card */}
                <div className="absolute inset-0 bg-white rounded-3xl p-6 shadow-2xl flex flex-col z-10 transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex gap-2 mb-4">
                        <span className="bg-[#e1f5fe] text-brand-secondary text-[10px] font-black px-2 py-1 rounded-md">FEEDBACK</span>
                        <span className="bg-[#e8f5e9] text-brand-success text-[10px] font-black px-2 py-1 rounded-md">BUG</span>
                        <span className="bg-[#f3e5f5] text-[#9c27b0] text-[10px] font-black px-2 py-1 rounded-md">DESIGN SYSTEM</span>
                    </div>

                    <h3 className="text-xl font-bold text-brand-primary mb-2">Improve cards readability</h3>
                    <span className="text-xs text-text-muted font-bold mb-6">21.03.22</span>

                    <div className="flex items-center gap-4 mt-auto">
                        <div className="flex -space-x-2">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                                alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                                alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                            <div className="w-8 h-8 rounded-full bg-brand-primary border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                +8
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-1.5 text-text-muted">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-[10px] font-bold">12 comments</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-[10px] font-bold">0 files</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-primary z-20 hover:bg-gray-50 active:scale-95 transition-all">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
            </div>
        </div>
    );
}
