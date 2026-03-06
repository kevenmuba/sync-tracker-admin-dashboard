"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
    { name: "Mon", research: 1.5, design: 2 },
    { name: "Tue", research: 2.5, design: 1.2 },
    { name: "Wed", research: 1.8, design: 2.2 },
    { name: "Thu", research: 3.5, design: 1.8 },
    { name: "Fri", research: 2.8, design: 2.5 },
    { name: "Sat", research: 3.2, design: 2.4 },
    { name: "Sun", research: 2.5, design: 2.1 },
];

export function ProductivityChart() {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm shadow-black/5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-primary">Productivity</h2>
                <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted cursor-pointer">
                    <span>01-07 May</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            <div className="flex gap-6 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-secondary"></div>
                    <span className="text-sm font-bold text-brand-primary">Research</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                    <div className="w-3 h-3 rounded-full bg-[#673ab7]"></div>
                    <span className="text-sm font-bold">Design</span>
                </div>
                <span className="text-xs text-text-muted ml-auto">Data updates every 3 hours</span>
            </div>

            <div className="flex-1 min-h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorResearch" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00b8d9" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#00b8d9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f2f5" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 12, fontWeight: 600 }}
                            ticks={[0, 1, 2, 3, 4]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-brand-primary text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl">
                                            {payload[0].value}h 10m
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="research"
                            stroke="#00b8d9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorResearch)"
                        />
                        <Area
                            type="monotone"
                            dataKey="design"
                            stroke="#673ab7"
                            strokeWidth={3}
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
