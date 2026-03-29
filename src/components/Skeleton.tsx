import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-surface-container-low rounded-lg ${className}`} />
);
