import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Code, Redo2, Database, Server, Network, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Module = {
  id: number;
  title: string;
  description: string;
  weekNumber: number;
  status: "completed" | "in_progress" | "locked";
  progress: number;
  icon: string;
  lessons: {
    id: number;
    title: string;
    duration: number;
    status: "completed" | "in_progress" | "locked";
  }[];
};

export default function Roadmap() {
  const { data: fullRoadmapData } = useQuery({
    queryKey: ['/api/roadmap/full'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const modules: Module[] = fullRoadmapData?.modules || [];
  
  const renderIcon = (icon: string) => {
    const iconClass = "h-6 w-6";
    switch (icon) {
      case 'html':
        return <Code className={iconClass} />;
      case 'javascript':
        return <Code className={iconClass} />;
      case 'react':
        return <Redo2 className={iconClass} />;
      case 'database':
        return <Database className={iconClass} />;
      case 'server':
        return <Server className={iconClass} />;
      case 'network':
        return <Network className={iconClass} />;
      default:
        return <Code className={iconClass} />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-600 dark:text-green-300',
          badge: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
        };
      case 'in_progress':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-600 dark:text-blue-300',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-400 dark:text-gray-500',
          badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Learning Roadmap</h1>
        <Button variant="outline">
          Customize Roadmap
        </Button>
      </div>

      <div className="grid gap-8">
        {modules.map((module) => {
          const colors = getStatusColors(module.status);
          
          return (
            <Card key={module.id} className={cn("border-2", colors.border)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 items-center">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colors.bg, colors.text)}>
                      {module.status === "completed" 
                        ? <Check className="h-6 w-6" /> 
                        : renderIcon(module.icon)
                      }
                    </div>
                    <div>
                      <Badge variant={module.status === "locked" ? "outline" : "secondary"} className="mb-1">
                        Week {module.weekNumber}
                      </Badge>
                      <CardTitle>{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm px-3 py-1 rounded-full inline-block", colors.badge)}>
                      {module.progress}% complete
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {module.lessons.filter(l => l.status === "completed").length}/{module.lessons.length} lessons completed
                    </p>
                  </div>
                </div>
                <Progress value={module.progress} className="mt-4 h-2" />
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-4">Lessons</h4>
                <div className="grid gap-3">
                  {module.lessons.map((lesson) => {
                    const lessonColors = getStatusColors(lesson.status);
                    
                    return (
                      <div 
                        key={lesson.id}
                        className={cn(
                          "flex items-center p-3 rounded-lg border dark:border-gray-800 transition-colors",
                          module.status !== "locked" ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          lessonColors.bg,
                          lessonColors.text
                        )}>
                          {lesson.status === "completed" 
                            ? <Check className="h-4 w-4" /> 
                            : <ChevronRight className="h-4 w-4" />
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
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
