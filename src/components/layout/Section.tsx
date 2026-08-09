import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, className = '', id, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('py-16 sm:py-20 lg:py-24', className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
