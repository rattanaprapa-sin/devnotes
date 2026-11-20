import React, { useState } from 'react';
import AppBadge from '../../../shared/ui/AppBadge';
import AppButton from '../../../shared/ui/AppButton';
import { getChecklistStats, formatMarkdownPreview } from '../../../shared/utils/checklistUtils';

export default function NoteCard({
  title,
  content,
  date,
  isPinned,
  isFlashcardMode,
  category,
  onTogglePin,
  onEdit,
  onDelete,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const checklistStats = getChecklistStats(content);
  const previewContent = formatMarkdownPreview(content);

  return (
    <div
      className={`card h-100 border shadow-sm rounded-4 overflow-hidden ${
        onClick ? 'hover-lift' : ''
      } ${
        isPinned
          ? 'border-warning bg-warning bg-opacity-10'
          : 'border-light-subtle'
      }`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="card-body app-card-body d-flex flex-column bg-white"
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
          {onTogglePin && (
            <button
              type="button"
              className={`btn btn-link p-0 d-flex align-items-center justify-content-center text-decoration-none shadow-none border-0 position-absolute ${
                isPinned ? 'text-warning' : 'text-secondary opacity-25'
              }`}
              style={{
                top: '0px',
                right: '-4px',
                width: '26px',
                height: '26px',
                transition: 'all 0.2s',
                zIndex: 2,
                lineHeight: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              title={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <i
                className={`bi ${
                  isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'
                }`}
                style={{ fontSize: '1.05rem' }}
              ></i>
            </button>
          )}
        </div>

        {category && (
          <div className="app-card-badge-wrap">
            <AppBadge
              color={category.color}
              className="px-2 fw-medium app-card-badge"
              style={{ fontSize: '0.75rem', paddingTop: '3px', paddingBottom: '3px' }}
            >
              {category.name}
            </AppBadge>
          </div>
        )}

        {/* Checklist Progress Indicator if note has tasks */}
        {checklistStats.hasChecklist && (
          <div className="app-card-checklist-wrap" style={{ marginBottom: '0.75rem' }}>
            <div
              className="d-flex align-items-center justify-content-between"
              style={{ marginBottom: '4px' }}
            >
              <span
                className={`badge rounded-pill d-inline-flex align-items-center px-2 app-card-checklist-badge ${
                  checklistStats.completed === checklistStats.total
                    ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                    : 'bg-light text-secondary border'
                }`}
                style={{ gap: '5px', paddingTop: '2px', paddingBottom: '2px', fontSize: '0.72rem' }}
              >
                <i
                  className={`bi ${
                    checklistStats.completed === checklistStats.total
                      ? 'bi-check-circle-fill text-success'
                      : 'bi-check2-square text-primary'
                  }`}
                ></i>
                <span className="fw-semibold">
                  {checklistStats.completed}/{checklistStats.total} done
                </span>
              </span>
              <span className="fw-bold text-secondary app-card-checklist-percent" style={{ fontSize: '0.74rem' }}>
                {checklistStats.percent}%
              </span>
            </div>
            <div
              className="progress rounded-pill overflow-hidden app-card-checklist-bar"
              style={{ height: '4px' }}
            >
              <div
                className={`progress-bar rounded-pill ${
                  checklistStats.completed === checklistStats.total
                    ? 'bg-success'
                    : 'bg-primary'
                }`}
                style={{
                  width: `${checklistStats.percent}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        <div
          className={`card-text flex-grow-1 text-secondary ${
            previewContent ? 'app-card-text' : 'mb-1'
          } ${
            isFlashcardMode && !isHovered ? 'bg-flashcard rounded' : ''
          }`}
          style={{
            display: '-webkit-box',
            lineClamp: 3,
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-line',
            fontSize: '0.92rem',
            lineHeight: '1.55',
            marginBottom: previewContent ? '0.9rem' : '0.2rem',
            pointerEvents: 'none',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          {previewContent}
        </div>

        <div
          className="d-flex justify-content-between align-items-center mt-auto border-top app-card-footer"
          style={{ paddingTop: '0.65rem' }}
        >
          <div className="d-flex align-items-center min-w-0" style={{ gap: '8px' }}>
            <small
              className="text-secondary fw-medium d-flex align-items-center app-card-meta flex-shrink-0"
              style={{ fontSize: '0.8rem' }}
            >
              <i className="bi bi-calendar3 me-1 me-md-2"></i>
              {date}
            </small>
          </div>

          <div className="d-flex" style={{ gap: '5px' }}>
            {onEdit && (
              <AppButton
                variant="light"
                className="bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0 hover-bg-secondary hover-text-white transition-all app-card-action-btn"
                style={{ width: '28px', height: '28px', padding: 0, fontSize: '0.78rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edit note"
                icon="bi-pencil-square"
              />
            )}
            {onDelete && (
              <AppButton
                variant="light"
                className="bg-light border-0 rounded-circle p-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0 hover-bg-danger hover-text-white transition-all app-card-action-btn"
                style={{ width: '28px', height: '28px', padding: 0, fontSize: '0.78rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete note"
                icon="bi-trash3"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
