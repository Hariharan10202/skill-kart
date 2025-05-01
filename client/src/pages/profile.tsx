import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Flame, Trophy } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: profileData } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const profile = profileData?.profile || {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    joinedDate: "Recently",
    completedModules: 0,
    totalModules: 0,
    achievements: [],
    skills: [],
    streak: {
      current: 0,
      best: 0,
    }
  };

  const progressPercentage = (profile.xp / profile.xpToNextLevel) * 100;
  const moduleProgressPercentage = profile.totalModules > 0 
    ? (profile.completedModules / profile.totalModules) * 100 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Profile Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mb-4">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-muted-foreground">{user?.email || "No email provided"}</p>
                
                <div className="w-full mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Level {profile.level}</span>
                    <span className="text-sm text-muted-foreground">{profile.xp}/{profile.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <div className="p-2 rounded-full bg-primary/20 text-primary mb-2">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold">{profile.achievements.length}</span>
                    <span className="text-xs text-muted-foreground">Achievements</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 mb-2">
                      <Flame className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold">{profile.streak.current}</span>
                    <span className="text-xs text-muted-foreground">Day Streak</span>
                  </div>
                </div>
                
                <div className="mt-6 w-full">
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your journey so far</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Module Completion</span>
                    <span className="text-sm text-muted-foreground">
                      {profile.completedModules}/{profile.totalModules} modules
                    </span>
                  </div>
                  <Progress value={moduleProgressPercentage} className="h-2" />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Your Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill: { id: number, name: string, level: number }, index: number) => (
                        <Badge key={skill.id} variant="outline" className="py-1.5">
                          {skill.name} <span className="ml-1 text-muted-foreground">Lv.{skill.level}</span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills acquired yet.</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Joined {profile.joinedDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different profile sections */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Achievements
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Earned an achievement</p>
                          <p className="text-sm text-muted-foreground">Completed your first module</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Completed a lesson</p>
                          <p className="text-sm text-muted-foreground">JavaScript Fundamentals: Functions</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Learning Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-3xl font-bold">{profile.completedModules}</p>
                        <p className="text-sm text-muted-foreground">Modules Completed</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-3xl font-bold">{profile.streak.best}</p>
                        <p className="text-sm text-muted-foreground">Best Streak</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-3xl font-bold">{profile.achievements.length}</p>
                        <p className="text-sm text-muted-foreground">Achievements</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-3xl font-bold">{profile.xp}</p>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="p-6">
                <h3 className="text-lg font-medium mb-4">Achievements</h3>
                {profile.achievements.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profile.achievements.map((achievement: { id: number, title: string, description: string, icon: string, dateEarned: string }, index: number) => (
                      <div key={achievement.id} className="p-4 border rounded-lg flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Earned on {achievement.dateEarned}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground">
                      Complete lessons and challenges to earn achievements.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity" className="p-6">
                <h3 className="text-lg font-medium mb-4">Activity Log</h3>
                <p className="text-muted-foreground">Your recent learning activity will appear here.</p>
              </TabsContent>
              
              <TabsContent value="settings" className="p-6">
                <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
