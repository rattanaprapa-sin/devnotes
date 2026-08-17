import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AppSelect = forwardRef(({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  options = [],
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const labelColor = isDark ? 'text-light opacity-75' : 'text-secondary';
  const inputBg = isDark ? 'bg-dark text-white border-light border-opacity-10' : 'bg-light';

  return (
    <div className={`mb-3 ${containerClassName}`}>
      {label && <label className={`form-label fw-semibold small ${labelColor}`}>{label}</label>}
      <div className="input-group">
        {icon && (
          <span className={`input-group-text ${inputBg} border-end-0 px-3`}>
            <i className={`bi ${icon} ${isDark ? 'text-light opacity-75' : 'text-muted'}`}></i>
          </span>
        )}
        <select 
          ref={ref}
          className={`form-select px-3 py-2 ${inputBg} ${icon ? 'border-start-0' : ''} ${error ? 'is-invalid' : ''} ${className}`}
          style={{ transition: 'all 0.2s', boxShadow: 'none' }}
          {...props}
        >
          {!options.some(opt => opt.value === '') && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="text-danger small mt-1 fw-medium">{error}</div>}
    </div>
  );
});

AppSelect.displayName = 'AppSelect';
export default AppSelect;
