import { useTheme } from '../../../contexts/ThemeContext';
import useHorizontalScroll from '../../../shared/hooks/useHorizontalScroll';

export default function CategoryFilter({ categories = [], activeCategory, onSelectCategory, isLoading }) {
  const { theme } = useTheme();
  
  const { scrollContainerRef, isDragging, events, hasDragged } = useHorizontalScroll();

  const handleClick = (catId) => {
    if (hasDragged()) return;
    onSelectCategory(catId);
  };

  return (
    <div 
      className="d-flex justify-content-center w-100 position-relative"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 25px, black calc(100% - 25px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 25px, black calc(100% - 25px), transparent)'
      }}
    >
      <div 
        ref={scrollContainerRef}
        className="d-flex gap-2 overflow-x-auto py-2 custom-scrollbar-hide px-3"
        style={{
          scrollBehavior: isDragging.current ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch',
          maxWidth: '100%',
          cursor: 'grab'
        }}
        {...events}
      >
        {isLoading ? (
          <>
            <div className="btn rounded-pill px-4 py-2 placeholder-glow bg-secondary bg-opacity-10" style={{ width: '100px', height: '40px' }}></div>
            <div className="btn rounded-pill px-4 py-2 placeholder-glow bg-secondary bg-opacity-10" style={{ width: '120px', height: '40px' }}></div>
            <div className="btn rounded-pill px-4 py-2 placeholder-glow bg-secondary bg-opacity-10" style={{ width: '90px', height: '40px' }}></div>
            <div className="btn rounded-pill px-4 py-2 placeholder-glow bg-secondary bg-opacity-10" style={{ width: '110px', height: '40px' }}></div>
          </>
        ) : (
          <>
            <button
              className={`btn rounded-pill px-4 py-2 fw-medium hover-lift flex-shrink-0 category-filter-btn ${activeCategory === 'All' ? 'fw-bold shadow-sm' : 'border'}`}
              style={{
                transition: 'all 0.2s',
                backgroundColor: activeCategory === 'All' ? (theme === 'dark' ? '#fff' : (theme === 'blue' ? 'var(--bs-primary)' : '#212529')) : (theme === 'blue' ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff')),
                color: activeCategory === 'All' ? (theme === 'dark' ? '#000' : '#fff') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#6c757d'),
                borderColor: activeCategory === 'All' ? (theme === 'dark' ? '#fff' : (theme === 'blue' ? 'var(--bs-primary)' : '#212529')) : (theme === 'blue' ? 'rgba(255, 255, 255, 0.8)' : (theme === 'dark' ? 'rgba(255,255,255,0.2)' : '#dee2e6')),
                backdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
              }}
              onClick={() => handleClick('All')}
            >
              All Tools
            </button>
      
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-1 flex-shrink-0 category-filter-btn ${activeCategory === cat.id ? 'fw-bold text-white shadow-sm' : 'border'}`}
          style={{ 
            transition: 'all 0.2s',
            backgroundColor: activeCategory === cat.id ? cat.color : (theme === 'blue' ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? `${cat.color}4D` : `${cat.color}15`)),
            color: activeCategory === cat.id ? '#fff' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : cat.color),
            borderColor: activeCategory === cat.id ? cat.color : (theme === 'blue' ? 'rgba(255, 255, 255, 0.8)' : (theme === 'dark' ? `${cat.color}66` : `${cat.color}30`)),
            backdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
          }}
          onClick={() => handleClick(cat.id)}
        >
          {cat.name}
        </button>
      ))}

          </>
        )}
      </div>
    </div>
  );
}
