import React from 'react';
import { THEME } from '../styles/constants';

interface CardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const CardLayout: React.FC<CardLayoutProps> = ({ children, title }) => (
  <div className="card">
    <div style={{ 
      fontSize: '16px',
      fontWeight: '500',
      color: THEME.colors.text.primary,
      marginBottom: THEME.spacing.md
    }}>
      {title}
    </div>
    <div className="card__content">
      {children}
    </div>
  </div>
);

export default CardLayout;