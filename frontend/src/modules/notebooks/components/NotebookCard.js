export default function NotebookCard({ title, category, description, noteCount, isPinned, onTogglePin, onEdit, onDelete }) {
  const getCategoryClass = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'frontend': return 'badge-frontend';
      case 'backend': return 'badge-backend';
      case 'database': return 'badge-database';
      case 'devops': return 'badge-devops';
      case 'tooling': return 'badge-tooling';
      default: return 'badge-other';
    }
  };

  return (
    <div 
      className={`card h-100 rounded-4 p-2 bg-white hover-lift ${isPinned ? 'border-warning shadow' : 'border shadow-sm'}`}
      style={{ borderWidth: isPinned ? '2px' : '1px', cursor: 'pointer' }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex flex-column">
            <h5 className="card-title fw-bold mb-2 text-dark fs-5">
              {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
            </h5>
            <div>
              <span className={`badge rounded-pill px-3 py-2 fw-bold ${getCategoryClass(category)}`}>
                {category}
              </span>
            </div>
          </div>
          <button 
            className={`btn btn-link p-0 text-decoration-none shadow-none fs-5 ${isPinned ? 'text-warning' : 'text-secondary opacity-50'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePin) onTogglePin();
            }}
          >
            <i className={`bi ${isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}`}></i>
          </button>
        </div>
        <p className="card-text text-secondary flex-grow-1 fs-6 lh-base">
          {description}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-4 pt-2">
          <div className="text-secondary small d-flex align-items-center gap-2 fw-medium">
            <i className="bi bi-file-earmark-text"></i>
            <span>{noteCount} Notes</span>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
            >
              <i className="bi bi-pencil-square"></i>
            </button>
            <button 
              className="btn btn-light bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
