import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import useLocalStorage from '../../../shared/hooks/useLocalStorage';
import useClickOutside from '../../../shared/hooks/useClickOutside';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';
import { STICKY_COLOR_THEMES } from '../../../shared/constants/colors';

const DEFAULT_STATE = {
  color: 'yellow',
  isCollapsed: true,
  tasks: [
    { id: '1', text: 'Welcome to DevNotes!', completed: true },
    { id: '2', text: 'Try adding your first task here', completed: false },
    { id: '3', text: 'Organize notes with Markdown & Checklists', completed: false },
  ],
};

export default function StickyChecklist() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const storageKey = `devnotes_sticky_checklist_${user?.id || 'guest'}`;

  const [state, setState] = useLocalStorage(storageKey, DEFAULT_STATE);
  const [newText, setNewText] = useState('');
  const [isPillHovered, setIsPillHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const closeTimerRef = useRef(null);

  // Fallback defaults in case older localstorage data exists without properties
  const color = state?.color && STICKY_COLOR_THEMES[state.color] ? state.color : 'yellow';
  const isCollapsed = Boolean(state?.isCollapsed);
  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];

  const isDark = theme === 'dark';
  const themeConfig = STICKY_COLOR_THEMES[color];
  const palette = themeConfig[isDark ? 'dark' : 'light'];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const triggerClose = useCallback(() => {
    if (isCollapsed || isClosing) return;
    setIsClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      setState((prev) => ({
        ...prev,
        isCollapsed: true,
      }));
    }, 220);
  }, [isCollapsed, isClosing, setState]);

  const containerRef = useClickOutside(() => {
    if (!isCollapsed && !isClosing && !taskToDelete && !showClearConfirm) {
      triggerClose();
    }
  });

  const handleAddTask = (e) => {
    e?.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    const newTask = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
    };

    setState((prev) => ({
      ...prev,
      tasks: [...(prev?.tasks || []), newTask],
    }));
    setNewText('');
  };

  const handleToggleTask = (id) => {
    setState((prev) => ({
      ...prev,
      tasks: (prev?.tasks || []).map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const handleDeleteTask = (id) => {
    const target = tasks.find((t) => t.id === id);
    if (target) setTaskToDelete(target);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    setState((prev) => ({
      ...prev,
      tasks: (prev?.tasks || []).filter((t) => t.id !== taskToDelete.id),
    }));
    setTaskToDelete(null);
  };

  const handleClearCompleted = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCompleted = () => {
    setState((prev) => ({
      ...prev,
      tasks: (prev?.tasks || []).filter((t) => !t.completed),
    }));
    setShowClearConfirm(false);
  };

  const handleSelectColor = (selectedColor) => {
    setState((prev) => ({
      ...prev,
      color: selectedColor,
    }));
  };

  const handleToggleCollapse = () => {
    if (!isCollapsed) {
      triggerClose();
    } else {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setIsClosing(false);
      setIsPillHovered(false);
      setState((prev) => ({
        ...prev,
        isCollapsed: false,
      }));
    }
  };

  return (
    <div
      ref={containerRef}
      className="sticky-checklist-wrapper"
    >
      {/* --- Floating Pill Trigger (Top-Right on Desktop, Centered on Mobile/Tablet) --- */}
      {isCollapsed && (
        <button
          type="button"
          className="btn rounded-pill d-flex align-items-center gap-2 sticky-checklist-trigger animate-sticky-pill-in"
          style={{
            pointerEvents: 'auto',
            background: palette.pillGradient,
            border: `1.5px solid ${palette.strongBorder}`,
            color: palette.text,
            padding: '6px 12px 6px 7px',
            transform: isPillHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
            boxShadow: isPillHovered
              ? `0 12px 24px -4px ${palette.shadow}, 0 4px 10px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,${isDark ? '0.12' : '0.85'})`
              : `0 6px 16px -3px ${palette.shadow}, 0 2px 6px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,${isDark ? '0.08' : '0.75'})`,
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={() => setIsPillHovered(true)}
          onMouseLeave={() => setIsPillHovered(false)}
          onClick={handleToggleCollapse}
          title="Open Sticky Checklist"
        >
          {/* Left Icon Circle */}
          <span
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 sticky-checklist-trigger-icon"
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: themeConfig.accentBg,
              color: '#ffffff',
              boxShadow: `0 2px 6px ${palette.shadow}`,
              fontSize: '0.85rem',
            }}
          >
            <i className="bi bi-check2-square"></i>
          </span>

          {/* Label */}
          <span
            className="fw-bold sticky-checklist-trigger-label"
            style={{
              fontSize: '0.84rem',
              letterSpacing: '-0.2px',
              paddingRight: totalTasks > 0 ? '0' : '2px',
            }}
          >
            Sticky Checklist
          </span>

          {/* Task Progress Counter Badge */}
          {totalTasks > 0 && (
            <span
              className="badge rounded-pill fw-bold sticky-checklist-trigger-badge"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                color: palette.text,
                border: `1px solid ${palette.strongBorder}`,
                fontSize: '0.72rem',
                padding: '3px 8px',
              }}
            >
              {completedTasks}/{totalTasks}
            </span>
          )}

          {/* Chevron Indicator */}
          <span
            className="rounded-circle d-flex align-items-center justify-content-center sticky-checklist-trigger-chevron"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: palette.text,
              transition: 'transform 0.2s ease',
              transform: isPillHovered ? 'translateY(1px)' : 'translateY(0)',
            }}
          >
            <i className="bi bi-chevron-down" style={{ fontSize: '0.68rem', WebkitTextStroke: '0.4px' }}></i>
          </span>
        </button>
      )}

      {/* --- Floating Sticky Note Paper (Top-Right Popover) --- */}
      {!isCollapsed && (
        <div
          className={`position-relative sticky-checklist-popover ${
            isClosing ? 'animate-sticky-note-close' : 'animate-sticky-note-open'
          }`}
        >
          {/* Decorative Tape Header */}
          <div
            className="position-absolute top-0 start-50 translate-middle shadow-sm rounded-1"
            style={{
              width: '68px',
              height: '12px',
              backgroundColor: palette.tape,
              opacity: 0.9,
              zIndex: 3,
              transform: 'rotate(-1.5deg)',
              transition: 'background-color 0.3s ease',
            }}
          />

          {/* Sticky Note Board */}
          <div
            className="rounded-4 position-relative overflow-hidden sticky-checklist-card"
            style={{
              backgroundColor: palette.bg,
              border: `1.5px solid ${palette.strongBorder}`,
              color: palette.text,
              padding: '1.25rem 1.3rem 1.15rem',
              boxShadow: isDark
                ? '0 18px 40px rgba(0,0,0,0.65)'
                : `0 18px 38px -6px ${palette.shadow}, 0 6px 16px -4px rgba(0,0,0,0.08)`,
              transition:
                'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* Header Row */}
            <div className="d-flex align-items-center justify-content-between flex-nowrap mb-3 sticky-checklist-header user-select-none">
              <div
                className="d-flex align-items-center gap-2"
                style={{ cursor: 'pointer' }}
                onClick={handleToggleCollapse}
                title="Click to collapse"
              >
                <span
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 sticky-checklist-card-icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: themeConfig.accentBg,
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxShadow: `0 2px 6px ${palette.shadow}`,
                  }}
                >
                  <i className="bi bi-check2-square"></i>
                </span>
                <h6
                  className="mb-0 fw-bold sticky-checklist-card-title text-nowrap"
                  style={{
                    color: palette.text,
                    fontSize: '0.96rem',
                    letterSpacing: '-0.2px',
                    transition: 'color 0.3s ease',
                  }}
                >
                  Sticky Checklist
                </h6>
              </div>

              <div className="d-flex align-items-center sticky-checklist-controls" style={{ gap: '10px' }}>
                {/* Color dots picker */}
                <div
                  className="d-flex align-items-center rounded-pill sticky-checklist-color-picker"
                  style={{
                    gap: '7px',
                    padding: '4px 8px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  {Object.entries(STICKY_COLOR_THEMES).map(([colorKey, cfg]) => {
                    const isSelected = color === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        className="border-0 rounded-circle p-0 d-block sticky-checklist-color-dot"
                        style={{
                          width: '13px',
                          height: '13px',
                          backgroundColor: cfg.dot,
                          cursor: 'pointer',
                          boxShadow: isSelected
                            ? `0 0 0 1.5px ${isDark ? '#1f1a0d' : '#ffffff'}, 0 0 0 3px ${palette.text}`
                            : 'none',
                          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                        }}
                        onClick={() => handleSelectColor(colorKey)}
                        title={`${cfg.name} theme`}
                      />
                    );
                  })}
                </div>

                {/* Minimize / Collapse Button */}
                <button
                  type="button"
                  className="btn btn-sm p-0 rounded-circle border-0 d-flex align-items-center justify-content-center flex-shrink-0 sticky-checklist-collapse-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: palette.text,
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={handleToggleCollapse}
                  title="Collapse Sticky Checklist"
                >
                  <i className="bi bi-chevron-up" style={{ fontSize: '0.78rem', WebkitTextStroke: '0.3px' }}></i>
                </button>
              </div>
            </div>

            {/* Unified Pill Input Field */}
            <form onSubmit={handleAddTask} className="sticky-checklist-form mb-3">
              <div
                className="d-flex align-items-center rounded-pill ps-3 pe-1 py-1 sticky-checklist-input-wrapper"
                style={{
                  backgroundColor: palette.inputBg,
                  border: `1.5px solid ${isInputFocused ? themeConfig.accentBg : palette.strongBorder}`,
                  boxShadow: isInputFocused
                    ? `0 0 0 3px ${palette.shadow}`
                    : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <i
                  className="bi bi-plus-lg me-2 flex-shrink-0 sticky-checklist-input-icon"
                  style={{ color: palette.muted, fontSize: '0.88rem', WebkitTextStroke: '0.4px' }}
                ></i>
                <input
                  type="text"
                  className="border-0 bg-transparent flex-grow-1 py-1 sticky-checklist-input"
                  placeholder="Add a quick task..."
                  value={newText}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{
                    color: isDark ? '#ffffff' : '#1e293b',
                    outline: 'none',
                    fontSize: '0.86rem',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={!newText.trim()}
                  className="btn rounded-pill fw-bold flex-shrink-0 ms-1 sticky-checklist-add-btn"
                  style={{
                    backgroundColor: newText.trim()
                      ? themeConfig.accentBg
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.07)',
                    color: newText.trim() ? '#ffffff' : palette.muted,
                    border: 'none',
                    fontSize: '0.78rem',
                    padding: '5px 14px',
                    opacity: newText.trim() ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                  }}
                >
                  Add
                </button>
              </div>
            </form>

            {/* Tasks List */}
            <div
              className="d-flex flex-column gap-2 overflow-auto custom-scrollbar-hide sticky-checklist-tasks-container"
              style={{ maxHeight: '230px', scrollbarWidth: 'none' }}
            >
              {tasks.length === 0 ? (
                <div
                  className="text-center py-4 rounded-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)',
                    border: `1px dashed ${palette.strongBorder}`,
                  }}
                >
                  <i
                    className="bi bi-clipboard-check d-block mb-1 opacity-50"
                    style={{ fontSize: '1.25rem', color: palette.muted }}
                  ></i>
                  <small className="fw-medium opacity-75" style={{ fontSize: '0.82rem' }}>
                    No tasks yet — jot down a quick todo above!
                  </small>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="d-flex align-items-center justify-content-between rounded-3 sticky-checklist-task-item"
                    style={{
                      padding: '9px 12px',
                      backgroundColor: palette.taskBg,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : palette.border}`,
                      boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggleTask(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggleTask(task.id);
                        }
                      }}
                      className="d-flex align-items-center gap-2 flex-grow-1 user-select-none"
                      style={{ cursor: 'pointer', minWidth: 0 }}
                    >
                      {/* Custom Theme-Matched Checkbox */}
                      <span
                        className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 sticky-checklist-checkbox"
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: task.completed
                            ? themeConfig.accentBg
                            : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : '#ffffff',
                          border: `1.5px solid ${
                            task.completed ? themeConfig.accentBg : palette.muted
                          }`,
                          color: '#ffffff',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {task.completed && (
                          <i
                            className="bi bi-check-lg"
                            style={{ fontSize: '0.72rem', WebkitTextStroke: '0.5px', lineHeight: 1 }}
                          ></i>
                        )}
                      </span>

                      <span
                        className={`text-break sticky-checklist-task-text ${
                          task.completed
                            ? 'text-decoration-line-through opacity-50'
                            : 'fw-medium'
                        }`}
                        style={{
                          fontSize: '0.86rem',
                          lineHeight: '1.45',
                          color: isDark ? '#f8fafc' : '#1e293b',
                        }}
                      >
                        {task.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm p-0 rounded-circle border-0 d-flex align-items-center justify-content-center text-danger opacity-50 hover-opacity flex-shrink-0 ms-2"
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <i className="bi bi-trash3" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Integrated Progress & Clear Button */}
            {tasks.length > 0 && (
              <div
                className="mt-3 pt-2 sticky-checklist-footer"
                style={{
                  borderTop: `1px solid ${palette.border}`,
                }}
              >
                {/* Slim Progress Bar */}
                <div
                  className="progress rounded-pill overflow-hidden mb-2 sticky-checklist-progress"
                  style={{
                    height: '4px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                  }}
                >
                  <div
                    className="progress-bar rounded-pill"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: themeConfig.accentBg,
                      transition: 'width 0.3s ease, background-color 0.3s ease',
                    }}
                  />
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <small className="opacity-75 fw-semibold sticky-checklist-footer-text" style={{ fontSize: '0.76rem' }}>
                    {completedTasks} of {totalTasks} completed ({progressPercent}%)
                  </small>
                  {completedTasks > 0 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-bold hover-opacity sticky-checklist-footer-text"
                      style={{
                        color: themeConfig.accent,
                        fontSize: '0.76rem',
                      }}
                      onClick={handleClearCompleted}
                    >
                      Clear completed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        show={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task?"
        message={
          <>
            Are you sure you want to delete <strong>"{taskToDelete?.text}"</strong>?
          </>
        }
      />

      <DeleteConfirmModal
        show={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearCompleted}
        title="Clear Completed Tasks?"
        message="Are you sure you want to remove all completed tasks?"
        confirmText="Clear"
      />
    </div>
  );
}

