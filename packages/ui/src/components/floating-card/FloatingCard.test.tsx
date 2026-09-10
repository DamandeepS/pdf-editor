import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FloatingCard } from './FloatingCard';

describe('FloatingCard Component', () => {
  it('renders children with frosted glass card styling', () => {
    render(<FloatingCard><span>Floating Content</span></FloatingCard>);
    const element = screen.getByText('Floating Content').parentElement;
    expect(element).toHaveClass('inq-floating-card');
  });

  it('merges custom className when provided', () => {
    render(<FloatingCard className="my-custom-toolbar">Content</FloatingCard>);
    const card = screen.getByText('Content');
    expect(card).toHaveClass('my-custom-toolbar');
  });
});
