import React, { useState, useId } from 'react';
import { ChevronDownIcon } from '@inq/icons';

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items?: AccordionItemData[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  allowMultiple?: boolean;
  variant?: 'bordered' | 'flush';
  className?: string;
  children?: React.ReactNode;
  onChange?: (expandedIds: string[]) => void;
  ref?: React.Ref<HTMLDivElement>;
}

interface AccordionContextType {
  expandedIds: string[];
  toggleItem: (id: string) => void;
  variant: 'bordered' | 'flush';
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  disabled = false,
  children,
  className = '',
  ref,
}) => {
  const context = React.useContext(AccordionContext);
  const headerId = `inq-accordion-header-${id}`;
  const panelId = `inq-accordion-panel-${id}`;

  const isExpanded = context ? context.expandedIds.includes(id) : false;

  const handleToggle = () => {
    if (disabled || !context) return;
    context.toggleItem(id);
  };

  return (
    <div ref={ref} className={`inq-accordion-item ${isExpanded ? 'is-expanded' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <h3 className="inq-accordion-heading">
        <button
          type="button"
          id={headerId}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={handleToggle}
          className="inq-accordion-trigger"
        >
          <span className="inq-accordion-title">{title}</span>
          <span className="inq-accordion-indicator" aria-hidden="true">
            <ChevronDownIcon size={16} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isExpanded}
        className="inq-accordion-panel"
      >
        <div className="inq-accordion-body">{children}</div>
      </div>
    </div>
  );
};

AccordionItem.displayName = 'AccordionItem';

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpandedIds = [],
  expandedIds: controlledIds,
  allowMultiple = false,
  variant = 'bordered',
  className = '',
  children,
  onChange,
  ref,
}) => {
  const [uncontrolledIds, setUncontrolledIds] = useState<string[]>(defaultExpandedIds);
  const isControlled = controlledIds !== undefined;
  const activeIds = isControlled ? controlledIds : uncontrolledIds;

  const toggleItem = (id: string) => {
    let nextIds: string[];

    if (activeIds.includes(id)) {
      nextIds = activeIds.filter((item) => item !== id);
    } else {
      nextIds = allowMultiple ? [...activeIds, id] : [id];
    }

    if (!isControlled) {
      setUncontrolledIds(nextIds);
    }

    if (onChange) {
      onChange(nextIds);
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedIds: activeIds, toggleItem, variant }}>
      <div ref={ref} className={`inq-accordion inq-accordion--${variant} ${className}`.trim()}>
        {items
          ? items.map((item) => (
              <AccordionItem
                key={item.id}
                id={item.id}
                title={item.title}
                disabled={item.disabled}
              >
                {item.content}
              </AccordionItem>
            ))
          : children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = 'Accordion';

