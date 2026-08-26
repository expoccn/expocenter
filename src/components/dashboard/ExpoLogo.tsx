import { cn } from '@/lib/utils';

export function ExpoLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)} aria-label="Expo Center Norte">
      <img
        src="/expo-center-norte-mark.png"
        alt="Expo Center Norte"
        className={cn(
          'shrink-0 object-contain drop-shadow-[0_3px_10px_rgba(255,255,255,0.08)]',
          compact ? 'h-[28px] w-[68px]' : 'h-[34px] w-[82px]',
        )}
      />
      <div className="min-w-0 leading-[1.02] text-white">
        <div className={cn('font-extrabold tracking-[-0.035em]', compact ? 'text-[12px]' : 'text-[14px]')}>EXPO</div>
        <div className={cn('mt-1 font-semibold tracking-[0.11em] text-white/62', compact ? 'text-[6px]' : 'text-[7px]')}>CENTER NORTE</div>
      </div>
    </div>
  );
}
