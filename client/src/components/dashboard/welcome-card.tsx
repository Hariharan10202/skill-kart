import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQueryFn } from "@/lib/queryClient";

export default function WelcomeCard() {
  const { user } = useAuth();

  const { data: userProgress } = useQuery({
    queryKey: ["/api/user/progress"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const progress = userProgress?.progress || {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    levelUp: false,
  };

  const progressPercentage = (progress.xp / progress.xpToNextLevel) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-2">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Continue your learning journey.
        </p>

        <div className="mt-4 flex items-center">
          <div className="relative w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-sm font-bold">
              Lv.{progress.level}
            </span>
            {progress.levelUp && (
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-green-500 animate-pulse"
              >
                +1
              </Badge>
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium dark:text-white">
              Experience Points
            </p>
            <Progress 
              value={progressPercentage} 
              className="w-36 h-2 mt-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {progress.xp}/{progress.xpToNextLevel} XP to next level
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
