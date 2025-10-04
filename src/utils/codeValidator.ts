// src/utils/codeValidator.ts
import { useNotification } from '../components/data-entry/NotificationSystem';

interface CodeValidationResult {
  valid: boolean;
  effects: string[];
  message: string;
}

export async function validateCode(code: string): Promise<CodeValidationResult> {
  try {
    const response = await fetch('/api/validate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating code:', error);
    return { 
      valid: false, 
      effects: [],
      message: 'Error connecting to validation service' 
    };
  }
}

export function handleCodeActivation(
  code: string, 
  activeEffects: Set<string>,
  setActiveEffects: (effects: Set<string>) => void
) {
  validateCode(code).then(result => {
    const notification = useNotification();
    
    if (result.valid) {
      const newEffects = new Set(activeEffects);
      
      // Add all effects from the result
      result.effects.forEach(effect => {
        newEffects.add(effect);
      });
      
      setActiveEffects(newEffects);
      
      // Show success notification
      notification.showNotification({
        title: 'Code Activated',
        message: result.message,
        type: 'success'
      });
    } else {
      // Show error notification
      notification.showNotification({
        title: 'Invalid Code',
        message: result.message,
        type: 'error'
      });
    }
  });
}