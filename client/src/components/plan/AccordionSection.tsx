import * as React from "react";
import { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

export function AccordionSection({ title, icon: Icon, children, defaultOpen = false, accentColor = "var(--primary)" }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 mb-4 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: accentColor }}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-black uppercase italic tracking-tighter">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 border-t border-white/5">
              <div className="mt-6 pl-4 border-l-2 border-white/10 prose prose-invert max-w-none">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
