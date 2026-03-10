import * as React from "react";
import { Layout } from "@/components/Layout";
import { Calculator as CalcIcon, Flame, Scale, Heart, Activity, Zap, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-users";

type CalcType = "bmi" | "bmr" | "tdee" | "water" | "protein" | "bodyfat";

const CALC_OPTIONS: { id: CalcType; label: string; icon: any; color: string }[] = [
  { id: "bmi", label: "BMI", icon: Scale, color: "text-primary" },
  { id: "bmr", label: "BMR", icon: Flame, color: "text-accent" },
  { id: "tdee", label: "TDEE", icon: Activity, color: "text-secondary" },
  { id: "water", label: "Water Intake", icon: Droplets, color: "text-blue-400" },
  { id: "protein", label: "Protein Need", icon: Zap, color: "text-emerald-400" },
  { id: "bodyfat", label: "Body Fat %", icon: Heart, color: "text-red-400" },
];

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400", bg: "bg-blue-400/20" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-400/20" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-400", bg: "bg-yellow-400/20" };
  return { label: "Obese", color: "text-red-400", bg: "bg-red-400/20" };
}

export default function CalculatorPage() {
  const { data: user } = useUser();
  const [activeCalc, setActiveCalc] = React.useState<CalcType>("bmi");

  const [age, setAge] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [gender, setGender] = React.useState("male");
  const [activityLevel, setActivityLevel] = React.useState("moderate");
  const [neck, setNeck] = React.useState("");
  const [waist, setWaist] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setAge(user.age ? String(user.age) : "");
      setWeight(user.weight ? String(user.weight) : "");
      setHeight(user.height ? String(user.height) : "");
    }
  }, [user]);

  const [result, setResult] = React.useState<{ value: string; label: string; detail: string; color: string } | null>(null);

  function calculate() {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    const n = Number(neck);
    const wa = Number(waist);

    if (!w || !h) return;

    switch (activeCalc) {
      case "bmi": {
        const bmi = w / ((h / 100) ** 2);
        const cat = getBmiCategory(bmi);
        setResult({ value: bmi.toFixed(1), label: cat.label, detail: `Based on ${w}kg and ${h}cm`, color: cat.color });
        break;
      }
      case "bmr": {
        if (!a) return;
        const bmr = gender === "male"
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161;
        setResult({ value: Math.round(bmr).toString(), label: "kcal/day", detail: "Mifflin-St Jeor Equation (calories your body burns at rest)", color: "text-accent" });
        break;
      }
      case "tdee": {
        if (!a) return;
        const bmr = gender === "male"
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161;
        const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
        const tdee = bmr * (multipliers[activityLevel] || 1.55);
        setResult({ value: Math.round(tdee).toString(), label: "kcal/day", detail: `Total Daily Energy Expenditure (${activityLevel} activity)`, color: "text-secondary" });
        break;
      }
      case "water": {
        const liters = w * 0.033;
        setResult({ value: liters.toFixed(1), label: "liters/day", detail: `Recommended daily water intake for ${w}kg body weight`, color: "text-blue-400" });
        break;
      }
      case "protein": {
        const lowRange = w * 1.6;
        const highRange = w * 2.2;
        setResult({ value: `${Math.round(lowRange)}-${Math.round(highRange)}`, label: "grams/day", detail: "Optimal range for muscle building (1.6-2.2g per kg)", color: "text-emerald-400" });
        break;
      }
      case "bodyfat": {
        if (!n || !wa) return;
        let bf: number;
        if (gender === "male") {
          bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(h)) - 450;
        } else {
          bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + (wa * 0.2) - n) + 0.22100 * Math.log10(h)) - 450;
        }
        bf = Math.max(3, Math.min(60, bf));
        const category = bf < 14 ? "Athletic" : bf < 20 ? "Fitness" : bf < 25 ? "Average" : "Above Average";
        setResult({ value: bf.toFixed(1) + "%", label: category, detail: "US Navy method estimate (neck & waist measurements)", color: "text-red-400" });
        break;
      }
    }
  }

  const needsAge = ["bmr", "tdee"].includes(activeCalc);
  const needsActivity = activeCalc === "tdee";
  const needsBodyMeasurements = activeCalc === "bodyfat";

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="mb-10 mt-2">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2 uppercase italic tracking-tighter">Health Calculator</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold opacity-70">Fitness Analytics // Multi-Mode</p>
        </header>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {CALC_OPTIONS.map((calc) => (
            <button
              key={calc.id}
              onClick={() => { setActiveCalc(calc.id); setResult(null); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                activeCalc === calc.id
                  ? "bg-white/10 border-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
              }`}
              data-testid={`button-calc-${calc.id}`}
            >
              <calc.icon className={`w-5 h-5 ${activeCalc === calc.id ? calc.color : "text-muted-foreground"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{calc.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card rounded-[2rem] p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 75" data-testid="input-calc-weight" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 180" data-testid="input-calc-height" />
              </div>
            </div>

            {needsAge && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Age (Years)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 25" data-testid="input-calc-age" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none font-bold" data-testid="select-calc-gender">
                    <option value="male" className="bg-card">Male</option>
                    <option value="female" className="bg-card">Female</option>
                  </select>
                </div>
              </div>
            )}

            {needsActivity && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Activity Level</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none font-bold" data-testid="select-calc-activity">
                  <option value="sedentary" className="bg-card">Sedentary</option>
                  <option value="light" className="bg-card">Lightly Active</option>
                  <option value="moderate" className="bg-card">Moderately Active</option>
                  <option value="active" className="bg-card">Very Active</option>
                </select>
              </div>
            )}

            {needsBodyMeasurements && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none font-bold" data-testid="select-bodyfat-gender">
                    <option value="male" className="bg-card">Male</option>
                    <option value="female" className="bg-card">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Age (Years)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 25" data-testid="input-bodyfat-age" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Neck (cm)</label>
                  <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 38" data-testid="input-calc-neck" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Waist (cm)</label>
                  <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="e.g. 85" data-testid="input-calc-waist" />
                </div>
              </div>
            )}

            <button
              onClick={calculate}
              className="w-full py-4 rounded-xl font-black uppercase italic tracking-widest bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              data-testid="button-calculate"
            >
              Calculate
            </button>
          </div>

          <div className="glass-card rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            {result ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <CalcIcon className={`w-10 h-10 ${result.color}`} />
                </div>
                <div className={`text-6xl font-display font-black italic tracking-tighter mb-2 ${result.color}`} data-testid="text-result-value">
                  {result.value}
                </div>
                <div className="text-xl font-display font-bold text-foreground uppercase italic tracking-tight mb-4" data-testid="text-result-label">
                  {result.label}
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {result.detail}
                </p>
              </motion.div>
            ) : (
              <div className="relative z-10 opacity-50">
                <CalcIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Enter values and calculate</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
