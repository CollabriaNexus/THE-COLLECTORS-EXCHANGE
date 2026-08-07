import React, { useRef, useState } from 'react';

/**
 * A free-text cell for an admin-defined column.
 *
 * Saves on blur (and on Enter) rather than on every keystroke, so typing a
 * sentence doesn't fire a request per character. Escape reverts.
 */
function CustomNoteCell({ value = '', onSave, placeholder = '—' }) {
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [isFocused, setIsFocused] = useState(false);
  // The last value we know the server holds. Tracked as state (not a ref) so it
  // can be adjusted during render without mutating a ref mid-render.
  const [serverValue, setServerValue] = useState(value);
  const inputRef = useRef(null);

  // If the row is refetched and another admin changed this note, adopt the new
  // value — but never clobber what this admin is currently typing. This is
  // React's "adjust state when props change" pattern: assigning during render
  // is cheaper than an effect, which would paint the stale value first.
  if (!isFocused && value !== serverValue) {
    setServerValue(value);
    setDraft(value);
  }

  const commit = async () => {
    setIsFocused(false);
    const next = draft.trim();
    if (next === (serverValue || '').trim()) return;

    setStatus('saving');
    try {
      await onSave(next);
      setServerValue(next);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1200);
    } catch {
      setDraft(serverValue || '');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        value={draft}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            setDraft(serverValue || '');
            e.currentTarget.blur();
          }
        }}
        className={`w-40 px-2 py-1.5 text-sm border rounded-md outline-none transition-colors focus:ring-2 focus:ring-luxury-gold focus:border-transparent ${
          status === 'error' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      />
      {status === 'saving' && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-gray-400">Saving…</span>
      )}
      {status === 'saved' && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-green-600">Saved</span>
      )}
      {status === 'error' && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-red-600">Failed — retry</span>
      )}
    </div>
  );
}

export default CustomNoteCell;
