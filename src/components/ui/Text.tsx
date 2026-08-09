import type { CSSProperties, ReactNode } from 'react';

interface TextProps {
  /**
   * Text size (font size)
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /**
   * Text font weight
   * @default 'medium'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /**
   * Text color (optional)
   */
  color?: CSSProperties['color'];
  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  /**
   * Additional className
   */
  className?: string;
  /**
   * Text content
   */
  children: ReactNode;
  /**
   * HTML tag to use (e.g., p, span, div)
   * @default 'p'
   */
  as?: keyof JSX.IntrinsicElements;
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
} as const;

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

const textAlignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

const Text: React.FC<TextProps> = ({
  size = 'md',
  weight = 'medium',
  color,
  align = 'left',
  className,
  children,
  as: Component = 'p',
}) => {
  const ComponentToUse = Component;

  return (
    <ComponentToUse
      className={`block text-foreground ${textSizes[size]} ${textWeights[weight]} ${textAlignments[align]} ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </ComponentToUse>
  );
};

export default Text;
export { Text };
