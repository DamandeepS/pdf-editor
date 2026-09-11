import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './Tabs';

const sampleTabs = [
  { id: 'general', label: 'General', content: <div>General Settings</div> },
  { id: 'security', label: 'Security', content: <div>Security Settings</div> },
  { id: 'billing', label: 'Billing', content: <div>Billing Info</div>, disabled: true },
];

describe('Tabs Component', () => {
  it('renders tablist, tabs, and active tabpanel', () => {
    render(<Tabs tabs={sampleTabs} defaultActiveId="general" />);

    const tablist = screen.getByRole('tablist', { name: 'Navigation Tabs' });
    expect(tablist).toBeInTheDocument();

    const generalTab = screen.getByRole('tab', { name: 'General' });
    const securityTab = screen.getByRole('tab', { name: 'Security' });
    const billingTab = screen.getByRole('tab', { name: 'Billing' });

    expect(generalTab).toHaveAttribute('aria-selected', 'true');
    expect(generalTab).toHaveAttribute('tabIndex', '0');
    expect(securityTab).toHaveAttribute('aria-selected', 'false');
    expect(securityTab).toHaveAttribute('tabIndex', '-1');
    expect(billingTab).toBeDisabled();

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('General Settings');
  });

  it('switches tab on click and updates panel content', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={sampleTabs} defaultActiveId="general" onChange={handleChange} />);

    const securityTab = screen.getByRole('tab', { name: 'Security' });
    fireEvent.click(securityTab);

    expect(securityTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Security Settings');
    expect(handleChange).toHaveBeenCalledWith('security');
  });

  it('supports roving keyboard arrow navigation (ArrowRight / ArrowLeft)', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={sampleTabs} defaultActiveId="general" onChange={handleChange} />);

    const tablist = screen.getByRole('tablist');

    // ArrowRight moves from general to security (skipping disabled billing)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('security');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Security Settings');

    // ArrowLeft moves back to general
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('general');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('General Settings');
  });

  it('applies variant and orientation classes correctly', () => {
    const { container } = render(
      <Tabs tabs={sampleTabs} orientation="vertical" variant="pill" />
    );
    expect(container.firstChild).toHaveClass('inq-tabs--vertical', 'inq-tabs--pill');
  });
});

