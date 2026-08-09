'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface ButtonProps {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  /**
   * Button size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Button state
   */
  disabled?: boolean;
  /**
   * Button type (submit, button, reset)
   */
  type?: 'submit' | 'button' | 'reset';
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Button content
   */
  children?: ReactNode;
  /**
   * URL for link button (optional)
   */
  href?: string;
  style?: CSSProperties;
}

const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'bg-transparent text-foreground hover:bg-muted/20',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-border text-foreground hover:bg-primary/10',
} as const;

const buttonSizes = {
  xs: 'h-8 rounded-md px-2 text-xs',
  sm: 'h-9 rounded-lg px-3 text-sm',
  md: 'h-10 rounded-lg px-4 text-base',
  lg: 'h-11 rounded-lg px-5 text-lg',
  xl: 'h-12 rounded-lg px-6 text-xl',
} as const;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className,
  children,
  href,
  onClick,
  style,
}) => {
  const baseClasses =
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

  // Determine if it's a link or button
  const Component = href ? 'a' : 'button';

  return (
    <Component
      {...(href ? { href } : { type })}
      onClick={onClick}
      className={`${baseClasses} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      disabled={disabled}
      style={style}
    >
      {children}
    </Component>
  );
};

export default Button;
export { Button };
