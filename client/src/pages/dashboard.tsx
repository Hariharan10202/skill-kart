import WelcomeCard from "@/components/dashboard/welcome-card";
import StreakCard from "@/components/dashboard/streak-card";
import AchievementsCard from "@/components/dashboard/achievements-card";
import CurrentModuleCard from "@/components/dashboard/current-module-card";
import RoadmapCard from "@/components/dashboard/roadmap-card";
import CommunityCard from "@/components/dashboard/community-card";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Progress Summary */}
        <div className="md:w-1/3">
          <div className="space-y-6">
            <WelcomeCard />
            <StreakCard />
            <AchievementsCard />
          </div>
        </div>
        
        {/* Right Column - Roadmap & Current Learning */}
        <div className="md:w-2/3">
          <div className="space-y-6">
            <CurrentModuleCard />
            <RoadmapCard />
            <CommunityCard />
          </div>
        </div>
      </div>
    </div>
  );
}
