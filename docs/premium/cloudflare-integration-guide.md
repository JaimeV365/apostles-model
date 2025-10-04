# Cloudflare Access Integration Guide

## Overview
This guide provides step-by-step instructions for integrating the Apostles Model application with Cloudflare Access for premium feature management.

## Current State
- ✅ Application has clean premium state management
- ✅ Premium features are controlled by `isPremium` boolean state
- ✅ Testing toggle is available for development
- 🔄 Ready for Cloudflare Access integration

## Cloudflare Access Setup

### 1. Cloudflare Access Configuration

#### Create Access Application
1. Log into Cloudflare Dashboard
2. Navigate to **Zero Trust** → **Access** → **Applications**
3. Click **Add an application**
4. Choose **Self-hosted** application
5. Configure application settings:
   - **Application name**: "Apostles Model Premium"
   - **Session duration**: 24 hours (or preferred)
   - **Application domain**: `your-domain.com`

#### Create Access Policies
Create policies for different user groups:

**Policy 1: Premium Users**
- **Name**: "Premium Access"
- **Action**: Allow
- **Rules**: 
  - Include: Email domains or specific emails
  - Example: `user@company.com`, `admin@company.com`
- **Additional headers**: Send user email and groups

**Policy 2: Standard Users** (Optional)
- **Name**: "Standard Access" 
- **Action**: Allow
- **Rules**: Different email set for standard access

### 2. Code Integration

#### Step 1: Create Authentication Utility

Create file: `src/utils/cloudflareAuth.ts`
```typescript
export interface UserAccessProfile {
  isAuthenticated: boolean;
  email?: string;
  isPremium: boolean;
  groups?: string[];
}

export async function checkCloudflareAccess(): Promise<UserAccessProfile> {
  try {
    // Check for Cloudflare authentication headers/cookies
    const email = getCloudflareCookie();
    
    if (!email) {
      return {
        isAuthenticated: false,
        isPremium: false
      };
    }

    // Fetch user permissions from your backend
    const response = await fetch('/api/user-permissions', {
      headers: {
        'X-Cloudflare-Email': email
      }
    });

    if (!response.ok) {
      return {
        isAuthenticated: false,
        isPremium: false
      };
    }

    const userData = await response.json();
    
    return {
      isAuthenticated: true,
      email: userData.email,
      isPremium: userData.isPremium,
      groups: userData.groups
    };
  } catch (error) {
    console.error('Cloudflare Access check failed', error);
    return {
      isAuthenticated: false,
      isPremium: false
    };
  }
}

function getCloudflareCookie(): string | null {
  // Extract email from Cloudflare headers or cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'CF_Authorization') {
      return decodeURIComponent(value);
    }
  }
  return null;
}
```

#### Step 2: Backend API Route

Create API endpoint: `/api/user-permissions`
```javascript
// Example for Next.js API route
export default async function handler(req, res) {
  const email = req.headers['x-cloudflare-email'];
  
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Define premium users (replace with your database logic)
  const premiumUsers = [
    'admin@company.com',
    'premium-user@company.com'
  ];
  
  const isPremium = premiumUsers.includes(email);
  
  res.status(200).json({
    email,
    isPremium,
    groups: isPremium ? ['premium'] : ['standard']
  });
}
```

#### Step 3: Update App.tsx

**Remove testing toggle logic:**
```typescript
// REMOVE: Testing click handlers
onClick={() => {
  setIsPremium(!isPremium);
  // ... notification logic
}}
```

**Replace with:**
```typescript
// ADD: Cloudflare integration
import { checkCloudflareAccess } from './utils/cloudflareAuth';

// In the component:
useEffect(() => {
  const checkPremiumStatus = async () => {
    const accessProfile = await checkCloudflareAccess();
    setIsPremium(accessProfile.isPremium);
    
    if (accessProfile.isAuthenticated) {
      console.log(`User ${accessProfile.email} authenticated with premium: ${accessProfile.isPremium}`);
    }
  };
  
  checkPremiumStatus();
}, []);
```

**Update the mode badge to be non-clickable:**
```typescript
{isPremium ? (
  <span className="mode-badge mode-badge--premium">
    👑 Premium Mode
  </span>
) : (
  <span className="mode-badge mode-badge--standard">
    ⚪ Standard Mode
  </span>
)}
```

### 3. User Management

#### Adding Premium Users
1. Go to Cloudflare Dashboard
2. Navigate to **Zero Trust** → **Access** → **Applications**
3. Edit the "Apostles Model Premium" application
4. Update the policy rules to include new email addresses

#### Removing Users
1. Remove email from the policy rules
2. User will lose access on next session check

### 4. Testing

#### Test Premium Access
1. Add your email to premium policy
2. Access the application
3. Verify crown icon appears
4. Verify watermark controls are available

#### Test Standard Access
1. Remove email from premium policy (or add to standard policy)
2. Clear browser cache/cookies
3. Access the application
4. Verify standard mode with limited features

### 5. Security Considerations

#### Headers Validation
- Always validate Cloudflare headers on backend
- Never trust client-side authentication state
- Implement proper session management

#### Fallback Behavior
- If Cloudflare is unreachable, default to standard mode
- Implement graceful degradation
- Log authentication failures for monitoring

## Migration Checklist

- [ ] Set up Cloudflare Access application
- [ ] Create user policies (premium/standard)
- [ ] Create backend API endpoint
- [ ] Add authentication utility
- [ ] Update App.tsx with Cloudflare integration
- [ ] Remove testing toggle logic
- [ ] Test with premium users
- [ ] Test with standard users
- [ ] Monitor logs for authentication issues

## Troubleshooting

### Common Issues

**Issue**: Users see standard mode despite being in premium policy
- **Check**: Cloudflare headers are being sent correctly
- **Check**: Backend API is receiving headers
- **Check**: User email matches policy exactly

**Issue**: Authentication not working
- **Check**: Cloudflare Access is properly configured
- **Check**: Application domain matches deployment URL
- **Check**: Browser cookies are enabled

**Issue**: Backend API errors
- **Check**: CORS configuration for cross-origin requests
- **Check**: API endpoint is accessible
- **Check**: Headers are being forwarded correctly

## Support

For issues with:
- **Cloudflare Access**: Contact Cloudflare support
- **Application integration**: Check application logs
- **User access**: Verify policy configuration