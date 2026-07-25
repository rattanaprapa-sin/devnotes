import React from 'react';
import useEscape from '../hooks/useEscape';

export default function DeleteConfirmModal({ show, onClose, onConfirm, title, message, isDeleting }) {
  useEscape(show, onClose);

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-body p-5 text-center">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-trash3 fs-1"></i>
              </div>
            </div>
            <h5 className="fw-bold mb-2">{title || 'Are you sure?'}</h5>
            <p className="text-secondary small mb-4 lh-base">
              {message || 'Do you really want to delete this item? This process cannot be undone.'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button 
                className="btn btn-light fw-medium rounded-pill px-4 flex-grow-1" 
                onClick={onClose} 
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger fw-medium rounded-pill px-4 flex-grow-1" 
                onClick={onConfirm} 
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
