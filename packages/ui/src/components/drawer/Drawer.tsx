import React, { useEffect, useId } from 'react';
import { CloseIcon } from '@inq/icons';

export type DrawerPlacement = 'left' | 'right' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnEsc?: boolean;
  closeOnBackdropClick?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  description,
  footer,
  placement = 'right',
  size = 'md',
  closeOnEsc = true,
  closeOnBackdropClick = true,
  children,
  className = '',
}) => {
  const generatedId = useId();
  const titleId = `inq-drawer-title-${generatedId.replace(/:/g, '')}`;
  const descId = `inq-drawer-desc-${generatedId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div className="inq-drawer-root" role="presentation">
      <div
        className="inq-drawer-backdrop"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`inq-drawer inq-drawer--${placement} inq-drawer--${size} ${className}`.trim()}
      >
        <div className="inq-drawer-header">
          <div className="inq-drawer-title-group">
            {title && (
              <h3 id={titleId} className="inq-drawer-title">
                {title}
              </h3>
            )}
            {description && (
              <p id={descId} className="inq-drawer-description">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="inq-drawer-close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="inq-drawer-content">{children}</div>

        {footer && <div className="inq-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
};

Drawer.displayName = 'Drawer';

