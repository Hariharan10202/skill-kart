import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("learner").notNull(), // 'learner', 'curator', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  userProgress: one(userProgress),
  userStreaks: one(userStreaks),
  userRoadmaps: many(userRoadmaps),
  userSkills: many(userSkills),
  userAchievements: many(userAchievements),
  posts: many(posts),
  replies: many(replies),
  lessonProgress: many(lessonProgress),
  postLikes: many(postLikes),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must provide a valid email").optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Progress Table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  xpToNextLevel: integer("xp_to_next_level").notNull().default(100),
  levelUp: boolean("level_up").default(false),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const insertUserProgressSchema = createInsertSchema(userProgress);
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// User Streaks Table
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  current: integer("current").notNull().default(0),
  best: integer("best").notNull().default(0),
  lastActive: timestamp("last_active"),
  activeDays: json("active_days").default([]).notNull(),
});

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(users, {
    fields: [userStreaks.userId],
    references: [users.id],
  }),
}));

export const insertUserStreakSchema = createInsertSchema(userStreaks);
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;

// Skills Table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
});

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const insertSkillSchema = createInsertSchema(skills);
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// User Skills Table
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  level: integer("level").notNull().default(1),
  proficiency: integer("proficiency").notNull().default(0), // 0-100
});

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const insertUserSkillSchema = createInsertSchema(userSkills);
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;

// Roadmaps Table
export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"), // in weeks
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  tags: json("tags").default([]),
});

export const roadmapsRelations = relations(roadmaps, ({ many }) => ({
  modules: many(modules),
  userRoadmaps: many(userRoadmaps),
}));

export const insertRoadmapSchema = createInsertSchema(roadmaps);
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;

// User Roadmaps Table
export const userRoadmaps = pgTable("user_roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  currentModuleId: integer("current_module_id"),
  progress: integer("progress").default(0), // 0-100
});

export const userRoadmapsRelations = relations(userRoadmaps, ({ one }) => ({
  user: one(users, {
    fields: [userRoadmaps.userId],
    references: [users.id],
  }),
  roadmap: one(roadmaps, {
    fields: [userRoadmaps.roadmapId],
    references: [roadmaps.id],
  }),
}));

export const insertUserRoadmapSchema = createInsertSchema(userRoadmaps);
export type InsertUserRoadmap = z.infer<typeof insertUserRoadmapSchema>;
export type UserRoadmap = typeof userRoadmaps.$inferSelect;

// Modules Table
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  weekNumber: integer("week_number").notNull(),
  order: integer("order").notNull(),
  icon: text("icon"),
});

export const modulesRelations = relations(modules, ({ one, many }) => ({
  roadmap: one(roadmaps, {
    fields: [modules.roadmapId],
    references: [roadmaps.id],
  }),
  lessons: many(lessons),
}));

export const insertModuleSchema = createInsertSchema(modules);
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Lessons Table
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  duration: integer("duration"), // in minutes
  order: integer("order").notNull(),
  type: text("type"), // video, article, quiz, etc.
  resourceUrl: text("resource_url"),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  lessonProgress: many(lessonProgress),
}));

export const insertLessonSchema = createInsertSchema(lessons);
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Lesson Progress Table
export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  status: text("status").notNull().default("locked"), // locked, in_progress, completed
  progress: integer("progress").default(0), // 0-100
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const insertLessonProgressSchema = createInsertSchema(lessonProgress);
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

// Achievements Table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  color: text("color"),
  criteria: text("criteria"), // e.g., "complete_module", "streak_7_days"
});

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const insertAchievementSchema = createInsertSchema(achievements);
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// User Achievements Table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Community Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  moduleReference: text("module_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  replies: many(replies),
  likes: many(postLikes),
}));

export const insertPostSchema = createInsertSchema(posts);
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Post Replies Table
export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repliesRelations = relations(replies, ({ one }) => ({
  post: one(posts, {
    fields: [replies.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
}));

export const insertReplySchema = createInsertSchema(replies);
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Reply = typeof replies.$inferSelect;

// Post Likes Table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const insertPostLikeSchema = createInsertSchema(postLikes);
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

// Learning Resources Table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // video, article, quiz, file, etc.
  contentType: text("content_type"), // MIME type for files
  content: text("content"), // HTML content for articles, quiz JSON, etc.
  url: text("url"), // External URL for videos, articles
  fileName: text("file_name"), // For uploaded files
  filePath: text("file_path"), // For uploaded files
  fileSize: integer("file_size"), // In bytes
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  tags: json("tags").default([]),
});

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  creator: one(users, {
    fields: [resources.creatorId],
    references: [users.id],
  }),
  lessonResources: many(lessonResources),
}));

export const insertResourceSchema = createInsertSchema(resources);
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Lesson Resources Linking Table (Many-to-Many)
export const lessonResources = pgTable("lesson_resources", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  resourceId: integer("resource_id").references(() => resources.id).notNull(),
  isPrimary: boolean("is_primary").default(false), // Is this the main resource for the lesson
  order: integer("order").default(0), // Display order in the lesson
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonResourcesRelations = relations(lessonResources, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonResources.lessonId],
    references: [lessons.id],
  }),
  resource: one(resources, {
    fields: [lessonResources.resourceId],
    references: [resources.id],
  }),
}));

export const insertLessonResourceSchema = createInsertSchema(lessonResources);
export type InsertLessonResource = z.infer<typeof insertLessonResourceSchema>;
export type LessonResource = typeof lessonResources.$inferSelect;
