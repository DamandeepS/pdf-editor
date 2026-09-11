import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Accordion } from './Accordion';

const sampleItems = [
  { id: '1', title: 'What is Inq PDF Editor?', content: 'Inq is an enterprise PDF manipulation workbench.' },
  { id: '2', title: 'How does vector replacement work?', content: 'It whiteouts selected text blocks and injects text vectors.' },
  { id: '3', title: 'Disabled Question', content: 'Hidden text', disabled: true },
];

describe('Accordion Component', () => {
  it('renders accordion headers with aria-expanded="false" by default', () => {
    render(<Accordion items={sampleItems} />);
    const button1 = screen.getByRole('button', { name: /what is inq pdf editor/i });
    expect(button1).toHaveAttribute('aria-expanded', 'false');
    expect(button1).toHaveAttribute('aria-controls', 'inq-accordion-panel-1');
  });

  it('expands item on header click and sets aria-expanded="true"', () => {
    const handleChange = vi.fn();
    render(<Accordion items={sampleItems} onChange={handleChange} />);
    const button1 = screen.getByRole('button', { name: /what is inq pdf editor/i });

    fireEvent.click(button1);
    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Inq is an enterprise PDF manipulation workbench.')).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(['1']);
  });

  it('closes open item when clicked again', () => {
    render(<Accordion items={sampleItems} defaultExpandedIds={['1']} />);
    const button1 = screen.getByRole('button', { name: /what is inq pdf editor/i });

    expect(button1).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button1);
    expect(button1).toHaveAttribute('aria-expanded', 'false');
  });

  it('only allows single open item when allowMultiple is false', () => {
    render(<Accordion items={sampleItems} defaultExpandedIds={['1']} allowMultiple={false} />);
    const button1 = screen.getByRole('button', { name: /what is inq pdf editor/i });
    const button2 = screen.getByRole('button', { name: /how does vector replacement work/i });

    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(button2).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button2);
    expect(button1).toHaveAttribute('aria-expanded', 'false');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows multiple open items when allowMultiple is true', () => {
    render(<Accordion items={sampleItems} defaultExpandedIds={['1']} allowMultiple={true} />);
    const button1 = screen.getByRole('button', { name: /what is inq pdf editor/i });
    const button2 = screen.getByRole('button', { name: /how does vector replacement work/i });

    fireEvent.click(button2);
    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not toggle disabled accordion items', () => {
    render(<Accordion items={sampleItems} />);
    const disabledBtn = screen.getByRole('button', { name: /disabled question/i });
    expect(disabledBtn).toBeDisabled();
    fireEvent.click(disabledBtn);
    expect(disabledBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

