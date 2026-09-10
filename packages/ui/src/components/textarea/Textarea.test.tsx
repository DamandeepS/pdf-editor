import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders correctly with label and placeholder', () => {
    render(<Textarea label="Bio" placeholder="Tell us about yourself" />);
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea label="Notes" onChange={handleChange} />);
    const textarea = screen.getByLabelText('Notes');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message and sets aria-invalid', () => {
    render(<Textarea label="Description" error="Description is required" />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Description is required');
  });

  it('displays helper text when no error is present', () => {
    render(<Textarea label="Details" helperText="Max 500 characters" />);
    expect(screen.getByText('Max 500 characters')).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    render(<Textarea label="Disabled Textarea" disabled />);
    expect(screen.getByLabelText('Disabled Textarea')).toBeDisabled();
  });

  it('renders required indicator when required', () => {
    render(<Textarea label="Required Field" required />);
    expect(screen.getByText('*')).toHaveClass('inq-textarea-required');
    expect(screen.getByRole('textbox')).toBeRequired();
  });
});
