import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_8px_24px_-12px_rgba(37,99,235,0.8)] hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.06]',
  ghost: 'text-accent-soft hover:text-white',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className = '') =>
  `${base} ${variants[variant]} ${variant === 'ghost' ? '' : sizes[size]} ${className}`;

export function ButtonLink({ to, variant, size, className, children }: CommonProps & { to: string }) {
  return (
    <Link to={to} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
