interface SecretCodeEffect {
    newEffects: Set<string>;
    notification?: {
      title: string;
      message: string;
      type: 'success' | 'info';
    };
  }
  
  export const handleSecretCode = (code: string, currentEffects: Set<string>): SecretCodeEffect => {
    const effects = new Set(currentEffects);
    
    switch(code) {
      case 'EXAMPLE-CODE-1':
        effects.add('EXAMPLE_EFFECT_1');
        return {
          newEffects: effects,
          notification: {
            title: 'Example Feature',
            message: 'Example feature activated',
            type: 'success'
          }
        };
      default:
        return { newEffects: effects };
    }
  };