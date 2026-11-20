import { useTheme } from '../../../contexts/ThemeContext';
import AppButton from '../../../shared/ui/AppButton';

export default function NotebookCard({ title, category, categoryObj, description, noteCount, isPinned, onTogglePin, onEdit, onDelete }) {
  const { theme } = useTheme();
  
  const getCategoryStyle = (catObj, catStr) => {
    if (catObj && catObj.color) {
      const isDark = theme === 'dark';
      const bg = isDark ? `${catObj.color}4D` : `${catObj.color}15`;
      const border = isDark ? `${catObj.color}66` : `${catObj.color}30`;
      const textColor = isDark ? '#fff' : catObj.color;
      return { backgroundColor: bg, color: textColor, border: `1px solid ${border}` };
    }
    
    const catLower = (catStr || 'Other').toLowerCase();
    
    // predefined colors for standard categories
    const standardColors = {
      'frontend': { light: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' }, dark: { bg: 'rgba(209, 250, 229, 0.15)', color: '#6ee7b7', border: 'rgba(110, 231, 183, 0.3)' } },
      'backend': { light: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' }, dark: { bg: 'rgba(219, 234, 254, 0.15)', color: '#93c5fd', border: 'rgba(147, 197, 253, 0.3)' } },
      'database': { light: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' }, dark: { bg: 'rgba(254, 243, 199, 0.15)', color: '#fcd34d', border: 'rgba(252, 211, 77, 0.3)' } },
      'devops': { light: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' }, dark: { bg: 'rgba(254, 226, 226, 0.15)', color: '#fca5a5', border: 'rgba(252, 165, 165, 0.3)' } },
      'tooling': { light: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' }, dark: { bg: 'rgba(243, 244, 246, 0.15)', color: '#d1d5db', border: 'rgba(209, 213, 219, 0.3)' } },
      'other': { light: { bg: '#f5f3ff', color: '#5b21b6', border: '#c4b5fd' }, dark: { bg: 'rgba(245, 243, 255, 0.15)', color: '#c4b5fd', border: 'rgba(196, 181, 253, 0.3)' } }
    };

    if (standardColors[catLower]) {
      const mode = theme === 'dark' ? 'dark' : 'light';
      const colors = standardColors[catLower][mode];
      return { backgroundColor: colors.bg, color: colors.color, border: `1px solid ${colors.border}` };
    }

    // Hash string to generate a hue
    let hash = 0;
    for (let i = 0; i < catLower.length; i++) {
      hash = catLower.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;

    if (theme === 'dark') {
      return {
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.15)`,
        color: `hsl(${hue}, 80%, 75%)`,
        border: `1px solid hsla(${hue}, 70%, 50%, 0.3)`
      };
    } else {
      return {
        backgroundColor: `hsl(${hue}, 85%, 95%)`,
        color: `hsl(${hue}, 75%, 35%)`,
        border: `1px solid hsl(${hue}, 80%, 85%)`
      };
    }
  };

  return (
    <div 
      className={`card h-100 rounded-4 overflow-hidden bg-white hover-lift ${isPinned ? 'border-warning shadow' : 'border shadow-sm'}`}
      style={{ borderWidth: isPinned ? '2px' : '1px', cursor: 'pointer' }}
    >
      <div
        className="card-body app-card-body d-flex flex-column"
      >
        <div className="mb-1 mb-md-2 position-relative">
          <h5
            className="card-title fw-bold text-dark mb-0 pe-4"
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              lineClamp: 2,
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={title}
          >
            {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
          </h5>
          <button
            type="button"
            className={`btn btn-link p-0 d-flex align-items-center justify-content-center text-decoration-none shadow-none border-0 position-absolute ${isPinned ? 'text-warning' : 'text-secondary opacity-50'}`}
            style={{
              top: '0px',
              right: '-4px',
              width: '26px',
              height: '26px',
              zIndex: 2,
              transition: 'all 0.2s',
              lineHeight: 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePin) onTogglePin();
            }}
          >
            <i
              className={`bi ${isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}`}
              style={{ fontSize: '1.05rem' }}
            ></i>
          </button>
        </div>

        <div className="app-card-badge-wrap">
          <span 
            className="badge rounded-pill fw-medium app-card-badge"
            style={{
              ...getCategoryStyle(categoryObj, category),
              fontSize: '0.75rem',
              padding: '3px 10px',
            }}
          >
            {categoryObj?.name || category || 'Other'}
          </span>
        </div>

        {description && (
          <p 
            className="card-text text-secondary flex-grow-1 app-card-text d-none d-md-block"
            title={description}
            style={{
              display: '-webkit-box',
              lineClamp: 3,
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.92rem',
              lineHeight: '1.55',
              marginBottom: '0.9rem',
            }}
          >
            {description}
          </p>
        )}

        <div
          className="d-flex justify-content-between align-items-center mt-auto border-top app-card-footer"
          style={{ paddingTop: '0.65rem' }}
        >
          <div
            className="text-secondary d-flex align-items-center fw-medium app-card-meta min-w-0"
            style={{ fontSize: '0.8rem', gap: '8px' }}
          >
            <span className="d-flex align-items-center flex-shrink-0" style={{ gap: '4px' }}>
              <i className="bi bi-file-earmark-text"></i>
              <span>{noteCount} Notes</span>
            </span>
          </div>
          <div className="d-flex" style={{ gap: '5px' }}>
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0 hover-bg-secondary hover-text-white transition-all app-card-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px', padding: 0, fontSize: '0.78rem' }}
              icon="bi-pencil-square"
            />
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0 hover-bg-danger hover-text-white transition-all app-card-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px', padding: 0, fontSize: '0.78rem' }}
              icon="bi-trash3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
