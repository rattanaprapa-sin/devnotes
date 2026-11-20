import AppButton from '../../../shared/ui/AppButton';

export default function AddButton({ onClick, label }) {
  return (
    <AppButton 
      variant="dark"
      className={`position-fixed bottom-0 end-0 m-3 m-md-5 shadow-lg d-flex justify-content-center align-items-center hover-lift ${label ? 'rounded-pill floating-add-btn' : 'rounded-circle p-3'}`}
      onClick={onClick}
      title={label || "Add"}
      style={{ zIndex: 1040 }}
      icon={`bi-plus-lg lh-1 ${label ? 'me-1' : ''}`}
    >
      {label && <span className="fw-semibold">{label}</span>}
    </AppButton>
  );
}
