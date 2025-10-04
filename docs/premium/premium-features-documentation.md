# Premium Features Documentation v2.0

## Overview

The Apostles Model application includes a comprehensive premium features system that provides enhanced functionality for authorized users. This system has been completely redesigned from the previous code-based approach to support modern authentication methods like Cloudflare Access.

## Current Authentication System

### Testing Mode (Current)
- **Toggle**: Clickable crown/circle badge in top-right corner
- **Purpose**: Development and testing
- **Default**: Standard mode (⚪ Standard Mode)
- **Premium**: Crown icon (👑 Premium Mode)

### Production Mode (Future)
- **Authentication**: Cloudflare Access integration
- **User Management**: Email-based access control
- **Session Management**: Cloudflare-managed sessions

## Premium Features Overview

### Standard Features (Free)
- ✅ Basic quadrant visualization
- ✅ Standard data entry (manual and CSV)
- ✅ Basic reporting
- ✅ Data export capabilities
- ✅ Standard charts and graphs

### Premium Features
- 👑 **Advanced Watermark Controls**
- 👑 **Custom Logo Support**
- 👑 **Logo Size and Orientation Controls**
- 👑 **Logo Position Controls**
- 👑 **Enhanced Visualization Options**
- 👑 **Advanced Reporting Features**

## Watermark Controls (Premium)

### Access
- **Location**: Cog icon (⚙️) in bottom-right of visualization
- **Availability**: Premium users only
- **Interface**: Side panel with comprehensive controls

### Features

#### 1. Watermark Visibility
- **Toggle**: Show/Hide watermark
- **Default**: Watermark visible
- **Impact**: Completely removes logo from visualization when hidden

#### 2. Logo Selection
- **Segmentor (Default)**: Application default logo
- **Xperience 360**: XP company branding
- **Teresa Monroe**: TM company branding  
- **Custom Logo URL**: User-provided logo via URL

#### 3. Logo Customization
- **Size Control**: 50px - 200px range
- **Size Adjustment**: +/- 10px increments
- **Default Size**: 90px

#### 4. Orientation Control
- **Vertical**: Logo rotated 90° (default)
- **Horizontal**: Logo displayed flat
- **Use Case**: Adapt to different logo designs

#### 5. Position Control
- **Horizontal Movement**: ← → buttons for left/right positioning
- **Vertical Movement**: ↑ ↓ buttons for up/down positioning
- **Range**: ±10px in each direction from default position
- **Precision**: 1px increments
- **Default Position**: Bottom-right corner (0,0)
- **Real-time Feedback**: Shows current offset (e.g., "Horizontal: -3px")

#### 6. Custom Logo Support
- **URL Input**: Direct image URL input
- **Supported Formats**: PNG, JPG, SVG
- **Fallback**: Reverts to default if URL fails
- **Validation**: Real-time error handling

## Technical Implementation

### Premium State Management

#### Component Structure
```
App.tsx
├── isPremium: boolean state
├── Premium mode badge (top-right)
└── FilteredChart
    └── WatermarkControlsButton (Premium only)
        └── Watermark controls panel
```

#### State Flow
1. **Premium Detection**: `isPremium` state in App.tsx
2. **Feature Gating**: Components check premium status
3. **Effects Management**: Watermark settings stored in `activeEffects` Set
4. **Real-time Updates**: Changes apply immediately

### Effects System

#### Effect Types
- `HIDE_WATERMARK`: Hides watermark completely
- `SHOW_XP_LOGO`: Shows Xperience 360 logo
- `SHOW_TM_LOGO`: Shows Teresa Monroe logo
- `CUSTOM_LOGO`: Enables custom logo mode
- `CUSTOM_LOGO_URL:${url}`: Stores custom logo URL
- `LOGO_SIZE:${size}`: Stores logo size (50-200px)
- `LOGO_FLAT`: Sets horizontal orientation
- `LOGO_X:${value}`: Horizontal position offset (-10 to +10px)
- `LOGO_Y:${value}`: Vertical position offset (-10 to +10px)

#### State Management
```typescript
const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
```

### Premium Component Wrapper

#### PremiumFeature Component
```typescript
<PremiumFeature isPremium={isPremium}>
  {/* Premium content */}
</PremiumFeature>
```

#### Features
- **Automatic Gating**: Hides content for standard users
- **Visual Indicators**: Lock icon for restricted features
- **Graceful Degradation**: Maintains app functionality

## User Experience

### Standard Mode Experience
- **Visual Indicator**: ⚪ Standard Mode badge
- **Limitations**: No watermark controls access
- **Watermark**: Fixed Segmentor logo (non-configurable)
- **Functionality**: All core features available

### Premium Mode Experience
- **Visual Indicator**: 👑 Premium Mode badge
- **Full Access**: All watermark customization options
- **Branding**: Custom logo support for white-labeling
- **Professional**: Enhanced presentation capabilities

## Migration from Code System

### What Changed
- ❌ **Removed**: Secret code input system
- ❌ **Removed**: Client-side code validation
- ❌ **Removed**: localStorage code persistence
- ✅ **Added**: Clean premium state management
- ✅ **Added**: Modern authentication preparation
- ✅ **Added**: Improved user experience

### Benefits
- **Security**: No client-side secrets
- **Scalability**: Centralized user management
- **Maintenance**: Cleaner codebase
- **UX**: Seamless authentication flow
- **GDPR**: Reduced data storage requirements

## Feature Roadmap

### Immediate (Testing Phase)
- ✅ Manual premium toggle for testing
- ✅ Watermark controls functionality
- ✅ All logo customization options
- ✅ Logo position controls (±10px)

### Next Phase (Cloudflare Integration)
- 🔄 Cloudflare Access authentication
- 🔄 Email-based user management
- 🔄 Automatic premium detection
- 🔄 Session-based state management

### Future Enhancements
- 📋 Additional premium visualization options
- 📋 Advanced reporting features
- 📋 Custom branding themes
- 📋 Team collaboration features

## Development Guidelines

### Adding New Premium Features

#### 1. Component Wrapping
```typescript
<PremiumFeature isPremium={isPremium}>
  <NewFeatureComponent />
</PremiumFeature>
```

#### 2. Effects Integration
```typescript
// Add new effect types to system
const [newEffect, setNewEffect] = useState(false);

// Update effects set
useEffect(() => {
  const newEffects = new Set(activeEffects);
  if (newEffect) {
    newEffects.add('NEW_EFFECT');
  } else {
    newEffects.delete('NEW_EFFECT');
  }
  setActiveEffects(newEffects);
}, [newEffect]);
```

#### 3. State Management
- Use `isPremium` for feature gating
- Use `activeEffects` for feature configuration
- Maintain backward compatibility

### Testing Premium Features

#### Development Testing
1. Use premium toggle in top-right corner
2. Verify feature availability changes
3. Test all premium functionality
4. Validate standard mode limitations

#### Production Testing
1. Configure test users in Cloudflare
2. Test authentication flow
3. Verify premium detection
4. Test session management

## Troubleshooting

### Common Issues

#### Premium Features Not Available
- **Check**: isPremium state value
- **Check**: Component premium wrapping
- **Verify**: Effects are properly set

#### Watermark Controls Not Working
- **Check**: Premium status is true
- **Check**: Effects management flow
- **Verify**: onEffectsChange callback

#### Custom Logo Not Loading
- **Check**: URL validity and accessibility
- **Check**: CORS headers for external images
- **Verify**: Fallback to default logo

### Debug Information

#### Console Logging
```typescript
// Check premium status
console.log('isPremium:', isPremium);

// Check active effects
console.log('activeEffects:', Array.from(activeEffects));

// Check watermark settings
console.log('hideWatermark:', hideWatermark);
```

#### State Inspection
- Use React Developer Tools
- Monitor state changes in real-time
- Verify effects propagation

## Security Considerations

### Client-Side Security
- No sensitive data in browser storage
- Effects are cosmetic only
- No business logic bypassing

### Authentication Security
- Server-side validation required
- Cloudflare Access provides security layer
- Session management handled externally

### Data Privacy
- Minimal data collection
- No personal data in effects
- GDPR-compliant approach

## Support and Maintenance

### Regular Maintenance
- Monitor Cloudflare Access logs
- Update user permissions as needed
- Test authentication flow regularly

### Support Escalation
- **Technical Issues**: Check application logs
- **Access Issues**: Verify Cloudflare policies
- **Feature Requests**: Document and prioritize

---

*Documentation Version: 2.0*  
*Last Updated: January 2025*  
*Status: Current System (Post Code-System Migration)*