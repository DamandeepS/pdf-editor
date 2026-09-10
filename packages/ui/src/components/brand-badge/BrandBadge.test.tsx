import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrandBadge } from './BrandBadge';

describe('BrandBadge Component', () => {
  it('renders brand label and Google-style 4-color dots', () => {
    render(<BrandBadge label="Inq BillEditor" />);
    expect(screen.getByText('Inq BillEditor')).toBeInTheDocument();
    const dots = document.querySelectorAll('.inq-brand-dot');
    expect(dots.length).toBe(4);
  });
});
