import * as React from "react";
import { Dumbbell, Utensils } from "lucide-react";
import { AccordionSection } from "./AccordionSection";
import { Badge } from "@/components/ui/badge";

interface DayPlan {
  day: string;
  workout: string;
  diet: string;
  type: 'Strength' | 'Cardio' | 'Rest Day' | string;
}

export function DayCard({ day, workout, diet, type }: DayPlan) {
  const isRest = type.toLowerCase().includes('rest');
  
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-gradient">{day}</h2>
        <Badge variant="outline" className={`uppercase font-black text-[10px] tracking-widest px-3 py-1 ${
          isRest ? 'border-muted text-muted' : 'border-primary text-primary shadow-[0_0_10px_rgba(168,85,247,0.3)]'
        }`}>
          {type}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccordionSection title="Workout" icon={Dumbbell} accentColor="var(--secondary)" defaultOpen={!isRest}>
          <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
            {workout || "No specific workout scheduled."}
          </div>
        </AccordionSection>
        
        <AccordionSection title="Nutrition" icon={Utensils} accentColor="var(--primary)" defaultOpen={true}>
          <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
            {diet || "Follow standard daily macro targets."}
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
