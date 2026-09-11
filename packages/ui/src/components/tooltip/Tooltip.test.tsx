import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders trigger element and reveals tooltip on hover after delay', () => {
    render(
      <Tooltip content="Save Document" delay={100}>
        <button type="button">Save</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Save Document');
    expect(button).toHaveAttribute('aria-describedby', tooltip.getAttribute('id'));
  });

  it('hides tooltip on mouseLeave', () => {
    render(
      <Tooltip content="Help info" delay={50}>
        <button type="button">Help</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Help' });
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('dismisses tooltip when Escape key is pressed', () => {
    render(
      <Tooltip content="Keyboard shortcut" delay={0}>
        <button type="button">Action</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Action' });
    fireEvent.focus(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not display tooltip when disabled is true', () => {
    render(
      <Tooltip content="Disabled info" disabled delay={0}>
        <button type="button">Disabled Tooltip</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Disabled Tooltip' });
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

