import React, { useEffect } from 'react';
import { CloseIcon, InfoIcon, CheckIcon, AlertTriangleIcon, AlertCircleIcon } from '@inq/icons';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  id?: string;
  title?: string;
  message: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  info: <InfoIcon size={18} />,
  success: <CheckIcon size={18} />,
  warning: <AlertTriangleIcon size={18} />,
  danger: <AlertCircleIcon size={18} />,
};

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration,
  onClose,
  actionLabel,
  onAction,
  className = '',
}) => {
  useEffect(() => {
    if (!duration || duration <= 0 || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isAlert = variant === 'danger' || variant === 'warning';

  return (
    <div
      id={id}
      role={isAlert ? 'alert' : 'status'}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
      className={`inq-toast inq-toast--${variant} ${className}`.trim()}
    >
      <span className="inq-toast-icon" aria-hidden="true">
        {variantIcons[variant]}
      </span>

      <div className="inq-toast-body">
        {title && <h4 className="inq-toast-title">{title}</h4>}
        <div className="inq-toast-message">{message}</div>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inq-toast-action"
        >
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="inq-toast-close"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';

