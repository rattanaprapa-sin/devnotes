import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';

const PICKER_WIDTH = 196;
const GAP = 6;

export default function TableGridPicker({ onSelectTable, onOpenEditor, onClose, anchorRef }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);
  const [pos, setPos] = useState(null);
  const popoverRef = useRef(null);

  const maxRows = 6;
  const maxCols = 6;

  // Position the picker relative to the Table button (fixed, rendered in <body>)
  // so it is never clipped by the modal and never causes the modal to scroll.
  const updatePos = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const height = popoverRef.current?.offsetHeight || 200;

    let left = rect.right - PICKER_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - PICKER_WIDTH - 8));

    let top = rect.bottom + GAP;
    // Flip above the button if there is not enough room below
    if (top + height > window.innerHeight - 8 && rect.top - GAP - height > 8) {
      top = rect.top - GAP - height;
    }
    top = Math.max(8, Math.min(top, window.innerHeight - height - 8));

    setPos({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    updatePos();
  }, [updatePos]);

  useEffect(() => {
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [updatePos]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !e.target.closest('.table-picker-toggle-btn')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCellClick = (r, c) => {
    if (onOpenEditor) {
      onOpenEditor(r, c);
    } else {
      onSelectTable(r, c, 'left');
    }
    onClose();
  };

  const hasHover = hoveredRow > 0 && hoveredCol > 0;

  const picker = (
    <div
      ref={popoverRef}
      className={`position-fixed shadow-lg rounded-3 border ${
        isDark ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border'
      }`}
      style={{
        zIndex: 99999,
        top: pos ? `${pos.top}px` : 0,
        left: pos ? `${pos.left}px` : 0,
        visibility: pos ? 'visible' : 'hidden',
        width: `${PICKER_WIDTH}px`,
        padding: '10px 12px',
        boxShadow: isDark
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-table text-primary" style={{ fontSize: '0.9rem' }}></i>
          <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>
            {hasHover ? (
              <span className="text-primary fw-bold">
                {hoveredCol} × {hoveredRow} Table
              </span>
            ) : (
              <span>Insert Table</span>
            )}
          </span>
        </div>
        <button
          type="button"
          className={`btn-close ${isDark ? 'btn-close-white' : ''}`}
          style={{ fontSize: '0.62rem' }}
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      {/* 6x6 Grid Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maxCols}, 21px)`,
          gap: '4px',
          justifyContent: 'center',
        }}
        onMouseLeave={() => {
          setHoveredRow(0);
          setHoveredCol(0);
        }}
      >
        {Array.from({ length: maxRows }).map((_, rIdx) => {
          const r = rIdx + 1;
          return Array.from({ length: maxCols }).map((_, cIdx) => {
            const c = cIdx + 1;
            const isHighlighted = r <= hoveredRow && c <= hoveredCol;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: '21px',
                  height: '21px',
                  borderRadius: '4px',
                  border: '1.5px solid',
                  borderColor: isHighlighted
                    ? isDark ? '#818cf8' : '#4f46e5'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.16)'
                    : '#e2e8f0',
                  backgroundColor: isHighlighted
                    ? isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(79, 70, 229, 0.15)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.08s ease',
                }}
                onMouseEnter={() => {
                  setHoveredRow(r);
                  setHoveredCol(c);
                }}
                onClick={() => handleCellClick(r, c)}
              />
            );
          });
        })}
      </div>

      {/* Subtle hint */}
      <div
        className="text-center text-secondary opacity-75 mt-1.5"
        style={{ fontSize: '0.68rem' }}
      >
        Click cell to insert
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(picker, document.body);
}

