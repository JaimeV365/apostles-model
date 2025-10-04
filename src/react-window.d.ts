declare module 'react-window' {
    import { ComponentType, CSSProperties, ReactNode } from 'react';
  
    interface ListProps {
      children: ComponentType<{
        index: number;
        style: CSSProperties;
      }>;
      height: number;
      width: number;
      itemCount: number;
      itemSize: number;
    }
  
    export const FixedSizeList: ComponentType<ListProps>;
  }