import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export function BusInputNode({ data, id }: NodeProps) {
  const bits = (data['bits'] as number) ?? 16;
  const value = (data['value'] as number) ?? 0;
  const label = (data['label'] as string) ?? '';
  const onValueChange = data['onValueChange'] as ((id: string, value: number) => void) | undefined;
  const [editing, setEditing] = useState(false);

  const maxVal = bits < 32 ? (1 << bits) - 1 : 0xFFFFFFFF;
  const padLen = Math.ceil(bits / 4);
  const hex = `0x${value.toString(16).toUpperCase().padStart(padLen, '0')}`;

  const commit = (text: string) => {
    const parsed = parseInt(text.replace(/^0x/i, ''), 16);
    if (!isNaN(parsed)) onValueChange?.(id, parsed & maxVal);
    setEditing(false);
  };

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
      <div style={{ fontSize: 10, color: '#818cf8', marginBottom: 3, fontWeight: 700, letterSpacing: 0.5 }}>
        {label}[{bits}]
      </div>
      {editing ? (
        <input
          autoFocus
          defaultValue={value.toString(16).toUpperCase()}
          style={{
            background: 'transparent', border: 'none', borderBottom: '1px solid #818cf8',
            color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
            width: '100%', outline: 'none',
          }}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <div style={{ fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit (hex)"
        >{hex}</div>
      )}
      <Handle type="source" position={Position.Right} id="bus-out-0"
        style={{ width: 14, height: 24, borderRadius: 3, background: '#818cf8', right: -8, top: '50%', transform: 'translateY(-50%)' }} />
    </div>
  );
}
