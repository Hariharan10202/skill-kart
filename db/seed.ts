import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting seeding process...");

    // Check if there are already users in the database
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });

    if (existingUsers.length > 0) {
      console.log("Database already has users. Skipping seeding process.");
      return;
    }

    console.log("Seeding skills...");
    // Create skills
    const skillsData = [
      { name: "HTML", description: "HyperText Markup Language", icon: "html" },
      { name: "CSS", description: "Cascading Style Sheets", icon: "css" },
      { name: "JavaScript", description: "Programming language for the web", icon: "javascript" },
      { name: "React", description: "JavaScript library for building user interfaces", icon: "react" },
      { name: "Node.js", description: "JavaScript runtime environment", icon: "nodejs" },
      { name: "SQL", description: "Structured Query Language", icon: "database" },
      { name: "Git", description: "Version control system", icon: "git" }
    ];

    const skills = await db.insert(schema.skills)
      .values(skillsData)
      .returning();

    console.log(`Created ${skills.length} skills`);

    console.log("Seeding achievements...");
    // Create achievements
    const achievementsData = [
      { 
        title: "First Week Complete", 
        description: "Completed your first week of learning", 
        icon: "award", 
        xpReward: 50, 
        color: "blue", 
        criteria: "complete_week"
      },
      { 
        title: "Speed Demon", 
        description: "Completed 3 lessons in one day", 
        icon: "timer", 
        xpReward: 25, 
        color: "purple", 
        criteria: "three_lessons_day"
      },
      { 
        title: "Perfect Streak", 
        description: "Maintained a 7-day learning streak", 
        icon: "flame", 
        xpReward: 100, 
        color: "orange", 
        criteria: "streak_7_days"
      },
      { 
        title: "Module Master", 
        description: "Completed an entire module", 
        icon: "star", 
        xpReward: 75, 
        color: "yellow", 
        criteria: "complete_module"
      },
      { 
        title: "Helpful Peer", 
        description: "Posted 5 replies in the community", 
        icon: "message-circle", 
        xpReward: 50, 
        color: "green", 
        criteria: "five_replies"
      }
    ];

    const achievements = await db.insert(schema.achievements)
      .values(achievementsData)
      .returning();

    console.log(`Created ${achievements.length} achievements`);

    console.log("Seeding roadmaps...");
    // Create roadmaps
    const roadmapsData = [
      { 
        title: "Web Development", 
        description: "Learn modern web development from scratch", 
        duration: 12, 
        difficulty: "beginner", 
        tags: ["HTML", "CSS", "JavaScript", "React"]
      },
      { 
        title: "Data Science", 
        description: "Master data analysis and machine learning", 
        duration: 16, 
        difficulty: "intermediate", 
        tags: ["Python", "SQL", "Statistics", "ML"]
      },
      { 
        title: "Mobile App Development", 
        description: "Build cross-platform mobile applications", 
        duration: 10, 
        difficulty: "intermediate", 
        tags: ["React Native", "JavaScript", "Mobile"]
      }
    ];

    const roadmaps = await db.insert(schema.roadmaps)
      .values(roadmapsData)
      .returning();

    console.log(`Created ${roadmaps.length} roadmaps`);

    console.log("Seeding modules for Web Development roadmap...");
    // Create modules for Web Development roadmap
    const webDevModulesData = [
      { 
        roadmapId: roadmaps[0].id, 
        title: "HTML & CSS Basics", 
        description: "Learn the fundamentals of creating web pages", 
        weekNumber: 1, 
        order: 1, 
        icon: "html"
      },
      { 
        roadmapId: roadmaps[0].id, 
        title: "JavaScript Fundamentals", 
        description: "Learn core JavaScript concepts and syntax", 
        weekNumber: 2, 
        order: 2, 
        icon: "javascript"
      },
      { 
        roadmapId: roadmaps[0].id, 
        title: "React Basics", 
        description: "Build interactive UIs with React", 
        weekNumber: 3, 
        order: 3, 
        icon: "react"
      },
      { 
        roadmapId: roadmaps[0].id, 
        title: "Backend Development", 
        description: "Create server-side applications with Node.js", 
        weekNumber: 4, 
        order: 4, 
        icon: "server"
      }
    ];

    const webDevModules = await db.insert(schema.modules)
      .values(webDevModulesData)
      .returning();

    console.log(`Created ${webDevModules.length} modules for Web Development`);

    console.log("Seeding lessons for HTML & CSS module...");
    // Create lessons for HTML & CSS module
    const htmlCssLessonsData = [
      { 
        moduleId: webDevModules[0].id, 
        title: "HTML Structure", 
        description: "Learn about HTML elements and document structure", 
        content: "Introduction to HTML structure and basic elements", 
        duration: 20, 
        order: 1, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/html-structure"
      },
      { 
        moduleId: webDevModules[0].id, 
        title: "CSS Selectors", 
        description: "Master CSS selectors and styling", 
        content: "Understanding CSS selectors and how to apply styles", 
        duration: 25, 
        order: 2, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/css-selectors"
      },
      { 
        moduleId: webDevModules[0].id, 
        title: "Flexbox Layout", 
        description: "Learn modern layout techniques with Flexbox", 
        content: "Using Flexbox for responsive layouts", 
        duration: 30, 
        order: 3, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/flexbox"
      },
      { 
        moduleId: webDevModules[0].id, 
        title: "Responsive Design", 
        description: "Make your websites work on all devices", 
        content: "Implementing responsive design with media queries", 
        duration: 35, 
        order: 4, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/responsive-design"
      },
      { 
        moduleId: webDevModules[0].id, 
        title: "HTML & CSS Project", 
        description: "Apply what you've learned in a project", 
        content: "Build a responsive landing page from scratch", 
        duration: 60, 
        order: 5, 
        type: "project", 
        resourceUrl: "https://example.com/lessons/html-css-project"
      }
    ];

    const htmlCssLessons = await db.insert(schema.lessons)
      .values(htmlCssLessonsData)
      .returning();

    console.log(`Created ${htmlCssLessons.length} lessons for HTML & CSS module`);

    console.log("Seeding lessons for JavaScript module...");
    // Create lessons for JavaScript module
    const jsLessonsData = [
      { 
        moduleId: webDevModules[1].id, 
        title: "Variables and Data Types", 
        description: "Learn about JavaScript variables and data types", 
        content: "Introduction to variables, primitive types, and objects", 
        duration: 20, 
        order: 1, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-variables"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "Functions and Scope", 
        description: "Master JavaScript functions and scope", 
        content: "Understanding functions, parameters, and variable scope", 
        duration: 25, 
        order: 2, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-functions"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "Arrays and Objects", 
        description: "Learn to work with complex data structures", 
        content: "Working with arrays, objects, and common methods", 
        duration: 30, 
        order: 3, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-arrays-objects"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "DOM Manipulation", 
        description: "Interact with HTML using JavaScript", 
        content: "Selecting elements and modifying the DOM", 
        duration: 35, 
        order: 4, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-dom"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "Events and Listeners", 
        description: "Handle user interactions with events", 
        content: "Adding event listeners and handling user input", 
        duration: 30, 
        order: 5, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-events"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "Async JavaScript", 
        description: "Learn about asynchronous programming", 
        content: "Understanding promises, async/await, and fetch API", 
        duration: 40, 
        order: 6, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/js-async"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "JavaScript Project", 
        description: "Apply JavaScript concepts in a project", 
        content: "Build an interactive web application", 
        duration: 60, 
        order: 7, 
        type: "project", 
        resourceUrl: "https://example.com/lessons/js-project"
      },
      { 
        moduleId: webDevModules[1].id, 
        title: "JavaScript Quiz", 
        description: "Test your JavaScript knowledge", 
        content: "Comprehensive quiz on JavaScript fundamentals", 
        duration: 20, 
        order: 8, 
        type: "quiz", 
        resourceUrl: "https://example.com/lessons/js-quiz"
      }
    ];

    const jsLessons = await db.insert(schema.lessons)
      .values(jsLessonsData)
      .returning();

    console.log(`Created ${jsLessons.length} lessons for JavaScript module`);

    console.log("Seeding lessons for React module...");
    // Create lessons for React module
    const reactLessonsData = [
      { 
        moduleId: webDevModules[2].id, 
        title: "React Introduction", 
        description: "Introduction to React and its concepts", 
        content: "Understanding React's component-based architecture", 
        duration: 25, 
        order: 1, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-intro"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "Components and Props", 
        description: "Learn about React components and props", 
        content: "Creating components and passing data with props", 
        duration: 30, 
        order: 2, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-components"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "State and Lifecycle", 
        description: "Master React state and component lifecycle", 
        content: "Managing state and understanding component lifecycle", 
        duration: 35, 
        order: 3, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-state"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "Handling Events", 
        description: "Handle user interactions in React", 
        content: "Adding event handlers to React components", 
        duration: 25, 
        order: 4, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-events"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "React Hooks", 
        description: "Learn modern React with Hooks", 
        content: "Using useState, useEffect, and custom hooks", 
        duration: 45, 
        order: 5, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-hooks"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "React Router", 
        description: "Add navigation to your React apps", 
        content: "Implementing client-side routing with React Router", 
        duration: 35, 
        order: 6, 
        type: "video", 
        resourceUrl: "https://example.com/lessons/react-router"
      },
      { 
        moduleId: webDevModules[2].id, 
        title: "React Project", 
        description: "Build a complete React application", 
        content: "Create a multi-page React app with state management", 
        duration: 90, 
        order: 7, 
        type: "project", 
        resourceUrl: "https://example.com/lessons/react-project"
      }
    ];

    const reactLessons = await db.insert(schema.lessons)
      .values(reactLessonsData)
      .returning();

    console.log(`Created ${reactLessons.length} lessons for React module`);

    console.log("Creating demo users...");
    // Create demo users
    const usersData = [
      { 
        username: "johndoe", 
        password: await hashPassword("password123"), 
        email: "john@example.com",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      { 
        username: "sarahgomez", 
        password: await hashPassword("password123"), 
        email: "sarah@example.com",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      { 
        username: "miketan", 
        password: await hashPassword("password123"), 
        email: "mike@example.com",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];

    const users = await db.insert(schema.users)
      .values(usersData)
      .returning();

    console.log(`Created ${users.length} users`);

    console.log("Setting up user progress...");
    // Set up progress for John Doe
    await db.insert(schema.userProgress)
      .values({
        userId: users[0].id,
        level: 5,
        xp: 650,
        xpToNextLevel: 1000,
        levelUp: false
      });

    await db.insert(schema.userStreaks)
      .values({
        userId: users[0].id,
        current: 8,
        best: 10,
        lastActive: new Date(),
        activeDays: [0, 1, 2, 3, 4, 5, 6] // All days of the week
      });

    // Assign Web Development roadmap to John
    await db.insert(schema.userRoadmaps)
      .values({
        userId: users[0].id,
        roadmapId: roadmaps[0].id,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        currentModuleId: webDevModules[1].id, // JavaScript module
        progress: 30
      });

    // Mark HTML & CSS module as completed for John
    for (const lesson of htmlCssLessons) {
      await db.insert(schema.lessonProgress)
        .values({
          userId: users[0].id,
          lessonId: lesson.id,
          status: "completed",
          progress: 100,
          startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
        });
    }

    // Mark first two JavaScript lessons as completed and third as in progress
    await db.insert(schema.lessonProgress)
      .values({
        userId: users[0].id,
        lessonId: jsLessons[0].id,
        status: "completed",
        progress: 100,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      });

    await db.insert(schema.lessonProgress)
      .values({
        userId: users[0].id,
        lessonId: jsLessons[1].id,
        status: "in_progress",
        progress: 50,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      });

    // Add Module Master achievement to John
    await db.insert(schema.userAchievements)
      .values({
        userId: users[0].id,
        achievementId: achievements[3].id, // Module Master
        earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      });

    // Add Perfect Streak achievement to John
    await db.insert(schema.userAchievements)
      .values({
        userId: users[0].id,
        achievementId: achievements[2].id, // Perfect Streak
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      });

    // Add skills for John
    await db.insert(schema.userSkills)
      .values([
        {
          userId: users[0].id,
          skillId: skills[0].id, // HTML
          level: 3,
          proficiency: 80
        },
        {
          userId: users[0].id,
          skillId: skills[1].id, // CSS
          level: 3,
          proficiency: 75
        },
        {
          userId: users[0].id,
          skillId: skills[2].id, // JavaScript
          level: 2,
          proficiency: 40
        }
      ]);

    console.log("Creating community posts...");
    // Create some community posts
    const postsData = [
      {
        authorId: users[1].id, // Sarah
        content: "Anyone else struggling with the scope examples in the Functions lesson? I'm not sure I understand closures correctly.",
        moduleReference: "JavaScript Fundamentals",
        likes: 3,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        authorId: users[2].id, // Mike
        content: "Just completed the HTML & CSS section. The final exercise was challenging but super rewarding! Anyone else finish it?",
        moduleReference: "HTML & CSS Basics",
        likes: 5,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    ];

    const posts = await db.insert(schema.posts)
      .values(postsData)
      .returning();

    // Add replies to the posts
    await db.insert(schema.replies)
      .values([
        {
          postId: posts[0].id,
          authorId: users[0].id, // John
          content: "I found thinking of closures as functions that remember their surrounding variables helps. The MDN docs have a good explanation.",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          postId: posts[0].id,
          authorId: users[2].id, // Mike
          content: "Try writing your own examples to understand them better. It really clicked for me when I made a counter function using closures.",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        },
        {
          postId: posts[1].id,
          authorId: users[0].id, // John
          content: "Congratulations! I found the flexbox part challenging at first, but once it clicked it was incredibly powerful.",
          createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000) // 7 hours ago
        }
      ]);

    // Add likes to posts
    await db.insert(schema.postLikes)
      .values([
        {
          postId: posts[0].id,
          userId: users[0].id
        },
        {
          postId: posts[0].id,
          userId: users[2].id
        },
        {
          postId: posts[1].id,
          userId: users[0].id
        },
        {
          postId: posts[1].id,
          userId: users[1].id
        }
      ]);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
