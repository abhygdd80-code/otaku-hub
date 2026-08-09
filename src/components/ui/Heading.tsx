import type { CSSProperties, ReactNode } from 'react';

interface HeadingProps {
  /**
   * Heading level (h1-h6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Heading size (font size)
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /**
   * Heading font weight
   * @default 'medium'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /**
   * Text color (optional)
   */
  color?: CSSProperties['color'];
  /**
   * Additional className
   */
  className?: string;
  /**
   * Heading content
   */
  children: ReactNode;
}

const headingSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
} as const;

const headingWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size = 'md',
  weight = 'medium',
  color,
  className,
  children,
}) => {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={`block font-display text-foreground ${headingSizes[size]} ${headingWeights[weight]} ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Heading;
export { Heading };
