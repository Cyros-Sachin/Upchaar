import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Health Data
  age: integer("age"),
  weight: integer("weight"), // in kg
  height: integer("height"), // in cm
  goal: text("goal"), // "lose_weight", "build_muscle", "maintain"
  activityLevel: text("activity_level"), // "sedentary", "light", "moderate", "active"
  dietPreference: text("diet_preference"), // "veg", "non_veg", "vegan", "eggetarian"
  gender: text("gender"), // "male", "female", "other"
  healthIssues: text("health_issues"), // comma-separated or JSON list of health concerns
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dietPlan: text("diet_plan").notNull(),
  workoutPlan: text("workout_plan").notNull(),
  targetCalories: integer("target_calories").notNull(),
  targetProtein: integer("target_protein").notNull(),
  targetCarbs: integer("target_carbs").notNull(),
  targetFat: integer("target_fat").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  consumedAt: timestamp("consumed_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, consumedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type UpdateUserRequest = Partial<InsertUser>;
