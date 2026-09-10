import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableHead, 
  TableCell 
} from './Table';

describe('Table Component', () => {
  it('renders semantic table structure with headers, rows, and cells', () => {
    render(
      <Table aria-label="Invoice Summary">
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell dataLabel="Item">Consulting Services</TableCell>
            <TableCell dataLabel="Amount" align="right" font="mono">$1,500.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="right" weight="bold">$1,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    const table = screen.getByRole('table', { name: 'Invoice Summary' });
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('inq-table');

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(2);
    expect(columnHeaders[0]).toHaveTextContent('Item');
    expect(columnHeaders[0]).toHaveAttribute('scope', 'col');
    expect(columnHeaders[1]).toHaveClass('inq-table-cell--align-right');

    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Consulting Services')).toBeInTheDocument();
    expect(screen.getByText('$1,500.00', { selector: '.inq-table-body .inq-table-cell-content' })).toBeInTheDocument();
  });

  it('renders caption when provided', () => {
    render(
      <Table caption="Monthly Subscription Breakdown">
        <TableBody>
          <TableRow>
            <TableCell>Plan A</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Monthly Subscription Breakdown')).toHaveClass('inq-table-caption');
  });

  it('applies variant and size classes correctly', () => {
    const { container } = render(
      <Table variant="striped" size="sm">
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('.inq-table');
    expect(table).toHaveClass('inq-table--striped');
    expect(table).toHaveClass('inq-table--sm');

    const wrapper = container.querySelector('.inq-table-container');
    expect(wrapper).toHaveClass('inq-table-container--striped');
    expect(wrapper).toHaveClass('inq-table-container--sm');
  });

  it('supports responsive card and scroll modes', () => {
    const { container, rerender } = render(
      <Table responsive="card">
        <TableBody>
          <TableRow>
            <TableCell dataLabel="Status">Paid</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(container.querySelector('.inq-table-container')).toHaveClass('inq-table-container--responsive-card');
    expect(container.querySelector('.inq-table')).toHaveClass('inq-table--responsive-card');

    rerender(
      <Table responsive="scroll">
        <TableBody>
          <TableRow>
            <TableCell dataLabel="Status">Paid</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(container.querySelector('.inq-table-container')).toHaveClass('inq-table-container--responsive-scroll');
  });

  it('renders cell with dataLabel, mono font, and weight modifier', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell dataLabel="Tax ID" font="mono" weight="bold">
              US-948294
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const cell = screen.getByRole('cell');
    expect(cell).toHaveAttribute('data-label', 'Tax ID');
    expect(cell).toHaveClass('inq-table-cell--font-mono');
    expect(cell).toHaveClass('inq-table-cell--weight-bold');
    expect(cell).toHaveClass('has-data-label');
    expect(screen.getByText('Tax ID')).toHaveClass('inq-table-cell-label');
  });

  it('handles row selection with aria-selected', () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected>
            <TableCell>Active Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveClass('is-selected');
    expect(row).toHaveAttribute('aria-selected', 'true');
  });

  it('renders without outer container when responsive="none"', () => {
    const { container } = render(
      <Table responsive="none">
        <TableBody>
          <TableRow>
            <TableCell>Raw Table</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(container.querySelector('.inq-table-container')).toBeNull();
    expect(container.querySelector('.inq-table')).toBeInTheDocument();
  });
});
