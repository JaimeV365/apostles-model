# Feature Documentation - Free vs Premium

## Core Features

### Visualization
| Feature | Free | Premium |
|---------|------|---------|
| Basic Quadrant View | ✓ | ✓ |
| Simple Data Points | ✓ | ✓ |
| Fixed Midpoint | ✓ | ✓ |
| Special Zones (Apostles/Terrorists) | - | ✓ |
| Near-zones | - | ✓ |
| Frequency Clustering | - | ✓ |
| Custom Grid Options | - | ✓ |

### Data Management
| Feature | Free | Premium |
|---------|------|---------|
| CSV Import | ✓ | ✓ |
| Basic Validation | ✓ | ✓ |
| Error Reporting | ✓ | ✓ |
| Bulk Processing | - | ✓ |
| Advanced Validation | - | ✓ |

### Reporting
| Feature | Free | Premium |
|---------|------|---------|
| Basic Data Report | ✓ | ✓ |
| Simple PDF Export | ✓ | ✓ |
| Advanced Analytics | - | ✓ |
| Custom Branding | - | ✓ |
| DOCX/PPTX Export | - | ✓ |
| Action Recommendations | - | ✓ |

## Access Control Implementation

```typescript
// Feature access control
interface FeatureAccess {
  feature: string;
  tier: 'free' | 'premium';
  preview?: boolean;
}

const FEATURE_ACCESS: Record<string, FeatureAccess> = {
  'basic-visualization': { feature: 'Basic Visualization', tier: 'free' },
  'special-zones': { feature: 'Special Zones', tier: 'premium', preview: true },
  'near-zones': { feature: 'Near Zones', tier: 'premium', preview: true },
  'advanced-reports': { feature: 'Advanced Reports', tier: 'premium', preview: false }
};
```

## Preview System
- Static SVG demonstrations for premium features
- Example report previews
- Feature comparison tooltips
