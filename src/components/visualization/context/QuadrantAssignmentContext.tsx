// src/components/visualization/context/QuadrantAssignmentContext.tsx
// This file now re-exports the unified context to maintain backward compatibility
export { 
  QuadrantAssignmentProvider, 
  useQuadrantAssignment,
  useQuadrantAssignmentSafe,
  type QuadrantType 
} from './UnifiedQuadrantContext';