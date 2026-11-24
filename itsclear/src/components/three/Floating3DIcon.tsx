import React from 'react';

interface Floating3DIconProps {
  children: React.ReactNode;
  color?: 'gold' | 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: string;
}

export const Floating3DIcon: React.FC<Floating3DIconProps> = ({
  children,
  color = 'gold',
  size = 'md',
  className = '',
  badge
}) => {
  const colorStyles = {
    gold: {
      bg: 'from-amber-400/20 via-amber-500/10 to-amber-900/30',
      border: 'border-amber-400/30 hover:border-amber-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(245,158,11,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]',
      text: 'text-amber-400'
    },
    emerald: {
      bg: 'from-emerald-400/20 via-emerald-500/10 to-emerald-900/30',
      border: 'border-emerald-400/30 hover:border-emerald-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]',
      text: 'text-emerald-400'
    },
    amber: {
      bg: 'from-orange-400/20 via-orange-500/10 to-orange-900/30',
      border: 'border-orange-400/30 hover:border-orange-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(249,115,22,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.45)]',
      text: 'text-orange-400'
    },
    blue: {
      bg: 'from-cyan-400/20 via-cyan-500/10 to-cyan-900/30',
      border: 'border-cyan-400/30 hover:border-cyan-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(6,182,212,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.45)]',
      text: 'text-cyan-400'
    },
    purple: {
      bg: 'from-purple-400/20 via-purple-500/10 to-purple-900/30',
      border: 'border-purple-400/30 hover:border-purple-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(168,85,247,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.45)]',
      text: 'text-purple-400'
    },
    red: {
      bg: 'from-rose-400/20 via-rose-500/10 to-rose-900/30',
      border: 'border-rose-400/30 hover:border-rose-400/60',
      shadow: 'shadow-[0_10px_25px_-5px_rgba(244,63,94,0.25)]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.45)]',
      text: 'text-rose-400'
    }
  }[color];

  const sizeStyles = {
    sm: 'w-8 h-8 rounded-xl p-1.5 text-sm',
    md: 'w-12 h-12 rounded-2xl p-2.5 text-base',
    lg: 'w-16 h-16 rounded-3xl p-3.5 text-xl',
    xl: 'w-20 h-20 rounded-[28px] p-5 text-2xl'
  }[size];

  return (
    <div className={`group relative inline-flex items-center justify-center ${className}`}>
      {/* 3D Isometric Drop Shadow Layer */}
      <div
        className={`absolute inset-0 rounded-2xl bg-black/40 translate-y-1.5 blur-sm transition-transform duration-300 group-hover:translate-y-2`}
      />

      {/* 3D Glass Tile */}
      <div
        className={`relative ${sizeStyles} bg-gradient-to-br ${colorStyles.bg} backdrop-blur-xl border ${colorStyles.border} ${colorStyles.shadow} ${colorStyles.glow} ${colorStyles.text} flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 group-hover:rotate-1`}
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Gloss highlight edge */}
        <div className="absolute top-1 left-2 right-2 h-1 rounded-full bg-white/25 pointer-events-none" />

        {/* The Icon */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          {children}
        </div>

        {badge && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950 shadow-md">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

