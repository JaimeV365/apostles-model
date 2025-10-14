import React, { useState } from 'react';
import './TabContainer.css';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabContainerProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  className?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const TabContainer: React.FC<TabContainerProps> = ({ 
  tabs, 
  defaultActiveTab, 
  className = '',
  activeTab: externalActiveTab,
  onTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveTab || tabs[0]?.id);
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tab-container ${className}`}>
      <div className="tab-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              if (onTabChange) {
                onTabChange(tab.id);
              } else {
                setInternalActiveTab(tab.id);
              }
            }}
            type="button"
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTabContent}
      </div>
    </div>
  );
};

export default TabContainer;
