'use client';

import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AlertCircle, Activity, Mail, Lock, User, Heart } from "lucide-react";

const FORM_STEPS = [
  { id: 1, label: "Account", icon: User },
  { id: 2, label: "Health", icon: Heart },
  { id: 3, label: "Preferences", icon: Activity },
];

export default function Signup() {
  const [, navigate] = useLocation();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    activityLevel: "",
    dietPreference: "",
    gender: "",
    healthIssues: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.username || !formData.password || !formData.passwordConfirm) {
        setError("All fields are required");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (formData.password !== formData.passwordConfirm) {
        setError("Passwords do not match");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.age || !formData.weight || !formData.height || !formData.gender) {
        setError("Please fill in all health fields");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.goal || !formData.activityLevel || !formData.dietPreference) {
        setError("Please select your preferences");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit form
        await handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await signup({
        username: formData.username,
        password: formData.password,
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        height: parseInt(formData.height),
        goal: formData.goal,
        activityLevel: formData.activityLevel,
        dietPreference: formData.dietPreference,
        gender: formData.gender,
        healthIssues: formData.healthIssues || null,
      });
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Upchaar</h1>
              <p className="text-xs text-muted-foreground">Elite Fitness Operating System</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex gap-2 mb-3">
              {FORM_STEPS.map((step, idx) => (
                <div key={step.id} className="flex-1">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: idx < currentStep ? "100%" : idx === currentStep - 1 ? `${progressPercent % 33.33}%` : "0%" }}
                    className="h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                  <label className="text-xs text-muted-foreground mt-2 block">
                    {step.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Form content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-6">Create Your Account</h2>

                <div>
                  <Label htmlFor="username" className="text-sm text-muted-foreground">
                    Username
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passwordConfirm" className="text-sm text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="passwordConfirm"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.passwordConfirm}
                      onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-6">Your Health Profile</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-sm text-muted-foreground">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 28"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-sm text-muted-foreground">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-sm text-muted-foreground">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 75"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-sm text-muted-foreground">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g., 175"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-6">Your Preferences</h2>

                <div>
                  <Label htmlFor="goal" className="text-sm text-muted-foreground">
                    Fitness Goal
                  </Label>
                  <Select value={formData.goal} onValueChange={(v) => handleSelectChange("goal", v)}>
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="build_muscle">Build Muscle</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activityLevel" className="text-sm text-muted-foreground">
                    Activity Level
                  </Label>
                  <Select value={formData.activityLevel} onValueChange={(v) => handleSelectChange("activityLevel", v)}>
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dietPreference" className="text-sm text-muted-foreground">
                    Diet Preference
                  </Label>
                  <Select value={formData.dietPreference} onValueChange={(v) => handleSelectChange("dietPreference", v)}>
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select diet preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="eggetarian">Eggetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="healthIssues" className="text-sm text-muted-foreground">
                    Health Issues (Optional)
                  </Label>
                  <Input
                    id="healthIssues"
                    placeholder="e.g., Knee pain, asthma"
                    value={formData.healthIssues}
                    onChange={(e) => handleInputChange("healthIssues", e.target.value)}
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-10">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1 border-white/10 text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
            >
              {isLoading ? "Creating..." : currentStep === 3 ? "Create Account" : "Next"}
            </Button>
          </div>

          {/* Login link */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Sign in here
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
