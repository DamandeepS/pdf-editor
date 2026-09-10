import React from 'react';
import { IconButton } from '@inq/ui/icon-button';
import { ChevronDownIcon, LayersIcon } from '@inq/icons';

export interface PageRailProps {
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const PageRail: React.FC<PageRailProps> = ({
  numPages,
  currentPage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
}) => {
  const pages = Array.from({ length: Math.max(1, numPages) }, (_, i) => i + 1);

  const handlePageClick = (pageNum: number) => {
    onSelectPage(pageNum);
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !isCollapsed) {
      onToggleCollapse();
    }
  };

  return (
    <aside className={`page-rail ${isCollapsed ? 'collapsed' : ''}`} aria-label="Page Navigation Rail">
      <div className="page-rail-header">
        {!isCollapsed && <span className="rail-title">Document Pages</span>}
        <IconButton
          tooltip={isCollapsed ? 'Expand Page Rail' : 'Collapse Page Rail'}
          size="sm"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <LayersIcon size={16} /> : <ChevronDownIcon size={16} />}
        </IconButton>
      </div>

      <div className="page-card-list">
        {pages.map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <div
              key={pageNum}
              className={`page-card ${isActive ? 'active' : ''}`}
              onClick={() => handlePageClick(pageNum)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePageClick(pageNum);
                }
              }}
              title={`Page ${pageNum}`}
            >
              <div className="page-thumbnail-mock">
                <div className="mock-line heading" />
                <div className="mock-line full" />
                <div className="mock-line medium" />
                <div className="mock-line short" />
                <div className="mock-line full" style={{ marginTop: 'auto' }} />
              </div>
              {!isCollapsed && <span className="page-number-tag">Page {pageNum}</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
