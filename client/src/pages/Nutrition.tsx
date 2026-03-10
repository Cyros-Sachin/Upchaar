import { useMeals, useCreateMeal, useDeleteMeal } from "@/hooks/use-meals";
import { useLatestPlan } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useState } from "react";
import { Loader2, Plus, Trash2, Apple } from "lucide-react";
import { format } from "date-fns";

export default function Nutrition() {
  const { data: meals, isLoading: loadingMeals } = useMeals();
  const { data: plan, isLoading: loadingPlan } = useLatestPlan();
  const createMutation = useCreateMeal();
  const deleteMutation = useDeleteMeal();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (loadingMeals || loadingPlan) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6 mt-4">
          <div className="h-10 bg-white/5 rounded-lg w-48 mb-8"></div>
          <div className="glass-card p-8 rounded-3xl h-48 mb-8"></div>
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
  const targetProtein = plan?.targetProtein || 150;
  const targetCarbs = plan?.targetCarbs || 200;
  const targetFat = plan?.targetFat || 65;

  async function handleAddMeal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        name: fd.get("name") as string,
        calories: Number(fd.get("calories")),
        protein: Number(fd.get("protein")),
        carbs: Number(fd.get("carbs")),
        fat: Number(fd.get("fat")),
        userId: 1, // Mock user id
      });
      setIsFormOpen(false);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Meal logged successfully" });
    } catch (err: any) {
      toast({ title: "Failed to log meal", description: err.message, variant: "destructive" });
    }
  }

  return (
    <Layout>
      <header className="mb-10 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Nutrition Log</h1>
          <p className="text-muted-foreground">Track your intake against your AI targets.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-white/10 hover:bg-white/20 text-foreground px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {isFormOpen ? "Cancel" : <><Plus className="w-5 h-5" /> Log Food</>}
        </button>
      </header>

      {isFormOpen && (
        <form onSubmit={handleAddMeal} className="glass-card rounded-[2rem] p-6 md:p-8 mb-8 animate-in slide-in-from-top-4 duration-300 border border-primary/30 shadow-2xl shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
          <h3 className="text-xl font-display font-bold mb-6 text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Apple className="text-primary w-5 h-5" />
            </div>
            Log New Entry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">Meal Name</label>
              <input name="name" required placeholder="e.g. Chicken Salad" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">Calories</label>
              <input name="calories" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">Protein (g)</label>
              <input name="protein" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">Carbs (g)</label>
              <input name="carbs" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1">Fat (g)</label>
              <input name="fat" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full mt-8 bg-primary text-primary-foreground py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Entry"}
          </button>
        </form>
      )}

      {/* Progress Overview */}
      <div className="glass-card rounded-[2rem] p-6 md:p-8 mb-8">
        <h2 className="text-lg font-display font-bold mb-6 text-foreground">Today's Consumption</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-6">
            <ProgressBar value={totalCals} max={targetCals} label="Calories" color="bg-accent" formatter={(v) => `${v} kcal`} />
            <ProgressBar value={totalProtein} max={targetProtein} label="Protein" color="bg-secondary" formatter={(v) => `${v}g`} />
          </div>
          <div className="space-y-6">
            <ProgressBar value={totalCarbs} max={targetCarbs} label="Carbs" color="bg-primary" formatter={(v) => `${v}g`} />
            <ProgressBar value={totalFat} max={targetFat} label="Fat" color="bg-orange-400" formatter={(v) => `${v}g`} />
          </div>
        </div>
      </div>

      {/* Meal List */}
      <div>
        <h2 className="text-lg font-display font-bold mb-4 text-foreground px-2">Log History</h2>
        {todayMeals.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-[2rem]">
            <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No meals logged today. Add one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="glass-card rounded-2xl p-4 md:p-5 flex items-center justify-between group transition-all hover:bg-white/[0.03]">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-foreground">{meal.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded flex items-center">
                      {meal.consumedAt ? format(new Date(meal.consumedAt), "h:mm a") : 'Today'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4">
                    <span><span className="text-accent">{meal.calories}</span> kcal</span>
                    <span><span className="text-secondary">{meal.protein}g</span> P</span>
                    <span><span className="text-primary">{meal.carbs}g</span> C</span>
                    <span><span className="text-orange-400">{meal.fat}g</span> F</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(meal.id)}
                  disabled={deleteMutation.isPending}
                  className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  title="Delete Entry"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
