import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Header for an admin-defined column: click the heading to rename it in place,
 * or remove the column entirely.
 */
function CustomColumnHeader({ column, onRename, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.label);

  const commit = () => {
    const next = draft.trim();
    onRename(column.id, next || 'Untitled');
    if (!next) setDraft('Untitled');
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(column.label);
            setEditing(false);
          }
        }}
        className="w-32 px-2 py-1 text-sm font-semibold border border-luxury-gold rounded outline-none"
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <button
        type="button"
        onClick={() => {
          setDraft(column.label);
          setEditing(true);
        }}
        title="Click to rename"
        className="text-sm font-semibold text-heritage-dark hover:text-luxury-gold transition-colors"
      >
        {column.label}
      </button>
      <button
        type="button"
        onClick={() => onRemove(column.id)}
        title="Remove column"
        aria-label={`Remove column ${column.label}`}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default CustomColumnHeader;
