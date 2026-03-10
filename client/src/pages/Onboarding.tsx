'use client';

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import type { OnboardingResponse } from "@shared/schema";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadOnboarding = async () => {
      try {
        setIsLoading(true);
        const data = await authClient.generateOnboarding();
        setOnboardingData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load onboarding data");
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboarding();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Activity className="text-white w-8 h-8" />
          </div>
          <p className="text-muted-foreground">Preparing your personalized plan...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-primary to-accent text-white">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Loading...</h2>
          <p className="text-muted-foreground">Your personalized plan is being prepared.</p>
        </Card>
      </div>
    );
  }

  if (!firstDay || !weekPlan?.week) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Plan Ready!</h2>
          <p className="text-muted-foreground mb-4">Your health analysis and weekly plan have been generated.</p>
          <div className="p-4 bg-white/5 rounded-lg mb-6">
            <h3 className="font-semibold text-white mb-3">Your Analysis:</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{onboardingData.analysis}</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-primary to-accent text-white"
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Safely get plan data - it comes directly from the API as an object
  const weekPlan = onboardingData.plan;
  const firstDay = weekPlan?.week?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome, {user.username}!</h1>
          </div>
          <p className="text-muted-foreground">Your personalized fitness journey starts here</p>
        </motion.div>

        {/* Health Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-8">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-semibold text-white">Your Health Analysis</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {onboardingData.analysis}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Weekly Plan Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Your Weekly Plan Preview</h2>

          {firstDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Workout */}
              <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{firstDay.day} Workout</h3>
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full mb-4">
                    {firstDay.intensity} Intensity
                  </div>
                  {firstDay.workout?.map((ex: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-white font-medium">{ex.name}</p>
                        <p className="text-sm text-muted-foreground">{ex.sets} • {ex.rest} rest</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Diet */}
              <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Nutrition Target</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold text-primary">{firstDay.diet?.calories}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold text-accent">{firstDay.diet?.protein}g</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold text-secondary">{firstDay.diet?.carbs}g</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Fats</p>
                      <p className="text-2xl font-bold text-primary/80">{firstDay.diet?.fats}g</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Sample meals */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Meals</h3>
              <div className="space-y-2">
                {firstDay?.meals?.slice(0, 4)?.map((meal: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">{meal.time}</p>
                      <p className="text-xs text-muted-foreground">{meal.name}</p>
                    </div>
                    <p className="text-sm text-primary font-semibold">{meal.calories}kcal</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Challenges */}
            <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Challenges</h3>
              <div className="space-y-2">
                {firstDay?.challenges?.map((challenge: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <p className="text-white text-sm">{challenge}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-12 px-8 flex items-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate("/plan")}
            variant="outline"
            className="border-white/10 text-muted-foreground hover:text-foreground h-12 px-8"
          >
            View Full Plan
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>This plan is personalized based on your profile. It will adapt as you progress.</p>
        </motion.div>
      </div>
    </div>
  );
}
