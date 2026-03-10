import { Layout } from "@/components/Layout";
import { Trophy, Zap, Star, Award, Flame, Shield, Swords, Crown, Target, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DAILY_CHALLENGES = [
  { title: "10,000 Steps", desc: "Walk at least 10k steps today", xpReward: 50, icon: Target },
  { title: "3L Water", desc: "Stay hydrated with 3 liters", xpReward: 30, icon: Sparkles },
  { title: "No Junk Food", desc: "Clean eating for the full day", xpReward: 40, icon: Shield },
  { title: "Morning Workout", desc: "Exercise before 9 AM", xpReward: 60, icon: Swords },
  { title: "Track All Meals", desc: "Log every meal in the app", xpReward: 35, icon: CheckCircle2 },
];

const ACHIEVEMENTS = [
  { label: "First Steps", desc: "Complete your first challenge", target: 100, icon: Star, gradient: "from-emerald-500 to-teal-600" },
  { label: "Bronze Warrior", desc: "Reach 300 XP", target: 300, icon: Shield, gradient: "from-amber-600 to-orange-700" },
  { label: "Silver Elite", desc: "Reach 700 XP", target: 700, icon: Award, gradient: "from-slate-300 to-slate-500" },
  { label: "Gold Legend", desc: "Reach 3,000 XP", target: 3000, icon: Crown, gradient: "from-yellow-400 to-amber-500" },
  { label: "Diamond Master", desc: "Reach 5,000 XP", target: 5000, icon: Trophy, gradient: "from-cyan-400 to-blue-500" },
];

export default function Challenges() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

  useEffect(() => {
    const storedXp = localStorage.getItem("upchaar_xp");
    const storedStreak = localStorage.getItem("upchaar_streak");
    const storedCompleted = localStorage.getItem("upchaar_daily_completed");
    const storedDate = localStorage.getItem("upchaar_daily_date");
    if (storedXp) setXp(parseInt(storedXp));
    if (storedStreak) setStreak(parseInt(storedStreak));
    const today = new Date().toDateString();
    if (storedCompleted && storedDate === today) {
      setCompletedToday(new Set(JSON.parse(storedCompleted)));
    }
  }, []);

  const completeChallenge = (index: number, reward: number) => {
    if (completedToday.has(index)) return;
    const newCompleted = new Set(completedToday);
    newCompleted.add(index);
    setCompletedToday(newCompleted);
    const newXp = xp + reward;
    setXp(newXp);
    localStorage.setItem("upchaar_xp", String(newXp));
    localStorage.setItem("upchaar_daily_completed", JSON.stringify(Array.from(newCompleted)));
    localStorage.setItem("upchaar_daily_date", new Date().toDateString());
    if (newCompleted.size === 1) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("upchaar_streak", String(newStreak));
    }
  };

  const getTier = (xp: number) => {
    if (xp >= 5000) return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-500/20", borderColor: "border-cyan-500/30" };
    if (xp >= 3000) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/20", borderColor: "border-yellow-500/30" };
    if (xp >= 700) return { name: "Silver", color: "text-slate-300", bg: "bg-slate-400/20", borderColor: "border-slate-400/30" };
    if (xp >= 300) return { name: "Bronze", color: "text-amber-500", bg: "bg-amber-600/20", borderColor: "border-amber-600/30" };
    return { name: "Novice", color: "text-primary", bg: "bg-primary/20", borderColor: "border-primary/30" };
  };

  const tier = getTier(xp);

  const leaderboard = [
    { name: "Sachin (You)", xp, isUser: true },
    { name: "Tanmay", xp: 2850, isUser: false },
    { name: "Anandi", xp: 2100, isUser: false },
    { name: "Sahil", xp: 1850, isUser: false },
    { name: "Ruhaan", xp: 1200, isUser: false },
  ].sort((a, b) => b.xp - a.xp);

  const nextTierTarget =
    xp < 300 ? 300 : xp < 700 ? 700 : xp < 3000 ? 3000 : xp < 5000 ? 5000 : 5000;
  const prevTierTarget =
    xp < 300 ? 0 : xp < 700 ? 300 : xp < 3000 ? 700 : xp < 5000 ? 3000 : 5000;
  const progressPercent = Math.min(
    ((xp - prevTierTarget) / (nextTierTarget - prevTierTarget)) * 100,
    100
  );

  return (
    <Layout>
      <div className="max-w-[1100px] mx-auto py-6 space-y-8 pb-24">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-transparent border border-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h1
              className="text-4xl md:text-5xl font-display font-black text-gradient uppercase italic tracking-tighter"
              data-testid="text-elite-title"
            >
              Elite Zone
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-14 opacity-70" data-testid="text-elite-subtitle">
            Complete challenges, earn XP, climb the ranks
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/5 p-5 relative overflow-hidden"
            data-testid="card-xp"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <Zap className="w-6 h-6 text-primary mb-3" />
            <div className="text-3xl font-display font-black italic tracking-tighter mb-0.5">
              {xp.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Total XP
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/15 to-orange-500/5 p-5 relative overflow-hidden"
            data-testid="card-streak"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <Flame className="w-6 h-6 text-orange-400 mb-3" />
            <div className="text-3xl font-display font-black italic tracking-tighter mb-0.5">
              {streak}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Day Streak
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={`rounded-2xl border ${tier.borderColor} ${tier.bg} p-5 relative overflow-hidden`}
            data-testid="card-tier"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <Crown className={`w-6 h-6 ${tier.color} mb-3`} />
            <div className={`text-3xl font-display font-black italic tracking-tighter mb-0.5 ${tier.color}`}>
              {tier.name}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Current Tier
            </div>
          </motion.div>
        </div>

        {xp < 5000 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5 rounded-2xl border border-white/5"
            data-testid="card-progress-bar"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Progress to next tier
              </span>
              <span className={`text-xs font-bold ${tier.color}`}>
                {xp} / {nextTierTarget} XP
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 md:p-8 rounded-3xl border border-white/5"
          data-testid="card-leaderboard"
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-500 w-5 h-5" />
            <h2 className="text-lg font-display font-black uppercase italic tracking-tight">
              Global Leaderboard
            </h2>
          </div>
          <div className="space-y-3">
            {leaderboard.map((player, i) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  player.isUser
                    ? "bg-primary/15 border border-primary/30"
                    : "bg-white/[0.03] border border-white/5"
                }`}
                data-testid={`row-leaderboard-${i}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black italic text-sm ${
                      i === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : i === 1
                        ? "bg-slate-400/20 text-slate-300"
                        : i === 2
                        ? "bg-amber-600/20 text-amber-500"
                        : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                      {player.name}
                      {player.isUser && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold tracking-wider">
                      {player.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
                {i === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          data-testid="card-daily-challenges"
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Swords className="text-primary w-5 h-5" />
              <h2 className="text-lg font-display font-black uppercase italic tracking-tight">
                Daily Challenges
              </h2>
            </div>
            <span className="text-xs font-bold text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {completedToday.size}/{DAILY_CHALLENGES.length} done
            </span>
          </div>

          <div className="space-y-3">
            {DAILY_CHALLENGES.map((challenge, i) => {
              const done = completedToday.has(i);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    done
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-primary/20"
                  }`}
                  data-testid={`challenge-daily-${i}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-xl ${
                        done ? "bg-emerald-500/20" : "bg-white/5"
                      }`}
                    >
                      <challenge.icon
                        className={`w-5 h-5 ${done ? "text-emerald-400" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <div className={`font-bold text-sm tracking-tight ${done ? "line-through opacity-60" : ""}`}>
                        {challenge.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{challenge.desc}</div>
                    </div>
                  </div>
                  {done ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">+{challenge.xpReward}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => completeChallenge(i, challenge.xpReward)}
                      className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 hover:border-primary/40 transition-all active:scale-95"
                      data-testid={`button-complete-${i}`}
                    >
                      +{challenge.xpReward} XP
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          data-testid="card-achievements"
        >
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-yellow-500 w-5 h-5" />
            <h2 className="text-lg font-display font-black uppercase italic tracking-tight">
              Achievements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const unlocked = xp >= a.target;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    unlocked
                      ? "bg-white/[0.06] border-white/10"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  }`}
                  data-testid={`achievement-${i}`}
                >
                  <div
                    className={`p-3 rounded-xl ${
                      unlocked
                        ? `bg-gradient-to-br ${a.gradient} shadow-lg`
                        : "bg-white/5"
                    }`}
                  >
                    {unlocked ? (
                      <a.icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm tracking-tight">{a.label}</div>
                    <div className="text-[11px] text-muted-foreground">{a.desc}</div>
                  </div>
                  {unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                      {a.target} XP
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
