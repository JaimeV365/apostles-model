import React, { useEffect, useRef } from 'react';
import { X, Crown } from 'lucide-react';
import { GridDimensions } from '@/types/base';

interface UnifiedWatermarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  effects: Set<string>;
  onEffectsChange: (effects: Set<string>) => void;
  dimensions: GridDimensions;
}

export const UnifiedWatermarkPanel: React.FC<UnifiedWatermarkPanelProps> = ({
  isOpen,
  onClose,
  effects,
  onEffectsChange,
  dimensions
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Body class to harmonize with unified controls
  useEffect(() => {
    if (isOpen) document.body.classList.add('unified-controls-open');
    return () => document.body.classList.remove('unified-controls-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const updateEffects = (updater: (current: Set<string>) => void) => {
    const next = new Set(effects);
    updater(next);
    onEffectsChange(next);
  };

  const getEffectValue = (prefix: string, fallback: number) => {
    const found = Array.from(effects).find(e => e.startsWith(prefix));
    if (!found) return fallback;
    const parsed = parseInt(found.replace(prefix, ''), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const size = getEffectValue('LOGO_SIZE:', 90);
  const posX = getEffectValue('LOGO_X:', 0);
  const posY = getEffectValue('LOGO_Y:', 0);
  
  // Calculate grid boundaries for watermark positioning
  // The watermark is positioned relative to the bottom-right corner
  // We need to ensure it stays within the grid bounds
  const gridWidth = dimensions.totalCols * dimensions.cellWidth;
  const gridHeight = dimensions.totalRows * dimensions.cellHeight;
  
  // Calculate maximum offsets based on grid size and watermark size
  const maxXOffset = Math.max(0, gridWidth - size - 20); // 20px margin
  const maxYOffset = Math.max(0, gridHeight - size - 20); // 20px margin

  return (
    <div className="unified-controls-panel" ref={panelRef}>
      <div className="unified-controls-header">
        <div className="unified-controls-tabs">
          <button className={`unified-tab active`}>
            <Crown size={16} />
            Watermark
          </button>
        </div>
        <button className="unified-close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="unified-controls-content">
        <div className="unified-tab-content">
          <div className="unified-tab-body">
            {/* Logo Selection */}
            <div className="unified-control-group">
              <label className="unified-control-label">Logo</label>
              <select
                className="unified-control-select"
                value={
                  effects.has('SHOW_XP_LOGO') ? 'xp' :
                  effects.has('SHOW_TM_LOGO') ? 'tm' :
                  effects.has('CUSTOM_LOGO') ? 'custom' : 'default'
                }
                onChange={(e) => {
                  updateEffects(next => {
                    next.delete('SHOW_XP_LOGO');
                    next.delete('SHOW_TM_LOGO');
                    next.delete('CUSTOM_LOGO');
                    if (e.target.value === 'tm') next.add('SHOW_TM_LOGO');
                    else if (e.target.value === 'custom') next.add('CUSTOM_LOGO');
                  });
                }}
              >
                <option value="default">Segmentor (Default)</option>
                <option value="tm">Teresa Monroe</option>
                <option value="custom">Custom Logo</option>
              </select>
            </div>

            {/* Size Controls */}
            <div className="unified-control-group">
              <label className="unified-control-label">Size</label>
              <div className="unified-size-controls">
                <button
                  className="unified-size-button"
                  onClick={() => updateEffects(next => {
                    Array.from(next).filter(e => e.startsWith('LOGO_SIZE:')).forEach(e => next.delete(e));
                    const newSize = Math.max(50, size - 10);
                    next.add(`LOGO_SIZE:${newSize}`);
                  })}
                >
                  -
                </button>
                <div className="unified-size-display">{size}px</div>
                <button
                  className="unified-size-button"
                  onClick={() => updateEffects(next => {
                    Array.from(next).filter(e => e.startsWith('LOGO_SIZE:')).forEach(e => next.delete(e));
                    const newSize = Math.min(200, Math.max(50, size + 10));
                    next.add(`LOGO_SIZE:${newSize}`);
                  })}
                >
                  +
                </button>
              </div>
            </div>

            {/* Position Controls */}
            <div className="unified-control-group">
              <label className="unified-control-label">Position</label>
              <div className="unified-size-controls">
                <button className="unified-size-button" onClick={() => updateEffects(next => {
                  Array.from(next).filter(e => e.startsWith('LOGO_X:')).forEach(e => next.delete(e));
                  // move left but keep within grid bounds
                  const nx = Math.max(-maxXOffset, posX - 10);
                  if (nx !== 0) next.add(`LOGO_X:${nx}`);
                })}>←</button>
                <div className="unified-size-display">X</div>
                <button className="unified-size-button" onClick={() => updateEffects(next => {
                  Array.from(next).filter(e => e.startsWith('LOGO_X:')).forEach(e => next.delete(e));
                  // move right but keep within grid bounds
                  const nx = Math.min(maxXOffset, posX + 10);
                  if (nx !== 0) next.add(`LOGO_X:${nx}`);
                })}>→</button>
              </div>
              <div className="unified-size-controls">
                <button className="unified-size-button" onClick={() => updateEffects(next => {
                  Array.from(next).filter(e => e.startsWith('LOGO_Y:')).forEach(e => next.delete(e));
                  // move up but keep within grid bounds
                  const ny = Math.max(-maxYOffset, posY - 10);
                  if (ny !== 0) next.add(`LOGO_Y:${ny}`);
                })}>↑</button>
                <div className="unified-size-display">Y</div>
                <button className="unified-size-button" onClick={() => updateEffects(next => {
                  Array.from(next).filter(e => e.startsWith('LOGO_Y:')).forEach(e => next.delete(e));
                  // move down but keep within grid bounds
                  const ny = Math.min(maxYOffset, posY + 10);
                  if (ny !== 0) next.add(`LOGO_Y:${ny}`);
                })}>↓</button>
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="unified-control-group">
              <label className="unified-control-label">Rotation</label>
              <div className="unified-rotation-controls">
                <button
                  className={`unified-rotation-button ${!effects.has('LOGO_FLAT') ? 'active' : ''}`}
                  onClick={() => updateEffects(next => next.delete('LOGO_FLAT'))}
                >
                  Vertical
                </button>
                <button
                  className={`unified-rotation-button ${effects.has('LOGO_FLAT') ? 'active' : ''}`}
                  onClick={() => updateEffects(next => next.add('LOGO_FLAT'))}
                >
                  Horizontal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedWatermarkPanel;

