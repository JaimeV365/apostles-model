import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, BarChart3, PieChart, Map, Activity, FileText, Settings } from 'lucide-react';

interface NavigationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections?: {
    id: string;
    title: string;
  }[];
}

interface ReportingNavigationProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const ReportingNavigation: React.FC<ReportingNavigationProps> = ({ 
  isVisible = true, 
  onToggle 
}) => {
  const [activeSection, setActiveSection] = useState<string>('data-overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['data-overview']));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Navigation structure based on your reporting components
  const navigationSections: NavigationSection[] = [
    {
      id: 'data-overview',
      title: 'Data Overview',
      icon: <FileText size={16} />,
      subsections: [
        { id: 'basic-info', title: 'Basic Information' },
        { id: 'statistics', title: 'Statistics Summary' },
        { id: 'distribution', title: 'Distribution Analysis' }
      ]
    },
    {
      id: 'response-concentration',
      title: 'Response Concentration',
      icon: <Activity size={16} />,
      subsections: [
        { id: 'distribution-map', title: 'Distribution Map' },
        { id: 'frequent-responses', title: 'Most Common Combinations' },
        { id: 'response-intensity', title: 'Response Intensity' }
      ]
    },
    {
      id: 'quadrant-analysis',
      title: 'Quadrant Analysis',
      icon: <BarChart3 size={16} />,
      subsections: [
        { id: 'loyalists', title: 'Loyalists' },
        { id: 'defectors', title: 'Defectors' },
        { id: 'mercenaries', title: 'Mercenaries' },
        { id: 'hostages', title: 'Hostages' }
      ]
    },
    {
      id: 'proximity-analysis',
      title: 'Proximity Analysis',
      icon: <Map size={16} />,
      subsections: [
        { id: 'proximity-overview', title: 'Overview' },
        { id: 'risk-opportunities', title: 'Risks & Opportunities' },
        { id: 'proximity-details', title: 'Detailed Analysis' }
      ]
    },
    {
      id: 'distribution-insights',
      title: 'Distribution Insights',
      icon: <PieChart size={16} />,
      subsections: [
        { id: 'heat-maps', title: 'Heat Maps' },
        { id: 'trend-analysis', title: 'Trend Analysis' },
        { id: 'special-zones', title: 'Special Zones' }
      ]
    },
    {
      id: 'actions-report',
      title: 'Actions & Recommendations',
      icon: <Settings size={16} />,
      subsections: [
        { id: 'recommendations', title: 'Key Recommendations' },
        { id: 'action-items', title: 'Action Items' },
        { id: 'priority-matrix', title: 'Priority Matrix' }
      ]
    }
  ];

  // Setup intersection observer for scroll tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('[data-section-id]');
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleSectionClick = (sectionId: string) => {
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      setActiveSection(sectionId);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed left-4 top-20 bottom-4 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-72'
    }`}>
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          {!isCollapsed && (
            <h3 className="font-semibold text-gray-800 text-sm">Report Navigation</h3>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <ChevronRight 
              size={16} 
              className={`transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
            />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {navigationSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const isActive = activeSection === section.id || 
              section.subsections?.some(sub => activeSection === sub.id);

            return (
              <div key={section.id} className="mb-1">
                {/* Main Section */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-all duration-200 group ${
                    isActive 
                      ? 'bg-green-100 text-green-800 shadow-sm' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false);
                    } else {
                      handleSectionClick(section.id);
                      if (section.subsections) {
                        toggleSection(section.id);
                      }
                    }
                  }}
                  title={isCollapsed ? section.title : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {section.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {section.title}
                      </span>
                    )}
                  </div>
                  
                  {!isCollapsed && section.subsections && (
                    <ChevronDown 
                      size={14} 
                      className={`flex-shrink-0 transform transition-transform text-gray-400 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  )}
                </div>

                {/* Subsections */}
                {!isCollapsed && section.subsections && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <div
                        key={subsection.id}
                        className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                          activeSection === subsection.id
                            ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                        onClick={() => handleSectionClick(subsection.id)}
                      >
                        {subsection.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Auto-scrolling navigation
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo component showing how to implement the sections
const ReportingDemo: React.FC = () => {
  const [showNavigation, setShowNavigation] = useState(true);

  const demoSections = [
    {
      id: 'data-overview',
      title: 'Data Overview',
      content: 'Basic information, statistics summary, and distribution analysis would go here...'
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      content: 'Entry counts, scales, date ranges, and data quality metrics...'
    },
    {
      id: 'statistics',
      title: 'Statistics Summary',
      content: 'Averages, modes, standard deviations, and distribution charts...'
    },
    {
      id: 'distribution',
      title: 'Distribution Analysis',
      content: 'Detailed breakdown of response patterns and frequency analysis...'
    },
    {
      id: 'response-concentration',
      title: 'Response Concentration',
      content: 'Heat maps and concentration analysis...'
    },
    {
      id: 'distribution-map',
      title: 'Distribution Map',
      content: 'Visual representation of response distribution across quadrants...'
    },
    {
      id: 'frequent-responses',
      title: 'Most Common Combinations',
      content: 'Analysis of the most frequently occurring satisfaction-loyalty combinations...'
    },
    {
      id: 'quadrant-analysis',
      title: 'Quadrant Analysis',
      content: 'Detailed analysis of each customer segment...'
    },
    {
      id: 'loyalists',
      title: 'Loyalists Analysis',
      content: 'High satisfaction, high loyalty customers - your advocates...'
    },
    {
      id: 'proximity-analysis',
      title: 'Proximity Analysis',
      content: 'Risk and opportunity identification based on boundary proximity...'
    },
    {
      id: 'actions-report',
      title: 'Actions & Recommendations',
      content: 'Strategic recommendations and priority action items...'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Toggle button for demo */}
      <button
        onClick={() => setShowNavigation(!showNavigation)}
        className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
      >
        {showNavigation ? 'Hide' : 'Show'} Navigation
      </button>

      {/* Navigation Component */}
      <ReportingNavigation 
        isVisible={showNavigation}
        onToggle={() => setShowNavigation(!showNavigation)}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${showNavigation ? 'ml-80' : 'ml-8'} p-8`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Customer Satisfaction Analysis Report
          </h1>

          {demoSections.map((section, index) => (
            <div
              key={section.id}
              data-section-id={section.id}
              className="mb-16 scroll-mt-24"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                  
                  {/* Demo content to make sections long enough */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-gray-900 mb-2">Sample Chart</h4>
                      <div className="h-32 bg-gradient-to-r from-green-200 to-green-300 rounded flex items-center justify-center">
                        <span className="text-green-800 font-medium">Visualization Placeholder</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Responses:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Score:</span>
                          <span className="font-medium">4.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response Rate:</span>
                          <span className="font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional content for scrolling demo */}
                  {Array.from({ length: 3 }, (_, i) => (
                    <p key={i} className="mt-4 text-gray-600">
                      This is additional content for section {section.title} to demonstrate 
                      the scrolling behavior and navigation tracking. The navigation menu 
                      will automatically update as you scroll through different sections 
                      of the report. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportingDemo;