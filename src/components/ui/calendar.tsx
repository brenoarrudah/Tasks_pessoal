import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2 select-none', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4 relative',
        month: 'space-y-3',
        month_caption: 'flex justify-center pt-1 relative items-center h-8',
        caption_label: 'text-sm font-semibold text-zinc-100 capitalize',
        nav: 'flex items-center justify-between absolute inset-x-0 h-8 px-1 z-10 pointer-events-none',
        button_previous: 'p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer pointer-events-auto',
        button_next: 'p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer pointer-events-auto',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex justify-between mb-1',
        weekday: 'text-zinc-400 w-9 font-normal text-xs text-center capitalize',
        weeks: 'space-y-1',
        week: 'flex w-full justify-between mt-1',
        day: 'p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          'h-9 w-9 p-0 font-normal rounded-xl transition-all cursor-pointer flex items-center justify-center text-zinc-200 hover:bg-zinc-800 hover:text-white',
          'focus:outline-hidden focus:ring-1 focus:ring-blue-500'
        ),
        selected: '!bg-blue-600 !text-white font-semibold !rounded-xl shadow-md shadow-blue-600/30 hover:!bg-blue-500',
        today: 'border border-blue-500/60 text-blue-400 font-semibold',
        outside: 'text-zinc-600 opacity-40 hover:bg-transparent',
        disabled: 'text-zinc-700 opacity-30 cursor-not-allowed hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) => {
          return orientation === 'left' ? (
            <ChevronLeft className={cn('h-4 w-4', className)} />
          ) : (
            <ChevronRight className={cn('h-4 w-4', className)} />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
