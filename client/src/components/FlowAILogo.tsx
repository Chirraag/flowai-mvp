import React from 'react';
import { cn } from '@/lib/utils';

interface FlowAILogoProps {
  className?: string;
}

export function FlowAILogo({ className }: FlowAILogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">Flow AI</span>
      </div>
    </div>
  );
}