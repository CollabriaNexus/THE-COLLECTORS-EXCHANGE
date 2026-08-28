import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { WATCH_BRANDS } from '../config/watchBrands';

/**
 * Searchable brand picker that also accepts a free-text value.
 *
 * The typed text *is* the value — there is no separate "committed" state — so a
 * vendor listing a house-marked or unlisted brand simply types it and it persists.
 * When what they typed does not exactly match a suggestion, an explicit
 * `Use "<typed value>"` row is offered so the free-text path is discoverable
 * rather than implicit.
 *
 * Deliberately optional: `required` is never set. Many collectibles are unbranded.
 *
 * Keyboard: ArrowDown/ArrowUp move, Enter selects the highlighted row, Escape
 * closes without clearing, Tab closes. Clicking outside closes.
 */
export default function BrandCombobox({
  id,
  value = '',
  onChange,
  options = WATCH_BRANDS,
  placeholder = 'Start typing a brand, e.g. HMT, Titan, Seiko…',
  disabled = false,
  // Defaults mirror the primary listing-form inputs. `text-base` (16px) is not
  // optional on mobile: anything smaller makes iOS Safari zoom the viewport on
  // focus. Compact call sites can step down to 14px from `sm:` upward.
  inputClassName = 'w-full p-3 sm:p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold text-base',
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const reactId = useId();
  const inputId = id || `brand-combobox-${reactId}`;
  const listboxId = `${inputId}-listbox`;

  const query = value.trim();
  const queryLower = query.toLowerCase();

  const exactMatch = useMemo(
    () => options.some((opt) => opt.toLowerCase() === queryLower),
    [options, queryLower],
  );

  // With no query — or once the query exactly names a brand — show everything, so
  // the field stays browsable instead of collapsing to the one row already chosen.
  const filtered = useMemo(() => {
    if (!queryLower || exactMatch) return options;
    return options.filter((opt) => opt.toLowerCase().includes(queryLower));
  }, [options, queryLower, exactMatch]);

  // The trailing free-text row, present only when the typed value is genuinely new.
  const showCustom = query !== '' && !exactMatch;

  const items = useMemo(() => {
    const rows = filtered.map((brand) => ({ kind: 'option', value: brand }));
    if (showCustom) rows.push({ kind: 'custom', value: query });
    return rows;
  }, [filtered, showCustom, query]);

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  // Close on any outside pointer interaction.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open, close]);

  // Keep the keyboard-highlighted row inside the scroll viewport.
  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return;
    const node = listRef.current.querySelector(`[data-index="${highlight}"]`);
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const select = (brand) => {
    onChange(brand);
    close();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(event.key === 'ArrowDown' ? 0 : items.length - 1);
        return;
      }
      if (items.length === 0) return;
      setHighlight((prev) => {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = prev + step;
        if (next < 0) return items.length - 1;
        if (next >= items.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter') {
      if (open && highlight >= 0 && items[highlight]) {
        // Swallow the Enter so it selects a brand instead of submitting the listing.
        event.preventDefault();
        select(items[highlight].value);
      } else if (open) {
        event.preventDefault();
        close();
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        close();
      }
      return;
    }

    if (event.key === 'Tab') close();
  };

  const activeDescendant =
    open && highlight >= 0 && items[highlight] ? `${listboxId}-option-${highlight}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={`${inputClassName} pr-16 disabled:bg-gray-50 disabled:text-gray-400`}
      />

      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
        {value !== '' && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setHighlight(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear brand"
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-heritage-charcoal transition-colors"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? 'Hide brand suggestions' : 'Show brand suggestions'}
          onClick={() => {
            setOpen((prev) => !prev);
            setHighlight(-1);
            inputRef.current?.focus();
          }}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-heritage-charcoal transition-colors"
        >
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Watch brands"
          className="absolute z-40 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-lg"
        >
          {items.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 italic">No matching brands</li>
          )}
          {items.map((item, index) => {
            const isHighlighted = index === highlight;
            const isSelected = item.kind === 'option' && item.value === value;
            return (
              <li
                key={`${item.kind}-${item.value}`}
                id={`${listboxId}-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(item.value)}
                onMouseEnter={() => setHighlight(index)}
                className={`px-4 py-3 min-h-[44px] flex items-center justify-between gap-2 cursor-pointer text-base sm:text-sm transition-colors ${
                  isHighlighted ? 'bg-luxury-gold/10 text-heritage-charcoal' : 'text-gray-700'
                }`}
              >
                {item.kind === 'custom' ? (
                  <span className="truncate">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mr-2">
                      Custom
                    </span>
                    Use &ldquo;{item.value}&rdquo;
                  </span>
                ) : (
                  <span className="truncate">{item.value}</span>
                )}
                {isSelected && <Check size={14} className="text-luxury-gold shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
