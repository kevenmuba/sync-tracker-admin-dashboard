import { Topbar } from "@/components/Topbar";
import { TaskTable } from "@/components/TaskTable";
import { ProductivityChart } from "@/components/ProductivityChart";
import { ProjectsProgress } from "@/components/ProjectsProgress";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
      <Topbar />

      <div className="flex-1 p-8 space-y-8 max-w-[1600px]">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8">

          {/* Top Section: Last Tasks */}
          <section className="w-full">
            <TaskTable />
          </section>

          {/* Bottom Section: Productivity & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
            <section>
              <ProductivityChart />
            </section>
            <section>
              <ProjectsProgress />
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
