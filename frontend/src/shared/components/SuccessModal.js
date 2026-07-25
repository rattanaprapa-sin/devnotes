export default function SuccessModal({ show, onClose, title, message }) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-body p-5 text-center">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-check-circle-fill fs-1"></i>
              </div>
            </div>
            <h5 className="fw-bold mb-2">{title || 'Success!'}</h5>
            <p className="text-secondary small mb-4 lh-base">
              {message}
            </p>
            <button 
              className="btn btn-success fw-medium rounded-pill px-5" 
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
