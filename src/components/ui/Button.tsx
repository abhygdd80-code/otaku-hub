import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  asChild = false,
  className = '',
  onClick,
  href,
  target,
  rel,
}) => {
  // Base classes
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Variants
  const variantMap: Record<string, string> = {
    primary: `bg-primary text-background hover:bg-primary/90`,
    secondary: `bg-surface text-primary hover:bg-surface/80 border border-border`,
    outline: `border border-primary text-primary hover:bg-primary/10`,
  };

  // Sizes
  const sizeMap: Record<string, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-5 text-lg',
  };

  const Variant = asChild ? 'span' : href ? 'a' : 'button';

  return (
    <Variant
      className={`${base} ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      onClick={onClick}
      href={href}
      target={target}
      rel={rel}
    >
      {children}
    </Variant>
  );
};

export default Button;
