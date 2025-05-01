import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Settings, Check, Code, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type RoadmapModule = {
  id: number;
  title: string;
  weekNumber: number;
  status: "completed" | "in_progress" | "locked";
  progress: number;
  icon: string;
  totalLessons: number;
};

export default function RoadmapCard() {
  const { data: roadmapData } = useQuery({
    queryKey: ['/api/roadmap'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const modules: RoadmapModule[] = roadmapData?.modules || [];

  const renderIcon = (icon: string, status: string) => {
    const iconClassName = "h-5 w-5";
    
    switch (icon) {
      case 'html':
        return <Code className={iconClassName} />;
      case 'javascript':
        return <Code className={iconClassName} />;
      case 'react':
        return <Redo2 className={iconClassName} />;
      default:
        return <Code className={iconClassName} />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-600 dark:text-green-300',
          badge: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
          ring: '',
        };
      case 'in_progress':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-600 dark:text-blue-300',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
          ring: 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-400 dark:text-gray-500',
          badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
          ring: '',
        };
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">Your Learning Roadmap</h3>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
            <Settings className="h-4 w-4 mr-1" /> Customize
          </Button>
        </div>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-5 top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="space-y-8">
            {modules.map((module) => {
              const colors = getStatusColors(module.status);
              
              return (
                <div key={module.id} className="flex items-start">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center z-10",
                    colors.bg,
                    colors.text,
                    colors.ring
                  )}>
                    {module.status === "completed" 
                      ? <Check className="h-5 w-5" /> 
                      : renderIcon(module.icon, module.status)
                    }
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium dark:text-white">{module.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Week {module.weekNumber} · 
                      {module.status === "completed" 
                        ? " Completed" 
                        : module.status === "in_progress" 
                          ? " In Progress" 
                          : " Locked"
                      }
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                        {module.progress}% complete
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {module.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <Link href="/roadmap">
          <Button 
            variant="outline" 
            className="mt-6 w-full flex items-center justify-center gap-2"
          >
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
              className="lucide lucide-road-map"
            >
              <path d="M6 17 9 4 M10 3 10 22 M14 21 17 8 M18 2 18 19 M3 2 19 2 M5 22 21 22 M2 7 22 7 M2 17 22 17" />
            </svg>
            View full roadmap
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
