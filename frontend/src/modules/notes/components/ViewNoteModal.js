import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ViewNoteModal({ show, onClose, noteData, hasNext, hasPrev, onNext, onPrev }) {
  const [isHidden, setIsHidden] = useState(false);

  // Reset hide state when note changes
  useEffect(() => {
    if (show) {
      setIsHidden(false);
    }
  }, [noteData, show]);

  // Keyboard shortcuts for Left/Right arrows
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
  }, [show, hasNext, hasPrev, onNext, onPrev]);

  if (!show || !noteData) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" onClick={onClose} style={{ transition: 'opacity 0.2s', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg position-relative" onClick={e => e.stopPropagation()}>
        
        {/* Floating Prev Button (Desktop only) */}
        <button 
          className="btn btn-light position-absolute top-50 translate-middle-y rounded-circle shadow-lg d-none d-md-flex align-items-center justify-content-center text-dark hover-opacity"
          style={{ left: '-76px', width: '56px', height: '56px', zIndex: 1060, visibility: hasPrev ? 'visible' : 'hidden', transition: 'all 0.2s', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          title="Previous Note"
        >
          <i className="bi bi-chevron-left fs-4"></i>
        </button>

        {/* Floating Next Button (Desktop only) */}
        <button 
          className="btn btn-light position-absolute top-50 translate-middle-y rounded-circle shadow-lg d-none d-md-flex align-items-center justify-content-center text-dark hover-opacity"
          style={{ right: '-76px', width: '56px', height: '56px', zIndex: 1060, visibility: hasNext ? 'visible' : 'hidden', transition: 'all 0.2s', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          title="Next Note"
        >
          <i className="bi bi-chevron-right fs-4"></i>
        </button>

        <div className="modal-content rounded-4 shadow-lg border-0 animate-pop-in-bounce">
          <div className="modal-header border-bottom pb-3 pt-4 px-4 flex-column align-items-stretch">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h4 className="modal-title fw-bolder text-dark lh-base pe-3 mb-0">
                {noteData.title}
              </h4>
              <button 
                type="button" 
                className="btn-close shadow-none mt-1 bg-light rounded-circle p-2 flex-shrink-0" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center text-secondary small fw-medium">
                <i className="bi bi-calendar3 me-2"></i>
                {new Date(noteData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                className={`btn btn-sm rounded-pill fw-medium d-flex align-items-center gap-1 transition-all ${isHidden ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setIsHidden(!isHidden)}
                style={{ transition: 'all 0.2s' }}
              >
                <i className={`bi ${isHidden ? 'bi-eye-fill' : 'bi-eye-slash'}`}></i>
                {isHidden ? 'Show Content' : 'Hide Content'}
              </button>
            </div>
          </div>
          <div className="modal-body px-4 py-4 bg-light">
            <div 
              className={`fs-6 lh-base text-break p-4 rounded-4 shadow-sm border overflow-auto ${isHidden ? 'bg-secondary bg-opacity-25' : 'bg-white text-dark'}`} 
              style={{ 
                minHeight: '150px', 
                maxHeight: '55vh',
                transition: 'all 0.3s ease',
                ...(isHidden ? {
                  color: 'transparent',
                  textShadow: '0 0 12px rgba(0,0,0,0.4)',
                  userSelect: 'none',
                  cursor: 'pointer'
                } : {})
              }}
              onClick={() => {
                if (isHidden) setIsHidden(false);
              }}
              title={isHidden ? "Click to reveal content" : ""}
            >
              {isHidden ? (
                <span>{noteData.content}</span>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, '')}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-3 shadow-sm my-3 fs-6"
                        />
                      ) : (
                        <code {...props} className="bg-secondary bg-opacity-10 text-primary px-1 rounded">
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {noteData.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
          <div className="modal-footer border-top px-4 py-3 bg-white d-flex justify-content-between">
            <div className="d-flex gap-2 d-md-none">
              <button 
                className="btn btn-light border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center text-secondary hover-opacity"
                style={{ width: '40px', height: '40px', transition: 'all 0.2s' }}
                onClick={onPrev}
                disabled={!hasPrev}
                title="Previous Note"
              >
                <i className="bi bi-chevron-left fs-5"></i>
              </button>
              <button 
                className="btn btn-light border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center text-secondary hover-opacity"
                style={{ width: '40px', height: '40px', transition: 'all 0.2s' }}
                onClick={onNext}
                disabled={!hasNext}
                title="Next Note"
              >
                <i className="bi bi-chevron-right fs-5"></i>
              </button>
            </div>
            <button className="btn btn-dark rounded-pill px-5 fw-medium shadow-sm ms-auto" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
