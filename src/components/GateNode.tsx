import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GATE_INPUT_COUNT } from '../engine/index.js';
import type { GateType } from '../engine/index.js';

export type GateNodeData = {
  type: GateType;
  active?: boolean;
};

const GATE_INPUT_LABELS: Partial<Record<GateType, string[]>> = {
  DFF: ['D'],
};

export function GateNode({ data }: NodeProps) {
  const gateType = data['type'] as GateType;
  const active = data['active'] as boolean | undefined;
  const inputCount = GATE_INPUT_COUNT[gateType];
  const inputLabels = GATE_INPUT_LABELS[gateType] ?? [];

  const borderColor = active ? '#60a5fa' : '#4b5563';
  const boxShadow = active ? '0 0 8px 2px rgba(96,165,250,0.5)' : 'none';

  return (
    <div
      style={{
        background: '#1e2030',
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: '10px 18px',
        minWidth: 100,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow,
        position: 'relative',
        color: '#e2e8f0',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 1,
      }}
    >
      {Array.from({ length: inputCount }, (_, i) => {
        const top = inputCount === 1
          ? '50%'
          : `${((i + 1) / (inputCount + 1)) * 100}%`;
        const portLabel = inputLabels[i];
        return (
          <div key={`input-${i}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${i}`}
              style={{ top, background: '#6b7280', width: 10, height: 10 }}
            />
            {portLabel && (
              <div style={{ position: 'absolute', left: 14, top, transform: 'translateY(-50%)', fontSize: 9, color: '#9ca3af', pointerEvents: 'none', userSelect: 'none' }}>
                {portLabel}
              </div>
            )}
          </div>
        );
      })}
      <span>{gateType}</span>
      <Handle
        type="source"
        position={Position.Right}
        id="output-0"
        style={{ top: '50%', background: '#6b7280', width: 10, height: 10 }}
      />
    </div>
  );
}
