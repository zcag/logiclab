import { GATE_INPUT_COUNT } from '../engine/index.js';
import type { GateType } from '../engine/index.js';

interface PaletteProps {
  availableGates: (GateType | string)[];
  compositeLabels?: Map<string, string>; // compositeId → display label
}

export function Palette({ availableGates, compositeLabels }: PaletteProps) {
  const handleDragStart = (e: React.DragEvent, gateType: string) => {
    e.dataTransfer.setData('application/gate-type', gateType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      style={{
        background: '#161822',
        borderTop: '1px solid #2d3148',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px 12px',
        gap: 8,
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginRight: 4, whiteSpace: 'nowrap' }}>
        GATES
      </span>
      {availableGates.map(gate => {
        const isPrimitive = gate in GATE_INPUT_COUNT;
        const label = isPrimitive ? gate : (compositeLabels?.get(gate) ?? gate);
        return (
          <div
            key={gate}
            draggable
            onDragStart={e => handleDragStart(e, gate)}
            style={{
              background: isPrimitive ? '#1e2030' : '#1a2540',
              border: isPrimitive ? '1px solid #374151' : '2px solid #6366f1',
              borderRadius: 6,
              padding: '5px 12px',
              color: isPrimitive ? '#e2e8f0' : '#a5b4fc',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'grab',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
