export const protectedCodes = [
    {
      code: 'XP-LOGO-OFF',
      action: (effects: Set<string>) => {
        const newEffects = new Set(effects);
        newEffects.add('HIDE_WATERMARK');
        return newEffects;
      },
      notification: {
        title: 'Secret Code Activated',
        message: 'Xperience 360 logo has been hidden',
        type: 'success' as const
      }
    },
    // ... existing logo codes ...
    {
      code: 'PREMIUM2024',
      action: (effects: Set<string>) => {
        const newEffects = new Set(effects);
        newEffects.add('premium');
        return newEffects;
      },
      notification: {
        title: 'Premium Code Activated',
        message: 'Premium features have been unlocked for 2024',
        type: 'success' as const
      }
    },
    {
      code: 'TEST-PREMIUM',
      action: (effects: Set<string>) => {
        const newEffects = new Set(effects);
        newEffects.add('premium');
        return newEffects;
      },
      notification: {
        title: 'Test Premium Activated',
        message: 'Premium features have been unlocked for testing',
        type: 'success' as const
      }
    }
  ];