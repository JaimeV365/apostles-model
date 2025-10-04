// src/components/reporting/widgets/ReportWidgetMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { DataPoint } from '@/types/base';
import { ReportFilter } from '../filters/ReportFilterPanel';
import './ReportWidgetMenu.css';

interface ReportWidgetMenuProps {
  widgetId: string;
  data: DataPoint[];
  onApplyFilters: (widgetId: string, filters: ReportFilter[]) => void;
  onCustomize?: (widgetId: string) => void;
  activeFilters: ReportFilter[];
  isPremium: boolean;
  children?: React.ReactNode;
}

const ReportWidgetMenu: React.FC<ReportWidgetMenuProps> = ({
  widgetId,
  data,
  onApplyFilters,
  onCustomize,
  activeFilters,
  isPremium,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isPremium) {
    return null;
  }

  return (
    <div className="report-widget-menu-container">
      <button
        ref={buttonRef}
        className={`report-widget-menu-toggle ${isOpen ? 'active' : ''} ${activeFilters.length > 0 ? 'has-filters' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Customize and filter"
        aria-label="Open customization and filter menu"
      >
        <Sliders size={20} />
        {activeFilters.length > 0 && (
          <span className="filter-badge">{activeFilters.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="report-widget-menu" ref={menuRef}>
          <div className="report-widget-menu-header">
            <h3>Customize Widget</h3>
            <button
              className="report-widget-menu-close"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          </div>
          
          <div className="report-widget-menu-content">
            {/* Filter section */}
            <div className="report-widget-menu-section">
              <h4>Filter Data</h4>
              {children}
            </div>
            
            {/* Customization section */}
            {onCustomize && (
              <div className="report-widget-menu-section">
                <h4>Appearance</h4>
                <button 
                  className="report-widget-menu-button"
                  onClick={() => {
                    onCustomize(widgetId);
                    setIsOpen(false);
                  }}
                >
                  Customize Appearance
                </button>
              </div>
            )}
          </div>
          
          <div className="report-widget-menu-footer">
            <button 
              className="report-widget-menu-button secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportWidgetMenu;