import React from 'react';
import { createPortal } from 'react-dom';
import useEscape from '../hooks/useEscape';
import AppButton from '../ui/AppButton';

export default function DeleteConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'bi-trash3',
}) {
  useEscape(show, onClose);

  if (!show) return null;

  const iconBgClass =
    variant === 'danger'
      ? 'bg-danger bg-opacity-10 text-danger'
      : variant === 'warning'
      ? 'bg-warning bg-opacity-15 text-warning'
      : 'bg-secondary bg-opacity-10 text-dark';

  const modalContent = (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      tabIndex="-1"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDeleting && onClose) onClose();
      }}
      style={{ zIndex: 1100, backdropFilter: 'blur(8px)' }}
    >
      <div
        className="modal-dialog modal-dialog-centered confirm-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-body p-4 p-sm-5 text-center confirm-modal-body">
            <div className="mb-3 mb-sm-4 confirm-modal-icon-wrap">
              <div
                className={`d-inline-flex align-items-center justify-content-center rounded-circle confirm-modal-icon-circle ${iconBgClass}`}
                style={{ width: '64px', height: '64px' }}
              >
                <i className={`bi ${icon} fs-1 confirm-modal-icon`}></i>
              </div>
            </div>
            <h5 className="fw-bold mb-2 confirm-modal-title">{title || 'Are you sure?'}</h5>
            <p className="text-secondary small mb-3 mb-sm-4 lh-base confirm-modal-message">
              {message || 'Are you sure you want to delete this item? This action cannot be undone'}
            </p>
            <div className="d-flex justify-content-center gap-2 confirm-modal-actions">
              <AppButton
                variant="light"
                className="border shadow-sm flex-grow-1"
                onClick={onClose}
                disabled={isDeleting}
              >
                {cancelText}
              </AppButton>
              <AppButton
                variant={variant}
                className="flex-grow-1"
                onClick={onConfirm}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                {confirmText}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
