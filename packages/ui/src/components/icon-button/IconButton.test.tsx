import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton Component', () => {
  it('renders with tooltip title and accessible button role', () => {
    render(<IconButton tooltip="Undo Action"><span>↺</span></IconButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('title', 'Undo Action');
  });

  it('applies active styling when active prop is true', () => {
    render(<IconButton active tooltip="Active Tool"><span>✓</span></IconButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('inq-icon-btn--active');
  });

  it('triggers click handler when clicked', () => {
    const handleClick = vi.fn();
    render(<IconButton onClick={handleClick}><span>+</span></IconButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
