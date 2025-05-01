import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Award, Timer } from "lucide-react";

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  xp: number;
};

export default function AchievementsCard() {
  const { data: achievementsData } = useQuery({
    queryKey: ['/api/user/achievements'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const achievements = achievementsData?.achievements || [];

  // Function to render appropriate icon based on achievement type
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'award':
        return <Award className="text-blue-600 dark:text-blue-300 h-5 w-5" />;
      case 'timer':
        return <Timer className="text-purple-600 dark:text-purple-300 h-5 w-5" />;
      default:
        return <Award className="text-blue-600 dark:text-blue-300 h-5 w-5" />;
    }
  };

  // Function to get background color class based on achievement color
  const getBgColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900';
      default:
        return 'bg-blue-100 dark:bg-blue-900';
    }
  };

  // Function to get badge color class based on achievement color
  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold dark:text-white mb-4">Recent Achievements</h3>
        
        <div className="space-y-4">
          {achievements.length > 0 ? (
            achievements.slice(0, 2).map((achievement: Achievement) => (
              <div key={achievement.id} className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full ${getBgColor(achievement.color)} flex items-center justify-center`}>
                  {renderIcon(achievement.icon)}
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">{achievement.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs ${getBadgeColor(achievement.color)} px-2 py-1 rounded-full`}>
                    +{achievement.xp} XP
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No achievements yet.</p>
              <p className="text-sm">Keep learning to earn badges!</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-4 text-sm text-primary dark:text-primary hover:underline"
        >
          View all achievements
        </Button>
      </CardContent>
    </Card>
  );
}
