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

  return (
    <div className={`mb-3 ${containerClassName}`}>
      {label && <label className={`form-label fw-semibold small ${labelColor}`}>{label}</label>}
      <textarea 
        ref={ref}
        className={`form-control p-3 ${inputBg} ${error ? 'is-invalid' : ''} ${className}`}
        style={{ transition: 'all 0.2s', boxShadow: 'none', resize: 'vertical' }}
        rows={rows}
        {...props}
      />
      {error && <div className="text-danger small mt-1 fw-medium">{error}</div>}
    </div>
  );
});

AppTextarea.displayName = 'AppTextarea';
export default AppTextarea;
