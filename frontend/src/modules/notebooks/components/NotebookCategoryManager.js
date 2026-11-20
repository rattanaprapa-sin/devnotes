import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchNotebookCategories, addNotebookCategory, editNotebookCategory, removeNotebookCategory, updateNotebookCategoryOrder } from '../../../store/categoriesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import AppButton from '../../../shared/ui/AppButton';
import AppBadge from '../../../shared/ui/AppBadge';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COLORS } from '../../../shared/constants/colors';
import { isCategoryHidden, normalizeHexColor } from '../../../shared/utils/categoryUtils';

function SortableCategoryItem({ category, editingCategory, onEdit, onDelete, onToggleHide }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const hidden = isCategoryHidden(category);

  useEffect(() => {
    if (!menuPos) return;
    const initialWidth = window.innerWidth;
    const scrollArea = triggerRef.current?.closest('.cat-manager-scroll-area');
    const initialScrollTop = scrollArea ? scrollArea.scrollTop : 0;

    const handleOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setMenuPos(null);
      }
    };
    const handleScroll = () => {
      if (scrollArea && Math.abs(scrollArea.scrollTop - initialScrollTop) > 4) {
        setMenuPos(null);
      }
    };
    const handleResize = () => {
      if (Math.abs(window.innerWidth - initialWidth) > 4) {
        setMenuPos(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    scrollArea?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      scrollArea?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuPos]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (menuPos) {
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 118;
    const menuHeight = 104;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuHeight + 8 ? rect.bottom + 4 : rect.top - menuHeight - 4;
    setMenuPos({ top, left });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-6">
      <div
        className={`d-flex align-items-center justify-content-between rounded-4 transition-all cat-item-card ${
          editingCategory === category.id
            ? 'border border-primary shadow-sm bg-primary bg-opacity-10'
            : hidden
            ? ''
            : 'border bg-white hover-shadow'
        }`}
        style={{
          padding: '7px 10px',
          ...(editingCategory !== category.id && hidden
            ? {
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
              }
            : {}),
        }}
      >
        <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-1" style={{ minWidth: 0 }}>
          <div {...attributes} {...listeners} className="text-secondary opacity-50 hover-opacity-100 flex-shrink-0 px-1 cat-item-grip" style={{ cursor: 'grab' }}>
            <i className="bi bi-grip-vertical"></i>
          </div>
          <AppBadge
            color={category.color}
            className={`fw-medium text-truncate cat-item-badge ${hidden ? 'text-decoration-line-through' : ''}`}
            style={{
              maxWidth: '100%',
              fontSize: '0.84rem',
              padding: '4px 10px',
              opacity: hidden ? 0.5 : 1,
            }}
          >
            {category.name}
          </AppBadge>
        </div>

        {/* Desktop Action Buttons (3 inline circle buttons) */}
        <div className="d-none d-md-flex align-items-center flex-shrink-0 ms-2 cat-item-actions" style={{ gap: '5px' }}>
          <button
            type="button"
            className="btn rounded-circle d-flex align-items-center justify-content-center transition-all cat-item-btn"
            onClick={() => onToggleHide(category)}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              backgroundColor: hidden ? '#475569' : '#f8f9fa',
              border: `1px solid ${hidden ? '#334155' : '#dee2e6'}`,
              color: hidden ? '#ffffff' : '#495057',
              boxShadow: hidden ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
            }}
            title={hidden ? 'Hidden (Click to show)' : 'Hide Category'}
          >
            <i className={`bi ${hidden ? 'bi-eye-slash-fill' : 'bi-eye'}`} style={{ fontSize: '0.8rem' }}></i>
          </button>
          <button
            type="button"
            className="btn bg-light border rounded-circle d-flex align-items-center justify-content-center text-secondary hover-bg-secondary hover-text-white transition-all cat-item-btn"
            onClick={() => onEdit(category)}
            style={{ width: '28px', height: '28px', padding: 0 }}
            title="Edit"
          >
            <i className="bi bi-pencil-square" style={{ fontSize: '0.78rem' }}></i>
          </button>
          <button
            type="button"
            className="btn bg-light border rounded-circle d-flex align-items-center justify-content-center text-danger hover-bg-danger hover-text-white transition-all cat-item-btn"
            onClick={() => onDelete(category)}
            style={{ width: '28px', height: '28px', padding: 0 }}
            title="Delete"
          >
            <i className="bi bi-trash3" style={{ fontSize: '0.78rem' }}></i>
          </button>
        </div>

        {/* Mobile Action Button (Single 3-dots trigger) */}
        <div className="d-flex d-md-none align-items-center flex-shrink-0 ms-1" style={{ gap: '3px' }}>
          {hidden && (
            <i
              className="bi bi-eye-slash-fill text-secondary opacity-75"
              style={{ fontSize: '0.68rem' }}
              title="Hidden"
            ></i>
          )}
          <button
            ref={triggerRef}
            type="button"
            className="btn rounded-circle d-flex align-items-center justify-content-center transition-all cat-item-more-btn"
            onClick={handleToggleMenu}
            style={{
              width: '22px',
              height: '22px',
              padding: 0,
              backgroundColor: menuPos ? '#e2e8f0' : 'transparent',
              border: 'none',
              color: '#64748b',
            }}
            title="Category options"
          >
            <i className="bi bi-three-dots-vertical" style={{ fontSize: '0.78rem' }}></i>
          </button>
        </div>

        {/* Mobile Floating Dropdown Menu via Portal */}
        {menuPos &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={menuRef}
              className="bg-white border rounded-3 shadow-lg py-1 cat-item-mobile-menu"
              style={{
                position: 'fixed',
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
                width: '118px',
                zIndex: 1095,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 px-2 py-1 border-0 rounded-0 text-dark cat-item-menu-option"
                onClick={() => {
                  setMenuPos(null);
                  onToggleHide(category);
                }}
              >
                <i className={`bi ${hidden ? 'bi-eye text-primary' : 'bi-eye-slash text-secondary'}`}></i>
                <span>{hidden ? 'Show' : 'Hide'}</span>
              </button>
              <button
                type="button"
                className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 px-2 py-1 border-0 rounded-0 text-dark cat-item-menu-option"
                onClick={() => {
                  setMenuPos(null);
                  onEdit(category);
                }}
              >
                <i className="bi bi-pencil-square text-secondary"></i>
                <span>Edit</span>
              </button>
              <hr className="my-1 opacity-10" />
              <button
                type="button"
                className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 px-2 py-1 border-0 rounded-0 text-danger cat-item-menu-option"
                onClick={() => {
                  setMenuPos(null);
                  onDelete(category);
                }}
              >
                <i className="bi bi-trash3"></i>
                <span>Delete</span>
              </button>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}

export default function NotebookCategoryManager({ show, onClose, onCategoryUpdate }) {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryToToggleHide, setCategoryToToggleHide] = useState(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

  const loadCategories = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setIsLoading(true);
      const data = await dispatch(fetchNotebookCategories()).unwrap();
      setCategories(data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (show) {
      resetForm();
      setCategoryToDelete(null);
      setCategoryToToggleHide(null);
      setShowUpdateConfirm(false);
      loadCategories();
    }
  }, [show, loadCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      let newCategories = [];
      setCategories((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        newCategories = arrayMove(items, oldIndex, newIndex);
        return newCategories;
      });

      // Save order to backend
      try {
        const categoryOrders = newCategories.map((cat, index) => ({
          id: cat.id,
          sort_order: index
        }));
        await dispatch(updateNotebookCategoryOrder(categoryOrders)).unwrap();
        if (onCategoryUpdate) onCategoryUpdate();
      } catch {
        toast.error('Failed to save category order');
        loadCategories(false); // Revert on failure
      }
    }
  };

  const handleToggleHide = (category) => {
    setCategoryToToggleHide(category);
  };

  const confirmToggleHide = async () => {
    const category = categoryToToggleHide;
    if (!category) return;
    const currentlyHidden = isCategoryHidden(category);
    const nextIcon = currentlyHidden ? 'bi-tag' : 'hidden';

    try {
      const updated = await dispatch(
        editNotebookCategory({
          id: category.id,
          data: {
            name: category.name,
            color: category.color,
            icon: nextIcon,
          },
        })
      ).unwrap();

      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? updated || { ...c, icon: nextIcon } : c))
      );
      toast.success(currentlyHidden ? `Showing "${category.name}"` : `Hidden "${category.name}"`);
      if (onCategoryUpdate) onCategoryUpdate();
    } catch {
      toast.error('Failed to update category visibility');
    } finally {
      setCategoryToToggleHide(null);
    }
  };

  const executeSaveCategory = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const validColor = normalizeHexColor(selectedColor);

    try {
      setIsSaving(true);
      const existingCat = categories.find((c) => c.id === editingCategory);
      const keepHidden = existingCat && isCategoryHidden(existingCat);
      if (editingCategory) {
        await dispatch(editNotebookCategory({
          id: editingCategory,
          data: {
            name: trimmedName,
            color: validColor,
            icon: keepHidden ? 'hidden' : 'bi-tag'
          }
        })).unwrap();
        toast.success('Category updated');
      } else {
        await dispatch(addNotebookCategory({
          name: trimmedName,
          color: validColor
        })).unwrap();
        toast.success('Category created');
      }
      setShowUpdateConfirm(false);
      resetForm();
      loadCategories(false);
      if (onCategoryUpdate) onCategoryUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    // Check for duplicate names (case-insensitive)
    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase() && cat.id !== editingCategory
    );

    if (isDuplicate) {
      toast.error('Category name already exists!');
      return;
    }

    if (editingCategory) {
      setShowUpdateConfirm(true);
    } else {
      await executeSaveCategory();
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category.id);
    setNewName(category.name);
    setSelectedColor(category.color);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewName('');
    setSelectedColor(COLORS[0]);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await dispatch(removeNotebookCategory(categoryToDelete.id)).unwrap();
      toast.success('Category deleted');
      const updated = await dispatch(fetchNotebookCategories()).unwrap();
      setCategories(updated || []);
      if (onCategoryUpdate) onCategoryUpdate();
      if (editingCategory === categoryToDelete.id) resetForm();
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setCategoryToDelete(null);
    }
  };

  if (!show) return null;

  const editingCatObj = editingCategory ? categories.find((c) => c.id === editingCategory) : null;
  const hasCategoryChanges =
    !editingCatObj ||
    newName.trim() !== (editingCatObj.name || '').trim() ||
    selectedColor.toLowerCase() !== (editingCatObj.color || '').toLowerCase();
  const canSubmitCategory = Boolean(newName.trim()) && hasCategoryChanges;

  return (
    <>
      <AppModal
        show={show}
        onClose={onClose}
        title="Manage Notebook Categories"
        icon="bi-tags"
        size="lg"
      >
        <div className="p-0 p-sm-1 cat-manager-wrapper">
          <form onSubmit={handleSaveCategory} className="mb-4 p-3 p-sm-4 rounded-4 shadow-sm bg-light border border-dark border-opacity-10 cat-manager-form">
            <div key={editingCategory ? 'edit' : 'create'} className="animate-fade-slide-up">
              <div className="d-flex justify-content-between align-items-center mb-3 mb-sm-4 flex-wrap gap-2 gap-sm-3 cat-manager-form-header">
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 fs-5 cat-manager-form-title">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h6>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div
                    className="d-flex align-items-center gap-2 bg-white rounded-pill shadow-sm border cat-manager-preview-box"
                    style={{ padding: '6px 14px' }}
                  >
                    <span className="text-secondary small fw-medium cat-manager-preview-label">Preview:</span>
                    <AppBadge
                      color={selectedColor}
                      className="px-3 py-1 fw-medium text-truncate cat-manager-preview-badge"
                      style={{ maxWidth: '160px', fontSize: '0.85rem' }}
                    >
                      {newName.trim() || 'Category'}
                    </AppBadge>
                  </div>
                  {editingCategory && (
                    <AppButton
                      variant="white"
                      className="border shadow-sm rounded-pill px-3 py-2 text-secondary fw-medium hover-bg-light transition-all cat-manager-cancel-btn"
                      style={{ fontSize: '0.85rem' }}
                      onClick={resetForm}
                    >
                      Cancel
                    </AppButton>
                  )}
                </div>
              </div>
              <div className="row g-3 g-sm-4 cat-manager-fields-row">
                <div className="col-md-6">
                  <AppInput
                    label={<><span className="small fw-bold text-secondary">Name</span></>}
                    className="mb-0"
                    placeholder="Category name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary cat-manager-color-label">Color</label>
                  <div className="d-flex flex-wrap gap-2 pt-1 align-items-center cat-manager-swatches">
                    <div className="cat-preset-colors-row">
                      {COLORS.map(color => (
                        <div
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="rounded-circle cursor-pointer d-flex align-items-center justify-content-center text-white transition-all cat-color-swatch"
                          style={{
                            width: '32px', height: '32px', backgroundColor: color,
                            transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            margin: '2px'
                          }}
                        >
                          {selectedColor === color && <i className="bi bi-check" style={{ fontSize: '20px' }}></i>}
                        </div>
                      ))}
                    </div>

                    <div className="d-flex align-items-center justify-content-between gap-2 ms-md-1 cat-custom-color-row">
                      <div className="d-flex align-items-center gap-2">
                        <div className="position-relative">
                          <input
                            type="color"
                            id="customColor"
                            className="position-absolute opacity-0 cat-color-swatch"
                            style={{ width: '32px', height: '32px', top: 0, left: 0, cursor: 'pointer' }}
                            value={(!COLORS.includes(selectedColor) && /^#[0-9A-Fa-f]{6}$/.test(selectedColor)) ? selectedColor : '#ffffff'}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            title="Choose custom color"
                          />
                          <label
                            htmlFor="customColor"
                            className="rounded-circle cursor-pointer d-flex align-items-center justify-content-center transition-all bg-white mb-0 cat-color-swatch"
                            style={{
                              width: '32px', height: '32px',
                              transform: !COLORS.includes(selectedColor) ? 'scale(1.15)' : 'scale(1)',
                              boxShadow: !COLORS.includes(selectedColor)
                                ? `0 0 0 2px white, 0 0 0 4px ${selectedColor}`
                                : '0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px #dee2e6',
                              cursor: 'pointer',
                              background: !COLORS.includes(selectedColor) ? selectedColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                            }}
                          >
                            {!COLORS.includes(selectedColor) ? (
                              <i className="bi bi-check" style={{ fontSize: '20px', color: '#fff', mixBlendMode: 'difference' }}></i>
                            ) : (
                              <i className="bi bi-plus-lg text-white" style={{ fontSize: '18px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}></i>
                            )}
                          </label>
                        </div>

                        <div className="d-flex align-items-center bg-white border rounded-pill px-2 py-1 shadow-sm cat-hex-box">
                          <span className="text-secondary small fw-bold me-1 ms-1">#</span>
                          <input
                            type="text"
                            className="border-0 shadow-none text-uppercase fw-medium p-0 cat-hex-input"
                            style={{ width: '60px', fontSize: '0.85rem', outline: 'none', background: 'transparent' }}
                            placeholder="HEX"
                            value={selectedColor.startsWith('#') ? selectedColor.substring(1) : selectedColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                setSelectedColor('#' + val);
                              }
                            }}
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <AppButton
                        type="submit"
                        variant={canSubmitCategory ? 'dark' : 'secondary'}
                        className="rounded-pill px-3 fw-medium shadow-sm d-inline-flex d-md-none align-items-center cat-manager-submit-btn"
                        disabled={isSaving || !canSubmitCategory}
                        isLoading={isSaving}
                        loadingText="Saving..."
                        icon={!isSaving ? (editingCategory ? 'bi-check2-circle' : 'bi-plus-lg') : null}
                      >
                        {isSaving ? '' : (editingCategory ? 'Update' : 'Add Category')}
                      </AppButton>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-end d-none d-md-block cat-manager-submit-row">
                <AppButton
                  type="submit"
                  variant={canSubmitCategory ? 'dark' : 'secondary'}
                  className="rounded-pill px-5 fw-medium shadow-sm cat-manager-submit-btn"
                  disabled={isSaving || !canSubmitCategory}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  icon={!isSaving ? (editingCategory ? 'bi-check2-circle' : 'bi-plus-lg') : null}
                >
                  {isSaving ? '' : (editingCategory ? 'Update Category' : 'Add Category')}
                </AppButton>
              </div>
            </div>
          </form>

          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 cat-manager-list-title">
            <i className="bi bi-collection"></i> All Categories
          </h6>
          <div className="cat-manager-list-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div className="text-center flex-grow-1 d-flex align-items-center justify-content-center py-4">
                <div className="spinner-border text-secondary" role="status"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-4 border-dashed flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <i className="bi bi-tags text-secondary fs-1 mb-2 d-block opacity-50"></i>
                <p className="text-secondary mb-0 fw-medium">No categories yet</p>
                <small className="text-secondary opacity-75">Create one above to organize your notes</small>
              </div>
            ) : (
              <div
                className="pe-1 pe-sm-2 cat-manager-scroll-area"
                style={{
                  maxHeight: '40vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.2) transparent'
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                <SortableContext
                  items={categories.map(c => c.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="row g-3 cat-manager-grid">
                    {categories.map(cat => (
                      <SortableCategoryItem
                        key={cat.id}
                        category={cat}
                        editingCategory={editingCategory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleHide={handleToggleHide}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
        </div>
      </AppModal>

      <DeleteConfirmModal
        show={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message={
          <>
            Are you sure you want to delete <strong style={{ color: categoryToDelete?.color }}>{categoryToDelete?.name}</strong>?<br />
            <span className="d-block mt-1">Notebooks using this category will lose this label</span>
          </>
        }
      />

      <DeleteConfirmModal
        show={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={executeSaveCategory}
        title="Update Category?"
        message={
          <>
            Are you sure you want to update this category to <strong style={{ color: selectedColor }}>{newName.trim()}</strong>?
          </>
        }
        confirmText="Update"
        variant="dark"
        icon="bi-pencil-square"
        isDeleting={isSaving}
      />

      <DeleteConfirmModal
        show={!!categoryToToggleHide}
        onClose={() => setCategoryToToggleHide(null)}
        onConfirm={confirmToggleHide}
        title={isCategoryHidden(categoryToToggleHide) ? 'Show Category?' : 'Hide Category?'}
        message={
          isCategoryHidden(categoryToToggleHide) ? (
            <>
              Are you sure you want to show <strong style={{ color: categoryToToggleHide?.color }}>{categoryToToggleHide?.name}</strong> in category filters?
            </>
          ) : (
            <>
              Are you sure you want to hide <strong style={{ color: categoryToToggleHide?.color }}>{categoryToToggleHide?.name}</strong> from category filters?
            </>
          )
        }
        confirmText={isCategoryHidden(categoryToToggleHide) ? 'Show' : 'Hide'}
        variant="dark"
        icon={isCategoryHidden(categoryToToggleHide) ? 'bi-eye' : 'bi-eye-slash'}
      />
    </>
  );
}
