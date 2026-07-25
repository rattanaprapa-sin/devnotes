import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="card h-100 rounded-4 p-2 border shadow-sm border-light-subtle bg-transparent">
      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex flex-column w-100">
            <div className="skeleton rounded mb-2" style={{ height: '28px', width: '60%' }}></div>
            <div className="skeleton rounded-pill mt-1" style={{ height: '32px', width: '30%' }}></div>
          </div>
          <div className="skeleton rounded-circle flex-shrink-0" style={{ width: '32px', height: '32px' }}></div>
        </div>
        
        <div className="card-text flex-grow-1 mt-3">
          <div className="skeleton rounded mb-2" style={{ height: '16px', width: '100%' }}></div>
          <div className="skeleton rounded mb-2" style={{ height: '16px', width: '90%' }}></div>
          <div className="skeleton rounded" style={{ height: '16px', width: '75%' }}></div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-light-subtle">
          <div className="skeleton rounded" style={{ height: '16px', width: '30%' }}></div>
          <div className="d-flex gap-2">
            <div className="skeleton rounded-circle" style={{ width: '36px', height: '36px' }}></div>
            <div className="skeleton rounded-circle" style={{ width: '36px', height: '36px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
