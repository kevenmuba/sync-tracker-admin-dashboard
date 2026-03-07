"use client";

import React, { useState } from "react";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Topbar } from "@/components/Topbar";

export default function Home() {
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

      <div className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Statistics & Charting Section */}
        <section className="w-full">
          <DashboardOverview searchValue={searchValue} />
        </section>
      </div>
    </div>
  );
}
