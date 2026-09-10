import React, { useState, useRef, useEffect, useId } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  exitDelay?: number;
  disabled?: boolean;
  interactive?: boolean;
  children: React.ReactElement;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delay = 120,
  exitDelay = 0,
  disabled = false,
  interactive = false,
  children,
  className = '',
  ref,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatedId = useId();
  const tooltipId = `inq-tooltip-${generatedId.replace(/:/g, '')}`;

  const clearTimers = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const show = () => {
    if (disabled || !content) return;
    clearTimers();
    if (delay <= 0) {
      setIsVisible(true);
    } else {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const hide = () => {
    clearTimers();
    if (exitDelay <= 0) {
      setIsVisible(false);
    } else {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, exitDelay);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      clearTimers();
      setIsVisible(false);
    }
  };

  // Close tooltip on window scroll, blur, or global Escape key
  useEffect(() => {
    if (!isVisible) return;
    const handleDismiss = () => {
      clearTimers();
      setIsVisible(false);
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimers();
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('scroll', handleDismiss, { passive: true, capture: true });
    window.addEventListener('blur', handleDismiss);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('scroll', handleDismiss, { capture: true });
      window.removeEventListener('blur', handleDismiss);
    };
  }, [isVisible]);

  const child = children as React.ReactElement<any>;
  const existingAriaDescribedBy = child.props['aria-describedby'];
  const combinedAriaDescribedBy = isVisible
    ? [existingAriaDescribedBy, tooltipId].filter(Boolean).join(' ')
    : existingAriaDescribedBy;

  const trigger = React.cloneElement(child, {
    'aria-describedby': combinedAriaDescribedBy,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      child.props.onBlur?.(e);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      handleKeyDown(e);
      child.props.onKeyDown?.(e);
    },
  });

  return (
    <div
      ref={ref}
      className="inq-tooltip-anchor"
      onMouseEnter={interactive ? () => clearTimers() : undefined}
      onMouseLeave={interactive ? () => hide() : undefined}
    >
      {trigger}
      {isVisible && !disabled && content && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`inq-tooltip inq-tooltip--${placement} ${interactive ? 'inq-tooltip--interactive' : ''} ${className}`.trim()}
        >
          {content}
          <div className="inq-tooltip-arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
