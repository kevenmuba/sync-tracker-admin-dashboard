import { DashboardOverview } from "@/components/DashboardOverview";
import { Topbar } from "@/components/Topbar";
import { TaskTable } from "@/components/TaskTable";
import { ProductivityChart } from "@/components/ProductivityChart";
import { ProjectsProgress } from "@/components/ProjectsProgress";
import { ProjectsTable } from "@/components/ProjectsTable";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-[#f4f6f9] min-h-screen">
      <Topbar />

      <div className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Statistics & Charting Section */}
        <section className="w-full">
          <DashboardOverview />
        </section>

        
      </div>
    </div>
  );
}
