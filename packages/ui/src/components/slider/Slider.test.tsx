import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Slider } from './Slider';

describe('Slider Component', () => {
  it('renders range input with min, max, and value', () => {
    render(<Slider min={0} max={100} value={50} onChange={() => {}} label="Zoom" unit="%" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveValue('50');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onChange callback with numeric value when changed', () => {
    const handleChange = vi.fn();
    render(<Slider min={0} max={100} value={25} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });
});
