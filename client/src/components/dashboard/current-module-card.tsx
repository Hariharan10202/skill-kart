import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Lesson = {
  id: number;
  title: string;
  duration: number;
  status: "completed" | "in_progress" | "locked";
};

type Module = {
  id: number;
  title: string;
  description: string;
  weekNumber: number;
  roadmapTitle: string;
  progress: number;
  lessons: Lesson[];
};

export default function CurrentModuleCard() {
  const { data: moduleData } = useQuery({
    queryKey: ['/api/modules/current'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const currentModule: Module = moduleData?.module || {
    id: 0,
    title: "Loading...",
    description: "",
    weekNumber: 0,
    roadmapTitle: "",
    progress: 0,
    lessons: [],
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="secondary" className="mb-2">Current Module</Badge>
            <h3 className="text-xl font-bold dark:text-white">{currentModule.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Week {currentModule.weekNumber} of your {currentModule.roadmapTitle} roadmap
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center">
            <span className="text-sm font-medium dark:text-white">
              {currentModule.progress}% complete
            </span>
          </div>
        </div>
        
        <Progress value={currentModule.progress} className="w-full h-2" />
        
        <div className="mt-6">
          <h4 className="text-md font-medium dark:text-white mb-3">Today's Lessons</h4>
          
          <div className="space-y-3">
            {currentModule.lessons?.map((lesson) => (
              <div 
                key={lesson.id}
                className={cn(
                  "flex items-center p-3 rounded-lg border dark:border-gray-800 transition-colors cursor-pointer",
                  lesson.status === "in_progress" 
                    ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                  lesson.status === "completed" 
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
                    : lesson.status === "in_progress" 
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                )}>
                  {lesson.status === "completed" 
                    ? <Check className="h-5 w-5" /> 
                    : lesson.status === "in_progress" 
                      ? <Play className="h-5 w-5" /> 
                      : <Lock className="h-5 w-5" />
                  }
                </div>
                <div>
                  <p className="font-medium dark:text-white text-sm">{lesson.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lesson.duration} min · 
                    {lesson.status === "completed" 
                      ? " Completed" 
                      : lesson.status === "in_progress" 
                        ? " In Progress" 
                        : " Locked"
                    }
                  </p>
                </div>
                {lesson.status === "completed" && (
                  <Button variant="link" size="sm" className="ml-auto text-primary dark:text-primary">
                    Review
                  </Button>
                )}
                {lesson.status === "in_progress" && (
                  <Button size="sm" className="ml-auto">
                    Continue
                  </Button>
                )}
                {lesson.status === "locked" && (
                  <div className="ml-auto text-gray-400 dark:text-gray-500 text-xs">Coming next</div>
                )}
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="mt-4 w-full">
            View all lessons
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
