import * as React from "react";
import { useUser } from "@/hooks/use-users";
import { useGeneratePlan } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Activity, Check } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { data: user, isLoading } = useUser();
  const generateMutation = useGeneratePlan();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isScanning, setIsScanning] = React.useState(false);
  const [updateSuccess, setUpdateSuccess] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [age, setAge] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [goal, setGoal] = React.useState("maintain");
  const [activityLevel, setActivityLevel] = React.useState("moderate");
  const [dietPreference, setDietPreference] = React.useState("non_veg");
  const [gender, setGender] = React.useState("other");
  const [healthIssues, setHealthIssues] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setAge(user.age ? String(user.age) : "");
      setWeight(user.weight ? String(user.weight) : "");
      setHeight(user.height ? String(user.height) : "");
      setGoal(user.goal || "maintain");
      setActivityLevel(user.activityLevel || "moderate");
      setDietPreference(user.dietPreference || "non_veg");
      setGender(user.gender || "other");
      setHealthIssues(user.healthIssues || "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6 mt-4">
          <div className="h-10 bg-white/5 rounded-lg w-48"></div>
          <div className="glass-card p-8 rounded-3xl h-96"></div>
        </div>
      </Layout>
    );
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdateSuccess(false);
    setIsUpdating(true);
    const data = {
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      goal,
      activityLevel,
      dietPreference,
      gender,
      healthIssues: healthIssues || null,
    };
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update profile");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      toast({
        title: "Profile Updated",
        description: "Your health metrics have been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleGeneratePlan() {
    setIsScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await generateMutation.mutateAsync();
      toast({
        title: "Plan Started",
        description: "Your fitness plan has been synchronized.",
      });
      setLocation("/plan");
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <Layout>
      <header className="mb-10 mt-2">
        <h1 className="text-4xl font-display font-bold text-gradient mb-2 uppercase italic tracking-tighter">Health Profile</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold opacity-70">Start Health Data // System ID: {user?.id}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="glass-card rounded-[2rem] p-6 md:p-8 space-y-6 relative overflow-hidden group" data-testid="form-profile">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                  placeholder="e.g. 28"
                  data-testid="input-age"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                  placeholder="e.g. 75"
                  data-testid="input-weight"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                  placeholder="e.g. 180"
                  data-testid="input-height"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                  data-testid="select-goal"
                >
                  <option value="lose_weight" className="bg-card">Lose Weight</option>
                  <option value="maintain" className="bg-card">Maintain Weight</option>
                  <option value="build_muscle" className="bg-card">Build Muscle</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                  data-testid="select-activity"
                >
                  <option value="sedentary" className="bg-card">Sedentary (Little or no exercise)</option>
                  <option value="light" className="bg-card">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate" className="bg-card">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="active" className="bg-card">Very Active (Hard exercise 6-7 days/week)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Diet Preference</label>
                <select
                  value={dietPreference}
                  onChange={(e) => setDietPreference(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                  data-testid="select-diet-preference"
                >
                  <option value="veg" className="bg-card">Vegetarian</option>
                  <option value="non_veg" className="bg-card">Non-Vegetarian</option>
                  <option value="vegan" className="bg-card">Vegan</option>
                  <option value="eggetarian" className="bg-card">Eggetarian</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-bold"
                  data-testid="select-gender"
                >
                  <option value="male" className="bg-card">Male</option>
                  <option value="female" className="bg-card">Female</option>
                  <option value="other" className="bg-card">Other</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Health Issues (Optional)</label>
                <input
                  type="text"
                  value={healthIssues}
                  onChange={(e) => setHealthIssues(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold"
                  placeholder="e.g. back pain, asthma, diabetes"
                  data-testid="input-health-issues"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className={`w-full py-4 rounded-xl font-black uppercase italic tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
                updateSuccess 
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                  : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
              }`}
              data-testid="button-update-metrics"
            >
              {isUpdating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : updateSuccess ? (
                <><Check className="w-5 h-5" /> Updated Successfully!</>
              ) : (
                "Update Metrics"
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-[2rem] p-6 text-center h-full flex flex-col justify-center relative overflow-hidden group">
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      className="absolute inset-0 border-2 border-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute inset-0 border-t-2 border-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <Activity className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h4 className="text-xl font-display font-black uppercase italic text-white mb-2">Profile Scan</h4>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse">Analyzing Health Metrics...</p>
                  
                  <div className="mt-8 w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-3 uppercase italic">Smart Planner</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
              Synchronize your metrics to initialize a high-performance fitness protocol.
            </p>
            
            <button
              onClick={handleGeneratePlan}
              disabled={generateMutation.isPending || isScanning || !weight}
              className="w-full py-4 rounded-xl font-black uppercase italic tracking-widest bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              data-testid="button-create-plan"
            >
              {generateMutation.isPending || isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Syncing...
                </>
              ) : (
                "Create Plan"
              )}
            </button>
            {!weight && (
              <p className="text-[10px] text-accent mt-4 font-black uppercase tracking-widest animate-pulse">Metrics Required</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
