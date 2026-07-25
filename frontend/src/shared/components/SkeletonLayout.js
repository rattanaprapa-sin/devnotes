import React from 'react';
import SkeletonCard from './SkeletonCard';

export default function SkeletonLayout({ count = 6 }) {
  return (
    <div className="container pb-5">
      <div className="row g-4 justify-content-center">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-4">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
}
