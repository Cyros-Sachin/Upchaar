import { useLatestPlan } from "@/hooks/use-data";
import { useMeals } from "@/hooks/use-meals";
import { useUser } from "@/hooks/use-users";
import { Link } from "wouter";
import { Flame, Target, ArrowRight, Activity, Plus, Quote, RefreshCw, Zap, Dumbbell, Trophy, TrendingUp, Calculator, Utensils, Clock, Shield } from "lucide-react";
import { HealthRing } from "@/components/HealthRing";
import { ProgressBar } from "@/components/ProgressBar";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Babe Ruth" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Andrew Murphy" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "It's not about having time, it's about making time.", author: "Bruce Lee" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Strive for progress, not perfection.", author: "Dave Gray" },
  { text: "You don't have to be extreme, just consistent.", author: "Herschel Walker" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The best project you'll ever work on is you.", author: "Sonny Franco" },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const hours = time.getHours().toString().padStart(2, "0");
  const mins = time.getMinutes().toString().padStart(2, "0");
  const secs = time.getSeconds().toString().padStart(2, "0");
  return (
    <div className="font-mono text-2xl font-bold tracking-wider">
      <span className="text-primary">{hours}</span>
      <span className="text-white/30 animate-pulse">:</span>
      <span className="text-secondary">{mins}</span>
      <span className="text-white/30 animate-pulse">:</span>
      <span className="text-accent">{secs}</span>
    </div>
  );
}

export default function Home() {
  const { data: user, isLoading: loadingUser } = useUser();
  const { data: plan, isLoading: loadingPlan } = useLatestPlan();
  const { data: meals, isLoading: loadingMeals } = useMeals();
  
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = QUOTES[quoteIndex];
  
  function nextQuote() {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }

  if (loadingUser || loadingPlan || loadingMeals) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8 mt-4">
          <div className="h-20 bg-white/5 rounded-3xl w-full"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 glass-card rounded-2xl"></div>)}
          </div>
          <div className="glass-card p-8 rounded-3xl h-64"></div>
        </div>
      </Layout>
    );
  }

  const todayMeals = meals || [];
  const totalCals = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);

  const targetCals = plan?.targetCalories || 2000;
  const calProgress = (totalCals / targetCals) * 100;

  const xp = parseInt(localStorage.getItem("upchaar_xp") || "0");
  const streak = parseInt(localStorage.getItem("upchaar_streak") || "0");
  const tier = xp >= 5000 ? "Gold" : xp >= 2000 ? "Silver" : xp >= 500 ? "Bronze" : "Novice";
  const tierColor = xp >= 5000 ? "text-yellow-400" : xp >= 2000 ? "text-gray-300" : xp >= 500 ? "text-orange-400" : "text-primary";

  const bmi = user?.weight && user?.height ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <header className="mb-8 mt-2">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-400">System Online</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-gradient mb-1 tracking-tighter italic uppercase" data-testid="text-greeting">
                Welcome to Upchaar
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${tierColor}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${tierColor}`}>{tier} Tier</span>
              </div>
            </div>
          </motion.div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card rounded-2xl p-4 relative overflow-hidden group" data-testid="stat-xp">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <Zap className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-display font-black text-foreground italic">{xp}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Total XP</div>
          </div>
          <div className="glass-card rounded-2xl p-4 relative overflow-hidden group" data-testid="stat-streak">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
            <Flame className="w-5 h-5 text-accent mb-2" />
            <div className="text-2xl font-display font-black text-foreground italic">{streak}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Day Streak</div>
          </div>
          <div className="glass-card rounded-2xl p-4 relative overflow-hidden group" data-testid="stat-meals">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent pointer-events-none" />
            <Utensils className="w-5 h-5 text-secondary mb-2" />
            <div className="text-2xl font-display font-black text-foreground italic">{todayMeals.length}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Meals Today</div>
          </div>
          <div className="glass-card rounded-2xl p-4 relative overflow-hidden group" data-testid="stat-bmi">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-display font-black text-foreground italic">{bmi || "--"}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">BMI Score</div>
          </div>
        </motion.div>

        {!plan ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4 uppercase italic tracking-tighter">
              No Active Plan
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed text-lg">
              Set up your health profile and let our AI generate a personalized diet and workout routine tailored to your goals.
            </p>
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 text-sm"
              data-testid="link-create-plan"
            >
              Initialize System <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card rounded-[2rem] p-6 md:p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
                    <HealthRing 
                      progress={calProgress} 
                      size={200} 
                      strokeWidth={18}
                      color="text-primary"
                      label={totalCals.toString()}
                      sublabel={`/ ${targetCals} kcal`}
                      icon={Activity}
                    />
                  </div>
                  <Link 
                    href="/nutrition"
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:text-emerald-400 transition-colors uppercase tracking-widest"
                    data-testid="link-log-meal"
                  >
                    <Plus className="w-4 h-4" /> Log Meal
                  </Link>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary">Daily Progress</span>
                  </div>
                  
                  <div className="grid gap-5">
                    <ProgressBar value={totalProtein} max={plan.targetProtein} label="Protein" color="bg-secondary" formatter={(v) => `${v}g`} />
                    <ProgressBar value={totalCarbs} max={plan.targetCarbs} label="Carbs" color="bg-primary" formatter={(v) => `${v}g`} />
                    <ProgressBar value={totalFat} max={plan.targetFat} label="Fats" color="bg-accent" formatter={(v) => `${v}g`} />
                  </div>

                  <div className="pt-4 flex gap-8 border-t border-white/5">
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Burn Rate</div>
                      <div className="text-sm font-display font-black text-white italic">
                        {plan.targetCalories ? `${plan.targetCalories.toLocaleString()} kcal/d` : "2,450 kcal/d"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Remaining</div>
                      <div className={`text-sm font-display font-black italic ${(targetCals - totalCals) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {Math.abs(targetCals - totalCals).toLocaleString()} kcal
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Progress</div>
                      <div className="text-sm font-display font-black text-primary italic">{Math.min(calProgress, 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Link href="/plan" className="block" data-testid="link-plan">
                <div className="glass-card rounded-2xl p-5 h-full group cursor-pointer text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
                    <Target className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-sm font-display font-black text-foreground uppercase italic tracking-tight">View Plan</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">7-Day Regimen</p>
                </div>
              </Link>

              <Link href="/nutrition" className="block" data-testid="link-nutrition">
                <div className="glass-card rounded-2xl p-5 h-full group cursor-pointer text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <Utensils className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-sm font-display font-black text-foreground uppercase italic tracking-tight">Food Log</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">{todayMeals.length} Entries</p>
                </div>
              </Link>

              <Link href="/calculator" className="block" data-testid="link-calculator">
                <div className="glass-card rounded-2xl p-5 h-full group cursor-pointer text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <Calculator className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-display font-black text-foreground uppercase italic tracking-tight">Calculator</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">BMI & More</p>
                </div>
              </Link>

              <Link href="/challenges" className="block" data-testid="link-challenges">
                <div className="glass-card rounded-2xl p-5 h-full group cursor-pointer text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all duration-300">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-display font-black text-foreground uppercase italic tracking-tight">Challenges</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">{xp} XP Earned</p>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 glass-card rounded-[2rem] p-6 md:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <Quote className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase font-black tracking-[0.3em] text-primary/60 mb-2">Daily Motivation</div>
              <p className="text-lg md:text-xl font-display font-bold italic text-foreground leading-relaxed" data-testid="text-quote">
                "{quote.text}"
              </p>
              <p className="text-sm text-muted-foreground mt-3 font-bold uppercase tracking-widest" data-testid="text-quote-author">
                - {quote.author}
              </p>
            </div>
            <button
              onClick={nextQuote}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/30 hover:rotate-180 transition-all duration-500 flex-shrink-0"
              data-testid="button-next-quote"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

      </motion.div>
    </Layout>
  );
}
