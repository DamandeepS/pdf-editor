import React, { useEffect, useId, useRef } from 'react';
import { CloseIcon } from '@inq/icons';
import { IconButton } from '../icon-button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  actions,
  size = 'md',
  className = '',
  ref,
}) => {
  const generatedId = useId();
  const titleId = `modal-title-${generatedId.replace(/:/g, '')}`;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus?.();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

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

  const modalFooter = footer ?? actions;

  return (
    <div className="inq-modal-overlay" onClick={onClose} ref={ref}>
      <div
        className={`inq-modal-dialog inq-modal-dialog--${size} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="inq-modal-header">
          <h3 id={titleId} className="inq-modal-title">{title}</h3>
          <IconButton onClick={onClose} tooltip="Close (Esc)">
            <CloseIcon size={18} />
          </IconButton>
        </div>

        <div className="inq-modal-body">{children}</div>

        {modalFooter && <div className="inq-modal-footer">{modalFooter}</div>}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
