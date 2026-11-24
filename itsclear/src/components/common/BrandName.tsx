import React from 'react';

interface BrandNameProps {
  className?: string;
  theme?: 'dark' | 'light'; // 'dark' = for white/light backgrounds (slate-950 'its'); 'light' = for dark backgrounds (white 'its')
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Authentic itsclear™ Logotype directly recreated from packaging typography.
 * Features:
 * - Clean bold 'its'
 * - Golden amber 'c'
 * - Integrated twin-leaf sprout emerging from the top of the 'l'
 * - Golden amber 'ear'
 * - Authentic superscript '™'
 */
export const BrandName: React.FC<BrandNameProps> = ({
  className = '',
  theme = 'dark',
  size = 'md'
}) => {
  const sizeConfig = {
    sm: {
      text: 'text-lg sm:text-xl',
      sprout: 'w-[16px] h-[10px] -top-[9px] -left-[4px]',
      tm: 'text-[7px]'
    },
    md: {
      text: 'text-xl sm:text-[22px]',
      sprout: 'w-[19px] h-[12px] -top-[11px] -left-[5px]',
      tm: 'text-[8px]'
    },
    lg: {
      text: 'text-3xl sm:text-4xl',
      sprout: 'w-[28px] h-[18px] -top-[15px] -left-[7px]',
      tm: 'text-[11px]'
    },
    xl: {
      text: 'text-4xl sm:text-5xl',
      sprout: 'w-[36px] h-[24px] -top-[20px] -left-[9px]',
      tm: 'text-[12px]'
    }
  }[size];

  const itsColor = theme === 'dark' ? 'text-slate-950' : 'text-white';
  const goldColor = '#e5a83b'; // Authentic gold from packaging

  return (
    <span
      className={`inline-flex items-baseline font-black tracking-tight select-none leading-none ${sizeConfig.text} ${className}`}
      style={{
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        letterSpacing: '-0.03em'
      }}
    >
      {/* 'its' */}
      <span className={`${itsColor} tracking-tighter`}>its</span>

      {/* 'clear' with Sprout on 'l' */}
      <span
        className="inline-flex items-baseline relative"
        style={{ color: goldColor }}
      >
        <span>c</span>

        {/* 'l' with Sprout on Top */}
        <span className="relative inline-block">
          {/* Twin Sprout Leaves SVG emerging seamlessly from 'l' */}
          <svg
            viewBox="0 0 64 36"
            fill="currentColor"
            className={`absolute ${sizeConfig.sprout} pointer-events-none drop-shadow-2xs`}
            aria-hidden="true"
          >
            {/* Left Leaf with inner vein curvature */}
            <path d="M29 35 C28 25 20 19 13 14 C6 9.5 4 4 8 2 C12.5 0 20.5 4 25 11.5 C28 16.5 29 23 29 35 Z" />
            {/* Right Leaf with inner vein curvature */}
            <path d="M33 35 C34 24 41 17 48 12 C56 7 60 2.5 56 0.8 C51 -0.8 41.5 2.5 36.5 10.5 C33.5 15.5 33 23.5 33 35 Z" />
            {/* Stem Junction into 'l' stroke */}
            <path d="M29 35 C30 32 32 32 33 35 Z" />
          </svg>
          <span>l</span>
        </span>

        <span>ear</span>

        {/* Superscript Trademark ™ */}
        <span
          className={`font-black align-super ml-0.5 select-none leading-none ${sizeConfig.tm}`}
          style={{ color: goldColor }}
        >
          ™
        </span>
      </span>
    </span>
  );
};

