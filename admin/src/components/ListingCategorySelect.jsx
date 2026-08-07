import React, { useState } from 'react';

/**
 * Inline selector for a product's placement (normal / featured / most rare).
 * Saves immediately on change and shows the result in place, so an admin can
 * work down the table without opening each product.
 */

const OPTIONS = [
  { value: 'normal', label: 'Normal', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'featured', label: 'Featured', className: 'bg-blue-50 text-blue-800 border-blue-300' },
  {
    value: 'most_rare',
    label: 'Most Rare',
    className: 'bg-purple-50 text-purple-800 border-purple-300',
  },
];

function ListingCategorySelect({ value, onSave, disabled = false }) {
  const current = value || 'normal';
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  const handleChange = async (e) => {
    const next = e.target.value;
    if (next === current) return;

    setStatus('saving');
    try {
      await onSave(next);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      // Surface the failure rather than silently reverting — the row still
      // shows the old value because the query cache wasn't updated.
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const option = OPTIONS.find((o) => o.value === current) || OPTIONS[0];

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <select
        value={current}
        onChange={handleChange}
        disabled={disabled || status === 'saving'}
        aria-label="Listing placement"
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-luxury-gold disabled:opacity-50 ${option.className}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {status === 'saving' && <span className="text-[11px] text-gray-400">Saving…</span>}
      {status === 'saved' && <span className="text-[11px] text-green-600">Saved</span>}
      {status === 'error' && <span className="text-[11px] text-red-600">Failed</span>}
    </div>
  );
}

export default ListingCategorySelect;
