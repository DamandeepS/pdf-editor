import React, { useEffect } from 'react';
import { CloseIcon } from '@inq/icons';
import { IconButton } from '../icon-button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="inq-modal-overlay" onClick={onClose}>
      <div
        className="inq-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="inq-modal-header">
          <h3 className="inq-modal-title">{title}</h3>
          <IconButton onClick={onClose} tooltip="Close (Esc)">
            <CloseIcon size={18} />
          </IconButton>
        </div>

        <div className="inq-modal-body">{children}</div>

        {footer && <div className="inq-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
