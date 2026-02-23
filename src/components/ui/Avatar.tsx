import React from 'react';
import { cn, getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ src, name, size = 'md', className, style }: AvatarProps) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
