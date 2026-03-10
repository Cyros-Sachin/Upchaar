import * as React from "react";
import { Layout } from "@/components/Layout";
import { useMeals } from "@/hooks/use-meals";
import { useLatestPlan } from "@/hooks/use-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Zap, Flame, Target, Utensils, ChevronUp, ChevronDown, Minus } from "lucide-react";

export default function Progress() {
  const { data: meals } = useMeals();
  const { data: plan } = useLatestPlan();

  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date, index) => {
      const dayMeals =
        meals?.filter((m) => m.consumedAt && String(m.consumedAt).startsWith(date)) || [];
      const hasMeals = dayMeals.length > 0;
      const demoCals = [1850, 2100, 1950, 2200, 2050, 1900, 2150];
      const demoProtein = [140, 155, 145, 160, 150, 142, 158];
      const demoCarbs = [200, 230, 210, 240, 220, 195, 235];
      const demoFat = [55, 65, 58, 70, 62, 52, 68];

      return {
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        calories: hasMeals
          ? dayMeals.reduce((sum, m) => sum + m.calories, 0)
          : demoCals[index % demoCals.length],
        protein: hasMeals
          ? dayMeals.reduce((sum, m) => sum + m.protein, 0)
          : demoProtein[index % demoProtein.length],
        carbs: hasMeals
          ? dayMeals.reduce((sum, m) => sum + m.carbs, 0)
          : demoCarbs[index % demoCarbs.length],
        fat: hasMeals
          ? dayMeals.reduce((sum, m) => sum + m.fat, 0)
          : demoFat[index % demoFat.length],
        targetCals: plan?.targetCalories || 2000,
        targetProtein: plan?.targetProtein || 150,
      };
    });
  }, [meals, plan]);

  const avgCalories = Math.round(
    chartData.reduce((s, d) => s + d.calories, 0) / chartData.length
  );
  const avgProtein = Math.round(
    chartData.reduce((s, d) => s + d.protein, 0) / chartData.length
  );
  const avgCarbs = Math.round(
    chartData.reduce((s, d) => s + d.carbs, 0) / chartData.length
  );
  const avgFat = Math.round(
    chartData.reduce((s, d) => s + d.fat, 0) / chartData.length
  );
  const targetCals = plan?.targetCalories || 2000;
  const targetProtein = plan?.targetProtein || 150;
  const calDiff = avgCalories - targetCals;
  const proteinDiff = avgProtein - targetProtein;

  const statCards = [
    {
      label: "Avg Calories",
      value: avgCalories.toLocaleString(),
      unit: "kcal",
      icon: Flame,
      color: "text-orange-400",
      bg: "from-orange-500/20 to-orange-500/5",
      border: "border-orange-500/20",
      diff: calDiff,
      target: targetCals,
    },
    {
      label: "Avg Protein",
      value: avgProtein + "g",
      unit: "",
      icon: Zap,
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/20",
      diff: proteinDiff,
      target: targetProtein,
    },
    {
      label: "Avg Carbs",
      value: avgCarbs + "g",
      unit: "",
      icon: Utensils,
      color: "text-primary",
      bg: "from-primary/20 to-primary/5",
      border: "border-primary/20",
      diff: 0,
      target: 0,
    },
    {
      label: "Avg Fat",
      value: avgFat + "g",
      unit: "",
      icon: Target,
      color: "text-pink-400",
      bg: "from-pink-500/20 to-pink-500/5",
      border: "border-pink-500/20",
      diff: 0,
      target: 0,
    },
  ];

  const DiffBadge = ({ diff, target }: { diff: number; target: number }) => {
    if (!target) return null;
    const abs = Math.abs(diff);
    if (abs <= 20)
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full" data-testid="badge-on-target">
          <Minus className="w-3 h-3" /> On Target
        </span>
      );
    if (diff > 0)
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full" data-testid="badge-over">
          <ChevronUp className="w-3 h-3" /> +{abs}
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full" data-testid="badge-under">
        <ChevronDown className="w-3 h-3" /> -{abs}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-[1100px] mx-auto py-6 space-y-8 pb-24">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-transparent border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1
              className="text-4xl md:text-5xl font-display font-black text-gradient uppercase italic tracking-tighter"
              data-testid="text-analytics-title"
            >
              Analytics
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-14 opacity-70" data-testid="text-analytics-subtitle">
            7-day performance overview
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border ${card.border} bg-gradient-to-b ${card.bg} p-4 md:p-5 overflow-hidden`}
              data-testid={`card-stat-${i}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
              <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
              <div className="text-2xl md:text-3xl font-display font-black italic tracking-tighter mb-0.5">
                {card.value}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">
                {card.label}
              </div>
              <DiffBadge diff={card.diff} target={card.target} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          data-testid="chart-calories"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary w-5 h-5" />
              <h2 className="text-lg font-display font-black uppercase italic tracking-tight">
                Calorie Trend
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Logged
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Target
                </span>
              </div>
            </div>
          </div>
          <div className="h-[280px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "rgba(10,10,10,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}
                  labelStyle={{
                    color: "#a855f7",
                    marginBottom: "6px",
                    fontSize: "10px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  name="Logged"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#calGrad)"
                  dot={{ r: 4, fill: "#a855f7", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#a855f7", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="targetCals"
                  name="Target"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fillOpacity={1}
                  fill="url(#targetGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 md:p-8 rounded-3xl border border-white/5"
          data-testid="chart-protein"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-cyan-400 w-5 h-5" />
              <h2 className="text-lg font-display font-black uppercase italic tracking-tight">
                Protein Intake
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#a855f7]/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,10,10,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                  }}
                />
                <Bar
                  dataKey="protein"
                  name="Logged (g)"
                  fill="#22d3ee"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="targetProtein"
                  name="Target (g)"
                  fill="rgba(168,85,247,0.15)"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
