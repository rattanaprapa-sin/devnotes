import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useClickOutside from '../hooks/useClickOutside';
import { DEFAULT_CATEGORY_COLOR } from '../constants/colors';
import { isCategoryHidden } from '../utils/categoryUtils';

export default function CreatableCategorySelect({
  label,
  categories = [],
  value = '',
  onChange,
  customName = '',
  onCustomNameChange,
  onCreateCategory,
  placeholder = 'Select or type to create category...',
  emptyOptionLabel = 'None / Other',
  containerClassName = 'mb-3',
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const selectedCategory = categories.find((c) => c.id === value) || null;

  const wrapperRef = useClickOutside(() => {
    if (isOpen) {
      setIsOpen(false);
      setIsTyping(false);
    }
  });

  // Determine what text to show in the input
  const displayValue = isOpen && isTyping
    ? searchText
    : selectedCategory
    ? selectedCategory.name
    : customName || '';

  const trimmedCurrent = (isOpen && isTyping ? searchText : customName).trim();

  const exactMatch = trimmedCurrent
    ? categories.find(
        (c) => (c.name || '').toLowerCase() === trimmedCurrent.toLowerCase()
      )
    : null;

  const visibleCategories = categories.filter(
    (c) => c.id === value || !isCategoryHidden(c)
  );

  const filteredCategories =
    isOpen && isTyping && trimmedCurrent
      ? visibleCategories.filter((c) =>
          (c.name || '').toLowerCase().includes(trimmedCurrent.toLowerCase())
        )
      : visibleCategories;

  const handleFocus = () => {
    setIsOpen(true);
    setIsTyping(false);
    setSearchText(selectedCategory ? selectedCategory.name : customName || '');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setIsOpen(true);
    setIsTyping(true);
    setSearchText(val);

    const trimmed = val.trim();
    if (!trimmed) {
      if (onChange) onChange('');
      if (onCustomNameChange) onCustomNameChange('');
      return;
    }

    const matched = categories.find(
      (c) => (c.name || '').toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) {
      if (onChange) onChange(matched.id);
      if (onCustomNameChange) onCustomNameChange('');
    } else {
      if (onChange) onChange('');
      if (onCustomNameChange) onCustomNameChange(val);
    }
  };

  const handleSelectOption = (catId) => {
    if (onChange) onChange(catId);
    if (onCustomNameChange) onCustomNameChange('');
    setSearchText('');
    setIsTyping(false);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!trimmedCurrent || exactMatch || isCreating) return;
    if (!onCreateCategory) {
      setIsTyping(false);
      setIsOpen(false);
      return;
    }

    try {
      setIsCreating(true);
      const created = await onCreateCategory(trimmedCurrent, DEFAULT_CATEGORY_COLOR);
      if (created?.id) {
        if (onChange) onChange(created.id);
        if (onCustomNameChange) onCustomNameChange('');
      }
      setSearchText('');
      setIsTyping(false);
      setIsOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exactMatch) {
        handleSelectOption(exactMatch.id);
      } else if (trimmedCurrent) {
        handleCreateNew();
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsTyping(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange('');
    if (onCustomNameChange) onCustomNameChange('');
    setSearchText('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const activeColor = selectedCategory
    ? selectedCategory.color || DEFAULT_CATEGORY_COLOR
    : customName.trim()
    ? DEFAULT_CATEGORY_COLOR
    : null;

  const labelColor = isDark ? 'text-light opacity-75' : 'text-secondary';
  const inputBg = isDark ? 'bg-dark text-white border-light border-opacity-10' : 'bg-light';

  return (
    <div className={`position-relative ${containerClassName}`} ref={wrapperRef}>
      {label && (
        <label className={`form-label fw-semibold small mb-1 ${labelColor}`}>
          {label}
        </label>
      )}

      <div
        className={`form-control d-flex align-items-center gap-2 px-3 py-2 ${inputBg}`}
        style={{
          cursor: 'text',
          transition: 'border-color 0.15s, background-color 0.15s',
          boxShadow: 'none',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Color dot indicator when a category or new gray category is active */}
        {activeColor ? (
          <span
            className="rounded-circle flex-shrink-0"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: activeColor,
            }}
          />
        ) : (
          <i
            className={`bi bi-tag flex-shrink-0 ${
              isDark ? 'text-light opacity-50' : 'text-secondary opacity-75'
            }`}
            style={{ fontSize: '0.88rem' }}
          ></i>
        )}

        <input
          ref={inputRef}
          type="text"
          className="border-0 bg-transparent flex-grow-1 p-0"
          placeholder={placeholder}
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            color: isDark ? '#ffffff' : '#212529',
            outline: 'none',
            fontSize: '0.95rem',
            minWidth: 0,
          }}
        />

        {/* Badge when a new category name is typed */}
        {!selectedCategory && customName.trim() && (
          <span
            className="badge rounded-pill flex-shrink-0"
            style={{
              backgroundColor: 'rgba(108, 117, 125, 0.15)',
              color: isDark ? '#cbd5e1' : '#6c757d',
              border: '1px solid rgba(108, 117, 125, 0.35)',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            New
          </span>
        )}

        {(selectedCategory || customName) && (
          <button
            type="button"
            className="btn btn-sm p-0 border-0 text-secondary opacity-50 hover-opacity flex-shrink-0 d-flex align-items-center"
            onClick={handleClear}
            title="Clear category"
          >
            <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
          </button>
        )}

        <button
          type="button"
          className="btn btn-sm p-0 border-0 text-secondary opacity-75 flex-shrink-0 d-flex align-items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              setIsTyping(false);
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          tabIndex={-1}
        >
          <i
            className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}
            style={{ fontSize: '0.8rem' }}
          ></i>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`position-absolute w-100 mt-1 rounded-3 shadow border overflow-auto ${
            isDark ? 'bg-dark border-secondary border-opacity-50' : 'bg-white'
          }`}
          style={{
            zIndex: 1060,
            maxHeight: '220px',
            padding: '6px',
          }}
        >
          {/* Option to create new category when typed text doesn't match existing */}
          {trimmedCurrent && !exactMatch && (
            <button
              type="button"
              disabled={isCreating}
              className={`btn btn-sm w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-2 mb-1 ${
                isDark ? 'text-light hover-bg-secondary' : 'text-dark bg-light'
              }`}
              style={{ border: '1px dashed rgba(108, 117, 125, 0.4)' }}
              onClick={handleCreateNew}
            >
              <span className="d-flex align-items-center gap-2 text-truncate">
                <i className="bi bi-plus-circle-fill text-secondary"></i>
                <span className="small fw-semibold">Create</span>
                <span
                  className="badge rounded-pill text-truncate"
                  style={{
                    backgroundColor: 'rgba(108, 117, 125, 0.15)',
                    color: isDark ? '#e2e8f0' : '#495057',
                    border: '1px solid rgba(108, 117, 125, 0.35)',
                    maxWidth: '180px',
                  }}
                >
                  {trimmedCurrent}
                </span>
              </span>
              <small className="text-secondary ms-2 flex-shrink-0" style={{ fontSize: '0.72rem' }}>
                {isCreating ? 'Creating...' : 'Enter ↵'}
              </small>
            </button>
          )}

          {/* None / Clear Option */}
          {(!isTyping || !trimmedCurrent) && (
            <button
              type="button"
              className={`btn btn-sm w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-2 ${
                !value && !customName
                  ? isDark
                    ? 'bg-secondary bg-opacity-25 text-white fw-semibold'
                    : 'bg-light text-dark fw-semibold'
                  : isDark
                  ? 'text-secondary'
                  : 'text-secondary'
              }`}
              onClick={() => handleSelectOption('')}
            >
              <span className="small">{emptyOptionLabel}</span>
              {!value && !customName && <i className="bi bi-check2"></i>}
            </button>
          )}

          {/* Existing Categories List */}
          {filteredCategories.map((cat) => {
            const isSelected = value === cat.id && !customName;
            return (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-2 ${
                  isSelected
                    ? isDark
                      ? 'bg-secondary bg-opacity-25 text-white fw-semibold'
                      : 'bg-light text-dark fw-semibold'
                    : isDark
                    ? 'text-light'
                    : 'text-dark'
                }`}
                onClick={() => handleSelectOption(cat.id)}
              >
                <span className="d-flex align-items-center gap-2 text-truncate">
                  <span
                    className="rounded-circle flex-shrink-0"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: cat.color || DEFAULT_CATEGORY_COLOR,
                    }}
                  />
                  <span className="small text-truncate">{cat.name}</span>
                </span>
                {isSelected && <i className="bi bi-check2 text-primary"></i>}
              </button>
            );
          })}

          {filteredCategories.length === 0 && !trimmedCurrent && (
            <div className="text-center py-2 text-secondary small opacity-75">
              Type above to create your first category
            </div>
          )}
        </div>
      )}
    </div>
  );
}

