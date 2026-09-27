import React, { useMemo, useState } from 'react';

/**
 * Lightweight export dropdown.
 *
 * props:
 * - label: string
 * - disabled?: boolean
 * - options: Array<{ id: string, label: string, onSelect: () => Promise<void> | void }>
 */
const ExportMenu = ({ label = 'Export', disabled = false, options = [] }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const safeOptions = useMemo(() => (Array.isArray(options) ? options.filter(Boolean) : []), [options]);

  const handleSelect = async (opt) => {
    try {
      setBusy(true);
      setOpen(false);
      await opt.onSelect?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={disabled || busy || safeOptions.length === 0}
        onClick={() => setOpen((v) => !v)}
      >
        {busy ? 'Working…' : label}
      </button>

      {open && (
        <div
          className="export-menu-popover"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            zIndex: 10,
            minWidth: 220,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 8,
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}
        >
          {safeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="export-menu-item"
              onClick={() => handleSelect(opt)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;

