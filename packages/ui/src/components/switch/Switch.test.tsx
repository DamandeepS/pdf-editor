import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch Component', () => {
  it('renders with role="switch" and aria-checked="false" by default', () => {
    render(<Switch label="Enable notifications" />);
    const toggle = screen.getByRole('switch', { name: /enable notifications/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).not.toHaveClass('is-checked');
  });

  it('handles controlled checked state', () => {
    render(<Switch label="Dark mode" checked={true} onChange={() => {}} />);
    const toggle = screen.getByRole('switch', { name: /dark mode/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveClass('is-checked');
  });

  it('toggles when clicked in uncontrolled mode and invokes onChange', () => {
    const handleChange = vi.fn();
    render(<Switch label="Auto-save" defaultChecked={false} onChange={handleChange} />);
    const toggle = screen.getByRole('switch', { name: /auto-save/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(handleChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('toggles when Space or Enter key is pressed', () => {
    const handleChange = vi.fn();
    render(<Switch label="Sound effects" onChange={handleChange} />);
    const toggle = screen.getByRole('switch', { name: /sound effects/i });

    fireEvent.keyDown(toggle, { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());

    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('respects disabled state and ignores clicks', () => {
    const handleChange = vi.fn();
    render(<Switch label="Disabled switch" disabled onChange={handleChange} />);
    const toggle = screen.getByRole('switch', { name: /disabled switch/i });

    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders helperText and error alert', () => {
    const { rerender } = render(<Switch label="Sync" helperText="Syncs with cloud every 5m" />);
    expect(screen.getByText('Syncs with cloud every 5m')).toBeInTheDocument();

    rerender(<Switch label="Sync" error="Sync server offline" />);
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toHaveTextContent('Sync server offline');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Switch label="Small switch" size="sm" />);
    expect(container.firstChild).toHaveClass('inq-switch--sm');
  });
});

