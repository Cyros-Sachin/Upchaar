import { db } from "./db";
import {
  users, plans, meals,
  type User, type InsertUser, type UpdateUserRequest,
  type Plan, type InsertPlan,
  type Meal, type InsertMeal
} from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, updates: UpdateUserRequest): Promise<User>;
  
  // Plan operations
  createPlan(plan: InsertPlan): Promise<Plan>;
  getLatestPlan(userId: number): Promise<Plan | undefined>;
  
  // Meal operations
  getMeals(userId: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  deleteMeal(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, updates: UpdateUserRequest): Promise<User> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  async getLatestPlan(userId: number): Promise<Plan | undefined> {
    const [latest] = await db.select()
      .from(plans)
      .where(eq(plans.userId, userId))
      .orderBy(desc(plans.createdAt))
      .limit(1);
    return latest;
  }

  async getMeals(userId: number): Promise<Meal[]> {
    return await db.select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.consumedAt));
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }
}

export const storage = new DatabaseStorage();
