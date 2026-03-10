import type { Express } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generatePlan } from "./engine";
import { generateToken, verifyPassword, hashPassword, extractTokenFromHeader, verifyToken } from "./auth";

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

// Auth middleware to extract user from token
async function extractUserFromRequest(req: any): Promise<{ userId: number } | null> {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) return null;
  const payload = verifyToken(token);
  return payload ? { userId: payload.userId } : null;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  await ensureSeedData();

  // Auth Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, age, weight, height, goal, activityLevel, dietPreference, gender, healthIssues } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create user with hashed password
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      
      const hashedPassword = hashPassword(password);
      const newUser = await db.insert(users).values({
        username,
        password: hashedPassword,
        age: age ? parseInt(age) : null,
        weight: weight ? parseInt(weight) : null,
        height: height ? parseInt(height) : null,
        goal: goal || null,
        activityLevel: activityLevel || null,
        dietPreference: dietPreference || null,
        gender: gender || null,
        healthIssues: healthIssues || null,
      }).returning();

      const user = newUser[0];
      const token = generateToken(user.id, user.username);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          age: user.age,
          weight: user.weight,
          height: user.height,
          goal: user.goal,
          activityLevel: user.activityLevel,
          dietPreference: user.dietPreference,
          gender: user.gender,
          healthIssues: user.healthIssues,
        }
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.username);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          age: user.age,
          weight: user.weight,
          height: user.height,
          goal: user.goal,
          activityLevel: user.activityLevel,
          dietPreference: user.dietPreference,
          gender: user.gender,
          healthIssues: user.healthIssues,
        }
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate onboarding analysis and plan
  app.post("/api/auth/generate-onboarding", async (req, res) => {
    try {
      const userContext = await extractUserFromRequest(req);
      if (!userContext) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userContext.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate both analysis and plan
      const analysisPrompt = `You are a professional health and fitness coach. Analyze this user's profile and provide a personalized health assessment:

User Profile:
- Age: ${user.age || "not specified"}
- Gender: ${user.gender || "not specified"}
- Weight: ${user.weight || "not specified"} kg
- Height: ${user.height || "not specified"} cm
- Goal: ${user.goal || "not specified"}
- Activity Level: ${user.activityLevel || "not specified"}
- Diet Preference: ${user.dietPreference || "non_veg"}
- Health Issues: ${user.healthIssues || "none"}

Respond with ONLY a brief 2-3 paragraph assessment covering:
1. Current health status assessment
2. Key opportunities for improvement
3. Personalized recommendations for their specific goal

Be encouraging and positive. Keep it concise (150-200 words).`;

      const planPrompt = `You are an expert AI Diet & Fitness Planner for "Upchaar", an elite fitness operating system.
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
        - IMPORTANT: Diet preference is "${user.dietPreference || "non_veg"}". If "veg", use ONLY vegetarian meals (no meat, no fish, no eggs). If "vegan", use ONLY plant-based meals. If "eggetarian", vegetarian meals + eggs are allowed. If "non_veg", all foods including meat and fish are allowed.`;

      // Run both in parallel
      const [analysis, planContent] = await Promise.all([
        generatePlan(analysisPrompt, user.dietPreference || "non_veg"),
        generatePlan(planPrompt, user.dietPreference || "non_veg"),
      ]);

      const generatedData = JSON.parse(planContent);

      // Extract average targets
      const avgCalories = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.calories, 0) / 7);
      const avgProtein = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.protein, 0) / 7);
      const avgCarbs = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.carbs, 0) / 7);
      const avgFat = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.fats, 0) / 7);

      res.json({
        analysis,
        plan: generatedData,
        summary: {
          targetCalories: avgCalories,
          targetProtein: avgProtein,
          targetCarbs: avgCarbs,
          targetFat: avgFat,
        }
      });
    } catch (error: any) {
      console.error("Onboarding generation error:", error);
      res.status(500).json({ message: error?.message || "Failed to generate onboarding data" });
    }
  });

  app.get(api.users.me.path, async (req, res) => {
    const userContext = await extractUserFromRequest(req);
    if (!userContext) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await storage.getUser(userContext.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const userContext = await extractUserFromRequest(req);
      if (!userContext) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(userContext.userId, input);
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
      const userContext = await extractUserFromRequest(req);
      if (!userContext) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await storage.getUser(userContext.userId);
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
        userId: userContext.userId,
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
    const userContext = await extractUserFromRequest(req);
    if (!userContext) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const plan = await storage.getLatestPlan(userContext.userId);
    if (!plan) {
      return res.status(404).json({ message: 'No plan found' });
    }
    res.json(plan);
  });

  app.get(api.meals.list.path, async (req, res) => {
    const userContext = await extractUserFromRequest(req);
    if (!userContext) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await storage.getUser(userContext.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const meals = await storage.getMeals(user.id);
    res.json(meals);
  });

  app.post(api.meals.create.path, async (req, res) => {
    try {
      const userContext = await extractUserFromRequest(req);
      if (!userContext) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const bodySchema = api.meals.create.input.extend({
        calories: z.coerce.number(),
        protein: z.coerce.number(),
        carbs: z.coerce.number(),
        fat: z.coerce.number(),
      });

      const input = bodySchema.parse(req.body);
      
      const meal = await storage.createMeal({
        ...input,
        userId: userContext.userId,
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
