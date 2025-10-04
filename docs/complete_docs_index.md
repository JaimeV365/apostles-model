# Apostles Model - Complete Documentation Index

## Root Files
- `CONTRIBUTING.md` - Guidelines for contributing to the project | **IN**: Developer questions | **OUT**: Contribution procedures
- `doc-index-update.md` - Documentation index update notes | **IN**: Index changes | **OUT**: Update procedures
- `documentation-index-update.txt` - Text version of index updates | **IN**: Text updates | **OUT**: Change tracking
- `documentation-index.md` - Main documentation index (legacy) | **IN**: File organization needs | **OUT**: Navigation structure
- `DocumentationIndex.md` - Main documentation index (current) | **IN**: Complete file list | **OUT**: Project navigation

## Architecture (`/docs/architecture/`)
- `architecture.md` - System overview and technical architecture diagrams | **IN**: System requirements | **OUT**: Architecture diagrams, component structure
- `business-plan.md` - Business model, pricing strategy, and implementation timeline | **IN**: Market analysis | **OUT**: Revenue projections, pricing strategy
- `data-entry-architecture-docs.md` - Manual entry component architecture and styling | **IN**: Component requirements | **OUT**: Architecture patterns, styling guides
- `DataInput File Structure.txt` - File structure for DataInput component organization | **IN**: Component organization needs | **OUT**: File structure blueprint
- `ProjectMap.md` - Complete project overview and component relationships | **IN**: Project scope | **OUT**: Component dependencies, system map
- `reporting-structure.md` - Report generation architecture and migration paths | **IN**: Report requirements | **OUT**: Architecture design, migration plan
- `StateFlow.md` - Data and state flow documentation throughout the app | **IN**: Data flow requirements | **OUT**: State management patterns, flow diagrams
- `types-architecture.md` - Type system organization and import patterns | **IN**: Type organization needs | **OUT**: Type structure, import guidelines

## Changelog (`/docs/changelog/`)
- `changelog-migration.md` - Migration notes and version changes | **IN**: Version differences | **OUT**: Migration procedures
- `csv-import-architecture.md` - CSV import system architectural changes | **IN**: System changes | **OUT**: Architecture evolution

## Components

### Data Entry (`/docs/components/data-entry/`)
- `CSVImport.md` - Main CSV import component documentation | **IN**: CSV files, scale formats | **OUT**: Validated data points, import status
- `DataDisplay.md` - Data display table component specification | **IN**: Data points array | **OUT**: Formatted table, edit/delete actions
- `DataEntryModule.md` - Main data entry module component | **IN**: User input, files | **OUT**: Data points, validation results
- `DataInput.md` - Manual data input form component | **IN**: Form data (name, email, scores) | **OUT**: DataPoint object, validation errors
- `csv-import-components.md` - CSV import React components documentation | **IN**: Component specs | **OUT**: Implementation guide
- `csv-import-hooks.md` - React hooks for CSV processing and state management | **IN**: State requirements | **OUT**: Custom hooks, state management
- `csv-import-utilities.md` - Utility functions for CSV processing | **IN**: Raw CSV data | **OUT**: Parsed, validated data
- `data-entry-types.md` - TypeScript types for data entry | **IN**: Type requirements | **OUT**: Type definitions, interfaces
- `notification-system-docs.md` - Notification system implementation | **IN**: Success/error events | **OUT**: User notifications
- `scale-selector-docs.md` - Scale selection component documentation | **IN**: Scale options | **OUT**: Selected scale, validation rules
- `validation-system-docs.md` - Input validation system | **IN**: User input | **OUT**: Validation results, error messages

### UI Components (`/docs/components/ui/`)
- `InputField.md` - Reusable input field component with validation | **IN**: Value, validation rules | **OUT**: Formatted input, error states
- `Switch.md` - Toggle switch UI component | **IN**: Boolean state | **OUT**: Toggle component, state changes
- `ui-guidelines.md` - UI component design guidelines and patterns | **IN**: Design requirements | **OUT**: Component standards

### Visualization (`/docs/components/visualization/`)
- `QuadrantChart.md` - Main visualization component specification | **IN**: Data points, scale formats | **OUT**: Interactive chart
- `ChartControls.md` - Main chart controls component specification | **IN**: User interactions | **OUT**: Chart config changes
- `DataPointRenderer.md` - Data point visualization component | **IN**: Data coordinates | **OUT**: Positioned visual elements
- `FrequencySlider.md` - Frequency control slider component | **IN**: Frequency values | **OUT**: Filtered display, threshold updates
- `GridSystem.md` - Grid system for chart layout | **IN**: Scale dimensions | **OUT**: Grid layout, positioning system
- `InfoBox.md` - Information display popup component | **IN**: Data point selection | **OUT**: Detailed info popup
- `ResizeHandles.md` - Zone resizing functionality component | **IN**: Mouse interactions | **OUT**: Zone size updates
- `SpecialZones.md` - Special zones (Apostles/Terrorists) handling | **IN**: Zone configurations | **OUT**: Zone overlays
- `classification_system_docs.md` - Data point classification system | **IN**: Data points, rules | **OUT**: Classified points by quadrant
- `midpoint-handle-doc.md` - Midpoint adjustment handle component | **IN**: Drag interactions | **OUT**: Updated midpoint, recalculated zones

#### BarChart (`/docs/components/visualization/BarChart/`)
- `barchart-api.md` - Bar chart component API reference | **IN**: Chart specifications | **OUT**: API documentation
- `barchart-readme.md` - Bar chart component usage guide | **IN**: Usage requirements | **OUT**: Implementation examples
- `barchart-styles.md` - Bar chart styling and theming | **IN**: Design tokens | **OUT**: CSS specifications

#### Filters (`/docs/components/visualization/filters/`)
- `filter-system-documentation.md` - Complete filter system docs | **IN**: Filter criteria | **OUT**: Filtered dataset, filter state
- `filter-implementation-guide.md` - Implementation guide for filters | **IN**: Filter requirements | **OUT**: Implementation patterns

## Development (`/docs/development/`)
- `BuildAndDeploy.md` - Build processes and deployment procedures | **IN**: Source code, configs | **OUT**: Deployment packages
- `ErrorHandling.md` - Error handling strategies and implementation | **IN**: Error events | **OUT**: Error recovery, user feedback
- `Maintenance.md` - System maintenance procedures and checklists | **IN**: System monitoring | **OUT**: Maintenance schedules
- `Performance.md` - Performance optimization guidelines | **IN**: Performance metrics | **OUT**: Optimization strategies
- `Security.md` - Security guidelines and best practices | **IN**: Security requirements | **OUT**: Implementation guidelines
- `TestingGuide.md` - Testing procedures and patterns | **IN**: Test scenarios | **OUT**: Test procedures, coverage
- `PrePublicationCleanup.md` - Pre-release cleanup procedures | **IN**: Development code | **OUT**: Production-ready code

## Premium (`/docs/premium/`)
- `premium-features-documentation.md` - Premium features documentation | **IN**: Premium requirements | **OUT**: Feature specifications
- `cloudflare-integration-guide.md` - Cloudflare integration for premium features | **IN**: Integration needs | **OUT**: Setup procedures

### Historical Analysis (`/docs/premium/Historical Analysis/`)
- `historical-feature-spec.md` - Original historical feature specification | **IN**: Historical data requirements | **OUT**: Feature specifications
- `historical-implementation-plan.md` - Original implementation plan | **IN**: Feature specs | **OUT**: Development timeline

## Types (`/docs/types/`)
- `BaseTypes.md` - Core type definitions used across the application | **IN**: Core data structures | **OUT**: TypeScript definitions
- `ComponentProps.md` - Component props interfaces and specifications | **IN**: Component interfaces | **OUT**: Props specifications
- `VisualizationTypes.md` - Visualization-specific type definitions | **IN**: Chart requirements | **OUT**: Visualization types

## Utils (`/docs/utils/`)
- `frequencyCalculator.md` - Frequency calculation utilities | **IN**: Data points, frequency rules | **OUT**: Frequency calculations
- `idCounter.md` - Unique ID generation utility | **IN**: ID requests | **OUT**: Unique identifiers
- `positionCalculator.md` - Position calculation utilities for chart elements | **IN**: Scale values, dimensions | **OUT**: X/Y coordinates
- `scaleManager.md` - Scale management utilities | **IN**: Scale formats, values | **OUT**: Scale validation, conversions
- `storageManager.md` - Data storage and persistence utilities | **IN**: Data objects | **OUT**: Persisted data, storage operations
- `zoneCalculator.md` - Zone calculation utilities for special areas | **IN**: Zone parameters, dimensions | **OUT**: Zone boundaries, overlap detection

---

## Summary
**Total Files**: 150+ documentation files covering complete system with descriptions, inputs, and outputs for each component.