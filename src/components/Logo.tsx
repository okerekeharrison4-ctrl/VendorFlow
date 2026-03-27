import React from 'react';

export const Logo = ({ 
  size = 40, 
  variant = 'icon',
  className = '' 
}: { 
  size?: number, 
  variant?: 'icon' | 'mark',
  className?: string 
}) => {
  if (variant === 'mark') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path 
          d="M30 34L50 68L70 34" 
          stroke="currentColor" 
          strokeWidth="14" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M50 68L70 34" 
          className="stroke-secondary"
          strokeWidth="14" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="24" fill="#2d3435" />
      <path 
        d="M30 34L50 68L70 34" 
        stroke="#ffffff" 
        strokeWidth="14" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M50 68L70 34" 
        stroke="#94f990" 
        strokeWidth="14" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};
