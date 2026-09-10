import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ColorPickerPill } from './ColorPickerPill';

describe('ColorPickerPill Component', () => {
  it('renders trigger with current background color', () => {
    render(<ColorPickerPill color="#4285f4" onChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: /select color/i });
    expect(trigger).toHaveStyle({ backgroundColor: '#4285f4' });
  });

  it('opens color swatch palette when clicked and triggers onChange', () => {
    const handleChange = vi.fn();
    render(<ColorPickerPill color="#4285f4" onChange={handleChange} />);
    const trigger = screen.getByRole('button', { name: /select color/i });
    fireEvent.click(trigger);

    // Should find preset swatches
    const swatches = screen.getAllByRole('button');
    expect(swatches.length).toBeGreaterThan(1);

    // Click second swatch
    fireEvent.click(swatches[1]);
    expect(handleChange).toHaveBeenCalled();
  });
});
