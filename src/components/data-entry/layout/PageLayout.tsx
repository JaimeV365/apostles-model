import React from 'react';
import { THEME } from '../styles/constants';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => (
  <div style={{ 
    padding: THEME.spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto'
  }}>
    <h1 style={{ 
      fontSize: '24px', 
      marginBottom: THEME.spacing.lg,
      color: THEME.colors.text.primary,
      fontWeight: '500'
    }}>
      {title}
    </h1>
    {children}
  </div>
);

export default PageLayout;