import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCard() {
  const { data: streakData } = useQuery({
    queryKey: ['/api/user/streak'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const streak = streakData?.streak || 0;
  const activeDays = streakData?.activeDays || [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold dark:text-white">Current Streak</h3>
          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-flame"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            {streak} days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day, index) => {
            const isActive = activeDays.includes(index);
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive 
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                )}>
                  {isActive && <Check className="h-4 w-4" />}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
