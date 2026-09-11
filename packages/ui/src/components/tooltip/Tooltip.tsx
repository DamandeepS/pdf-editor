import React, { useState, useRef, useId } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delay = 150,
  disabled = false,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);
  const generatedId = useId();
  const tooltipId = `inq-tooltip-${generatedId.replace(/:/g, '')}`;

  const show = () => {
    if (disabled || !content) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      hide();
    }
  };

  // Clone trigger child to attach event handlers and aria-describedby
  const child = children as React.ReactElement<any>;
  const trigger = React.cloneElement(child, {
    'aria-describedby': isVisible ? tooltipId : undefined,
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
    <div className="inq-tooltip-anchor">
      {trigger}
      {isVisible && !disabled && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`inq-tooltip inq-tooltip--${placement} ${className}`.trim()}
        >
          {content}
          <div className="inq-tooltip-arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

