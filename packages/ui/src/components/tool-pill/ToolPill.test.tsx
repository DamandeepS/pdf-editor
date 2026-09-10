import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToolPill } from './ToolPill';

describe('ToolPill Component', () => {
  it('renders label and keyboard shortcut badge', () => {
    render(<ToolPill label="Whiteout" shortcut="E" />);
    expect(screen.getByText('Whiteout')).toBeInTheDocument();
    expect(screen.getByText('E')).toHaveClass('inq-pill-badge');
  });

  it('applies active class when active is true', () => {
    render(<ToolPill label="Text Tool" shortcut="T" active />);
    const pill = screen.getByRole('button');
    expect(pill).toHaveClass('inq-pill--active');
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<ToolPill label="Select" shortcut="V" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
