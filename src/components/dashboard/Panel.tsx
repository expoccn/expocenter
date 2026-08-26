import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('expo-panel flex min-w-0 flex-col rounded-[14px] p-4 sm:p-[18px]', className)}>
      <header className="mb-3.5 flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Icon className={cn('h-4 w-4', iconClassName)} strokeWidth={1.9} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground sm:text-sm">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="ml-auto shrink-0">{action}</div> : null}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}
