import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
    </div>
  );
};

export const LoadingGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div 
          key={index} 
          className="h-64 bg-gradient-card rounded-lg border border-border/50 animate-pulse"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-12"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-14"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-18"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};