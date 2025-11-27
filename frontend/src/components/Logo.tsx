import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  // Add variant to control icon color
  variant?: 'default' | 'white' | 'dark';
}

export function Logo({
  size = 'md',
  showText = true,
  className = '',
  variant = 'default'
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  // Use strong contrast for any background
  const variants = {
    default: '#A34421', // orange, for white or light backgrounds
    white: '#FFFFFF',   // white, for orange/dark backgrounds
    dark:  '#1F2937'    // dark (gray-900), for white/light backgrounds
  };
  const iconColor = variants[variant];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 60 60"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <circle cx="30" cy="30" r="25" fill={iconColor} opacity="0.1" />
          <g transform="translate(15, 15)">
            {/* Pot body */}
            <ellipse cx="15" cy="20" rx="12" ry="8" fill={iconColor} />
            {/* Pot handle */}
            <path d="M 25 15 Q 30 15 30 20 Q 30 25 25 25" stroke={iconColor} strokeWidth={2} fill="none" />
            {/* Steam lines */}
            <path d="M 10 8 Q 12 4 10 2" stroke={iconColor} strokeWidth={1.5} fill="none" opacity="0.7" />
            <path d="M 15 8 Q 17 4 15 2" stroke={iconColor} strokeWidth={1.5} fill="none" opacity="0.7" />
            <path d="M 20 8 Q 22 4 20 2" stroke={iconColor} strokeWidth={1.5} fill="none" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-900 ${textSizes[size]}`}>
            KitchenSathi
          </h1>
          <p className="text-xs text-gray-600 hidden sm:block">
            Your Kitchen Companion
          </p>
        </div>
      )}
    </div>
  );
}
