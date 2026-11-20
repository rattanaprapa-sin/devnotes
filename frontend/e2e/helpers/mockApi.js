/**
 * Stateful Mock Helper for DevNotes Playwright E2E Tests.
 * Mocks Supabase Auth session and Backend REST API endpoints in-memory
 * so tests run deterministically without mutating real database records.
 */

export const MOCK_USER = {
  id: 'user-e2e-001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'developer@devnotes.app',
  user_metadata: {
    display_name: 'Tong',
  },
};

export const MOCK_SESSION = {
  access_token: 'mock-jwt-access-token-e2e',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-jwt-refresh-token-e2e',
  user: MOCK_USER,
};

export function createInitialDbState() {
  return {
    notebookCategories: [
      { id: 'nb-cat-1', name: 'Frontend', color: '#dc3545', icon: 'bi-tag', sort_order: 0 },
      { id: 'nb-cat-2', name: 'Backend', color: '#198754', icon: 'bi-tag', sort_order: 1 },
      { id: 'nb-cat-3', name: 'Database', color: '#0d6efd', icon: 'bi-tag', sort_order: 2 },
      { id: 'nb-cat-4', name: 'Other', color: '#6c757d', icon: 'bi-tag', sort_order: 3 },
    ],
    notebooks: [
      {
        id: 'nb-1',
        title: 'SQL',
        description: 'Structured Query Language reference and joins',
        category_id: 'nb-cat-3',
        category: 'Database',
        notebook_categories: { id: 'nb-cat-3', name: 'Database', color: '#0d6efd' },
        is_pinned: true,
        notes_count: 2,
        noteCount: 2,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'nb-2',
        title: 'React.js',
        description: 'Hooks, components, and state management patterns',
        category_id: 'nb-cat-1',
        category: 'Frontend',
        notebook_categories: { id: 'nb-cat-1', name: 'Frontend', color: '#dc3545' },
        is_pinned: false,
        notes_count: 1,
        noteCount: 1,
        updated_at: new Date().toISOString(),
      },
    ],
    noteCategories: [
      { id: 'note-cat-1', name: 'Queries', color: '#0d6efd', icon: 'nb:nb-1', sort_order: 0 },
      { id: 'note-cat-2', name: 'Indexing', color: '#198754', icon: 'nb:nb-1', sort_order: 1 },
    ],
    notes: [
      {
        id: 'note-1',
        notebook_id: 'nb-1',
        title: 'INNER JOIN vs LEFT JOIN',
        content: '- [ ] Review INNER JOIN\n- [x] Practice LEFT JOIN\n\n```sql\nSELECT * FROM users;\n```',
        category_id: 'note-cat-1',
        note_categories: { id: 'note-cat-1', name: 'Queries', color: '#0d6efd' },
        is_pinned: true,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'note-2',
        notebook_id: 'nb-1',
        title: 'B-Tree Indexes',
        content: 'Indexes speed up `WHERE` and `JOIN` queries significantly.',
        category_id: 'note-cat-2',
        note_categories: { id: 'note-cat-2', name: 'Indexing', color: '#198754' },
        is_pinned: false,
        updated_at: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Sets up authenticated session and API routes for a Playwright page.
 * @param {import('@playwright/test').Page} page
 * @param {{ authenticated?: boolean, initialState?: ReturnType<typeof createInitialDbState> }} [options]
 */
export async function setupMockEnvironment(page, options = {}) {
  const { authenticated = true, initialState = createInitialDbState() } = options;
  const db = structuredClone(initialState);

  if (authenticated) {
    await page.addInitScript((sessionData) => {
      window.__E2E_SIGNED_OUT__ = false;
      const origGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key) {
        if (!window.__E2E_SIGNED_OUT__ && /^sb-.*-auth-token$/.test(key)) {
          return JSON.stringify(sessionData);
        }
        return origGetItem.call(this, key);
      };
      localStorage.setItem('devnotes_last_activity', Date.now().toString());
    }, MOCK_SESSION);
  }

  // Mock Supabase Auth REST calls
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/logout') || (url.includes('/token') && method === 'DELETE')) {
      await page.evaluate(() => {
        window.__E2E_SIGNED_OUT__ = true;
      });
      return route.fulfill({ status: 204, body: '' });
    }

    if (url.includes('/token') || url.includes('/signup')) {
      const body = route.request().postDataJSON?.() || {};
      if (body.password === 'wrongpassword') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials', message: 'Invalid login credentials' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
    }

    if (url.includes('/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER),
      });
    }

    if (url.includes('/recover')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION),
    });
  });

  // Mock Notebook Categories API
  await page.route('**/api/notebook-categories**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(db.notebookCategories),
      });
    }

    if (method === 'POST' && url.endsWith('/reorder')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    if (method === 'POST' && url.includes('/update')) {
      const id = url.split('/notebook-categories/')[1].split('/update')[0];
      const payload = route.request().postDataJSON();
      const idx = db.notebookCategories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        db.notebookCategories[idx] = { ...db.notebookCategories[idx], ...payload };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(db.notebookCategories[idx]),
      });
    }

    if (method === 'POST' && url.includes('/delete')) {
      const id = url.split('/notebook-categories/')[1].split('/delete')[0];
      db.notebookCategories = db.notebookCategories.filter((c) => c.id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const created = {
        id: `nb-cat-${Date.now()}`,
        name: payload.name,
        color: payload.color || '#6c757d',
        icon: payload.icon || 'bi-tag',
        sort_order: db.notebookCategories.length,
      };
      db.notebookCategories.push(created);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }
  });

  // Mock Note Categories API
  await page.route('**/api/note-categories**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(db.noteCategories),
      });
    }

    if (method === 'POST' && url.endsWith('/reorder')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    if (method === 'POST' && url.includes('/update')) {
      const id = url.split('/note-categories/')[1].split('/update')[0];
      const payload = route.request().postDataJSON();
      const idx = db.noteCategories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        db.noteCategories[idx] = { ...db.noteCategories[idx], ...payload };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(db.noteCategories[idx]),
      });
    }

    if (method === 'POST' && url.includes('/delete')) {
      const id = url.split('/note-categories/')[1].split('/delete')[0];
      db.noteCategories = db.noteCategories.filter((c) => c.id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const created = {
        id: `note-cat-${Date.now()}`,
        name: payload.name,
        color: payload.color || '#6c757d',
        icon: payload.icon || (payload.notebookId ? `nb:${payload.notebookId}` : 'bi-tag'),
        sort_order: db.noteCategories.length,
      };
      db.noteCategories.push(created);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }
  });

  // Mock Notebooks API
  await page.route('**/api/notebooks**', async (route) => {
    const urlObj = new URL(route.request().url());
    const pathname = urlObj.pathname;
    const method = route.request().method();

    // GET /api/notebooks/:id
    const singleMatch = pathname.match(/\/api\/notebooks\/([^/]+)$/);
    if (method === 'GET' && singleMatch) {
      const nb = db.notebooks.find((n) => n.id === singleMatch[1]);
      return route.fulfill({
        status: nb ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify({ data: nb || null }),
      });
    }

    // GET /api/notebooks
    if (method === 'GET') {
      const categoryId = urlObj.searchParams.get('categoryId');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase();
      let list = [...db.notebooks];
      if (categoryId && categoryId !== 'All') {
        list = list.filter((n) => (categoryId === 'null' ? !n.category_id : n.category_id === categoryId));
      }
      if (search) {
        list = list.filter(
          (n) =>
            n.title.toLowerCase().includes(search) ||
            (n.description || '').toLowerCase().includes(search)
        );
      }
      list.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            data: list,
            count: list.length,
            page: 1,
            limit: 12,
            usedCategoryIds: db.notebooks.map((n) => n.category_id),
            usedCategoryStrings: db.notebooks.map((n) => n.category),
          },
        }),
      });
    }

    // POST /api/notebooks/:id/update
    if (method === 'POST' && pathname.endsWith('/update')) {
      const id = pathname.split('/api/notebooks/')[1].split('/update')[0];
      const payload = route.request().postDataJSON();
      const idx = db.notebooks.findIndex((n) => n.id === id);
      if (idx !== -1) {
        const catId = payload.categoryId !== undefined ? payload.categoryId : db.notebooks[idx].category_id;
        const catObj = db.notebookCategories.find((c) => c.id === catId) || null;
        db.notebooks[idx] = {
          ...db.notebooks[idx],
          ...payload,
          category_id: catId,
          category: catObj ? catObj.name : 'Other',
          notebook_categories: catObj,
        };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: db.notebooks[idx] }),
      });
    }

    // POST /api/notebooks/:id/delete
    if (method === 'POST' && pathname.endsWith('/delete')) {
      const id = pathname.split('/api/notebooks/')[1].split('/delete')[0];
      db.notebooks = db.notebooks.filter((n) => n.id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id } }),
      });
    }

    // POST /api/notebooks
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const catObj = db.notebookCategories.find((c) => c.id === payload.categoryId) || null;
      const created = {
        id: `nb-${Date.now()}`,
        title: payload.title,
        description: payload.description || '',
        category_id: payload.categoryId || null,
        category: catObj ? catObj.name : 'Other',
        notebook_categories: catObj,
        is_pinned: false,
        notes_count: 0,
        noteCount: 0,
        updated_at: new Date().toISOString(),
      };
      db.notebooks.push(created);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: created }),
      });
    }
  });

  // Mock Notes API
  await page.route('**/api/notes**', async (route) => {
    const urlObj = new URL(route.request().url());
    const pathname = urlObj.pathname;
    const method = route.request().method();

    // GET /api/notes/notebook/:notebookId
    if (method === 'GET' && pathname.includes('/api/notes/notebook/')) {
      const notebookId = pathname.split('/api/notes/notebook/')[1];
      const categoryId = urlObj.searchParams.get('categoryId');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase();
      const allForNb = db.notes.filter((n) => n.notebook_id === notebookId);
      let list = [...allForNb];

      if (categoryId && categoryId !== 'All') {
        list = list.filter((n) => (categoryId === 'null' ? !n.category_id : n.category_id === categoryId));
      }
      if (search) {
        list = list.filter(
          (n) =>
            n.title.toLowerCase().includes(search) ||
            (n.content || '').toLowerCase().includes(search)
        );
      }
      list.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            data: list,
            count: list.length,
            page: 1,
            limit: 12,
            usedCategoryIds: allForNb.map((n) => n.category_id).filter(Boolean),
          },
        }),
      });
    }

    // POST /api/notes/:id/update
    if (method === 'POST' && pathname.endsWith('/update')) {
      const id = pathname.split('/api/notes/')[1].split('/update')[0];
      const payload = route.request().postDataJSON();
      const idx = db.notes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        const catId = payload.categoryId !== undefined ? payload.categoryId : db.notes[idx].category_id;
        const catObj = db.noteCategories.find((c) => c.id === catId) || null;
        db.notes[idx] = {
          ...db.notes[idx],
          ...payload,
          category_id: catId,
          note_categories: catObj,
          updated_at: new Date().toISOString(),
        };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: db.notes[idx] }),
      });
    }

    // POST /api/notes/:id/delete
    if (method === 'POST' && pathname.endsWith('/delete')) {
      const id = pathname.split('/api/notes/')[1].split('/delete')[0];
      db.notes = db.notes.filter((n) => n.id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id } }),
      });
    }

    // POST /api/notes
    if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const catObj = db.noteCategories.find((c) => c.id === payload.categoryId) || null;
      const created = {
        id: `note-${Date.now()}`,
        notebook_id: payload.notebookId,
        title: payload.title,
        content: payload.content,
        category_id: payload.categoryId || null,
        note_categories: catObj,
        is_pinned: false,
        updated_at: new Date().toISOString(),
      };
      db.notes.push(created);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: created }),
      });
    }
  });

  // Mock Global Search API
  await page.route('**/api/search**', async (route) => {
    const urlObj = new URL(route.request().url());
    const q = (urlObj.searchParams.get('q') || '').toLowerCase();
    const notebooks = db.notebooks.filter(
      (n) => n.title.toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q)
    );
    const notes = db.notes
      .filter((n) => n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
      .map((n) => ({
        ...n,
        notebooks: { title: db.notebooks.find((nb) => nb.id === n.notebook_id)?.title || 'SQL' },
      }));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { notebooks, notes } }),
    });
  });

  return db;
}

