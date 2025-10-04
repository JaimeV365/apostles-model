declare module 'react-virtualized-auto-sizer' {
    import { ComponentType, ReactNode } from 'react';
  
    interface AutoSizerProps {
      children: ({ height, width }: { height: number; width: number }) => ReactNode;
    }
  
    const AutoSizer: ComponentType<AutoSizerProps>;
    export default AutoSizer;
  }