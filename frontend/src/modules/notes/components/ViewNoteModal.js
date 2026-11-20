import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import AppButton from '../../../shared/ui/AppButton';
import AppBadge from '../../../shared/ui/AppBadge';
import { editNote } from '../../../store/notesSlice';
import { getChecklistStats, toggleMarkdownTask } from '../../../shared/utils/checklistUtils';
import { useTheme } from '../../../contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Remark plugin: annotates every task listItem with its 1-based source line
// number stored as a `data-task-line` HTML property.
// This runs at the mdast level where node.position IS available, so we get
// exact line numbers without any runtime counter.
// ---------------------------------------------------------------------------
function remarkTaskLineAnnotator() {
  return function transformer(tree) {
    function walk(node) {
      if (
        node.type === 'listItem' &&
        (node.checked === true || node.checked === false) &&
        node.position
      ) {
        node.data = node.data || {};
        node.data.hProperties = Object.assign({}, node.data.hProperties, {
          'data-task-line': node.position.start.line, // 1-based
        });
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    }
    walk(tree);
  };
}

// Context that carries the 1-based line number from the <li> down to the
// <input> child without needing a shared mutable counter.
const TaskLineCtx = React.createContext(null);

// Import and register common languages for PrismLight to dramatically reduce bundle size / chunk count
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'; // handles HTML/XML
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c++', cpp);

export default function ViewNoteModal({
  show,
  onClose,
  noteData,
  categoryObj,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  isFlashcardMode,
  onNoteUpdated,
}) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isHidden, setIsHidden] = useState(isFlashcardMode || false);
  const [currentContent, setCurrentContent] = useState(noteData?.content || '');

  // Reset states when noteData or flashcard mode changes
  useEffect(() => {
    if (show && noteData) {
      setIsHidden(isFlashcardMode || false);
      setCurrentContent(noteData.content || '');
    }
  }, [noteData, show, isFlashcardMode]);

  // Keyboard shortcuts for Left/Right arrows and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;
      if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!show || !noteData) return null;

  const checklistStats = getChecklistStats(currentContent);

  // line1based: the exact 1-based source line from the remark plugin annotation
  const handleToggleTask = async (line1based) => {
    const updatedContent = toggleMarkdownTask(currentContent, { line: line1based });
    if (updatedContent === currentContent) return;
    setCurrentContent(updatedContent);

    try {
      await dispatch(
        editNote({
          id: noteData.id,
          data: { content: updatedContent },
        })
      ).unwrap();

      if (onNoteUpdated) {
        onNoteUpdated({ ...noteData, content: updatedContent });
      }
    } catch (error) {
      console.error('Failed to toggle checklist item:', error);
      toast.error('Failed to update checklist item');
      setCurrentContent(noteData.content || '');
    }
  };

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      tabIndex="-1"
      onClick={onClose}
      style={{ transition: 'opacity 0.2s', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg position-relative m-2 m-sm-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Prev Button (Desktop only) */}
        <AppButton
          variant="light"
          className="position-absolute top-50 translate-middle-y rounded-circle shadow-lg d-none d-lg-flex align-items-center justify-content-center text-dark hover-opacity p-0"
          style={{
            left: '-76px',
            width: '56px',
            height: '56px',
            padding: 0,
            zIndex: 1060,
            visibility: hasPrev ? 'visible' : 'hidden',
            transition: 'all 0.2s',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          title="Previous Note"
        >
          <i className="bi bi-chevron-left fs-4"></i>
        </AppButton>

        {/* Floating Next Button (Desktop only) */}
        <AppButton
          variant="light"
          className="position-absolute top-50 translate-middle-y rounded-circle shadow-lg d-none d-lg-flex align-items-center justify-content-center text-dark hover-opacity p-0"
          style={{
            right: '-76px',
            width: '56px',
            height: '56px',
            padding: 0,
            zIndex: 1060,
            visibility: hasNext ? 'visible' : 'hidden',
            transition: 'all 0.2s',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          title="Next Note"
        >
          <i className="bi bi-chevron-right fs-4"></i>
        </AppButton>

        <div className="modal-content rounded-4 shadow-lg border-0 animate-pop-in-bounce view-note-modal-content">
          <div className="modal-header border-bottom pb-3 pt-3 pt-sm-4 px-3 px-sm-4 flex-column align-items-stretch view-note-modal-header">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="modal-title fw-bolder text-dark lh-base pe-2 mb-0 text-break view-note-modal-title">
                {noteData.title}
              </h4>
              <button
                type="button"
                className="btn-close shadow-none m-0 flex-shrink-0"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center flex-wrap gap-1.5 gap-sm-3" style={{ gap: '8px' }}>
                {categoryObj && (
                  <AppBadge
                    color={categoryObj.color}
                    className="px-2 py-1 shadow-sm border view-note-modal-badge"
                  >
                    {categoryObj.name}
                  </AppBadge>
                )}
                <div className="d-flex align-items-center text-secondary small fw-medium view-note-modal-date">
                  <i className="bi bi-calendar3 me-1.5 me-sm-2" style={{ marginRight: '6px' }}></i>
                  {new Date(noteData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <AppButton
                variant={isHidden ? 'dark' : 'outline-secondary'}
                size="sm"
                className="rounded-pill fw-medium d-flex align-items-center gap-1 transition-all px-2 px-sm-3 view-note-hide-btn"
                onClick={() => setIsHidden(!isHidden)}
                style={{ transition: 'all 0.2s' }}
                icon={isHidden ? 'bi-eye-fill' : 'bi-eye-slash'}
              >
                {isHidden ? 'Show Content' : 'Hide Content'}
              </AppButton>
            </div>

            {/* Checklist Progress Bar Banner if tasks are present */}
            {checklistStats.hasChecklist && !isHidden && (
              <div
                className="mt-2 rounded-3 bg-light border d-flex flex-column animate-fade-slide-up"
                style={{ padding: '6px 12px', gap: '4px' }}
              >
                <div
                  className="d-flex align-items-center justify-content-between"
                  style={{ fontSize: '0.78rem', lineHeight: 1.2 }}
                >
                  <span
                    className="fw-semibold text-secondary d-flex align-items-center"
                    style={{ gap: '6px' }}
                  >
                    <i
                      className={`bi ${
                        checklistStats.completed === checklistStats.total
                          ? 'bi-check-circle-fill text-success'
                          : 'bi-check2-square text-primary'
                      }`}
                    ></i>
                    <span>
                      Checklist: {checklistStats.completed} of {checklistStats.total} completed
                    </span>
                  </span>
                  <span
                    className={`fw-bold ${
                      checklistStats.completed === checklistStats.total
                        ? 'text-success'
                        : 'text-primary'
                    }`}
                  >
                    {checklistStats.percent}%
                  </span>
                </div>
                <div className="progress rounded-pill" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar rounded-pill ${
                      checklistStats.completed === checklistStats.total
                        ? 'bg-success'
                        : 'bg-primary'
                    }`}
                    style={{
                      width: `${checklistStats.percent}%`,
                      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-body px-4 py-4 bg-light view-note-modal-body">
            <div
              className={`lh-base text-break p-4 rounded-4 shadow-sm border bg-white text-dark note-markdown-view ${
                isHidden ? 'bg-flashcard overflow-hidden' : 'overflow-auto'
              }`}
              style={{
                fontSize: '1rem',
                minHeight: '150px',
                maxHeight: isHidden ? '150px' : '65vh',
                whiteSpace: isHidden ? 'pre-wrap' : 'normal',
                cursor: isFlashcardMode ? 'pointer' : 'text',
                transition:
                  'max-height 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s ease, color 0.3s ease',
              }}
              onClick={() => {
                if (isHidden) setIsHidden(false);
              }}
              title={isHidden ? 'Click to reveal content' : ''}
            >
              {isHidden ? (
                <span>{currentContent}</span>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkTaskLineAnnotator]}
                  components={{
                    p({ children, ...props }) {
                      return <p className="mb-2" {...props}>{children}</p>;
                    },
                    ol({ children, className, ...props }) {
                      return <ol className={`ps-3.5 mb-2 ${className || ''}`} {...props}>{children}</ol>;
                    },
                    ul({ children, className, ...props }) {
                      const isTaskList = className?.includes('contains-task-list');
                      if (isTaskList) {
                        return (
                          <ul
                            className={`contains-task-list ps-0 mb-2 ${className || ''}`}
                            style={{ listStyleType: 'none' }}
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      }
                      return <ul className={`ps-3.5 mb-2 ${className || ''}`} {...props}>{children}</ul>;
                    },
                    li({ children, className, 'data-task-line': taskLine, ...props }) {
                      const isTaskItem = className?.includes('task-list-item');
                      if (isTaskItem && taskLine !== undefined) {
                        // Unwrap any <p> generated by loose task lists so checkbox and text
                        // are direct flex children on the exact same horizontal center line.
                        const flatChildren = React.Children.toArray(children)
                          .flatMap((child) => {
                            if (
                              React.isValidElement(child) &&
                              (child.type === 'p' || child.props?.node?.tagName === 'p')
                            ) {
                              return React.Children.toArray(child.props.children);
                            }
                            return [child];
                          })
                          .filter((child) => !(typeof child === 'string' && child.trim() === ''));

                        const checkboxIndex = flatChildren.findIndex(
                          (child) =>
                            React.isValidElement(child) &&
                            (child.props?.type === 'checkbox' || child.props?.node?.tagName === 'input')
                        );
                        const checkboxChild = checkboxIndex !== -1 ? flatChildren[checkboxIndex] : null;
                        const textChildren = (
                          checkboxIndex !== -1
                            ? flatChildren.filter((_, idx) => idx !== checkboxIndex)
                            : flatChildren
                        ).map((child, idx) =>
                          idx === 0 && typeof child === 'string' ? child.replace(/^\s+/, '') : child
                        );

                        // taskLine is 1-based line number injected by remarkTaskLineAnnotator.
                        // Provide it via context so the <input> child can read it without
                        // any shared mutable counter.
                        return (
                          <TaskLineCtx.Provider value={Number(taskLine)}>
                            <li
                              className={`task-list-item my-1 rounded-3 d-flex align-items-center ${className || ''}`}
                              style={{
                                listStyleType: 'none',
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.035)',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                gap: '10px',
                                lineHeight: '1.5',
                              }}
                              onClick={(e) => {
                                // Skip if the click is on the checkbox itself —
                                // that already fires onChange and will call handleToggleTask.
                                if (e.target.type === 'checkbox') return;
                                e.stopPropagation();
                                handleToggleTask(Number(taskLine));
                              }}
                            >
                              {checkboxChild}
                              <span
                                className="task-item-text"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  lineHeight: '1.5',
                                }}
                              >
                                {textChildren}
                              </span>
                            </li>
                          </TaskLineCtx.Provider>
                        );
                      }
                      return (
                        <li className={className} style={{ marginBottom: '0.25rem' }} {...props}>
                          {children}
                        </li>
                      );
                    },
                    input({ node, ...props }) {
                      // Read the line number provided by the parent <li> via context.
                      // This is 100% reliable — no counter, no render-order assumption.
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      const taskLine = useContext(TaskLineCtx);
                      if (props.type === 'checkbox') {
                        return (
                          <input
                            type="checkbox"
                            checked={Boolean(props.checked)}
                            disabled={false}
                            readOnly={false}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (taskLine !== null) handleToggleTask(taskLine);
                            }}
                            style={{
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px',
                              minWidth: '16px',
                              margin: '0',
                              float: 'none',
                              position: 'static',
                              pointerEvents: 'auto',
                              flexShrink: 0,
                              accentColor: '#0d6efd',
                            }}
                          />
                        );
                      }
                      return <input {...props} />;
                    },
                    table({ children, ...props }) {
                      return (
                        <div
                          className="table-responsive my-3 rounded-3 overflow-hidden shadow-sm"
                          style={{
                            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                          }}
                        >
                          <table
                            className={`table table-bordered table-hover table-striped mb-0 align-middle ${
                              isDark ? 'table-dark' : ''
                            }`}
                            style={{
                              borderColor: isDark ? '#4b5563' : '#d1d5db',
                              '--bs-table-border-color': isDark ? '#4b5563' : '#d1d5db',
                              '--bs-table-striped-bg': isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              '--bs-table-hover-bg': isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                            }}
                            {...props}
                          >
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children, ...props }) {
                      return (
                        <thead
                          className="fw-bold"
                          style={{
                            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                            borderBottom: `1.5px solid ${isDark ? '#6b7280' : '#6b7280'}`,
                          }}
                          {...props}
                        >
                          {children}
                        </thead>
                      );
                    },
                    th({ children, style, ...props }) {
                      const textAlign = props.align || 'left';
                      return (
                        <th
                          className="px-3 py-2.5 small fw-bold text-uppercase"
                          style={{
                            letterSpacing: '0.5px',
                            textAlign,
                            color: isDark ? '#f9fafb' : '#374151',
                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                            borderWidth: '1px',
                            ...style,
                          }}
                          {...props}
                        >
                          {children}
                        </th>
                      );
                    },
                    td({ children, style, ...props }) {
                      const textAlign = props.align || 'left';
                      return (
                        <td
                          className="px-3 py-2 small"
                          style={{
                            textAlign,
                            color: isDark ? '#f3f4f6' : '#1f2937',
                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                            borderWidth: '1px',
                            ...style,
                          }}
                          {...props}
                        >
                          {children}
                        </td>
                      );
                    },
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-3 shadow-sm my-3 fs-6"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          {...props}
                          className="bg-secondary bg-opacity-10 text-primary px-1 rounded"
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {currentContent}
                </ReactMarkdown>
              )}
            </div>
          </div>

          <div className="modal-footer border-top px-3 px-sm-4 py-3 bg-white d-flex justify-content-between view-note-modal-footer">
            <div className="d-flex gap-2 d-lg-none">
              <AppButton
                variant="light"
                className="border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center text-secondary hover-opacity p-0 view-note-nav-btn"
                style={{ width: '40px', height: '40px', padding: 0, transition: 'all 0.2s' }}
                onClick={onPrev}
                disabled={!hasPrev}
                title="Previous Note"
              >
                <i className="bi bi-chevron-left fs-5"></i>
              </AppButton>
              <AppButton
                variant="light"
                className="border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center text-secondary hover-opacity p-0 view-note-nav-btn"
                style={{ width: '40px', height: '40px', padding: 0, transition: 'all 0.2s' }}
                onClick={onNext}
                disabled={!hasNext}
                title="Next Note"
              >
                <i className="bi bi-chevron-right fs-5"></i>
              </AppButton>
            </div>
            <AppButton
              variant="dark"
              className="rounded-pill px-5 fw-medium shadow-sm ms-auto view-note-close-btn"
              onClick={onClose}
            >
              Close
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
