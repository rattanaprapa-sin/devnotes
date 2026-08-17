import React from 'react';
import useEscape from '../hooks/useEscape';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppModal({ 
  show, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md', // sm, md, lg, xl
  icon,
  borderless = false
}) {
  const { theme } = useTheme();
  useEscape(show, onClose);

  if (!show) return null;

  const isDark = theme === 'dark';
  const modalBg = isDark ? 'bg-dark text-light' : 'bg-white text-dark';
  const borderClass = isDark ? 'border-light border-opacity-25' : 'border-light-subtle';
  const closeBtnClass = isDark ? 'btn-close-white' : '';

  const sizeClass = size !== 'md' ? `modal-${size}` : '';

  return (
    <div 
      className="modal fade show d-block bg-dark bg-opacity-50" 
      tabIndex="-1" 
      role="dialog" 
      onClick={onClose}
      style={{ zIndex: 1050, backdropFilter: 'blur(8px)' }}
    >
      <div 
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`} 
        role="document" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-content shadow-lg border-0 rounded-4 ${modalBg}`}>
          <div className={`modal-header ${borderless ? 'border-0 pb-0' : `border-bottom ${borderClass}`} px-4 py-3 d-flex justify-content-between align-items-center`}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              {icon && <i className={`bi ${icon}`}></i>}
              {title}
            </h5>
            <button 
              type="button" 
              className={`btn-close ${closeBtnClass}`}
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            {children}
          </div>
          {footer && (
            <div className={`modal-footer ${borderless ? 'border-0 pt-0' : `border-top ${borderClass}`} px-4 py-3`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
