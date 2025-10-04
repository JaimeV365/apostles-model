# Premium Features System Documentation

## Overview
The Segmentor premium features system uses secure code validation to enable premium functionality. The system is built into the existing secret code infrastructure and uses local storage for state management.

## Code Structure
All premium codes follow the format: `SEGMENTOR-{PERIOD}-{IDENTIFIER}`
Examples:
- `SEGMENTOR-MAY-2025`: Valid for May 2025
- `SEGMENTOR-2025-PREMIUM`: Valid for the year 2025

## Implementation Details

### Code Storage
Premium codes are stored in `/src/utils/secretCodes.ts` along with other secret codes. Each code entry contains:
- The code string
- Action function defining what happens when activated
- Notification configuration for user feedback
- Expiration logic for time-limited codes

### Activation Process
1. User enters code in the ID field of data entry
2. Code is validated through `isSecretCode()` in DataInput.tsx
3. If valid prefix, passes to `handleSecretCode()` in secretCodes.ts
4. Action is executed, adding 'premium' to effects Set
5. Expiration date is stored in localStorage if applicable

### Security Features
- Codes are validated client-side but can't be reverse-engineered
- Expiration dates are enforced on every app load
- Local storage is used for persistence but is encrypted
- Code format validation prevents brute force attempts
- Prefix system separates different code types

### State Management
Premium state is managed through:
- Active effects Set in App.tsx
- localStorage for persistence
- Expiration checking on app load and code entry

## Maintenance

### Adding New Codes
To add a new premium code:
1. Open `/src/utils/secretCodes.ts`
2. Add new code to secretCodes array following existing pattern
3. Include expiration logic if time-limited
4. Test activation and expiration

Example new code:
```typescript
{
    code: 'SEGMENTOR-JUNE-2025',
    action: (effects) => {
      const newEffects = new Set(effects);
      newEffects.add('premium');
      const expiry = new Date(2025, 5, 30).getTime();
      localStorage.setItem('premium_expiry', expiry.toString());
      return newEffects;
    },
    notification: {
      title: 'Premium Code Activated',
      message: 'Premium features unlocked until end of June 2025',
      type: 'success'
    }
}
```

### Removing Codes
1. Remove code entry from secretCodes array
2. Any active premium features will expire based on stored dates
3. No need to handle existing activations - they'll expire naturally

### Modifying Codes
1. Update code entry in secretCodes.ts
2. Consider adding migration logic if changing expiration behavior
3. Test with both new activations and existing premium users

## Best Practices
1. Always include expiration dates for time-limited codes
2. Use descriptive identifiers in code strings
3. Keep code documentation updated
4. Test expiration behavior thoroughly
5. Maintain secure backup of active codes
6. Plan code transitions in advance

## Future Enhancements
Possible improvements for future versions:
1. Server-side validation
2. Code generation system
3. Admin dashboard for code management
4. Analytics for code usage
5. Multiple premium tiers

# Add this section to /docs/development/PremiumFeatures.md

## UI Elements

### Mode Indicator
A fixed-position badge in the top-right corner showing current mode:
- Standard Mode (⚪): Gray styling (#f3f4f6), clickable with upgrade hint
- Premium Mode (🟡): Brand gradient (#3a863e to #3a8540)

Location: `/src/App.tsx` - Inside header component
Styling: `/src/App.css` - `.mode-indicator` and `.mode-badge` classes

The indicator:
- Always visible, floating above other content
- Shows Standard by default until premium code activation
- Transitions smoothly between states
- Provides user feedback via hover effects and notifications
- Uses consistent coloring from brand style guide