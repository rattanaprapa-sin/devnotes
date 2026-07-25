export default function AddButton({ onClick, label }) {
  return (
    <button 
      className={`btn btn-dark position-fixed bottom-0 end-0 m-4 m-md-5 shadow-lg d-flex justify-content-center align-items-center hover-lift ${label ? 'rounded-pill px-4 py-3' : 'rounded-circle p-3'}`}
      onClick={onClick}
      title={label || "Add"}
      style={{ zIndex: 1040 }}
    >
      <i className={`bi bi-plus-lg fs-5 lh-1 ${label ? 'me-2' : ''}`}></i>
      {label && <span className="fw-semibold fs-6">{label}</span>}
    </button>
  );
}
