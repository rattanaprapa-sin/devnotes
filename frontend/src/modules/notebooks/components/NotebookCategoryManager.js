import { useState, useEffect, useCallback } from 'react';
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

function SortableCategoryItem({ category, editingCategory, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-12 col-md-6">
      <div
        className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-4 border transition-all ${editingCategory === category.id ? 'border-primary shadow-sm bg-primary bg-opacity-10' : 'bg-white hover-shadow'}`}
      >
        <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-2" style={{ minWidth: 0 }}>
          <div {...attributes} {...listeners} className="text-secondary opacity-50 hover-opacity-100 flex-shrink-0" style={{ cursor: 'grab' }}>
            <i className="bi bi-grip-vertical fs-5"></i>
          </div>
          <AppBadge
            color={category.color}
            className="px-3 py-2 fs-6 fw-medium text-truncate"
            style={{ maxWidth: '100%' }}
          >
            {category.name}
          </AppBadge>
        </div>

        <div className="d-flex gap-2 flex-shrink-0 ms-2">
          <AppButton
            variant="light"
            className="bg-white border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary hover-bg-secondary hover-text-white transition-all shadow-sm"
            onClick={() => onEdit(category)}
            style={{ width: '32px', height: '32px' }}
            title="Edit"
            icon="bi-pencil-square fs-6"
          />
          <AppButton
            variant="light"
            className="bg-white border rounded-circle p-0 d-flex align-items-center justify-content-center text-danger hover-bg-danger hover-text-white transition-all shadow-sm"
            onClick={() => onDelete(category)}
            style={{ width: '32px', height: '32px' }}
            title="Delete"
            icon="bi-trash3 fs-6"
          />
        </div>
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

    try {
      setIsSaving(true);
      if (editingCategory) {
        await dispatch(editNotebookCategory({
          id: editingCategory,
          data: {
            name: trimmedName,
            color: selectedColor
          }
        })).unwrap();
        toast.success('Category updated');
      } else {
        await dispatch(addNotebookCategory({
          name: trimmedName,
          color: selectedColor
        })).unwrap();
        toast.success('Category created');
      }
      resetForm();
      loadCategories(false);
      if (onCategoryUpdate) onCategoryUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
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

  return (
    <>
      <AppModal
        show={show}
        onClose={onClose}
        title="Manage Notebook Categories"
        icon="bi-tags"
        size="lg"
      >
        <div className="p-1">
          <form onSubmit={handleSaveCategory} className="mb-4 p-4 rounded-4 shadow-sm bg-light border border-dark border-opacity-10">
            <div key={editingCategory ? 'edit' : 'create'} className="animate-fade-slide-up">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 fs-5">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
                    <span className="text-secondary small fw-medium">Preview:</span>
                    <AppBadge
                      color={selectedColor}
                      className="px-2 py-1 text-truncate"
                      style={{ maxWidth: '150px' }}
                    >
                      {newName.trim() || 'Category'}
                    </AppBadge>
                  </div>
                  {editingCategory && (
                    <AppButton
                      variant="white"
                      className="border shadow-sm rounded-pill px-4 py-2 text-secondary fw-medium hover-bg-light transition-all"
                      style={{ fontSize: '0.875rem' }}
                      onClick={resetForm}
                    >
                      Cancel
                    </AppButton>
                  )}
                </div>
              </div>
              <div className="row g-4">
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
                  <label className="form-label small fw-bold text-secondary">Color</label>
                  <div className="d-flex flex-wrap gap-2 pt-1 align-items-center">
                    {COLORS.map(color => (
                      <div
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className="rounded-circle cursor-pointer d-flex align-items-center justify-content-center text-white transition-all"
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

                    <div className="d-flex align-items-center gap-2 ms-1">
                      <div className="position-relative">
                        <input
                          type="color"
                          id="customColor"
                          className="position-absolute opacity-0"
                          style={{ width: '32px', height: '32px', top: 0, left: 0, cursor: 'pointer' }}
                          value={(!COLORS.includes(selectedColor) && /^#[0-9A-Fa-f]{6}$/.test(selectedColor)) ? selectedColor : '#ffffff'}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          title="Choose custom color"
                        />
                        <label
                          htmlFor="customColor"
                          className="rounded-circle cursor-pointer d-flex align-items-center justify-content-center transition-all bg-white mb-0"
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

                      <div className="d-flex align-items-center bg-white border rounded-pill px-2 py-1 shadow-sm">
                        <span className="text-secondary small fw-bold me-1 ms-1">#</span>
                        <input
                          type="text"
                          className="border-0 shadow-none text-uppercase fw-medium p-0"
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
                  </div>
                </div>
              </div>
              <div className="mt-4 text-end">
                <AppButton
                  type="submit"
                  variant="dark"
                  className="rounded-pill px-5 fw-medium shadow-sm"
                  disabled={isSaving || !newName.trim()}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  icon={!isSaving ? (editingCategory ? 'bi-check2-circle' : 'bi-plus-lg') : null}
                >
                  {isSaving ? '' : (editingCategory ? 'Update Category' : 'Add Category')}
                </AppButton>
              </div>
            </div>
          </form>

          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-collection"></i> All Categories
          </h6>
          {isLoading ? (
            <div className="text-center py-4"><div className="spinner-border text-secondary" role="status"></div></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 bg-light rounded-4 border-dashed">
              <i className="bi bi-tags text-secondary fs-1 mb-2 d-block opacity-50"></i>
              <p className="text-secondary mb-0 fw-medium">No categories yet</p>
              <small className="text-secondary opacity-75">Create one above to organize your notes</small>
            </div>
          ) : (
            <div
              className="pe-2"
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
                  <div className="row g-3">
                    {categories.map(cat => (
                      <SortableCategoryItem
                        key={cat.id}
                        category={cat}
                        editingCategory={editingCategory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </AppModal>

      <DeleteConfirmModal
        show={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message={
          <>
            Are you sure you want to delete <strong style={{ color: categoryToDelete?.color }}>{categoryToDelete?.name}</strong>?<br /><br />
            Notebooks using it will lose this label.<br />
            This process cannot be undone.
          </>
        }
      />
    </>
  );
}
