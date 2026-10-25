import React from 'react';

interface SponsoredAdSlotProps {
  label: string;
  notice: string;
  className?: string;
}

export const SponsoredAdSlot: React.FC<SponsoredAdSlotProps> = ({ label, notice, className = '' }) => {
  return (
    <aside
      className={`w-full max-w-4xl mx-auto my-6 px-4 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center transition-colors min-h-[72px] flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement Container"
    >
      <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
        {label}
      </span>
      <p className="text-xs text-slate-400 mt-0.5">
        {notice}
      </p>
    </aside>
  );
};
