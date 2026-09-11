import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, Radio } from './RadioGroup';

const sampleOptions = [
  { value: 'email', label: 'Email', helperText: 'Receive updates via email' },
  { value: 'sms', label: 'SMS', helperText: 'Standard rates apply' },
  { value: 'push', label: 'Push', disabled: true },
];

describe('RadioGroup Component', () => {
  it('renders radiogroup container and radio items', () => {
    render(<RadioGroup label="Notification Preference" options={sampleOptions} defaultValue="email" />);
    const group = screen.getByRole('radiogroup', { name: /notification preference/i });
    expect(group).toBeInTheDocument();

    const emailRadio = screen.getByRole('radio', { name: /email/i });
    const smsRadio = screen.getByRole('radio', { name: /sms/i });
    const pushRadio = screen.getByRole('radio', { name: /push/i });

    expect(emailRadio).toBeChecked();
    expect(smsRadio).not.toBeChecked();
    expect(pushRadio).toBeDisabled();
  });

  it('selects option on click and fires onChange', () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={sampleOptions} defaultValue="email" onChange={handleChange} />);

    const smsRadio = screen.getByRole('radio', { name: /sms/i });
    fireEvent.click(smsRadio);

    expect(handleChange).toHaveBeenCalledWith('sms');
  });

  it('supports roving arrow key navigation across enabled options', () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={sampleOptions} defaultValue="email" onChange={handleChange} />);
    const group = screen.getByRole('radiogroup');

    // ArrowDown should move to sms (next option)
    fireEvent.keyDown(group, { key: 'ArrowDown' });
    expect(handleChange).toHaveBeenCalledWith('sms');

    // ArrowUp should move back to email
    fireEvent.keyDown(group, { key: 'ArrowUp' });
    expect(handleChange).toHaveBeenCalledWith('email');
  });

  it('renders composition using Radio children directly', () => {
    render(
      <RadioGroup name="billing" defaultValue="annual">
        <Radio value="monthly" label="Monthly" />
        <Radio value="annual" label="Annual (Save 20%)" />
      </RadioGroup>
    );

    expect(screen.getByRole('radio', { name: /annual/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /monthly/i })).not.toBeChecked();
  });

  it('disables all items when disabled is true', () => {
    render(<RadioGroup options={sampleOptions} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it('renders helperText and error message with role="alert"', () => {
    const { rerender } = render(<RadioGroup helperText="Choose at least one" options={sampleOptions} />);
    expect(screen.getByText('Choose at least one')).toBeInTheDocument();

    rerender(<RadioGroup error="Selection required" options={sampleOptions} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Selection required');
  });
});

