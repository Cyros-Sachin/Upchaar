import OpenAI from "openai";

let provider: "groq" | "gemini" | "none" = "none";
let groqClient: OpenAI | null = null;
let geminiApiKey: string = "";

if (process.env.GROQ_API_KEY) {
  groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  provider = "groq";
  console.log("AI Provider: Groq (Free LLM)");
} else if (process.env.GEMINI_API_KEY) {
  geminiApiKey = process.env.GEMINI_API_KEY;
  provider = "gemini";
  console.log("AI Provider: Google Gemini");
} else {
  console.warn("No AI API key found. Set GROQ_API_KEY to enable AI plan generation. Get free API key at https://console.groq.com");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EXERCISES = {
  chest: ["Bench Press", "Incline DB Press", "Cable Flyes", "Push-ups", "Dumbbell Pullover", "Chest Dips"],
  back: ["Deadlift", "Barbell Row", "Pull Ups", "Lat Pulldown", "Cable Row", "T-Bar Row"],
  legs: ["Squats", "Leg Press", "Romanian Deadlift", "Lunges", "Leg Curl", "Calf Raises", "Bulgarian Split Squat"],
  shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls", "Arnold Press", "Rear Delt Flyes", "Upright Row"],
  arms: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Skull Crushers", "Cable Curls", "Overhead Extension"],
  recovery: ["Yoga Flow", "Stretching", "Light Walk", "Foam Rolling", "Mobility Drills", "Meditation"]
};

const CHALLENGES = [
  "10k Steps", "12k Steps", "8k Steps", "3L Water", "2.5L Water", "No Junk Food",
  "No Sugar", "Cook Own Meal", "High Protein Day", "Meditate 10min", "Sleep 8hrs",
  "Meal Prep", "Take Stairs", "Morning Walk", "Evening Stretch", "Track All Meals"
];

const SETS_OPTIONS = ["3x8", "3x10", "3x12", "3x15", "4x6", "4x8", "4x10", "4x12"];
const REST_OPTIONS = ["45s", "60s", "90s", "120s"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_OPTIONS = {
  breakfast: {
    veg: [
      { name: "Oatmeal with Banana & Honey", calories: 380 },
      { name: "Poha with Peanuts & Lemon", calories: 320 },
      { name: "Greek Yogurt Parfait with Granola & Berries", calories: 350 },
      { name: "Protein Pancakes with Maple Syrup", calories: 420 },
      { name: "Overnight Oats with Chia Seeds & Almonds", calories: 400 },
      { name: "Idli Sambar with Coconut Chutney", calories: 350 },
      { name: "Masala Dosa with Potato Filling", calories: 400 },
    ],
    eggetarian: [
      { name: "Scrambled Eggs with Whole Wheat Toast", calories: 380 },
      { name: "Egg White Omelette with Spinach & Cheese", calories: 320 },
      { name: "Avocado Toast with Poached Eggs", calories: 430 },
      { name: "Boiled Eggs with Multigrain Bread", calories: 350 },
      { name: "Egg Paratha with Curd", calories: 420 },
      { name: "French Toast with Fruits", calories: 400 },
      { name: "Oatmeal with Banana & Whey Protein", calories: 420 },
    ],
    non_veg: [
      { name: "Oatmeal with Banana & Whey Protein", calories: 420 },
      { name: "Scrambled Eggs with Whole Wheat Toast", calories: 380 },
      { name: "Protein Pancakes with Honey", calories: 450 },
      { name: "Egg White Omelette with Spinach & Cheese", calories: 320 },
      { name: "Avocado Toast with Poached Eggs", calories: 430 },
      { name: "Chicken Sausage with Toast & Eggs", calories: 480 },
      { name: "Overnight Oats with Chia Seeds & Almonds", calories: 400 },
    ],
    vegan: [
      { name: "Overnight Oats with Almond Milk & Berries", calories: 380 },
      { name: "Smoothie Bowl with Banana, Spinach & Seeds", calories: 350 },
      { name: "Avocado Toast with Tomato & Seeds", calories: 400 },
      { name: "Poha with Peanuts & Vegetables", calories: 320 },
      { name: "Tofu Scramble with Vegetables", calories: 360 },
      { name: "Muesli with Soy Milk & Fruits", calories: 380 },
      { name: "Upma with Vegetables & Cashews", calories: 350 },
    ],
  },
  lunch: {
    veg: [
      { name: "Paneer Tikka with Roti & Dal", calories: 650 },
      { name: "Rajma Chawal with Raita", calories: 600 },
      { name: "Chole Bhature with Salad", calories: 620 },
      { name: "Palak Paneer with Jeera Rice", calories: 580 },
      { name: "Mixed Veg Curry with Chapati", calories: 520 },
      { name: "Lentil Soup with Whole Grain Bread", calories: 480 },
      { name: "Mushroom & Peas Pulao with Raita", calories: 550 },
    ],
    eggetarian: [
      { name: "Egg Curry with Steamed Rice", calories: 580 },
      { name: "Paneer Tikka with Roti & Dal", calories: 650 },
      { name: "Egg Fried Rice with Vegetables", calories: 550 },
      { name: "Lentil Soup with Whole Grain Bread", calories: 480 },
      { name: "Omelette Wrap with Veggies", calories: 520 },
      { name: "Rajma Chawal with Boiled Eggs", calories: 620 },
      { name: "Egg Biryani with Raita", calories: 600 },
    ],
    non_veg: [
      { name: "Grilled Chicken with Brown Rice & Broccoli", calories: 620 },
      { name: "Turkey Wrap with Veggies & Hummus", calories: 550 },
      { name: "Tuna Salad with Quinoa & Avocado", calories: 580 },
      { name: "Chicken Stir-Fry with Mixed Vegetables", calories: 600 },
      { name: "Grilled Fish Tacos with Slaw", calories: 520 },
      { name: "Chicken Biryani with Raita", calories: 680 },
      { name: "Paneer Tikka with Roti & Dal", calories: 650 },
    ],
    vegan: [
      { name: "Chickpea Curry with Brown Rice", calories: 580 },
      { name: "Tofu Stir-Fry with Vegetables & Noodles", calories: 520 },
      { name: "Lentil Dal with Roti & Salad", calories: 500 },
      { name: "Quinoa Bowl with Roasted Veggies & Tahini", calories: 550 },
      { name: "Rajma Chawal with Salad", calories: 600 },
      { name: "Mixed Bean Burrito Bowl", calories: 560 },
      { name: "Vegetable Pulao with Dal", calories: 540 },
    ],
  },
  snack: {
    veg: [
      { name: "Greek Yogurt with Almonds", calories: 220 },
      { name: "Mixed Nuts & Dried Fruits", calories: 250 },
      { name: "Apple Slices with Peanut Butter", calories: 200 },
      { name: "Cottage Cheese with Walnuts", calories: 230 },
      { name: "Protein Bar", calories: 260 },
      { name: "Roasted Makhana with Spices", calories: 180 },
      { name: "Fruit Chaat with Chaat Masala", calories: 150 },
    ],
    eggetarian: [
      { name: "Boiled Eggs with Hummus", calories: 240 },
      { name: "Greek Yogurt with Almonds", calories: 220 },
      { name: "Mixed Nuts & Dried Fruits", calories: 250 },
      { name: "Egg Salad on Crackers", calories: 260 },
      { name: "Protein Bar", calories: 260 },
      { name: "Apple Slices with Peanut Butter", calories: 200 },
      { name: "Cottage Cheese with Walnuts", calories: 230 },
    ],
    non_veg: [
      { name: "Protein Shake with Peanut Butter", calories: 280 },
      { name: "Greek Yogurt with Almonds", calories: 220 },
      { name: "Mixed Nuts & Dried Fruits", calories: 250 },
      { name: "Apple Slices with Almond Butter", calories: 200 },
      { name: "Cottage Cheese with Walnuts", calories: 230 },
      { name: "Boiled Eggs with Hummus", calories: 240 },
      { name: "Chicken Strips with Dip", calories: 280 },
    ],
    vegan: [
      { name: "Mixed Nuts & Dried Fruits", calories: 250 },
      { name: "Apple Slices with Almond Butter", calories: 200 },
      { name: "Roasted Chickpeas", calories: 220 },
      { name: "Protein Bar (Plant-Based)", calories: 260 },
      { name: "Roasted Makhana with Spices", calories: 180 },
      { name: "Hummus with Veggie Sticks", calories: 200 },
      { name: "Energy Balls with Dates & Nuts", calories: 230 },
    ],
  },
  dinner: {
    veg: [
      { name: "Palak Paneer with Jeera Rice", calories: 580 },
      { name: "Dal Tadka with Chapati & Salad", calories: 520 },
      { name: "Aloo Gobi with Roti & Raita", calories: 500 },
      { name: "Vegetable Biryani with Raita", calories: 600 },
      { name: "Tofu Stir-Fry with Brown Rice", calories: 480 },
      { name: "Mushroom Masala with Naan", calories: 550 },
      { name: "Chana Masala with Rice & Salad", calories: 560 },
    ],
    eggetarian: [
      { name: "Egg Bhurji with Chapati & Salad", calories: 550 },
      { name: "Egg Curry with Steamed Rice", calories: 580 },
      { name: "Palak Paneer with Roti", calories: 560 },
      { name: "Omelette with Vegetable Soup & Bread", calories: 480 },
      { name: "Egg Masala with Jeera Rice", calories: 600 },
      { name: "Dal Tadka with Chapati & Boiled Eggs", calories: 520 },
      { name: "Vegetable Biryani with Egg Raita", calories: 620 },
    ],
    non_veg: [
      { name: "Salmon with Sweet Potato & Spinach", calories: 580 },
      { name: "Grilled Chicken Breast with Roasted Vegetables", calories: 520 },
      { name: "Lean Beef Steak with Mashed Potatoes", calories: 650 },
      { name: "Baked Fish with Quinoa & Asparagus", calories: 500 },
      { name: "Chicken Curry with Basmati Rice", calories: 620 },
      { name: "Mutton Keema with Roti & Salad", calories: 600 },
      { name: "Tandoori Chicken with Naan & Raita", calories: 640 },
    ],
    vegan: [
      { name: "Tofu Stir-Fry with Brown Rice & Bok Choy", calories: 480 },
      { name: "Chickpea Curry with Roti", calories: 520 },
      { name: "Lentil Dal with Rice & Salad", calories: 500 },
      { name: "Vegetable Noodle Stir-Fry with Tofu", calories: 480 },
      { name: "Rajma with Jeera Rice", calories: 560 },
      { name: "Mushroom & Peas Curry with Chapati", calories: 500 },
      { name: "Mixed Bean Chili with Brown Rice", calories: 540 },
    ],
  },
};

function generateRandomPlan(dietPref: string = "non_veg"): string {
  const pref = (["veg", "non_veg", "vegan", "eggetarian"].includes(dietPref) ? dietPref : "non_veg") as keyof typeof MEAL_OPTIONS.breakfast;
  const muscleGroups = ["chest", "legs", "recovery", "back", "shoulders", "arms", "recovery"] as const;
  const intensities = ["High", "Moderate", "Recovery", "High", "Moderate", "High", "Recovery"];

  const week = DAYS.map((day, i) => {
    const group = muscleGroups[i];
    const intensity = intensities[i];
    const isRecovery = intensity === "Recovery";

    const exercises = EXERCISES[group];
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, isRecovery ? 2 : rand(2, 3));

    const workout = selected.map(name => ({
      name,
      sets: isRecovery ? `${rand(15, 30)}min` : pick(SETS_OPTIONS),
      rest: isRecovery ? "-" : pick(REST_OPTIONS),
    }));

    const baseCal = isRecovery ? rand(1700, 1900) : intensity === "High" ? rand(2100, 2400) : rand(1900, 2100);
    const diet = {
      calories: baseCal,
      protein: rand(120, 180),
      carbs: rand(180, 260),
      fats: rand(45, 75),
    };

    const meals = [
      { time: "Breakfast", ...pick(MEAL_OPTIONS.breakfast[pref]) },
      { time: "Lunch", ...pick(MEAL_OPTIONS.lunch[pref]) },
      { time: "Snack", ...pick(MEAL_OPTIONS.snack[pref]) },
      { time: "Dinner", ...pick(MEAL_OPTIONS.dinner[pref]) },
    ];

    const shuffledChallenges = [...CHALLENGES].sort(() => Math.random() - 0.5);
    const challenges = shuffledChallenges.slice(0, rand(2, 3));

    return { day, intensity, workout, diet, meals, challenges };
  });

  return JSON.stringify({ week });
}

async function callGroq(prompt: string, retries = 3, dietPref: string = "non_veg"): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await groqClient!.chat.completions.create({
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
      console.warn(`Groq attempt ${attempt}/${retries} failed:`, err?.message || err);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }
      console.warn("All Groq attempts failed. Using randomized fitness data.");
      return generateRandomPlan(dietPref);
    }
  }
  return generateRandomPlan(dietPref);
}

async function callGemini(prompt: string, retries = 3, dietPref: string = "non_veg"): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`Gemini API error ${res.status}: ${errBody}`);
        throw new Error(`Gemini ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          JSON.parse(jsonMatch[0]);
          return jsonMatch[0];
        }
      }
      return generateRandomPlan(dietPref);
    } catch (err: any) {
      console.warn(`Gemini attempt ${attempt}/${retries} failed:`, err?.message || err);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 5000));
        continue;
      }
      return generateRandomPlan(dietPref);
    }
  }
  return generateRandomPlan(dietPref);
}

export async function generatePlan(prompt: string, dietPref: string = "non_veg") {
  if (provider === "groq") {
    return callGroq(prompt, 3, dietPref);
  } else if (provider === "gemini") {
    return callGemini(prompt, 3, dietPref);
  }
  return generateRandomPlan(dietPref);
}

export default { provider };
