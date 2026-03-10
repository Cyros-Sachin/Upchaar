import * as React from "react";
import { LucideIcon } from "lucide-react";

interface MacroStatsProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: string;
}

export function MacroStats({ label, value, unit, icon: Icon, color }: MacroStatsProps) {
  return (
    <div className="glass-card rounded-2xl p-5 border-l-4 transition-all duration-300 hover:scale-105" style={{ borderLeftColor: color }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">{label}</span>
      </div>
      <div className="text-3xl font-display font-black text-foreground tracking-tighter italic">
        {value}{unit && <span className="text-lg ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}
