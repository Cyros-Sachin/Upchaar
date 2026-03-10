export function HealthRing({
  progress,
  size = 160,
  strokeWidth = 14,
  color = "text-primary",
  label,
  sublabel,
  icon: Icon
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  icon?: any;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure progress is bounded
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const offset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 drop-shadow-2xl" width={size} height={size}>
        {/* Background track */}
        <circle
          className="text-white/5 stroke-current"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress track */}
        <circle
          className={`${color} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 delay-150">
        {Icon && <Icon className={`w-6 h-6 mb-1 ${color} opacity-80`} />}
        {label && <span className="text-3xl font-display font-bold text-foreground tracking-tight">{label}</span>}
        {sublabel && <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
