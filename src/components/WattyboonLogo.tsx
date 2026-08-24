import React from 'react';

interface WattyboonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WattyboonLogo: React.FC<WattyboonLogoProps> = ({ 
  className = '', 
  size = 'md'
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <span className={`font-logo font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 dark:from-purple-300 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-sm ${textSizes[size]}`}>
        WattyBoon
      </span>
    </div>
  );
};


