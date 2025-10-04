# Pre-Publication Cleanup Guide

## Current Implementation Status

### Active Production Code

#### Visualization Core (Currently in test/TestZones8)
These components need to be moved to proper production locations:
```
src/components/visualization/test/TestZones8/
├── components/
│   ├── DataPointRenderer.tsx     -> Move to: src/components/visualization/components/DataPoints/
│   ├── GridSystem.tsx           -> Move to: src/components/visualization/components/Grid/
│   ├── SpecialZones.tsx        -> Move to: src/components/visualization/components/Zones/
│   └── ChartControls.tsx       -> Move to: src/components/visualization/components/Controls/
```

#### Data Entry Module (Production Ready)
```
src/components/data-entry/
├── DataEntryModule.tsx
├── forms/
│   ├── CSVImport.tsx
│   ├── DataInput.tsx
│   └── ScaleSelector.tsx
└── table/
    └── DataDisplay.tsx
```

### Code to Remove

#### Deprecated Test Versions
```
src/components/visualization/test/
├── TestZones.tsx          # Initial test - Remove
├── TestZones2.tsx         # Early iteration - Remove
├── TestZones3.tsx         # Scale testing - Remove
├── TestZones4.tsx         # Grid system test - Remove
├── TestZones5.tsx         # Zone handling test - Remove
├── TestZones6.tsx         # Point rendering test - Remove
└── TestZones7.tsx         # Near-apostles test - Remove
```

#### Unused Components/Files
- `src/components/visualization/test/TestZones8 not in use.tsx`
- Any `.css` files associated with removed test components
- Any unused type definitions in `/src/types/`
- Any unused utility functions in `/src/utils/`

## Cleanup Steps

### 1. Component Migration
1. Create new production component directories if not exist
2. Move TestZones8 components to proper locations
3. Update all imports to reflect new locations
4. Update documentation to reflect new structure
5. Test all functionality after migration

### 2. File Cleanup
1. Remove all TestZones1-7 files
2. Remove associated test files
3. Remove unused CSS files
4. Remove unused utility functions
5. Clean up type definitions

### 3. Documentation Update
Following files need to be updated after cleanup:
- `/docs/architecture/ProjectMap.md`
- `/docs/DocumentationIndex.md`
- Component documentation files
- Update `structure.txt`

### 4. Import/Export Cleanup
1. Check and update all import statements
2. Remove unused exports
3. Update barrel files (index.ts)
4. Verify dependency tree

### 5. Testing
1. Update test files to reflect new structure
2. Remove tests for deleted components
3. Add tests for migrated components
4. Verify test coverage

## New Production Structure

### After Cleanup
```
src/components/
├── data-entry/           # Already in production structure
└── visualization/
    ├── components/
    │   ├── Controls/
    │   ├── DataPoints/
    │   ├── Grid/
    │   └── Zones/
    ├── utils/
    └── types/
```

## Version Management

### Current Active Versions
- Data Entry Module: v1.0
- Visualization: TestZones8 (to be versioned as v1.0 after migration)
- Component Library: v1.0

### Version Update Plan
1. Complete component migration
2. Version all components as 1.0
3. Update package.json
4. Create initial release tag

## Pre-Publication Checklist

### Code
- [ ] Migrate TestZones8 components
- [ ] Remove deprecated test files
- [ ] Update imports/exports
- [ ] Clean up unused files
- [ ] Verify all tests pass

### Documentation
- [ ] Update architecture docs
- [ ] Update component docs
- [ ] Update project map
- [ ] Update documentation index
- [ ] Verify all links work

### Testing
- [ ] Run full test suite
- [ ] Verify component integration
- [ ] Check performance
- [ ] Validate types
- [ ] Test all features

### Build
- [ ] Clean build works
- [ ] No console warnings
- [ ] Bundle size optimized
- [ ] Dependencies cleaned

## Notes
- Keep git history for reference
- Document migration decisions
- Maintain test coverage
- Update version numbers
- Create release notes

## Timeline
1. Component Migration: 1-2 days
2. File Cleanup: 1 day
3. Documentation Update: 1-2 days
4. Testing & Verification: 2-3 days
5. Final Review: 1 day

Total Estimated Time: 6-9 days