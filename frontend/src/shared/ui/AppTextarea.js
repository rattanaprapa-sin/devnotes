import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AppTextarea = forwardRef(({
  label,
  error,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const labelColor = isDark ? 'text-light opacity-75' : 'text-secondary';
  const inputBg = isDark ? 'bg-dark text-white border-light border-opacity-10' : 'bg-light';
  const { style, ...restProps } = props;

  return (
    <div className={containerClassName || 'mb-3'}>
      {label && <label className={`form-label fw-semibold small ${labelColor}`}>{label}</label>}
      <textarea 
        ref={ref}
        className={`form-control px-3 py-2 ${inputBg} ${error ? 'is-invalid' : ''} ${className}`}
        style={{ 
          transition: 'border-color 0.15s, background-color 0.15s, height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), min-height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)', 
          boxShadow: 'none', 
          resize: 'vertical', 
          ...style 
        }}
        rows={rows}
        {...restProps}
      />
      {error && <div className="text-danger small mt-1 fw-medium">{error}</div>}
    </div>
  );
});

AppTextarea.displayName = 'AppTextarea';
export default AppTextarea;
