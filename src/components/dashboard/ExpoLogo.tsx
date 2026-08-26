import { Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpoLogo({ compact = false, onLight = false, className }: { compact?: boolean; onLight?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-label="Expo Center Norte">
      <div className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1769aa] via-[#1585c7] to-[#20a9d6] text-white shadow-[0_10px_28px_rgba(21,133,199,0.28)]',
        compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12',
      )}>
        <Snowflake className={compact ? 'h-5 w-5' : 'h-6 w-6'} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 leading-none">
        <div className={cn('font-extrabold tracking-[-0.04em]', onLight ? 'text-slate-950' : 'text-foreground', compact ? 'text-base' : 'text-xl')}>
          EXPO
        </div>
        <div className={cn('mt-1 font-semibold tracking-[0.14em]', onLight ? 'text-slate-500' : 'text-muted-foreground', compact ? 'text-[8px]' : 'text-[9px]')}>
          CENTER NORTE
        </div>
      </div>
    </div>
  );
}
