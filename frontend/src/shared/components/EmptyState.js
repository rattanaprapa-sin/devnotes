import AppButton from '../ui/AppButton';

export default function EmptyState({ title, description, icon, actionLabel, onAction }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 mt-4 animate-fade-slide-up w-100">
      <div className="position-relative mb-4">
        {/* Icon Container */}
        <div className="empty-state-icon rounded-circle d-flex align-items-center justify-content-center position-relative shadow-sm bg-white border border-secondary border-opacity-25">
          <i className={`bi ${icon || 'bi-journals'} text-secondary fs-2`}></i>
        </div>
      </div>

      <h4 className="fw-semibold text-secondary mb-2 opacity-75">{title}</h4>
      <p className="text-secondary mb-4 opacity-75">{description}</p>
      
      {actionLabel && onAction && (
        <AppButton 
          variant="dark"
          className="shadow-sm hover-lift mt-2 py-2"
          onClick={onAction}
          icon="bi-plus-lg"
        >
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
}
