import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox Component', () => {
  it('renders with label and connects to checkbox input', () => {
    render(<Checkbox label="Accept terms and conditions" />);
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('triggers onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Notify me" onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox', { name: /notify me/i });
    
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('supports indeterminate state with aria-checked="mixed"', () => {
    render(<Checkbox label="Select all" indeterminate checked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: /select all/i });
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('renders checked state correctly', () => {
    render(<Checkbox label="Active item" checked onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox', { name: /active item/i });
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('handles disabled state properly', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Disabled option" disabled onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox', { name: /disabled option/i });
    expect(checkbox).toBeDisabled();
    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders helperText and associates with aria-describedby', () => {
    render(<Checkbox label="Newsletter" helperText="We send updates once a week." />);
    const helper = screen.getByText('We send updates once a week.');
    const checkbox = screen.getByRole('checkbox', { name: /newsletter/i });
    expect(checkbox).toHaveAttribute('aria-describedby', helper.getAttribute('id'));
  });

  it('renders error message with role="alert" and aria-invalid', () => {
    render(<Checkbox label="Terms" error="You must accept the terms." />);
    const alert = screen.getByRole('alert');
    const checkbox = screen.getByRole('checkbox', { name: /terms/i });
    expect(alert).toHaveTextContent('You must accept the terms.');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies appropriate size classes', () => {
    const { container } = render(<Checkbox label="Small" size="sm" />);
    expect(container.firstChild).toHaveClass('inq-checkbox--sm');
  });
});

