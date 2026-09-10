import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const sampleOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

describe('Select Component', () => {
  it('renders select element with options array', () => {
    render(<Select label="Choose fruit" options={sampleOptions} defaultValue="banana" />);
    const select = screen.getByRole('combobox', { name: /choose fruit/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('banana');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeDisabled();
  });

  it('renders select with children options', () => {
    render(
      <Select label="Choose size" defaultValue="m">
        <option value="s">Small</option>
        <option value="m">Medium</option>
        <option value="l">Large</option>
      </Select>
    );
    const select = screen.getByRole('combobox', { name: /choose size/i });
    expect(select).toHaveValue('m');
  });

  it('fires onChange when a new option is chosen', () => {
    const handleChange = vi.fn();
    render(<Select label="Options" options={sampleOptions} onChange={handleChange} />);
    const select = screen.getByRole('combobox', { name: /options/i });

    fireEvent.change(select, { target: { value: 'apple' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('apple');
  });

  it('renders helperText and links via aria-describedby', () => {
    render(<Select label="Plan" helperText="You can upgrade anytime" options={sampleOptions} />);
    const helper = screen.getByText('You can upgrade anytime');
    const select = screen.getByRole('combobox', { name: /plan/i });
    expect(select).toHaveAttribute('aria-describedby', helper.getAttribute('id'));
  });

  it('renders error message with role="alert" and aria-invalid', () => {
    render(<Select label="Plan" error="Selection is required" options={sampleOptions} />);
    const errorAlert = screen.getByRole('alert');
    const select = screen.getByRole('combobox', { name: /plan/i });
    expect(errorAlert).toHaveTextContent('Selection is required');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select label="Fruit" disabled options={sampleOptions} />);
    expect(screen.getByRole('combobox', { name: /fruit/i })).toBeDisabled();
  });

  it('applies variant and size classes', () => {
    const { container } = render(<Select variant="filled" size="lg" options={sampleOptions} />);
    expect(container.firstChild).toHaveClass('inq-select--filled', 'inq-select--lg');
  });
});

