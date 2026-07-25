import React, { useState } from 'react';

export default function NoteCard({ title, content, date, isPinned, isFlashcardMode, onTogglePin, onEdit, onDelete, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`card h-100 border shadow-sm rounded-4 overflow-hidden ${onClick ? 'hover-lift' : ''} ${isPinned ? 'border-warning bg-warning bg-opacity-10' : 'border-light-subtle'}`} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-body p-4 d-flex flex-column bg-white">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h4 className="card-title fw-bolder text-dark mb-0 pe-2">
            {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
          </h4>
          {onTogglePin && (
            <button 
              className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 ${isPinned ? 'text-warning' : 'text-secondary opacity-25 hover-opacity-100'}`}
              style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              title={isPinned ? "Unpin note" : "Pin note"}
            >
              <i className={isPinned ? "bi bi-pin-angle-fill fs-5" : "bi bi-pin-angle fs-5"}></i>
            </button>
          )}
        </div>
        <div 
          className={`card-text mb-4 flex-grow-1 fs-6 ${isFlashcardMode && !isHovered ? 'bg-secondary bg-opacity-25 rounded' : 'text-secondary'}`} 
          style={{
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            transition: 'all 0.3s ease',
            ...(isFlashcardMode && !isHovered ? {
              color: 'transparent',
              textShadow: '0 0 10px rgba(0,0,0,0.3)',
              userSelect: 'none'
            } : {})
          }}
        >
          {content}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
          <small className="text-secondary fw-medium d-flex align-items-center">
            <i className="bi bi-calendar3 me-2"></i>
            {date}
          </small>
          
          <div className="d-flex gap-2">
            {onEdit && (
              <button 
                className="btn btn-light bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0 hover-opacity"
                style={{ width: '36px', height: '36px', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.classList.replace('bg-light', 'bg-secondary'); e.currentTarget.classList.replace('text-secondary', 'text-white'); }}
                onMouseLeave={(e) => { e.currentTarget.classList.replace('bg-secondary', 'bg-light'); e.currentTarget.classList.replace('text-white', 'text-secondary'); }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edit note"
              >
                <i className="bi bi-pencil-square fs-6"></i>
              </button>
            )}
            {onDelete && (
              <button 
                className="btn btn-light bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0 hover-opacity"
                style={{ width: '36px', height: '36px', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.classList.replace('bg-light', 'bg-danger'); e.currentTarget.classList.replace('text-danger', 'text-white'); }}
                onMouseLeave={(e) => { e.currentTarget.classList.replace('bg-danger', 'bg-light'); e.currentTarget.classList.replace('text-white', 'text-danger'); }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete note"
              >
                <i className="bi bi-trash3 fs-6"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
