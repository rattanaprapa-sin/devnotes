import React, { forwardRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AppInput = forwardRef(({
  label,
  type = 'text',
  error,
  icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const isDark = theme === 'dark';
  const labelColor = isDark ? 'text-light opacity-75' : 'text-secondary';
  const inputBg = isDark ? 'bg-dark text-white border-light border-opacity-10' : 'bg-light';
  
  // Extract border classes from className to keep input group borders consistent
  const borderClass = className.split(' ').find(c => c.startsWith('border-') && !c.includes('start-0') && !c.includes('end-0')) || '';
  
  return (
    <div className={`mb-3 ${containerClassName}`}>
      {label && <label className={`form-label fw-semibold small ${labelColor}`}>{label}</label>}
      <div className="input-group">
        {icon && (
          <span className={`input-group-text ${inputBg} px-3 ${error ? 'border-danger' : borderClass}`}>
            <i className={`bi ${icon} ${isDark ? 'text-light opacity-75' : 'text-muted'}`}></i>
          </span>
        )}
        <input 
          ref={ref}
          type={inputType}
          className={`form-control px-3 py-2 ${inputBg} ${error ? 'is-invalid' : ''} ${className}`}
          style={{ transition: 'all 0.2s', boxShadow: 'none' }}
          {...props}
        />
        {isPassword && (
          <span 
            className={`input-group-text ${inputBg} ${error ? 'border-danger' : borderClass}`}
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} ${isDark ? 'text-light opacity-75' : 'text-secondary'}`}></i>
          </span>
        )}
      </div>
      {error && <div className="text-danger small mt-1 fw-medium">{error}</div>}
    </div>
  );
});

AppInput.displayName = 'AppInput';
export default AppInput;
