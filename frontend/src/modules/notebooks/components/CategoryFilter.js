export default function CategoryFilter({ categories = [], activeCategory, onSelectCategory }) {
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
      <button
        className={`btn rounded-pill px-4 py-2 fw-medium hover-lift ${
          activeCategory === 'All Tools'
            ? 'btn-dark' 
            : 'bg-white text-secondary border'
        }`}
        onClick={() => onSelectCategory('All Tools')}
      >
        All Tools
      </button>
      
      {categories.map((cat) => (
        <button
          key={cat}
          className={`btn rounded-pill px-4 py-2 fw-medium hover-lift ${
            activeCategory === cat 
              ? 'btn-dark' 
              : 'bg-white text-secondary border'
          }`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
