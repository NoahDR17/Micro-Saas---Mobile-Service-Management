import React from 'react';

interface CompleteJobModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CompleteJobModal({ open, onConfirm, onCancel }: CompleteJobModalProps) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '420px' }}>
        <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>Mark as Completed</h3>
        <p style={{ marginTop: 0, color: '#374151' }}>Confirm you want to mark this job as completed.</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '0.5rem 0.75rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '0.5rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>Complete</button>
        </div>
      </div>
    </div>
  );
}
