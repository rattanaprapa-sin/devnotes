import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { theme } = useTheme();
  
  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const isDark = theme === 'dark';
  
  const getButtonClass = (isActive) => {
    if (isActive) {
      return `btn ${isDark ? 'btn-light text-dark' : 'btn-dark text-white'} rounded-3 shadow-sm fw-bold`;
    }
    return `btn ${isDark ? 'btn-outline-secondary text-light border-0' : 'btn-outline-secondary text-dark border-0'} rounded-3 fw-medium`;
  };
  
  return (
    <nav className="d-flex justify-content-center mt-5 mb-3 w-100">
      <div className={`d-flex align-items-center gap-1 p-2 rounded-4 shadow-sm ${isDark ? 'bg-dark border border-secondary' : 'bg-white border'}`}>
        <button 
          className={`btn ${isDark ? 'btn-outline-secondary text-light border-0' : 'btn-outline-secondary text-dark border-0'} rounded-3 d-flex align-items-center justify-content-center`}
          style={{ width: '40px', height: '40px' }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={index} className={`px-1 fw-bold ${isDark ? 'text-secondary' : 'text-muted'}`}>...</span>
            );
          }
          
          const isActive = currentPage === page;
          
          return (
            <button 
              key={index}
              className={getButtonClass(isActive)}
              style={{ width: '40px', height: '40px' }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
        
        <button 
          className={`btn ${isDark ? 'btn-outline-secondary text-light border-0' : 'btn-outline-secondary text-dark border-0'} rounded-3 d-flex align-items-center justify-content-center`}
          style={{ width: '40px', height: '40px' }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </nav>
  );
}
