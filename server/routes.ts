import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { format, differenceInDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Middleware to check if user is a curator or admin
  const isCuratorOrAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    if (req.user.role === 'curator' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: You must be a curator or admin to perform this action" });
    }
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: You must be an admin to perform this action" });
    }
  };

  // User progress routes
  app.get("/api/user/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const progress = await storage.getUserProgress(req.user!.id);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json({ progress });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User streak routes
  app.get("/api/user/streak", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const streak = await storage.getUserStreak(req.user!.id);
      
      if (!streak) {
        return res.status(404).json({ message: "Streak not found" });
      }
      
      res.json({ streak: streak.current, activeDays: streak.activeDays });
    } catch (error) {
      console.error("Error fetching user streak:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User achievements routes
  app.get("/api/user/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userAchievements = await storage.getUserAchievements(req.user!.id);
      
      const achievements = userAchievements.map(ua => {
        return {
          id: ua.achievement.id,
          title: ua.achievement.title,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          color: ua.achievement.color,
          xp: ua.achievement.xpReward,
          dateEarned: format(ua.earnedAt, 'PP')
        };
      });
      
      res.json({ achievements });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile route
  app.get("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userProgress = await storage.getUserProgress(req.user!.id);
      const userStreak = await storage.getUserStreak(req.user!.id);
      const userAchievements = await storage.getUserAchievements(req.user!.id);
      const userSkills = await storage.getUserSkills(req.user!.id);
      const userRoadmap = await storage.getUserRoadmap(req.user!.id);
      
      let modules = [];
      let completedModules = 0;
      let totalModules = 0;
      
      if (userRoadmap) {
        modules = await storage.getModulesByRoadmap(userRoadmap.id);
        totalModules = modules.length;
        
        // Count completed modules (simplified logic)
        // In a real app, we'd check if all lessons in the module are completed
        for (const module of modules) {
          const lessons = await storage.getLessonsByModule(module.id);
          let completed = true;
          
          for (const lesson of lessons) {
            const progress = await storage.getLessonProgress(req.user!.id, lesson.id);
            if (!progress || progress.status !== "completed") {
              completed = false;
              break;
            }
          }
          
          if (completed) {
            completedModules++;
          }
        }
      }
      
      const joinedDays = differenceInDays(new Date(), req.user!.createdAt);
      let joinedDate = "Recently";
      
      if (joinedDays > 365) {
        joinedDate = `${Math.floor(joinedDays / 365)} year${Math.floor(joinedDays / 365) !== 1 ? 's' : ''} ago`;
      } else if (joinedDays > 30) {
        joinedDate = `${Math.floor(joinedDays / 30)} month${Math.floor(joinedDays / 30) !== 1 ? 's' : ''} ago`;
      } else if (joinedDays > 0) {
        joinedDate = `${joinedDays} day${joinedDays !== 1 ? 's' : ''} ago`;
      }
      
      const profile = {
        level: userProgress?.level || 1,
        xp: userProgress?.xp || 0,
        xpToNextLevel: userProgress?.xpToNextLevel || 100,
        joinedDate,
        completedModules,
        totalModules,
        achievements: userAchievements.map(ua => ({
          id: ua.achievement.id,
          title: ua.achievement.title,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          dateEarned: format(ua.earnedAt, 'PP')
        })),
        skills: userSkills.map(us => ({
          id: us.skill.id,
          name: us.skill.name,
          level: us.level
        })),
        streak: {
          current: userStreak?.current || 0,
          best: userStreak?.best || 0
        }
      };
      
      res.json({ profile });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Current module routes
  app.get("/api/modules/current", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const currentModule = await storage.getCurrentModule(req.user!.id);
      
      if (!currentModule) {
        return res.status(404).json({ message: "Current module not found" });
      }
      
      const lessons = await storage.getLessonsByModule(currentModule.id);
      const lessonsWithProgress = await Promise.all(lessons.map(async lesson => {
        const progress = await storage.getLessonProgress(req.user!.id, lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || 0,
          status: progress?.status || "locked"
        };
      }));
      
      // Calculate overall module progress
      const completedLessons = lessonsWithProgress.filter(l => l.status === "completed").length;
      const moduleProgress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
      
      // Get roadmap name
      const roadmap = await storage.getRoadmap(currentModule.roadmapId);
      
      const moduleData = {
        id: currentModule.id,
        title: currentModule.title,
        description: currentModule.description,
        weekNumber: currentModule.weekNumber,
        roadmapTitle: roadmap.title,
        progress: moduleProgress,
        lessons: lessonsWithProgress
      };
      
      res.json({ module: moduleData });
    } catch (error) {
      console.error("Error fetching current module:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Roadmap routes
  app.get("/api/roadmap", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userRoadmap = await storage.getUserRoadmap(req.user!.id);
      
      if (!userRoadmap) {
        return res.status(404).json({ message: "User roadmap not found" });
      }
      
      const modules = await storage.getModulesByRoadmap(userRoadmap.id);
      const modulesWithProgress = await Promise.all(modules.map(async module => {
        const lessons = await storage.getLessonsByModule(module.id);
        let completedLessons = 0;
        let inProgressLessons = 0;
        
        for (const lesson of lessons) {
          const progress = await storage.getLessonProgress(req.user!.id, lesson.id);
          if (progress && progress.status === "completed") {
            completedLessons++;
          } else if (progress && progress.status === "in_progress") {
            inProgressLessons++;
          }
        }
        
        let status = "locked";
        if (completedLessons === lessons.length && lessons.length > 0) {
          status = "completed";
        } else if (completedLessons > 0 || inProgressLessons > 0) {
          status = "in_progress";
        }
        
        const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
        
        return {
          id: module.id,
          title: module.title,
          weekNumber: module.weekNumber,
          status,
          progress,
          icon: module.icon || "code",
          totalLessons: lessons.length
        };
      }));
      
      res.json({ modules: modulesWithProgress });
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Full roadmap route
  app.get("/api/roadmap/full", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userRoadmap = await storage.getUserRoadmap(req.user!.id);
      
      if (!userRoadmap) {
        return res.status(404).json({ message: "User roadmap not found" });
      }
      
      const modules = await storage.getModulesByRoadmap(userRoadmap.id);
      const modulesWithLessons = await Promise.all(modules.map(async module => {
        const lessons = await storage.getLessonsByModule(module.id);
        const lessonsWithProgress = await Promise.all(lessons.map(async lesson => {
          const progress = await storage.getLessonProgress(req.user!.id, lesson.id);
          return {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration || 0,
            status: progress?.status || "locked"
          };
        }));
        
        let completedLessons = lessonsWithProgress.filter(l => l.status === "completed").length;
        let status = "locked";
        
        if (completedLessons === lessons.length && lessons.length > 0) {
          status = "completed";
        } else if (lessonsWithProgress.some(l => l.status === "in_progress") || completedLessons > 0) {
          status = "in_progress";
        }
        
        const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
        
        return {
          id: module.id,
          title: module.title,
          description: module.description,
          weekNumber: module.weekNumber,
          status,
          progress,
          icon: module.icon || "code",
          lessons: lessonsWithProgress
        };
      }));
      
      res.json({ modules: modulesWithLessons });
    } catch (error) {
      console.error("Error fetching full roadmap:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all modules with lessons (for resource assignment by curators/admins)
  app.get("/api/modules/with-lessons", isCuratorOrAdmin, async (req, res) => {
    try {
      const roadmaps = await storage.getRoadmaps();
      const allModules = [];
      
      // Get all modules from all roadmaps
      for (const roadmap of roadmaps) {
        const modules = await storage.getModulesByRoadmap(roadmap.id);
        allModules.push(...modules);
      }
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        allModules.map(async (module) => {
          const lessons = await storage.getLessonsByModule(module.id);
          return {
            ...module,
            lessons,
          };
        })
      );
      
      res.json({ modules: modulesWithLessons });
    } catch (error) {
      console.error("Error fetching modules with lessons:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resource management routes (for curators and admins)
  app.get("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const resources = await storage.getResources();
      res.json({ resources });
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/resources/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      res.json({ resource });
    } catch (error) {
      console.error("Error fetching resource:", error);
      if (error.message && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.get("/api/resources/creator/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const creatorId = parseInt(req.params.id);
      const resources = await storage.getResourcesByCreator(creatorId);
      res.json({ resources });
    } catch (error) {
      console.error("Error fetching creator resources:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/resources", isCuratorOrAdmin, async (req, res) => {
    try {
      const resource = req.body;
      resource.creatorId = req.user!.id;
      
      // Validate required fields
      if (!resource.title || !resource.type) {
        return res.status(400).json({ message: "Title and type are required" });
      }
      
      const newResource = await storage.createResource(resource);
      res.status(201).json({ resource: newResource });
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/resources/:id", isCuratorOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      
      // Check if the resource exists
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if the user is the creator of the resource or an admin
      if (resource.creatorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this resource" });
      }
      
      const updatedResource = await storage.updateResource(id, req.body);
      res.json({ resource: updatedResource });
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/resources/:id", isCuratorOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      
      // Check if the resource exists
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if the user is the creator of the resource or an admin
      if (resource.creatorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete this resource" });
      }
      
      await storage.deleteResource(id);
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Lesson resource management
  app.get("/api/lessons/:id/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const lessonId = parseInt(req.params.id);
      const lessonResources = await storage.getLessonResources(lessonId);
      res.json({ resources: lessonResources });
    } catch (error) {
      console.error("Error fetching lesson resources:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/lessons/:id/resources", isCuratorOrAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const { resourceId, isPrimary, order } = req.body;
      
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID is required" });
      }
      
      const lessonResource = await storage.addResourceToLesson({
        lessonId,
        resourceId,
        isPrimary: isPrimary || false,
        order: order || 0
      });
      
      res.status(201).json({ lessonResource });
    } catch (error) {
      console.error("Error adding resource to lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/lessons/:lessonId/resources/:resourceId", isCuratorOrAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const resourceId = parseInt(req.params.resourceId);
      
      await storage.removeResourceFromLesson(lessonId, resourceId);
      res.json({ message: "Resource removed from lesson successfully" });
    } catch (error) {
      console.error("Error removing resource from lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/lessons/resources/:id/order", isCuratorOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { order } = req.body;
      
      if (typeof order !== 'number') {
        return res.status(400).json({ message: "Order must be a number" });
      }
      
      const updatedLessonResource = await storage.updateLessonResourceOrder(id, order);
      res.json({ lessonResource: updatedLessonResource });
    } catch (error) {
      console.error("Error updating lesson resource order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User role management (admin only)
  app.get("/api/users/role/:role", isAdmin, async (req, res) => {
    try {
      const role = req.params.role;
      if (!['learner', 'curator', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const users = await storage.getUsersByRole(role);
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/users/:id/role", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !['learner', 'curator', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Community posts routes
  app.get("/api/community/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const allPosts = await storage.getPosts();
      
      const posts = allPosts.map(post => {
        const timeAgo = formatTimeAgo(post.createdAt);
        
        const postData = {
          id: post.id,
          author: {
            id: post.author.id,
            name: post.author.username,
            initials: getInitials(post.author.username),
            avatar: ""
          },
          content: post.content,
          module: post.moduleReference || "Community",
          timeAgo,
          replyCount: post.replies?.length || 0,
          likes: post.likes || 0
        };
        
        if (post.replies && post.replies.length > 0) {
          postData.replies = post.replies.map(reply => ({
            id: reply.id,
            author: {
              id: reply.author.id,
              name: reply.author.username,
              initials: getInitials(reply.author.username),
              avatar: ""
            },
            content: reply.content,
            timeAgo: formatTimeAgo(reply.createdAt)
          }));
        }
        
        return postData;
      });
      
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community post
  app.post("/api/community/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { content, moduleReference } = req.body;
      
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Post content is required" });
      }
      
      const post = await storage.createPost({
        authorId: req.user!.id,
        content,
        moduleReference,
        likes: 0
      });
      
      // Return the new post with author information
      const author = await storage.getUser(req.user!.id);
      
      const newPost = {
        id: post.id,
        content: post.content,
        author: {
          id: author.id,
          name: author.username,
          initials: getInitials(author.username),
          avatar: ""
        },
        moduleReference: post.moduleReference,
        timeAgo: "just now",
        replyCount: 0,
        likes: 0
      };
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add reply to post
  app.post("/api/community/posts/:postId/replies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Reply content is required" });
      }
      
      // Check if post exists
      try {
        await storage.getPost(postId);
      } catch (error) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const reply = await storage.createReply({
        postId,
        authorId: req.user!.id,
        content
      });
      
      // Return the new reply with author information
      const author = await storage.getUser(req.user!.id);
      
      const newReply = {
        id: reply.id,
        content: reply.content,
        author: {
          id: author.id,
          name: author.username,
          initials: getInitials(author.username),
          avatar: ""
        },
        timeAgo: "just now"
      };
      
      res.status(201).json(newReply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Like a post
  app.post("/api/community/posts/:postId/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const postId = parseInt(req.params.postId);
      
      // Check if post exists
      try {
        await storage.getPost(postId);
      } catch (error) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.likePost(req.user!.id, postId);
      
      res.status(200).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update lesson progress
  app.post("/api/lessons/:lessonId/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const lessonId = parseInt(req.params.lessonId);
      const { status, progress } = req.body;
      
      // Validate required fields
      if (!status || !["locked", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      // Update lesson progress
      const lessonProgress = await storage.updateLessonProgress({
        userId: req.user!.id,
        lessonId,
        status,
        progress: progress || 0,
        startedAt: status === "in_progress" ? new Date() : undefined,
        completedAt: status === "completed" ? new Date() : undefined
      });
      
      // If lesson is completed, update user XP
      if (status === "completed") {
        const userProgress = await storage.getUserProgress(req.user!.id);
        
        if (userProgress) {
          const newXP = userProgress.xp + 10; // 10 XP per lesson completed
          let newLevel = userProgress.level;
          let newXpToNextLevel = userProgress.xpToNextLevel;
          let levelUp = false;
          
          // Level up if XP is enough
          if (newXP >= userProgress.xpToNextLevel) {
            newLevel += 1;
            newXpToNextLevel = userProgress.xpToNextLevel + 100; // Increase XP needed for next level
            levelUp = true;
          }
          
          await storage.updateUserProgress(req.user!.id, {
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
            levelUp
          });
          
          // Update streak if it's a new day
          const streak = await storage.getUserStreak(req.user!.id);
          
          if (streak) {
            const today = new Date();
            const lastActive = streak.lastActive || new Date(0);
            
            // If last activity was not today
            if (lastActive.getDate() !== today.getDate() || 
                lastActive.getMonth() !== today.getMonth() || 
                lastActive.getFullYear() !== today.getFullYear()) {
              
              // Get day of week (0-6, Sunday is 0)
              const dayOfWeek = today.getDay();
              
              // Convert to array if it's not already
              const activeDays = Array.isArray(streak.activeDays) ? streak.activeDays : [];
              
              // Add day if not already present
              if (!activeDays.includes(dayOfWeek)) {
                activeDays.push(dayOfWeek);
              }
              
              // Calculate current streak
              let current = streak.current;
              
              // Check if it's consecutive with last activity
              const lastActiveDay = lastActive.getDay();
              const isConsecutive = 
                (dayOfWeek === (lastActiveDay + 1) % 7) || // Next day
                (dayOfWeek === lastActiveDay); // Same day (already counted)
              
              if (isConsecutive && dayOfWeek !== lastActiveDay) {
                current += 1;
              } else if (!isConsecutive && dayOfWeek !== lastActiveDay) {
                // Break the streak if not consecutive and not the same day
                current = 1;
              }
              
              // Update best streak if current is higher
              const best = Math.max(streak.best, current);
              
              await storage.updateUserStreak({
                userId: req.user!.id,
                current,
                best,
                lastActive: today,
                activeDays
              });
            }
          }
        }
      }
      
      res.status(200).json({ 
        progress: lessonProgress,
        message: "Lesson progress updated successfully"
      });
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}
