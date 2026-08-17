import React from 'react';

export default function AppButton({
  children,
  variant = 'primary', // primary, secondary, danger, outline-secondary, etc.
  size = 'md', // sm, md, lg
  isLoading = false,
  loadingText,
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const finalClass = `btn btn-${variant} ${sizeClass} fw-medium rounded-pill px-4 ${className}`;

  return (
    <button 
      type={type} 
      className={finalClass} 
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon} ${children ? 'me-2' : ''}`}></i>}
          {children}
        </>
      )}
    </button>
  );
}
