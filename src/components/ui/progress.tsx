import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

/** Barra de progresso no padrão Shadcn UI (API compatível com <Progress value={n} />) */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={cn('relative h-3 w-full overflow-hidden rounded-full bg-zinc-800', className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full bg-blue-500 transition-all duration-700 ease-out', indicatorClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
