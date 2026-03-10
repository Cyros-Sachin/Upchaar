import type { Express } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generatePlan } from "./engine";

// Engine initialized in engine.ts

// Helper for seeding the mock user and initial data if not exists
async function ensureSeedData() {
  const user = await storage.getUser(1);
  if (!user) {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    await db.insert(users).values({
      id: 1,
      username: "Sachin",
      password: "password123", // dummy
      age: 28,
      weight: 75,
      height: 175,
      goal: "maintain",
      activityLevel: "moderate",
      gender: "male",
      healthIssues: null
    });

    await storage.createPlan({
      userId: 1,
      dietPlan: "Sample Diet Plan: Focus on lean proteins, whole grains, and healthy fats. Ensure you are well hydrated.",
      workoutPlan: "Sample Workout Plan: 3 days of strength training, 2 days of cardio.",
      targetCalories: 2400,
      targetProtein: 160,
      targetCarbs: 250,
      targetFat: 80
    });

    await storage.createMeal({
      userId: 1,
      name: "Morning Oatmeal",
      calories: 350,
      protein: 15,
      carbs: 60,
      fat: 8
    });
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  await ensureSeedData();

  app.get(api.users.me.path, async (req, res) => {
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(1, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.plans.generate.path, async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const prompt = `
        You are an expert AI Diet & Fitness Planner for "Upchaar", an elite fitness operating system.
        Create a personalized weekly plan for a user with these metrics:
        Age: ${user.age}, Gender: ${user.gender || "not specified"}, Weight: ${user.weight}kg, Height: ${user.height}cm, Goal: ${user.goal}, Activity: ${user.activityLevel}, Diet Preference: ${user.dietPreference || "non_veg"}${user.healthIssues ? `, Health Considerations: ${user.healthIssues}` : ""}

        Respond ONLY with a JSON object in this exact structure, no markdown, no text outside JSON:
        {
          "week": [
            {
              "day": "Monday",
              "intensity": "High",
              "workout": [
                { "name": "Bench Press", "sets": "4x8", "rest": "90s" },
                { "name": "Incline DB Press", "sets": "3x10", "rest": "60s" }
              ],
              "diet": {
                "calories": 2100,
                "protein": 150,
                "carbs": 220,
                "fats": 65
              },
              "meals": [
                { "time": "Breakfast", "name": "Oatmeal with Banana & Whey Protein", "calories": 450 },
                { "time": "Lunch", "name": "Grilled Chicken with Brown Rice & Broccoli", "calories": 650 },
                { "time": "Snack", "name": "Greek Yogurt with Almonds", "calories": 250 },
                { "time": "Dinner", "name": "Salmon with Sweet Potato & Spinach", "calories": 550 },
                { "time": "Post-Workout", "name": "Protein Shake with Peanut Butter", "calories": 200 }
              ],
              "challenges": ["10k Steps", "3L Water", "No Junk Food"]
            }
          ]
        }

        Rules:
        - Include all 7 days of the week starting from Monday.
        - Vary intensity: High, Moderate, Recovery.
        - Match macros to intensity (higher carbs on High days).
        - Keep workout names concise.
        - Include 4-5 meals per day with realistic food names and calorie estimates.
        - Vary meals across days. Use healthy, practical foods.
        - IMPORTANT: Diet preference is "${user.dietPreference || "non_veg"}". If "veg", use ONLY vegetarian meals (no meat, no fish, no eggs). If "vegan", use ONLY plant-based meals. If "eggetarian", vegetarian meals + eggs are allowed. If "non_veg", all foods including meat and fish are allowed.
      `;

      const content = await generatePlan(prompt, user.dietPreference || "non_veg");

      
      if (!content) {
        throw new Error("No response from AI");
      }

      const generatedData = JSON.parse(content);

      // Extract average targets for the summary columns
      const avgCalories = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.calories, 0) / 7);
      const avgProtein = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.protein, 0) / 7);
      const avgCarbs = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.carbs, 0) / 7);
      const avgFat = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.fats, 0) / 7);

      const plan = await storage.createPlan({
        userId: 1,
        dietPlan: JSON.stringify(generatedData.week), // Store JSON in the text field
        workoutPlan: JSON.stringify(generatedData.week), // Re-using JSON structure for both
        targetCalories: avgCalories,
        targetProtein: avgProtein,
        targetCarbs: avgCarbs,
        targetFat: avgFat,
      });

      res.status(201).json(plan);

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      const msg = error?.message || "Failed to generate plan";
      res.status(500).json({ message: msg });
    }
  });

  app.get(api.plans.latest.path, async (req, res) => {
    const plan = await storage.getLatestPlan(1);
    if (!plan) {
      return res.status(404).json({ message: 'No plan found' });
    }
    res.json(plan);
  });

  app.get(api.meals.list.path, async (req, res) => {
    const user = await storage.getUser(1);
    if (!user) return res.status(404).json({ message: "User not found" });
    const meals = await storage.getMeals(user.id);
    res.json(meals);
  });

  app.post(api.meals.create.path, async (req, res) => {
    try {
      const bodySchema = api.meals.create.input.extend({
        calories: z.coerce.number(),
        protein: z.coerce.number(),
        carbs: z.coerce.number(),
        fat: z.coerce.number(),
      });

      const input = bodySchema.parse(req.body);
      
      const meal = await storage.createMeal({
        ...input,
        userId: 1,
      });

      res.status(201).json(meal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.meals.delete.path, async (req, res) => {
    await storage.deleteMeal(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
