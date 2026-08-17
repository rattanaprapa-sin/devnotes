import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppBadge({ 
  children, 
  color = '#0d6efd', // Default primary blue
  className = '',
  style = {}
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <span 
      className={`badge rounded-pill px-3 py-1 fw-medium text-truncate ${className}`}
      style={{ 
        backgroundColor: isDark ? `${color}4D` : `${color}15`, 
        color: isDark ? 'rgba(255, 255, 255, 0.85)' : color,
        border: isDark ? `1px solid ${color}66` : 'none',
        maxWidth: '150px',
        ...style
      }}
    >
      {children}
    </span>
  );
}
