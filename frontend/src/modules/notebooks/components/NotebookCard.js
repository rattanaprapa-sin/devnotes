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
      className={`card h-100 rounded-4 p-2 bg-white hover-lift ${isPinned ? 'border-warning shadow' : 'border shadow-sm'}`}
      style={{ borderWidth: isPinned ? '2px' : '1px', cursor: 'pointer' }}
    >
      <div className="card-body d-flex flex-column">
        <div className="mb-3 position-relative">
          <div className="d-flex flex-column pe-4">
            <h5 className="card-title fw-bold mb-2 text-dark fs-5">
              {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
            </h5>
            <div>
              <span 
                className="badge rounded-pill px-3 py-2 fw-bold"
                style={getCategoryStyle(categoryObj, category)}
              >
                {categoryObj?.name || category || 'Other'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-link p-0 text-decoration-none shadow-none fs-5 border-0 position-absolute ${isPinned ? 'text-warning' : 'text-secondary opacity-50'}`}
            style={{ top: '0px', right: '4px', zIndex: 2, transition: 'all 0.2s', lineHeight: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePin) onTogglePin();
            }}
          >
            <i className={`bi ${isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}`}></i>
          </button>
        </div>
        <p 
          className="card-text text-secondary fs-6 lh-base mb-0"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {description}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
          <div className="text-secondary small d-flex align-items-center gap-2 fw-medium">
            <i className="bi bi-file-earmark-text"></i>
            <span>{noteCount} Notes</span>
          </div>
          <div className="d-flex gap-2">
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0 hover-bg-secondary hover-text-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
              icon="bi-pencil-square"
            />
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0 hover-bg-danger hover-text-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
              icon="bi-trash3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
