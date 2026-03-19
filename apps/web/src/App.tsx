import { Header } from "./components/Header";
import { MapView } from "./features/map/MapView";
import { SidePanel } from "./components/SidePanel";
import { GlobalStats } from "./components/GlobalStats";
import { useAppStore } from "./store/appStore";

export default function App() {
  const currentRun = useAppStore((s) => s.currentRun);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map fills the background */}
        <div className="absolute inset-0">
          <MapView />
        </div>

        {/* Global stats bar at top of map when results exist */}
        {currentRun && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <GlobalStats />
          </div>
        )}

        {/* Side panel (right) */}
        <div className="absolute right-0 top-0 bottom-0 w-[420px] z-10 pointer-events-none">
          <div className="h-full pointer-events-auto">
            <SidePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
