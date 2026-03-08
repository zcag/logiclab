import { Handle, Position, type NodeProps } from '@xyflow/react';

export function BusOutputNode({ data }: NodeProps) {
  const bits = (data['bits'] as number) ?? 16;
  const value = (data['value'] as number) ?? 0;
  const label = (data['label'] as string) ?? '';
  const padLen = Math.ceil(bits / 4);
  const hex = `0x${value.toString(16).toUpperCase().padStart(padLen, '0')}`;

  return (
    <div style={{
      background: '#1a1f35',
      border: '2px solid #818cf8',
      borderRadius: 8,
      padding: '8px 14px',
      minWidth: 130,
      color: '#c7d2fe',
      fontFamily: 'monospace',
      position: 'relative',
      userSelect: 'none',
    }}>
      <Handle type="target" position={Position.Left} id="bus-in-0"
        style={{ width: 14, height: 24, borderRadius: 3, background: '#818cf8', left: -8, top: '50%', transform: 'translateY(-50%)' }} />
      <div style={{ fontSize: 10, color: '#818cf8', marginBottom: 3, fontWeight: 700, letterSpacing: 0.5 }}>
        {label}[{bits}]
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{hex}</div>
    </div>
  );
}
