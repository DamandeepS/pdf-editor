import React, { forwardRef } from 'react';

export type TableVariant = 'default' | 'bordered' | 'striped' | 'elevated';
export type TableSize = 'sm' | 'md' | 'lg';
export type TableResponsive = 'card' | 'scroll' | 'none';
export type TableAlign = 'left' | 'center' | 'right';
export type TableFont = 'default' | 'mono';
export type TableWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  size?: TableSize;
  responsive?: TableResponsive;
  stickyHeader?: boolean;
  hoverable?: boolean;
  fullWidth?: boolean;
  caption?: React.ReactNode;
  containerClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(({
  variant = 'default',
  size = 'md',
  responsive = 'card',
  stickyHeader = false,
  hoverable = true,
  fullWidth = true,
  caption,
  containerClassName = '',
  className = '',
  children,
  ...rest
}, ref) => {
  const containerClasses = [
    'inq-table-container',
    `inq-table-container--${size}`,
    `inq-table-container--${variant}`,
    `inq-table-container--responsive-${responsive}`,
    stickyHeader ? 'inq-table-container--sticky-header' : '',
    fullWidth ? 'inq-table-container--full-width' : '',
    containerClassName,
  ].filter(Boolean).join(' ').trim();

  const tableClasses = [
    'inq-table',
    `inq-table--${variant}`,
    `inq-table--${size}`,
    `inq-table--responsive-${responsive}`,
    hoverable ? 'inq-table--hoverable' : '',
    fullWidth ? 'inq-table--full-width' : '',
    className,
  ].filter(Boolean).join(' ').trim();

  const tableElement = (
    <table ref={ref} className={tableClasses} {...rest}>
      {caption && <caption className="inq-table-caption">{caption}</caption>}
      {children}
    </table>
  );

  if (responsive === 'none') {
    return tableElement;
  }

  return (
    <div className={containerClasses}>
      {tableElement}
    </div>
  );
});

Table.displayName = 'Table';

// ----------------------------------------------------------------------
// TableHeader
// ----------------------------------------------------------------------
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children?: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(({
  className = '',
  children,
  ...rest
}, ref) => (
  <thead ref={ref} className={`inq-table-header ${className}`.trim()} {...rest}>
    {children}
  </thead>
));

TableHeader.displayName = 'TableHeader';

// ----------------------------------------------------------------------
// TableBody
// ----------------------------------------------------------------------
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children?: React.ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(({
  className = '',
  children,
  ...rest
}, ref) => (
  <tbody ref={ref} className={`inq-table-body ${className}`.trim()} {...rest}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

// ----------------------------------------------------------------------
// TableFooter
// ----------------------------------------------------------------------
export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children?: React.ReactNode;
}

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(({
  className = '',
  children,
  ...rest
}, ref) => (
  <tfoot ref={ref} className={`inq-table-footer ${className}`.trim()} {...rest}>
    {children}
  </tfoot>
));

TableFooter.displayName = 'TableFooter';

// ----------------------------------------------------------------------
// TableRow
// ----------------------------------------------------------------------
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  hoverable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({
  selected = false,
  hoverable,
  className = '',
  children,
  ...rest
}, ref) => {
  const rowClasses = [
    'inq-table-row',
    selected ? 'is-selected' : '',
    hoverable !== undefined ? (hoverable ? 'is-hoverable' : 'is-not-hoverable') : '',
    className,
  ].filter(Boolean).join(' ').trim();

  return (
    <tr
      ref={ref}
      className={rowClasses}
      aria-selected={selected || undefined}
      {...rest}
    >
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// ----------------------------------------------------------------------
// TableHead
// ----------------------------------------------------------------------
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
  width?: string | number;
  className?: string;
  children?: React.ReactNode;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({
  align = 'left',
  width,
  style,
  className = '',
  children,
  ...rest
}, ref) => {
  const headClasses = [
    'inq-table-head',
    `inq-table-cell--align-${align}`,
    className,
  ].filter(Boolean).join(' ').trim();

  return (
    <th
      ref={ref}
      scope="col"
      className={headClasses}
      style={{ width, ...style }}
      {...rest}
    >
      {children}
    </th>
  );
});

TableHead.displayName = 'TableHead';

// ----------------------------------------------------------------------
// TableCell
// ----------------------------------------------------------------------
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
  font?: TableFont;
  weight?: TableWeight;
  dataLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({
  align = 'left',
  font = 'default',
  weight = 'normal',
  dataLabel,
  className = '',
  children,
  ...rest
}, ref) => {
  const cellClasses = [
    'inq-table-cell',
    `inq-table-cell--align-${align}`,
    font !== 'default' ? `inq-table-cell--font-${font}` : '',
    weight !== 'normal' ? `inq-table-cell--weight-${weight}` : '',
    dataLabel ? 'has-data-label' : '',
    className,
  ].filter(Boolean).join(' ').trim();

  return (
    <td
      ref={ref}
      data-label={dataLabel}
      className={cellClasses}
      {...rest}
    >
      {dataLabel && (
        <span className="inq-table-cell-label" aria-hidden="true">
          {dataLabel}
        </span>
      )}
      <span className="inq-table-cell-content">
        {children}
      </span>
    </td>
  );
});

TableCell.displayName = 'TableCell';
