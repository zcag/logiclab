import { Handle, Position, type NodeProps } from '@xyflow/react';

export type InputNodeData = {
  value: boolean;
  label: string;
  onToggle: () => void;
};

export function InputNode({ data }: NodeProps) {
  const value = data['value'] as boolean;
  const label = data['label'] as string;
  const onToggle = data['onToggle'] as () => void;

  return (
    <div
      onClick={onToggle}
      style={{
        background: '#1e2030',
        border: `2px solid ${value ? '#60a5fa' : '#4b5563'}`,
        borderRadius: 24,
        padding: '6px 14px',
        minWidth: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: value ? '0 0 8px 2px rgba(96,165,250,0.5)' : 'none',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</span>
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: value ? '#60a5fa' : '#4b5563',
        }}
      >
        {value ? '1' : '0'}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="output-0"
        style={{ top: '50%', background: '#6b7280', width: 10, height: 10 }}
      />
    </div>
  );
}
