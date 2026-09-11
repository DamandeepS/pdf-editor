import React, { useState, useRef, useId } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'underline' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId: controlledId,
  defaultActiveId,
  onChange,
  orientation = 'horizontal',
  variant = 'underline',
  size = 'md',
  'aria-label': ariaLabel = 'Navigation Tabs',
  className = '',
}) => {
  const generatedId = useId();
  const tabsPrefix = `inq-tabs-${generatedId.replace(/:/g, '')}`;

  const initialId = defaultActiveId || (tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? '');
  const [uncontrolledId, setUncontrolledId] = useState<string>(initialId);
  const isControlled = controlledId !== undefined;
  const currentId = isControlled ? controlledId : uncontrolledId;

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setUncontrolledId(id);
    }
    if (onChange) {
      onChange(id);
    }
  };

  const enabledTabs = tabs.filter((t) => !t.disabled);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = enabledTabs.findIndex((t) => t.id === currentId);
    if (currentIndex === -1) return;

    let nextIndex = -1;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % enabledTabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      }
    } else {
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % enabledTabs.length;
      } else if (e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      }
    }

    if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      handleSelect(nextTab.id);

      const targetRefIndex = tabs.findIndex((t) => t.id === nextTab.id);
      tabRefs.current[targetRefIndex]?.focus();
    }
  };

  const activeTab = tabs.find((t) => t.id === currentId);

  return (
    <div className={`inq-tabs-container inq-tabs--${orientation} inq-tabs--${variant} inq-tabs--${size} ${className}`.trim()}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className="inq-tablist"
      >
        {tabs.map((tab, idx) => {
          const isSelected = tab.id === currentId;
          const tabId = `${tabsPrefix}-tab-${tab.id}`;
          const panelId = `${tabsPrefix}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleSelect(tab.id)}
              className={`inq-tab-button ${isSelected ? 'is-selected' : ''} ${tab.disabled ? 'is-disabled' : ''}`}
            >
              {tab.icon && <span className="inq-tab-icon" aria-hidden="true">{tab.icon}</span>}
              <span className="inq-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab && activeTab.content && (
        <div
          id={`${tabsPrefix}-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`${tabsPrefix}-tab-${activeTab.id}`}
          tabIndex={0}
          className="inq-tabpanel"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
};

Tabs.displayName = 'Tabs';

