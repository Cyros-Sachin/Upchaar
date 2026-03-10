export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = "bg-primary",
  formatter = (v: number) => `${v}`
}: { 
  value: number; 
  max: number; 
  label: string;
  color?: string;
  formatter?: (val: number) => string;
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold font-display">
          <span className="text-foreground">{formatter(value)}</span>
          <span className="text-muted-foreground text-xs ml-1">/ {formatter(max)}</span>
        </span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
