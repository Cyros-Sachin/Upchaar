'use client';

import { Link, useLocation } from "wouter";
import { Home, User, Target, Activity, Trophy, BarChart2, Calculator, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/nutrition", icon: Activity, label: "Nutrition" },
  { href: "/plan", icon: Target, label: "Plan" },
  { href: "/progress", icon: BarChart2, label: "Analytics" },
  { href: "/challenges", icon: Trophy, label: "Elite" },
  { href: "/calculator", icon: Calculator, label: "Calculator" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Sidebar (Desktop) */}
      <nav className="hidden md:flex flex-col w-72 bg-black/60 border-r border-white/5 p-6 gap-2 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tighter text-white italic">Upchaar</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold shadow-inner' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User section */}
        {user && (
          <div className="border-t border-white/10 pt-4 mt-auto">
            <div className="px-4 py-3 rounded-lg bg-white/5 mb-3">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="text-sm font-semibold text-white">{user.username}</p>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 border"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-x-0 border-b-0 rounded-t-3xl flex justify-around p-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 w-16 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                <item.icon className="w-6 h-6 relative z-10" />
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-0" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
