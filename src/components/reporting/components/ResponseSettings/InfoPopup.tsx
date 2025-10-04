import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './InfoPopup.css';

interface InfoPopupProps {
  content: string;
  id: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ content, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ 
  top: 0, 
  left: 0, 
  transform: 'translateX(-50%)' 
});
  const popupRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const updatePosition = () => {
  if (iconRef.current) {
    const rect = iconRef.current.getBoundingClientRect();
    const actualPopupWidth = 320;
    const viewportWidth = window.innerWidth;
    const margin = 16;
    
    let left = rect.left + rect.width / 2 + window.scrollX;
    let transform = 'translateX(-50%)';
    
    // Check if popup would go beyond right edge
    if (left + actualPopupWidth / 2 > viewportWidth - margin) {
      left = viewportWidth - margin + window.scrollX;
      transform = 'translateX(-100%)';
    }
    
    // Check if popup would go beyond left edge
    else if (left - actualPopupWidth / 2 < margin) {
      left = margin + window.scrollX;
      transform = 'translateX(0)';
    }
    
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: left,
      transform: transform
    });
  }
};

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const popupContent = isOpen ? (
    <div 
  ref={popupRef} 
  className="info-popup-portal" 
  role="tooltip" 
  aria-describedby={id}
  onClick={(e) => e.stopPropagation()}
  style={{
    position: 'absolute',
    top: position.top,
    left: position.left,
    transform: position.transform || 'translateX(-50%)',
    zIndex: 999999
  }}
>
      <div 
  className="info-popup-content"
  onClick={(e) => e.stopPropagation()}
>
        <p>{content}</p>
        <button
  className="info-popup-close"
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
  }}
  aria-label="Close information"
  type="button"
>
  <X size={14} />
</button>
      </div>
    </div>
  ) : null;

  return (
    <div className="info-popup-container">
      <button
        ref={iconRef}
        className="info-icon"
        onClick={handleClick}
        aria-label="More information"
        type="button"
      >
        ⓘ
      </button>
      
      {popupContent && createPortal(popupContent, document.body)}
    </div>
  );
};

export default InfoPopup;