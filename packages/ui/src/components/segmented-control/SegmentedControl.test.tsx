import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const mockOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl Component', () => {
  it('renders all options with radiogroup semantics', () => {
    render(<SegmentedControl options={mockOptions} defaultValue="day" aria-label="Time period" />);
    const group = screen.getByRole('radiogroup', { name: 'Time period' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('handles option click and calls onChange', () => {
    const handleChange = vi.fn();
    render(<SegmentedControl options={mockOptions} defaultValue="day" onChange={handleChange} />);

    const weekBtn = screen.getByRole('radio', { name: 'Week' });
    fireEvent.click(weekBtn);

    expect(handleChange).toHaveBeenCalledWith('week');
    expect(weekBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('supports keyboard navigation via arrow keys', () => {
    const handleChange = vi.fn();
    render(<SegmentedControl options={mockOptions} defaultValue="day" onChange={handleChange} />);

    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith('week');
  });

  it('disables interactions when disabled prop is true', () => {
    const handleChange = vi.fn();
    render(<SegmentedControl options={mockOptions} defaultValue="day" onChange={handleChange} disabled />);

    const weekBtn = screen.getByRole('radio', { name: 'Week' });
    expect(weekBtn).toBeDisabled();
    fireEvent.click(weekBtn);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
