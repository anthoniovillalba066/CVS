import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] active:scale-95',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
