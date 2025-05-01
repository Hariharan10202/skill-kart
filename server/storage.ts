import { db } from "@db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import {
  User,
  InsertUser,
  UserProgress,
  InsertUserProgress,
  Skill,
  InsertSkill,
  Roadmap,
  InsertRoadmap,
  Module,
  InsertModule,
  Lesson,
  InsertLesson,
  Achievement,
  InsertAchievement,
  UserAchievement,
  InsertUserAchievement,
  UserSkill,
  InsertUserSkill,
  UserStreak,
  InsertUserStreak,
  Post,
  InsertPost,
  Reply,
  InsertReply,
  LessonProgress,
  InsertLessonProgress
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User>;
  
  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Skill methods
  getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]>;
  addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  
  // Roadmap methods
  getRoadmaps(): Promise<Roadmap[]>;
  getRoadmap(id: number): Promise<Roadmap>;
  getUserRoadmap(userId: number): Promise<Roadmap | undefined>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  updateRoadmap(id: number, roadmap: Partial<InsertRoadmap>): Promise<Roadmap>;
  
  // Module methods
  getModulesByRoadmap(roadmapId: number): Promise<Module[]>;
  getCurrentModule(userId: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<InsertModule>): Promise<Module>;
  
  // Lesson methods
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson>;
  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson>;
  
  // Resource methods
  getResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource>;
  getResourcesByCreator(creatorId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: number): Promise<void>;
  
  // Lesson Resource methods
  getLessonResources(lessonId: number): Promise<(LessonResource & { resource: Resource })[]>;
  addResourceToLesson(lessonResource: InsertLessonResource): Promise<LessonResource>;
  removeResourceFromLesson(lessonId: number, resourceId: number): Promise<void>;
  updateLessonResourceOrder(id: number, order: number): Promise<LessonResource>;
  
  // Achievement methods
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  addUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Streak methods
  getUserStreak(userId: number): Promise<UserStreak | undefined>;
  updateUserStreak(streak: Partial<UserStreak>): Promise<UserStreak>;
  
  // Community methods
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post>;
  createPost(post: InsertPost): Promise<Post>;
  getRepliesByPost(postId: number): Promise<Reply[]>;
  createReply(reply: InsertReply): Promise<Reply>;
  likePost(userId: number, postId: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
    
    // Create initial progress record for new user
    await db.insert(schema.userProgress).values({
      userId: newUser.id,
      level: 1,
      xp: 0,
      xpToNextLevel: 100
    });
    
    // Create initial streak record
    await db.insert(schema.userStreaks).values({
      userId: newUser.id,
      current: 0,
      best: 0,
      activeDays: []
    });
    
    return newUser;
  }
  
  // Progress methods
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return await db.query.userProgress.findFirst({
      where: eq(schema.userProgress.userId, userId),
    });
  }
  
  async updateUserProgress(userId: number, progress: Partial<UserProgress>): Promise<UserProgress> {
    const [updatedProgress] = await db.update(schema.userProgress)
      .set(progress)
      .where(eq(schema.userProgress.userId, userId))
      .returning();
      
    return updatedProgress;
  }
  
  // Skill methods
  async getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]> {
    return await db.query.userSkills.findMany({
      where: eq(schema.userSkills.userId, userId),
      with: {
        skill: true
      }
    });
  }
  
  async addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const [newUserSkill] = await db.insert(schema.userSkills)
      .values(userSkill)
      .returning();
      
    return newUserSkill;
  }
  
  // Roadmap methods
  async getRoadmaps(): Promise<Roadmap[]> {
    return await db.query.roadmaps.findMany();
  }
  
  async getRoadmap(id: number): Promise<Roadmap> {
    const roadmap = await db.query.roadmaps.findFirst({
      where: eq(schema.roadmaps.id, id),
    });
    
    if (!roadmap) {
      throw new Error(`Roadmap with id ${id} not found`);
    }
    
    return roadmap;
  }
  
  async getUserRoadmap(userId: number): Promise<Roadmap | undefined> {
    const userRoadmap = await db.query.userRoadmaps.findFirst({
      where: eq(schema.userRoadmaps.userId, userId),
      with: {
        roadmap: true
      }
    });
    
    return userRoadmap?.roadmap;
  }
  
  // Module methods
  async getModulesByRoadmap(roadmapId: number): Promise<Module[]> {
    return await db.query.modules.findMany({
      where: eq(schema.modules.roadmapId, roadmapId),
      orderBy: (modules, { asc }) => [asc(modules.order)]
    });
  }
  
  async getCurrentModule(userId: number): Promise<Module | undefined> {
    const userRoadmap = await db.query.userRoadmaps.findFirst({
      where: eq(schema.userRoadmaps.userId, userId),
    });
    
    if (!userRoadmap || !userRoadmap.currentModuleId) {
      return undefined;
    }
    
    return await db.query.modules.findFirst({
      where: eq(schema.modules.id, userRoadmap.currentModuleId),
    });
  }
  
  // Lesson methods
  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    return await db.query.lessons.findMany({
      where: eq(schema.lessons.moduleId, moduleId),
      orderBy: (lessons, { asc }) => [asc(lessons.order)]
    });
  }
  
  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    return await db.query.lessonProgress.findFirst({
      where: (fields, { and, eq }) => and(
        eq(fields.userId, userId),
        eq(fields.lessonId, lessonId)
      ),
    });
  }
  
  async updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(progress.userId, progress.lessonId);
    
    if (existing) {
      const [updated] = await db.update(schema.lessonProgress)
        .set(progress)
        .where(eq(schema.lessonProgress.id, existing.id))
        .returning();
        
      return updated;
    } else {
      const [newProgress] = await db.insert(schema.lessonProgress)
        .values(progress)
        .returning();
        
      return newProgress;
    }
  }
  
  // Achievement methods
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db.query.userAchievements.findMany({
      where: eq(schema.userAchievements.userId, userId),
      with: {
        achievement: true
      }
    });
  }
  
  async addUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db.insert(schema.userAchievements)
      .values(userAchievement)
      .returning();
      
    // Update user XP
    const achievement = await db.query.achievements.findFirst({
      where: eq(schema.achievements.id, userAchievement.achievementId),
    });
    
    if (achievement) {
      const userProgress = await this.getUserProgress(userAchievement.userId);
      if (userProgress) {
        await this.updateUserProgress(userAchievement.userId, {
          xp: userProgress.xp + achievement.xpReward
        });
      }
    }
    
    return newUserAchievement;
  }
  
  // Streak methods
  async getUserStreak(userId: number): Promise<UserStreak | undefined> {
    return await db.query.userStreaks.findFirst({
      where: eq(schema.userStreaks.userId, userId),
    });
  }
  
  async updateUserStreak(streak: Partial<UserStreak> & { userId: number }): Promise<UserStreak> {
    const [updatedStreak] = await db.update(schema.userStreaks)
      .set(streak)
      .where(eq(schema.userStreaks.userId, streak.userId))
      .returning();
      
    return updatedStreak;
  }
  
  // Community methods
  async getPosts(): Promise<Post[]> {
    return await db.query.posts.findMany({
      with: {
        author: true,
        replies: {
          with: {
            author: true
          }
        }
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    });
  }
  
  async getPost(id: number): Promise<Post> {
    const post = await db.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: {
        author: true,
        replies: {
          with: {
            author: true
          }
        }
      }
    });
    
    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }
    
    return post;
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(schema.posts)
      .values({
        ...post,
        likes: 0,
        createdAt: new Date()
      })
      .returning();
      
    return newPost;
  }
  
  async getRepliesByPost(postId: number): Promise<Reply[]> {
    return await db.query.replies.findMany({
      where: eq(schema.replies.postId, postId),
      with: {
        author: true
      },
      orderBy: (replies, { asc }) => [asc(replies.createdAt)]
    });
  }
  
  async createReply(reply: InsertReply): Promise<Reply> {
    const [newReply] = await db.insert(schema.replies)
      .values({
        ...reply,
        createdAt: new Date()
      })
      .returning();
      
    return newReply;
  }
  
  async likePost(userId: number, postId: number): Promise<void> {
    // Check if user already liked this post
    const existingLike = await db.query.postLikes.findFirst({
      where: (fields, { and, eq }) => and(
        eq(fields.userId, userId),
        eq(fields.postId, postId)
      ),
    });
    
    if (!existingLike) {
      // Add new like
      await db.insert(schema.postLikes)
        .values({ userId, postId });
        
      // Increment post likes count
      await db.update(schema.posts)
        .set({ likes: (posts) => `${posts.likes} + 1` })
        .where(eq(schema.posts.id, postId));
    }
  }
}

export const storage = new DatabaseStorage();
