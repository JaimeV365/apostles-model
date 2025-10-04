# Data Entry Documentation Index

## Service Architecture Documentation
| Document | Description | Location |
|----------|-------------|----------|
| [Data Entry System: Service-Oriented Architecture Documentation](data-entry-architecture-docs) | Core services, interactions, and overall workflow | `/docs/architecture/service-architecture.md` |
| [Data Entry Service Workflows and Diagrams](service-workflow-diagrams) | Visual diagrams of service interactions | `/docs/architecture/service-workflows.md` |
| [Service Implementation Examples](service-implementation-examples) | Code examples of the core services | `/docs/architecture/service-implementations.md` |
| [Custom Hooks Integration Examples](hooks-integration-examples) | Examples of hooks connecting components to services | `/docs/architecture/hooks-integration.md` |
| [Service Architecture Maintenance Guide](service-architecture-maintenance-guide) | Best practices for maintaining and extending services | `/docs/architecture/maintenance-guide.md` |

## Component Documentation
| Document | Description | Status |
|----------|-------------|--------|
| [CSVImport Component](CSVImport.md) | CSV import functionality | Current |
| [DataInput Component](DataInput.md) | Manual data entry form | Outdated (Replace with service architecture docs) |
| [DataDisplay Component](DataDisplay.md) | Data table display | Current |

## System Modules
| Document | Description | Status |
|----------|-------------|--------|
| [DataEntryModule](DataEntryModule.md) | Main entry point for data entry system | Outdated (Replace with service architecture docs) |
| [Date Entry System](date-entry-system.md) | Date handling functionality | Outdated (Replace with service architecture docs) |
| [Duplicate Detection System](duplicate-handling-system.docx) | Duplicate entry handling | Outdated (Replace with service architecture docs) |

## Utility Documentation
| Document | Description | Status |
|----------|-------------|--------|
| [CSV Import Utilities](csv-import-components.md) | Utilities for CSV processing | Current |
| [Date Handling Utilities](date-handling.md) | Date processing functions | Outdated (Replace with service architecture docs) |
| [Form Input Utilities](input-field-spec.md) | Form input components | Outdated (Replace with service architecture docs) |

## Upcoming Documentation
| Document | Description |
|----------|-------------|
| Service API Reference | Detailed API documentation for each service |
| Extension Tutorials | Step-by-step guides for extending the system |
| Performance Optimization | Guidelines for optimizing service performance |

## Outdated Documents
The following documents are now outdated and should be replaced by the new service architecture documentation:

1. `DataInput.md` - Superseded by service architecture docs
2. `date-handling.md` - Superseded by FormatService documentation
3. `date-validation-system.md` - Superseded by ValidationService documentation
4. `date-system-maintenance-guide.md` - Superseded by maintenance guide
5. `duplicate-handling-system.docx` - Superseded by DuplicateCheckService documentation
6. `error-handling.md` - Superseded by service architecture docs
7. `input-field-spec.md` - Superseded by component integration examples
8. Various date code examples (`date-code-examples.md`, etc.) - Superseded by service implementation examples

## Reading Path for New Developers
For developers new to the system, we recommend reading the documentation in this order:
1. Data Entry System: Service-Oriented Architecture Documentation (overview)
2. Service Workflows and Diagrams (visual understanding)
3. Service Implementation Examples (code implementation details)
4. Hooks Integration Examples (component connection)
5. Service Architecture Maintenance Guide (best practices)
