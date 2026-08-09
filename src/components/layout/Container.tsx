import React from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  className = '',
}) => {
  return (
    <div
      className={cn(
        fluid ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
