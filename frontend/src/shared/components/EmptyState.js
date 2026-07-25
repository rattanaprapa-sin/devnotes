export default function EmptyState({ title, description, icon, actionLabel, onAction }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 mt-4 animate-fade-slide-up">
      <div className="position-relative mb-4">
        
        {/* Icon Container */}
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center position-relative shadow-sm bg-white" 
          style={{ 
            width: '80px', 
            height: '80px',
            border: '1px solid var(--bs-border-color-translucent)',
            zIndex: 1
          }}
        >
          <i className={`bi ${icon || 'bi-journals'} text-secondary fs-2`}></i>
        </div>
      </div>

      <h3 className="fw-bold text-dark mb-2">{title}</h3>
      <p className="text-secondary mb-4">{description}</p>
      
      {actionLabel && onAction && (
        <button 
          className="btn btn-dark rounded-pill px-4 py-2 fw-semibold shadow-sm hover-lift"
          onClick={onAction}
        >
          <i className="bi bi-plus-lg me-2"></i>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
