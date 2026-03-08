import { Handle, Position, type NodeProps } from '@xyflow/react';

export type OutputNodeData = {
  value: boolean;
  label: string;
};

export function OutputNode({ data }: NodeProps) {
  const value = data['value'] as boolean;
  const label = data['label'] as string;

  return (
    <div
      style={{
        background: '#1e2030',
        border: `2px solid ${value ? '#34d399' : '#4b5563'}`,
        borderRadius: 24,
        padding: '6px 14px',
        minWidth: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: value ? '0 0 8px 2px rgba(52,211,153,0.5)' : 'none',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input-0"
        style={{ top: '50%', background: '#6b7280', width: 10, height: 10 }}
      />
      <span style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</span>
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: value ? '#34d399' : '#4b5563',
        }}
      >
        {value ? '1' : '0'}
      </span>
    </div>
  );
}
