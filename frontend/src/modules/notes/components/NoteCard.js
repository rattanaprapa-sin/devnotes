import React, { useState } from 'react';
import AppBadge from '../../../shared/ui/AppBadge';
import AppButton from '../../../shared/ui/AppButton';

export default function NoteCard({ title, content, date, isPinned, isFlashcardMode, category, onTogglePin, onEdit, onDelete, onClick }) {
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
        <div className="mb-3 position-relative">
          <h4 className="card-title fw-bolder text-dark mb-0 pe-4">
            {title ? title.charAt(0).toUpperCase() + title.slice(1) : ''}
          </h4>
          {onTogglePin && (
            <button
              type="button"
              className={`btn btn-link p-0 d-flex align-items-center justify-content-center text-decoration-none shadow-none border-0 position-absolute ${isPinned ? 'text-warning' : 'text-secondary opacity-25'}`}
              style={{ top: '0px', right: '-4px', width: '28px', height: '28px', transition: 'all 0.2s', zIndex: 2, lineHeight: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              title={isPinned ? "Unpin note" : "Pin note"}
            >
              <i className={`bi ${isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'} fs-5`}></i>
            </button>
          )}
        </div>
        
        {category && (
          <div className="mb-3">
            <AppBadge 
              color={category.color} 
              className="px-2 py-1 fw-medium"
            >
              {category.name}
            </AppBadge>
          </div>
        )}

        <div 
          className={`card-text mb-4 flex-grow-1 fs-6 text-secondary ${isFlashcardMode && !isHovered ? 'bg-flashcard rounded' : ''}`} 
          style={{
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            transition: 'background-color 0.3s ease, color 0.3s ease'
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
              <AppButton 
                variant="light"
                className="bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0 hover-bg-secondary hover-text-white transition-all"
                style={{ width: '36px', height: '36px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edit note"
                icon="bi-pencil-square fs-6"
              />
            )}
            {onDelete && (
              <AppButton 
                variant="light"
                className="bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0 hover-bg-danger hover-text-white transition-all"
                style={{ width: '36px', height: '36px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete note"
                icon="bi-trash3 fs-6"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
