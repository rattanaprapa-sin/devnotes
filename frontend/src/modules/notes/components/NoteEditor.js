import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { useTheme } from '../../../contexts/ThemeContext';
import TableGridPicker from './TableGridPicker';

export default function NoteEditor({
  content = '',
  onChange,
  isExpanded = false,
  onToggleExpand,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showTableSidePanel, setShowTableSidePanel] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 120, left: null, right: 20 });

  const editorWrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const tableDropdownRef = useRef(null);
  const isSettingContentRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (isSettingContentRef.current) return;
      const md = editor.storage.markdown.getMarkdown();
      onChange?.(md);
    },
    editorProps: {
      attributes: {
        class: `wysiwyg-editor-content p-3 focus-ring-none outline-none ${
          isDark ? 'text-light' : 'text-dark'
        }`,
        style: `min-height: ${isExpanded ? '350px' : '200px'}; outline: none;`,
      },
    },
  });

  // Calculate position pinned to the side of the active modal
  const updatePanelPos = useCallback(() => {
    const modalContent = document.querySelector('.modal-content');
    const panelWidth = 220;

    if (!modalContent) {
      setPanelPos({ top: 120, left: null, right: 20 });
      return;
    }

    const rect = modalContent.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;

    let left = null;
    let right = null;

    if (spaceOnRight >= panelWidth + 16) {
      // Room on the right side of modal
      left = rect.right + 12;
    } else if (rect.left >= panelWidth + 16) {
      // Room on the left side of modal
      left = rect.left - panelWidth - 12;
    } else {
      // Fallback: dock inside right edge of screen
      right = 16;
    }

    // Align exactly with the top of the Content editor box
    const editorRect = editorWrapperRef.current?.getBoundingClientRect();
    const top = editorRect ? Math.max(16, editorRect.top) : Math.max(16, rect.top + 180);

    setPanelPos({ top, left, right });
  }, []);

  // Update position on resize, scroll, expand, and modal animation completion
  useEffect(() => {
    updatePanelPos();

    const t1 = setTimeout(updatePanelPos, 60);
    const t2 = setTimeout(updatePanelPos, 160);
    const t3 = setTimeout(updatePanelPos, 320);

    const modalDialog = document.querySelector('.animate-modal');
    const handleAnimEnd = () => updatePanelPos();
    modalDialog?.addEventListener('animationend', handleAnimEnd);

    window.addEventListener('resize', updatePanelPos);
    window.addEventListener('scroll', updatePanelPos, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      modalDialog?.removeEventListener('animationend', handleAnimEnd);
      window.removeEventListener('resize', updatePanelPos);
      window.removeEventListener('scroll', updatePanelPos, true);
    };
  }, [updatePanelPos, isExpanded, showTableSidePanel]);

  // Keep side panel open only when user is actively editing/focused inside a table
  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => {
      if (editor.isFocused && editor.isActive('table')) {
        setShowTableSidePanel(true);
        updatePanelPos();
      } else if (!editor.isActive('table')) {
        setShowTableSidePanel(false);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!editor.isFocused) {
          setShowTableSidePanel(false);
        }
      }, 150);
    };

    editor.on('selectionUpdate', handleSelection);
    editor.on('focus', handleSelection);
    editor.on('blur', handleBlur);
    return () => {
      editor.off('selectionUpdate', handleSelection);
      editor.off('focus', handleSelection);
      editor.off('blur', handleBlur);
    };
  }, [editor, updatePanelPos]);

  // Right-click inside table: immediately focuses cell and opens panel beside modal
  const handleContextMenu = (e) => {
    const table = e.target.closest('table');
    if (table && editor) {
      e.preventDefault();

      const pos = editor.view?.posAtDOM?.(e.target, 0);
      if (typeof pos === 'number') {
        editor.chain().focus().setTextSelection(pos).run();
      } else {
        editor.commands.focus();
      }

      setShowTableSidePanel(true);
      updatePanelPos();
    }
  };

  // Sync content from outside when noteData loads
  const lastContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      const currentMd = editor.storage.markdown.getMarkdown();
      if (content !== currentMd) {
        isSettingContentRef.current = true;
        editor.commands.setContent(content || '', false);
        isSettingContentRef.current = false;
      }
      lastContentRef.current = content;
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleInsertTable = (rows = 3, cols = 3) => {
    if (!editor) return;

    const r = Math.max(1, Number(rows) || 3);
    const c = Math.max(1, Number(cols) || 3);

    try {
      // 1. If cursor is already inside a table, insert below the existing table
      if (editor.isActive('table')) {
        const { state } = editor;
        const { $from } = state.selection;
        let tableDepth = -1;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === 'table') {
            tableDepth = d;
            break;
          }
        }
        if (tableDepth !== -1) {
          const afterPos = $from.after(tableDepth);
          editor
            .chain()
            .insertContentAt(afterPos, [{ type: 'paragraph' }])
            .focus(afterPos + 1)
            .insertTable({ rows: r, cols: c, withHeaderRow: true })
            .run();
          setShowTablePicker(false);
          setShowTableSidePanel(true);
          setTimeout(updatePanelPos, 60);
          return;
        }
      }

      // 2. Try standard insertTable command
      let success = false;
      try {
        success = editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
      } catch (e1) {
        console.warn('Direct insertTable command failed, attempting fallback', e1);
        success = false;
      }

      // 3. Fallback: if not successful (e.g. cursor inside list item or unselected), insert a paragraph first then table
      if (!success) {
        try {
          success = editor
            .chain()
            .focus()
            .createParagraphNear()
            .insertTable({ rows: r, cols: c, withHeaderRow: true })
            .run();
        } catch (e2) {
          console.warn('createParagraphNear fallback failed, attempting HTML fallback', e2);
          success = false;
        }
      }

      // 4. Ultimate Fallback: Generate HTML table and insert via insertContent
      if (!success) {
        let tableHtml = '<table><thead><tr>';
        for (let j = 1; j <= c; j++) {
          tableHtml += `<th>Header ${j}</th>`;
        }
        tableHtml += '</tr></thead><tbody>';
        for (let i = 1; i <= r; i++) {
          tableHtml += '<tr>';
          for (let j = 1; j <= c; j++) {
            tableHtml += `<td>Data ${i},${j}</td>`;
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p></p>';

        editor.chain().focus('end').insertContent(tableHtml).run();
      }
    } catch (err) {
      console.error('All table insertion methods failed:', err);
    }

    setShowTablePicker(false);
    setShowTableSidePanel(true);
    setTimeout(updatePanelPos, 60);
  };

  const inactiveBtnClass = isDark
    ? 'btn-outline-secondary'
    : 'bg-white text-dark border shadow-xs';

  return (
    <div
      ref={editorWrapperRef}
      className={`wysiwyg-editor-wrapper rounded-3 border transition-all ${
        isDark ? 'bg-dark text-white' : 'bg-white text-dark'
      }`}
      style={{
        backgroundColor: isDark ? undefined : '#ffffff',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#212529',
        transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
      }}
    >
      {/* Editor Toolbar (Single row, completely fixed and clean) */}
      <div
        className="d-flex justify-content-between align-items-center p-2 gap-1 position-relative rounded-top-3 wysiwyg-toolbar"
        style={{
          overflow: 'visible',
          zIndex: 105,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
        }}
      >
        {/* Left side: Formatting tools */}
        <div
          className="d-flex align-items-center flex-wrap gap-1"
          style={{ overflow: 'visible' }}
        >
          {/* Bold, Italic */}
          <button
            type="button"
            className={`btn btn-sm ${
              editor.isActive('bold') ? 'btn-primary text-white' : inactiveBtnClass
            } py-0 px-2 rounded-pill`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <i className="bi bi-type-bold"></i>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              editor.isActive('italic') ? 'btn-primary text-white' : inactiveBtnClass
            } py-0 px-2 rounded-pill`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <i className="bi bi-type-italic"></i>
          </button>

          <div className="border-start mx-1" style={{ height: '14px', borderColor: '#94a3b8' }}></div>

          {/* Bullet, Numbered, Checklist */}
          <button
            type="button"
            className={`btn btn-sm ${
              editor.isActive('bulletList') ? 'btn-primary text-white' : inactiveBtnClass
            } py-0 px-2 rounded-pill d-flex align-items-center gap-1`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <i className="bi bi-list-ul"></i>
            <span className="d-none d-sm-inline">Bullet</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              editor.isActive('orderedList') ? 'btn-primary text-white' : inactiveBtnClass
            } py-0 px-2 rounded-pill d-flex align-items-center gap-1`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <i className="bi bi-list-ol"></i>
            <span className="d-none d-sm-inline">Numbered</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              editor.isActive('taskList') ? 'btn-primary text-white' : inactiveBtnClass
            } py-0 px-2 rounded-pill d-flex align-items-center gap-1`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Checklist task"
          >
            <i className={`bi bi-check2-square ${editor.isActive('taskList') ? 'text-white' : 'text-primary'}`}></i>
            <span className="d-none d-sm-inline">Checklist</span>
          </button>

          <div className="border-start mx-1" style={{ height: '14px', borderColor: '#94a3b8' }}></div>

          {/* Table Button & Grid Picker */}
          <div className="position-relative" ref={tableDropdownRef} style={{ zIndex: 110 }}>
            <button
              type="button"
              className={`btn btn-sm table-picker-toggle-btn ${
                showTablePicker
                  ? 'btn-primary text-white shadow-sm'
                  : inactiveBtnClass
              } py-0 px-2 rounded-pill d-flex align-items-center`}
              style={{ fontSize: '0.78rem', gap: '5px' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowTablePicker(!showTablePicker);
              }}
              title="Insert Table"
            >
              <i className="bi bi-table"></i>
              <span>Table</span>
              <i className={`bi ${showTablePicker ? 'bi-chevron-up' : 'bi-chevron-down'} opacity-75`} style={{ fontSize: '0.62rem' }}></i>
            </button>

            {/* Grid Picker (for inserting a new table) */}
            {showTablePicker && (
              <TableGridPicker
                anchorRef={tableDropdownRef}
                onSelectTable={handleInsertTable}
                onClose={() => setShowTablePicker(false)}
              />
            )}
          </div>
        </div>

        {/* Right side: Expand toggle */}
        {onToggleExpand && (
          <div className="d-none d-md-flex align-items-center ms-auto flex-shrink-0">
            <button
              type="button"
              className={`btn btn-sm ${
                isExpanded ? 'btn-primary text-white border-0 shadow-sm' : inactiveBtnClass
              } rounded-pill py-0 px-2 d-flex align-items-center gap-1 transition-all`}
              style={{ fontSize: '0.78rem' }}
              onClick={onToggleExpand}
              title={isExpanded ? 'Collapse editor to normal view' : 'Expand editor to large view'}
            >
              <i className={`bi ${isExpanded ? 'bi-arrows-angle-contract' : 'bi-arrows-angle-expand'}`}></i>
              <span className="fw-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area (Typing directly like Word) */}
      <div className="position-relative rounded-bottom-3 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-auto wysiwyg-scroll-area"
          style={{
            height: isExpanded ? '380px' : '220px',
            minHeight: isExpanded ? '380px' : '220px',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            transition: 'height 0.3s ease, background-color 0.15s ease',
          }}
          onContextMenu={handleContextMenu}
          onClick={() => {
            if (!editor.isFocused) {
              editor.commands.focus();
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Table Options Panel: Rendered directly to <body> via Portal so it is NEVER clipped */}
      {showTableSidePanel &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`table-options-side-panel position-fixed shadow-lg rounded-3 border p-2 animate-fade-slide-up ${
              isDark ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light-subtle'
            }`}
            style={{
              top: `${panelPos.top}px`,
              ...(panelPos.left !== null ? { left: `${panelPos.left}px` } : {}),
              ...(panelPos.right !== null ? { right: `${panelPos.right}px` } : {}),
              width: '215px',
              zIndex: 99999,
              backdropFilter: 'blur(10px)',
              transition: 'top 0.15s ease, left 0.15s ease',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.6)'
                : '0 10px 30px rgba(0,0,0,0.18)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Dismiss button */}
            <div className="d-flex align-items-center justify-content-between px-1 pb-2 mb-2 border-bottom">
              <span
                className="small fw-bold text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: '0.75rem', letterSpacing: '0.6px' }}
              >
                <i className="bi bi-table text-primary" style={{ fontSize: '0.9rem' }}></i>
                <span>TABLE OPTIONS</span>
              </span>
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
                onClick={() => setShowTableSidePanel(false)}
                title="Close panel"
              >
                <i className="bi bi-x fs-5"></i>
              </button>
            </div>

            {/* Rows Actions */}
            <div className="small fw-semibold text-secondary px-1 pt-1 pb-0.5" style={{ fontSize: '0.66rem' }}>
              ROWS
            </div>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addRowBefore().run();
              }}
            >
              <i className="bi bi-arrow-up-square text-primary"></i> Insert Row Above
            </button>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addRowAfter().run();
              }}
            >
              <i className="bi bi-arrow-down-square text-primary"></i> Insert Row Below
            </button>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteRow().run();
              }}
            >
              <i className="bi bi-dash-square text-secondary"></i> Delete Row
            </button>

            <div className="border-top my-1.5"></div>

            {/* Columns Actions */}
            <div className="small fw-semibold text-secondary px-1 pt-1 pb-0.5" style={{ fontSize: '0.66rem' }}>
              COLUMNS
            </div>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addColumnBefore().run();
              }}
            >
              <i className="bi bi-arrow-left-square text-primary"></i> Insert Column Left
            </button>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addColumnAfter().run();
              }}
            >
              <i className="bi bi-arrow-right-square text-primary"></i> Insert Column Right
            </button>
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteColumn().run();
              }}
            >
              <i className="bi bi-dash-square text-secondary"></i> Delete Column
            </button>

            <div className="border-top my-1.5"></div>

            {/* Insert Another Table Action */}
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item d-flex align-items-center gap-2 border-0 text-primary mb-1"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertTable(2, 3);
              }}
            >
              <i className="bi bi-plus-circle text-primary"></i> Insert Table Below
            </button>

            {/* Delete Table Action */}
            <button
              type="button"
              className="btn btn-sm w-100 text-start py-1.5 px-2 word-context-menu-item danger d-flex align-items-center gap-2 border-0 text-danger"
              style={{ fontSize: '0.75rem' }}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteTable().run();
                setShowTableSidePanel(false);
              }}
            >
              <i className="bi bi-trash3 text-danger"></i> Delete Table
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

