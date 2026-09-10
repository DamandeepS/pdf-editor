import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput Component', () => {
  it('renders input with default properties and container class', () => {
    render(<TextInput placeholder="Enter text..." />);
    const input = screen.getByPlaceholderText('Enter text...');
    expect(input).toBeInTheDocument();
    expect(input.closest('.inq-text-field-container')).toHaveClass('inq-text-field--md', 'inq-text-field--outlined');
  });

  it('renders label linked via htmlFor', () => {
    render(<TextInput label="Full Name" placeholder="Jane Doe" />);
    const label = screen.getByText('Full Name');
    const input = screen.getByPlaceholderText('Jane Doe');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('renders required indicator when required is true', () => {
    render(<TextInput label="Email Address" required />);
    expect(screen.getByText('*')).toHaveClass('inq-text-field-required');
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('renders helperText and links it via aria-describedby', () => {
    render(<TextInput label="Username" helperText="Must be 3-20 characters" />);
    const helper = screen.getByText('Must be 3-20 characters');
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', helper.getAttribute('id'));
  });

  it('renders error message with role="alert" and aria-invalid', () => {
    render(<TextInput label="Username" error="Username is already taken" />);
    const errorAlert = screen.getByRole('alert');
    const input = screen.getByRole('textbox');
    expect(errorAlert).toHaveTextContent('Username is already taken');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorAlert.getAttribute('id'));
  });

  it('renders clear button when clearable and value is present, invoking onClear when clicked', () => {
    const onClear = vi.fn();
    render(<TextInput value="Some value" clearable onClear={onClear} onChange={() => {}} />);
    const clearBtn = screen.getByLabelText('Clear input');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('supports prefix and suffix icons', () => {
    render(
      <TextInput
        prefixIcon={<span data-testid="prefix-icon">P</span>}
        suffixIcon={<span data-testid="suffix-icon">S</span>}
      />
    );
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('handles disabled state properly', () => {
    render(<TextInput label="Disabled Field" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').closest('.inq-text-field-container')).toHaveClass('is-disabled');
  });
});

