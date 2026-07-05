import React, { useState, useEffect, useRef } from 'react';

/**
 * CustomSelect — a fully themed dropdown that matches the site's dark glassmorphism
 * aesthetic instead of using the native OS `<select>` widget.
 *
 * Props:
 *   value       — currently selected value (string)
 *   onChange    — called with the new value (string) when selection changes
 *   options     — array of { value, label } objects
 *   placeholder — optional placeholder string shown when nothing is selected
 *   style       — optional additional style for the trigger wrapper
 */
export default function CustomSelect({ value, onChange, options = [], placeholder = 'Select…', style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const label    = selected ? selected.label : placeholder;

  return (
    <div className="custom-select-wrapper" ref={ref} style={style}>
      {/* Trigger */}
      <button
        type="button"
        className={`custom-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'custom-select-value' : 'custom-select-placeholder'}>
          {label}
        </span>
        <span className={`custom-select-chevron ${open ? 'rotated' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <ul
          className="custom-select-dropdown"
          role="listbox"
          aria-label="Options"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.value === value && (
                <span className="custom-select-tick">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
