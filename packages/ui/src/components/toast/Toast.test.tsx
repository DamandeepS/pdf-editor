import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title and message correctly with status role for info', () => {
    render(<Toast title="Note" message="Operation completed successfully" variant="info" />);
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="alert" and aria-live="assertive" for danger variant', () => {
    render(<Toast message="Failed to save document" variant="danger" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveClass('inq-toast--danger');
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<Toast message="File saved" onClose={handleClose} />);
    const closeBtn = screen.getByLabelText('Dismiss notification');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onAction when action button is clicked', () => {
    const handleAction = vi.fn();
    render(<Toast message="Item deleted" actionLabel="Undo" onAction={handleAction} />);
    const actionBtn = screen.getByText('Undo');
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration expires', () => {
    const handleClose = vi.fn();
    render(<Toast message="Temporary alert" duration={3000} onClose={handleClose} />);

    expect(handleClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

