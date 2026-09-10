import React from 'react';
import type { ComponentStoryMeta } from '../../../../../apps/stories/src/types';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableHead, 
  TableCell 
} from './Table';

export const TableStory: ComponentStoryMeta = {
  id: 'table',
  name: 'Table',
  category: 'Surfaces',
  description: 'Semantic, accessible tabular data grid with automatic mobile card transformation and sticky header scrolling.',
  component: (props: any) => {
    const sampleItems = [
      { id: '1', desc: 'Cloud Infrastructure Hosting (AWS us-east-1)', qty: 1, rate: 1250.00, amount: 1250.00, tax: '10%' },
      { id: '2', desc: 'Enterprise Vector PDF Engine License', qty: 3, rate: 450.00, amount: 1350.00, tax: '10%' },
      { id: '3', desc: 'Custom Typography & Style Dictionary Setup', qty: 8, rate: 120.00, amount: 960.00, tax: '0%' },
      { id: '4', desc: 'Security Audit & Pen Testing Retainer', qty: 1, rate: 2400.00, amount: 2400.00, tax: '10%' },
    ];

    return (
      <div style={{ width: '100%', maxWidth: '780px' }}>
        <Table
          {...props}
          aria-label="Invoice Billing Items"
          caption="Invoice #INV-2026-0042 · Issued to Acme Corp"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead align="center" width="80px">Qty</TableHead>
              <TableHead align="right" width="120px">Rate</TableHead>
              <TableHead align="right" width="80px">Tax</TableHead>
              <TableHead align="right" width="130px">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell dataLabel="Description" weight="medium">
                  {item.desc}
                </TableCell>
                <TableCell dataLabel="Qty" align="center" font="mono">
                  {item.qty}
                </TableCell>
                <TableCell dataLabel="Rate" align="right" font="mono">
                  ${item.rate.toFixed(2)}
                </TableCell>
                <TableCell dataLabel="Tax" align="right">
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-subtle)' }}>
                    {item.tax}
                  </span>
                </TableCell>
                <TableCell dataLabel="Amount" align="right" font="mono" weight="semibold">
                  ${item.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell dataLabel="Summary" weight="bold">Total Due</TableCell>
              <TableCell dataLabel="Total Qty" align="center" font="mono">13</TableCell>
              <TableCell />
              <TableCell />
              <TableCell dataLabel="Total" align="right" font="mono" weight="bold">
                $5,960.00
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  },
  controls: {
    variant: {
      type: 'select',
      label: 'Variant',
      options: ['default', 'bordered', 'striped', 'elevated'],
      defaultValue: 'default',
    },
    size: {
      type: 'select',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    responsive: {
      type: 'select',
      label: 'Responsive Mode',
      options: ['card', 'scroll', 'none'],
      defaultValue: 'card',
    },
    hoverable: { type: 'boolean', label: 'Hoverable Rows', defaultValue: true },
    stickyHeader: { type: 'boolean', label: 'Sticky Header', defaultValue: false },
    fullWidth: { type: 'boolean', label: 'Full Width', defaultValue: true },
  },
  defaultProps: {
    variant: 'default',
    size: 'md',
    responsive: 'card',
    hoverable: true,
    stickyHeader: false,
    fullWidth: true,
  },
  a11y: {
    role: 'table',
    keyboardShortcuts: [
      { key: 'Tab', description: 'Navigates through interactive controls inside cells' },
    ],
    ariaAttributes: ['role="table"', 'role="row"', 'th scope="col"', 'aria-selected on selectable rows'],
  },
  variants: [
    { name: 'Default Clean', props: { variant: 'default', size: 'md', responsive: 'card' } },
    { name: 'Bordered Grid', props: { variant: 'bordered', size: 'md', responsive: 'card' } },
    { name: 'Striped Ledger', props: { variant: 'striped', size: 'sm', responsive: 'card' } },
    { name: 'Horizontal Scroll Viewport', props: { variant: 'bordered', size: 'md', responsive: 'scroll' } },
  ],
};

