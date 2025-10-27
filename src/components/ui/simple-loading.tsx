
import React from 'react';

interface SimpleLoadingProps {
  text?: string;
  className?: string;
}

export const SimpleLoading: React.FC<SimpleLoadingProps> = ({ 
  text = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};
