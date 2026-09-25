import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef((props, ref) => {
  const { className, type, ...rest } = props;
  return (
    <input
      type={type}
      style={{ colorScheme: 'dark' }}
      className={cn(
        'flex h-10 w-full rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-sm text-white font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

export { Input };
