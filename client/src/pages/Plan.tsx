import { useLatestPlan } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { Dumbbell, Utensils, Target, ArrowRight, Flame, Zap, Droplets, Info, Award, Star, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCurrentDayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getWeekDates(): { day: number; month: string }[] {
  const today = new Date();
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });
}

async function exportPlanToPdf(weekData: any[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFillColor(168, 85, 247);
  doc.rect(0, 45, pageWidth, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(168, 85, 247);
  doc.text("CYROS.AI", 14, 25);

  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text("7-Day Fitness & Diet Plan", 14, 35);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 35, { align: "right" });

  y = 55;

  for (const day of weekData) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(25, 25, 30);
    doc.roundedRect(10, y - 5, pageWidth - 20, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(day.day.toUpperCase(), 14, y + 2);

    const intensityColor: Record<string, [number, number, number]> = {
      High: [239, 68, 68],
      Moderate: [168, 85, 247],
      Recovery: [34, 211, 238],
    };
    const ic = intensityColor[day.intensity] || [168, 85, 247];
    doc.setFontSize(9);
    doc.setTextColor(ic[0], ic[1], ic[2]);
    doc.text(`${day.intensity} Intensity`, pageWidth - 14, y + 2, { align: "right" });

    y += 14;

    const diet = day.diet || {};
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 40, 180);
    doc.text("MACROS:", 14, y);
    doc.setTextColor(30, 30, 30);
    doc.text(`Calories: ${diet.calories || 0} kcal  |  Protein: ${diet.protein || 0}g  |  Carbs: ${diet.carbs || 0}g  |  Fats: ${diet.fats || 0}g`, 38, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 130, 180);
    doc.text("WORKOUT:", 14, y);
    y += 6;

    for (const ex of (day.workout || [])) {
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`  ${ex.name}`, 18, y);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${ex.sets}  |  Rest: ${ex.rest}`, pageWidth - 14, y, { align: "right" });
      y += 6;
    }

    if (day.meals && day.meals.length > 0) {
      y += 3;
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 100, 0);
      doc.text("DIET PLAN:", 14, y);
      y += 6;
      for (const meal of day.meals) {
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`  ${meal.time}: ${meal.name}`, 18, y);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`${meal.calories} kcal`, pageWidth - 14, y, { align: "right" });
        y += 6;
      }
    }

    if (day.challenges && day.challenges.length > 0) {
      y += 3;
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 40, 180);
      doc.text("CHALLENGES:", 14, y);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.text(day.challenges.join("  |  "), 48, y);
      y += 6;
    }

    y += 8;
  }

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("Cyros AI - Diet & Fitness Planner", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

  doc.save("cyros-fitness-plan.pdf");
}

export default function Plan() {
  const { data: plan, isLoading } = useLatestPlan();
  const [xp, setXp] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const sliderRef = useRef<HTMLDivElement>(null);
  const weekDates = getWeekDates();

  useEffect(() => {
    const storedXp = localStorage.getItem("upchaar_xp");
    if (storedXp) setXp(parseInt(storedXp));
  }, []);

  const handleChallengeComplete = (checked: boolean) => {
    if (checked) {
      const newXp = xp + 100;
      setXp(newXp);
      localStorage.setItem("upchaar_xp", newXp.toString());
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6 mt-4 max-w-[900px] mx-auto">
          <div className="h-10 bg-white/5 rounded-lg w-48 mb-8"></div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-12 w-16 glass-card rounded-xl"></div>)}
          </div>
          <div className="glass-card p-8 rounded-3xl h-64"></div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
          <Target className="w-20 h-20 text-muted-foreground mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground uppercase italic tracking-tighter">No Plan Active</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start your profile to generate your optimized fitness operating system.
          </p>
          <Link href="/profile" className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase italic rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all inline-flex items-center gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Layout>
    );
  }

  let weekData: any[] = [];
  try {
    const parsed = JSON.parse(plan.dietPlan);
    weekData = Array.isArray(parsed) ? parsed : (parsed.week || []);
  } catch (e) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
          <Info className="w-20 h-20 text-primary mb-6" />
          <h2 className="text-3xl font-display font-black mb-4 text-foreground uppercase italic tracking-tighter">Legacy Data Detected</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Your current plan is using an outdated format. Re-generate it to unlock the new dashboard.
          </p>
          <Link href="/profile" className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase italic rounded-xl shadow-lg hover:-translate-y-1 transition-all inline-flex items-center gap-2">
            Update Profile <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Layout>
    );
  }

  const day = weekData[selectedDay] || weekData[0];
  if (!day) return null;

  const todayIndex = getCurrentDayIndex();

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-20 max-w-[900px] mx-auto"
      >
        <header className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-gradient mb-1 uppercase italic tracking-tighter" data-testid="heading-plan">Fitness & Diet Plan</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] opacity-70">
              Week 01 // XP: {xp}
            </p>
          </div>
          <button
            onClick={async () => {
              setExporting(true);
              try { await exportPlanToPdf(weekData); } catch (e) { console.error("PDF export failed:", e); } finally { setExporting(false); }
            }}
            disabled={exporting || weekData.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest self-start md:self-auto"
            data-testid="button-export-pdf"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        </header>

        <div className="relative mb-8">
          <div ref={sliderRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="day-slider">
            {weekData.map((_: any, idx: number) => {
              const isSelected = idx === selectedDay;
              const isToday = idx === todayIndex;
              const dateInfo = weekDates[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`relative flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl transition-all duration-300 border min-w-[72px] ${
                    isSelected
                      ? "bg-primary/20 border-primary/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
                  }`}
                  data-testid={`day-tab-${idx}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {DAYS_SHORT[idx]}
                  </span>
                  <span className={`text-xl font-display font-black ${isSelected ? "text-foreground" : "text-foreground/50"}`}>
                    {dateInfo?.day}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-primary/70" : "text-muted-foreground/50"}`}>
                    {dateInfo?.month}
                  </span>
                  {isToday && (
                    <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary" : "bg-emerald-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  disabled={selectedDay === 0}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  data-testid="button-prev-day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-foreground" data-testid="text-selected-day">{day.day}</h2>
                </div>
                <button
                  onClick={() => setSelectedDay(Math.min(weekData.length - 1, selectedDay + 1))}
                  disabled={selectedDay === weekData.length - 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  data-testid="button-next-day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Badge className={`px-4 py-1.5 uppercase font-black text-[10px] tracking-widest italic ${
                day.intensity === 'High' ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                day.intensity === 'Moderate' ? 'bg-primary/20 text-primary border-primary/50' :
                'bg-secondary/20 text-secondary border-secondary/50'
              }`} data-testid="badge-intensity">
                {day.intensity}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Calories", value: day.diet.calories, unit: "kcal", icon: Flame, color: "text-accent" },
                { label: "Protein", value: day.diet.protein, unit: "g", icon: Zap, color: "text-secondary" },
                { label: "Carbs", value: day.diet.carbs, unit: "g", icon: Droplets, color: "text-primary" },
                { label: "Fats", value: day.diet.fats, unit: "g", icon: Info, color: "text-orange-400" },
              ].map((macro) => (
                <div key={macro.label} className="glass-card rounded-2xl p-4 border border-white/5" data-testid={`macro-${macro.label.toLowerCase()}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <macro.icon className={`w-4 h-4 ${macro.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{macro.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-black text-foreground">{macro.value}</span>
                    <span className="text-xs text-muted-foreground font-bold">{macro.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {day.meals && day.meals.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
                  <Utensils className="w-4 h-4 text-accent" /> Diet Plan
                </h3>
                <div className="glass-card rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                  {day.meals.map((meal: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors" data-testid={`meal-${selectedDay}-${i}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Utensils className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-black tracking-widest text-accent mb-0.5">{meal.time}</div>
                          <div className="font-display font-bold text-sm text-foreground">{meal.name}</div>
                        </div>
                      </div>
                      <div className="text-sm font-black text-muted-foreground">{meal.calories} <span className="text-[10px]">kcal</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
                  <Dumbbell className="w-4 h-4 text-secondary" /> Workout Plan
                </h3>
                <div className="glass-card rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                  {day.workout.map((ex: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors" data-testid={`workout-${i}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="font-display font-black uppercase italic tracking-tight text-foreground text-sm">{ex.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-display font-black italic text-foreground">{ex.sets}</div>
                        <div className="text-[9px] uppercase font-black text-secondary tracking-widest">Rest: {ex.rest}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-primary" /> Daily Challenges
                </h3>
                <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4">
                  {day.challenges.map((c: string, i: number) => (
                    <div key={i} className="flex items-center space-x-3 group cursor-pointer" data-testid={`challenge-${i}`}>
                      <Checkbox 
                        id={`c-${selectedDay}-${i}`} 
                        className="w-5 h-5 rounded-lg border-primary/50 data-[state=checked]:bg-primary flex-shrink-0"
                        onCheckedChange={(checked) => handleChallengeComplete(checked === true)}
                      />
                      <label 
                        htmlFor={`c-${selectedDay}-${i}`}
                        className="text-sm font-display font-bold uppercase italic tracking-tight text-foreground/80 group-hover:text-foreground transition-all cursor-pointer flex-1"
                      >
                        {c}
                      </label>
                      <Award className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2">
                      <span>+100 XP per challenge</span>
                      <span className="text-primary">{xp} XP Total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
