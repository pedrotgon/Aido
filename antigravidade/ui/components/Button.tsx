
import React from 'react';
import { THEME } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'iconOnly';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  icon,
  ...props 
}) => {
  // Industrial Base: Rigid shape (rounded-sm), precise padding, medium font
  let baseStyles = "relative overflow-hidden font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";
  
  // Adjust padding based on variant
  if (variant !== 'iconOnly') {
    baseStyles += " px-5 py-2.5 rounded-sm";
  } else {
    baseStyles += " p-2 rounded-sm aspect-square";
  }
  
  const variants = {
    // Bosch Blue Primary - Flat, High Contrast
    primary: `bg-[#005691] text-white hover:bg-[#004475] focus:ring-[#005691] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.1)]`,
    
    // Secondary - White surface, clean border
    secondary: `bg-white text-[#1C1C1C] border border-[#D1D5DB] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] focus:ring-[#9CA3AF]`,
    
    // Outline - Transparent with border
    outline: `bg-transparent text-[#005691] border border-[#005691] hover:bg-[#F0F7FC]`,
    
    // Danger - Bosch Red
    danger: `bg-[#E20015] text-white hover:bg-[#B00010] focus:ring-[#E20015] shadow-sm`,
    
    // Ghost - Minimal
    ghost: `text-[#4A5568] hover:bg-[#EFF1F3] hover:text-[#1C1C1C]`,

    // Icon Only - Used for chat tools
    iconOnly: `text-gray-500 hover:text-[#005691] hover:bg-gray-100 border border-transparent`,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed active:scale-100' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit z-10">
           <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Icon Rendering */}
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default Button;
