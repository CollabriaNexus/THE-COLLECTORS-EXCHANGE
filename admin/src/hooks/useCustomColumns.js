import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tce.admin.productCustomColumns';

/**
 * Admin-defined extra columns for the products table.
 *
 * The column DEFINITIONS (id + heading) are shared workspace config and live in
 * localStorage — they're cheap, change rarely, and don't belong in the product
 * table. The per-product VALUES are persisted server-side on
 * `product.adminNotes`, keyed by column id, so notes survive a browser change
 * and are visible to every admin.
 *
 * Ids are generated rather than derived from the heading so that renaming a
 * column keeps its existing cell values attached.
 */
export function useCustomColumns() {
  const [columns, setColumns] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Corrupt or unavailable storage shouldn't take the page down.
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch {
      // Quota or private-mode failures are non-fatal; the table still works
      // for this session.
    }
  }, [columns]);

  const addColumn = useCallback((label = 'New column') => {
    const id = `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    setColumns((prev) => [...prev, { id, label }]);
    return id;
  }, []);

  const renameColumn = useCallback((id, label) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)));
  }, []);

  const removeColumn = useCallback((id) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { columns, addColumn, renameColumn, removeColumn };
}

export default useCustomColumns;
