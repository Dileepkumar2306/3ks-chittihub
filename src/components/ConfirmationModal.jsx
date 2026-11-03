import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useChits } from '../context/ChitContext';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useChits();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header" style={{ borderBottomColor: 'var(--rose-border)' }}>
          <div className="modal-title" style={{ color: 'var(--rose-500)' }}>
            <AlertTriangle size={20} />
            <span>{title || t('confirmAction')}</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            {message || t('confirmDelete')}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
};
