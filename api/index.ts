import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import pg from "pg";
import { z } from "zod";
import OpenAI from "openai";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age"),
  weight: integer("weight"),
  height: integer("height"),
  goal: text("goal"),
  activityLevel: text("activity_level"),
  dietPreference: text("diet_preference"),
});

const plans = pgTable("plans", {
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

const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  consumedAt: timestamp("consumed_at").defaultNow(),
});

const insertUserSchema = createInsertSchema(users).omit({ id: true });
const insertMealSchema = createInsertSchema(meals).omit({ id: true, consumedAt: true });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool, { schema: { users, plans, meals } });

let groqClient: OpenAI | null = null;
let geminiApiKey = "";
let aiProvider: "groq" | "gemini" | "none" = "none";

if (process.env.GROQ_API_KEY) {
  groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  aiProvider = "groq";
} else if (process.env.GEMINI_API_KEY) {
  geminiApiKey = process.env.GEMINI_API_KEY;
  aiProvider = "gemini";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EXERCISES: Record<string, string[]> = {
  chest: ["Bench Press", "Incline DB Press", "Cable Flyes", "Push-ups", "Dumbbell Pullover", "Chest Dips"],
  back: ["Deadlift", "Barbell Row", "Pull Ups", "Lat Pulldown", "Cable Row", "T-Bar Row"],
  legs: ["Squats", "Leg Press", "Romanian Deadlift", "Lunges", "Leg Curl", "Calf Raises"],
  shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls", "Arnold Press", "Rear Delt Flyes"],
  arms: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Skull Crushers", "Cable Curls"],
  recovery: ["Yoga Flow", "Stretching", "Light Walk", "Foam Rolling", "Mobility Drills"],
};

const CHALLENGES = [
  "10k Steps", "12k Steps", "3L Water", "No Junk Food", "No Sugar",
  "Cook Own Meal", "High Protein Day", "Meditate 10min", "Sleep 8hrs",
  "Meal Prep", "Take Stairs", "Morning Walk", "Track All Meals",
];

const SETS_OPTIONS = ["3x8", "3x10", "3x12", "4x8", "4x10", "4x12"];
const REST_OPTIONS = ["45s", "60s", "90s", "120s"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_OPTIONS: Record<string, Record<string, { name: string; cal: number; p: number; c: number; f: number }[]>> = {
  breakfast: {
    veg: [
      { name: "Oatmeal with Banana & Nuts", cal: 400, p: 12, c: 65, f: 14 },
      { name: "Paneer Paratha with Curd", cal: 450, p: 18, c: 50, f: 20 },
      { name: "Idli Sambar with Chutney", cal: 350, p: 10, c: 60, f: 8 },
    ],
    non_veg: [
      { name: "Egg Omelette with Toast", cal: 420, p: 25, c: 35, f: 20 },
      { name: "Chicken Sandwich", cal: 450, p: 30, c: 40, f: 15 },
      { name: "Oatmeal with Whey Protein", cal: 400, p: 30, c: 55, f: 10 },
    ],
    vegan: [
      { name: "Smoothie Bowl with Seeds", cal: 380, p: 12, c: 60, f: 12 },
      { name: "Poha with Peanuts", cal: 350, p: 10, c: 55, f: 12 },
      { name: "Tofu Scramble with Toast", cal: 400, p: 20, c: 40, f: 18 },
    ],
    eggetarian: [
      { name: "Boiled Eggs with Toast", cal: 380, p: 22, c: 35, f: 18 },
      { name: "Egg Bhurji with Roti", cal: 420, p: 20, c: 45, f: 18 },
      { name: "Omelette with Veggies", cal: 350, p: 22, c: 20, f: 22 },
    ],
  },
  lunch: {
    veg: [
      { name: "Dal Rice with Sabzi", cal: 550, p: 18, c: 80, f: 15 },
      { name: "Chole with Rice", cal: 600, p: 20, c: 85, f: 18 },
      { name: "Rajma Chawal", cal: 580, p: 22, c: 82, f: 14 },
    ],
    non_veg: [
      { name: "Grilled Chicken with Rice", cal: 600, p: 40, c: 65, f: 18 },
      { name: "Fish Curry with Roti", cal: 550, p: 35, c: 55, f: 20 },
      { name: "Chicken Biryani", cal: 650, p: 35, c: 75, f: 22 },
    ],
    vegan: [
      { name: "Tofu Stir Fry with Rice", cal: 520, p: 22, c: 70, f: 18 },
      { name: "Lentil Soup with Bread", cal: 480, p: 20, c: 65, f: 14 },
      { name: "Chickpea Salad Bowl", cal: 500, p: 18, c: 60, f: 20 },
    ],
    eggetarian: [
      { name: "Egg Curry with Rice", cal: 560, p: 25, c: 70, f: 18 },
      { name: "Dal Rice with Egg Fry", cal: 580, p: 28, c: 72, f: 16 },
      { name: "Veggie Wrap with Egg", cal: 500, p: 22, c: 55, f: 20 },
    ],
  },
  snack: {
    veg: [
      { name: "Greek Yogurt with Fruits", cal: 200, p: 12, c: 28, f: 6 },
      { name: "Trail Mix", cal: 250, p: 8, c: 20, f: 16 },
    ],
    non_veg: [
      { name: "Protein Shake", cal: 220, p: 30, c: 15, f: 5 },
      { name: "Chicken Wrap", cal: 300, p: 25, c: 25, f: 12 },
    ],
    vegan: [
      { name: "Hummus with Veggies", cal: 200, p: 8, c: 22, f: 10 },
      { name: "Fruit & Nut Bar", cal: 230, p: 6, c: 30, f: 12 },
    ],
    eggetarian: [
      { name: "Boiled Egg Snack", cal: 180, p: 14, c: 5, f: 12 },
      { name: "Yogurt Parfait", cal: 220, p: 12, c: 30, f: 8 },
    ],
  },
  dinner: {
    veg: [
      { name: "Paneer Tikka with Roti", cal: 500, p: 22, c: 45, f: 25 },
      { name: "Mixed Veg Curry with Rice", cal: 480, p: 15, c: 70, f: 16 },
    ],
    non_veg: [
      { name: "Grilled Salmon with Veggies", cal: 520, p: 40, c: 25, f: 28 },
      { name: "Chicken Tikka with Salad", cal: 480, p: 38, c: 20, f: 25 },
    ],
    vegan: [
      { name: "Tofu Curry with Quinoa", cal: 480, p: 22, c: 55, f: 20 },
      { name: "Vegetable Stew with Rice", cal: 450, p: 14, c: 65, f: 16 },
    ],
    eggetarian: [
      { name: "Egg Fried Rice", cal: 500, p: 22, c: 65, f: 18 },
      { name: "Omelette with Salad & Bread", cal: 420, p: 24, c: 35, f: 22 },
    ],
  },
};

function generateRandomPlan(dietPref: string = "non_veg"): string {
  const pref = ["veg", "non_veg", "vegan", "eggetarian"].includes(dietPref) ? dietPref : "non_veg";
  const muscleGroups = ["chest", "back", "legs", "shoulders", "arms"];
  const week = DAYS.map((day, i) => {
    const isRecovery = i === 2 || i === 5;
    const intensity = isRecovery ? "Recovery" : i % 2 === 0 ? "High" : "Moderate";
    const group = isRecovery ? "recovery" : muscleGroups[i % muscleGroups.length];
    const exercises = EXERCISES[group] || EXERCISES.recovery;
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    const workout = shuffled.slice(0, isRecovery ? rand(2, 3) : rand(4, 5)).map((name) => ({
      name,
      sets: pick(SETS_OPTIONS),
      rest: pick(REST_OPTIONS),
    }));
    const b = pick(MEAL_OPTIONS.breakfast[pref] || MEAL_OPTIONS.breakfast.non_veg);
    const l = pick(MEAL_OPTIONS.lunch[pref] || MEAL_OPTIONS.lunch.non_veg);
    const s = pick(MEAL_OPTIONS.snack[pref] || MEAL_OPTIONS.snack.non_veg);
    const d = pick(MEAL_OPTIONS.dinner[pref] || MEAL_OPTIONS.dinner.non_veg);
    const mealsList = [
      { time: "Breakfast", name: b.name, calories: b.cal },
      { time: "Lunch", name: l.name, calories: l.cal },
      { time: "Snack", name: s.name, calories: s.cal },
      { time: "Dinner", name: d.name, calories: d.cal },
    ];
    const totalCal = b.cal + l.cal + s.cal + d.cal;
    const totalP = b.p + l.p + s.p + d.p;
    const totalC = b.c + l.c + s.c + d.c;
    const totalF = b.f + l.f + s.f + d.f;
    const shuffledChallenges = [...CHALLENGES].sort(() => Math.random() - 0.5);
    const challenges = shuffledChallenges.slice(0, rand(2, 3));
    return {
      day,
      intensity,
      workout,
      diet: { calories: totalCal, protein: totalP, carbs: totalC, fats: totalF },
      meals: mealsList,
      challenges,
    };
  });
  return JSON.stringify({ week });
}

async function callAI(prompt: string, dietPref: string): Promise<string> {
  if (aiProvider === "groq" && groqClient) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 3500,
        });
        const content = response.choices[0]?.message?.content;
        if (content) {
          // Clean up the response - remove markdown code blocks
          let cleaned = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          
          // Find the first { and last } to extract JSON
          const startIdx = cleaned.indexOf('{');
          const lastIdx = cleaned.lastIndexOf('}');
          
          if (startIdx !== -1 && lastIdx > startIdx) {
            let jsonStr = cleaned.substring(startIdx, lastIdx + 1);
            
            // Try to parse and validate
            try {
              JSON.parse(jsonStr);
              return jsonStr;
            } catch {
              console.warn(`[v0] JSON parsing failed on attempt ${attempt}, retrying...`);
              // If parsing fails, try cleaning common issues
              jsonStr = jsonStr
                .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
                .replace(/,\s*}/g, '}') // Remove trailing commas in objects
                .replace(/:\s*,/g, ': null,') // Handle missing values
                .replace(/\n/g, ' '); // Remove newlines that might break JSON
              
              JSON.parse(jsonStr); // Validate again
              return jsonStr;
            }
          }
        }
        console.warn(`[v0] Groq attempt ${attempt}: No valid JSON found in response`);
      } catch (err: any) {
        if (attempt === 3) return generateRandomPlan(dietPref);
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }
  } else if (aiProvider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });
        if (!res.ok) throw new Error(`Gemini ${res.status}`);
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) { JSON.parse(jsonMatch[0]); return jsonMatch[0]; }
        }
        return generateRandomPlan(dietPref);
      } catch {
        if (attempt === 3) return generateRandomPlan(dietPref);
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }
    }
  }
  return generateRandomPlan(dietPref);
}

let seeded = false;
async function ensureSeedData() {
  if (seeded) return;
  const [user] = await db.select().from(users).where(eq(users.id, 1));
  if (!user) {
    await db.insert(users).values({
      id: 1,
      username: "Sachin",
      password: "password123",
      age: 28,
      weight: 75,
      height: 175,
      goal: "maintain",
      activityLevel: "moderate",
    });
    await db.insert(plans).values({
      userId: 1,
      dietPlan: "Sample Diet Plan",
      workoutPlan: "Sample Workout Plan",
      targetCalories: 2400,
      targetProtein: 160,
      targetCarbs: 250,
      targetFat: 80,
    });
    await db.insert(meals).values({
      userId: 1,
      name: "Morning Oatmeal",
      calories: 350,
      protein: 15,
      carbs: 60,
      fat: 8,
    });
  }
  seeded = true;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/users/me", async (_req, res) => {
  await ensureSeedData();
  const [user] = await db.select().from(users).where(eq(users.id, 1));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.put("/api/users/me", async (req, res) => {
  await ensureSeedData();
  try {
    const input = insertUserSchema.partial().parse(req.body);
    const [updated] = await db.update(users).set(input).where(eq(users.id, 1)).returning();
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/plans/generate", async (_req, res) => {
  await ensureSeedData();
  try {
    const [user] = await db.select().from(users).where(eq(users.id, 1));
    if (!user) return res.status(404).json({ message: "User not found" });

    const prompt = `
      You are an expert AI Diet & Fitness Planner for "Upchaar", an elite fitness operating system.
      Create a personalized weekly plan for a user with these metrics:
      Age: ${user.age}, Weight: ${user.weight}kg, Height: ${user.height}cm, Goal: ${user.goal}, Activity: ${user.activityLevel}, Diet Preference: ${user.dietPreference || "non_veg"}
      Respond ONLY with a JSON object in this exact structure, no markdown:
      {"week":[{"day":"Monday","intensity":"High","workout":[{"name":"Bench Press","sets":"4x8","rest":"90s"}],"diet":{"calories":2100,"protein":150,"carbs":220,"fats":65},"meals":[{"time":"Breakfast","name":"Oatmeal with Banana","calories":450}],"challenges":["10k Steps","3L Water"]}]}
      Rules: Include all 7 days Monday-Sunday. Vary intensity. Include 4-5 meals per day.
      Diet preference is "${user.dietPreference || "non_veg"}". If "veg", ONLY vegetarian. If "vegan", plant-based only. If "eggetarian", vegetarian + eggs.
    `;

    const content = await callAI(prompt, user.dietPreference || "non_veg");
    const generatedData = JSON.parse(content);
    const avgCalories = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.calories, 0) / 7);
    const avgProtein = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.protein, 0) / 7);
    const avgCarbs = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.carbs, 0) / 7);
    const avgFat = Math.round(generatedData.week.reduce((acc: number, d: any) => acc + d.diet.fats, 0) / 7);

    const [plan] = await db.insert(plans).values({
      userId: 1,
      dietPlan: JSON.stringify(generatedData.week),
      workoutPlan: JSON.stringify(generatedData.week),
      targetCalories: avgCalories,
      targetProtein: avgProtein,
      targetCarbs: avgCarbs,
      targetFat: avgFat,
    }).returning();

    res.status(201).json(plan);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: error?.message || "Failed to generate plan" });
  }
});

app.get("/api/plans/latest", async (_req, res) => {
  await ensureSeedData();
  const [plan] = await db.select().from(plans).where(eq(plans.userId, 1)).orderBy(desc(plans.createdAt)).limit(1);
  if (!plan) return res.status(404).json({ message: "No plan found" });
  res.json(plan);
});

app.get("/api/meals", async (_req, res) => {
  await ensureSeedData();
  const result = await db.select().from(meals).where(eq(meals.userId, 1)).orderBy(desc(meals.consumedAt));
  res.json(result);
});

app.post("/api/meals", async (req, res) => {
  await ensureSeedData();
  try {
    const bodySchema = insertMealSchema.extend({
      calories: z.coerce.number(),
      protein: z.coerce.number(),
      carbs: z.coerce.number(),
      fat: z.coerce.number(),
    });
    const input = bodySchema.parse(req.body);
    const [meal] = await db.insert(meals).values({ ...input, userId: 1 }).returning();
    res.status(201).json(meal);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/meals/:id", async (req, res) => {
  await ensureSeedData();
  await db.delete(meals).where(eq(meals.id, Number(req.params.id)));
  res.status(204).send();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export default app;
