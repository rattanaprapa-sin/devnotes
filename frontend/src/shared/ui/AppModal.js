import React, { useRef } from 'react';
import useEscape from '../hooks/useEscape';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppModal({ 
  show, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md', // sm, md, lg, xl
  maxWidth,
  dialogStyle,
  icon,
  borderless = false,
  closeOnBackdrop = true
}) {
  const { theme } = useTheme();
  useEscape(show, onClose);
  const isMouseDownInsideRef = useRef(false);

  if (!show) return null;

  const isDark = theme === 'dark';
  const modalBg = isDark ? 'bg-dark text-light' : 'bg-white text-dark';
  const borderClass = isDark ? 'border-light border-opacity-25' : 'border-light-subtle';
  const closeBtnClass = isDark ? 'btn-close-white' : '';

  const sizeClass = size !== 'md' ? `modal-${size}` : '';

  const handleMouseDown = (e) => {
    // Check if mousedown originated inside modal-content
    if (e.target.closest('.modal-content')) {
      isMouseDownInsideRef.current = true;
    } else {
      isMouseDownInsideRef.current = false;
    }
  };

  const handleBackdropClick = (e) => {
    // If the click started inside the modal (e.g. dragging text selection), do not close
    if (isMouseDownInsideRef.current) {
      isMouseDownInsideRef.current = false;
      return;
    }

    if (closeOnBackdrop && !e.target.closest('.modal-content')) {
      onClose?.();
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-backdrop {
          animation: modalBackdropFade 0.2s ease-out forwards;
        }
        .animate-modal {
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: max-width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
      <div 
        className="modal show d-block bg-dark bg-opacity-50 animate-backdrop" 
        tabIndex="-1" 
        role="dialog" 
        onMouseDown={handleMouseDown}
        onClick={handleBackdropClick}
        style={{ zIndex: 1050, backdropFilter: 'blur(8px)' }}
      >
        <div 
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass} animate-modal m-2 m-sm-auto`} 
          role="document" 
          style={{
            ...(maxWidth ? { maxWidth } : {}),
            ...dialogStyle,
          }}
        >
          <div 
            className={`modal-content shadow-lg border-0 rounded-4 ${modalBg}`} 
            onClick={(e) => e.stopPropagation()}
            style={{ transition: 'background-color 0.3s ease, border-color 0.3s ease' }}
          >
            <div className={`modal-header border-bottom ${borderClass} px-3 px-sm-4 py-3 d-flex justify-content-between align-items-center`}>
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
            <div className={`modal-body ${borderless ? 'pt-3 px-3 px-sm-4 pb-2' : 'p-3 p-sm-4'}`} style={{ transition: 'padding 0.3s ease' }}>
              {children}
            </div>
            {footer && (
              <div className={`modal-footer ${borderless ? 'border-0 pt-1 pb-3 px-3 px-sm-4' : `border-top ${borderClass} px-3 px-sm-4 py-3`}`}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
