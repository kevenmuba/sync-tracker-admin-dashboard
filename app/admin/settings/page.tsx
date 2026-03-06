import { Topbar } from "@/components/Topbar";

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] min-h-screen">
            <Topbar />
            <div className="flex-1 p-8 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-brand-primary">The Settings page is ready to do</h1>
            </div>
        </div>
    );
}
