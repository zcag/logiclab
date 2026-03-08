import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { PortDef } from '../engine/index.js';

export function CompositeGateNode({ data }: NodeProps) {
  const inputCount = data['inputCount'] as number;
  const outputCount = data['outputCount'] as number;
  const label = data['label'] as string;
  const portGroups = data['portGroups'] as { inputs: PortDef[]; outputs: PortDef[] } | undefined;

  if (portGroups) {
    const inp = portGroups.inputs;
    const out = portGroups.outputs;
    const nodeHeight = Math.max(72, Math.max(inp.length, out.length) * 40 + 20);

    return (
      <div style={{
        background: '#1a1f35',
        border: '2px solid #818cf8',
        borderRadius: 8,
        padding: '10px 18px',
        minWidth: 110,
        height: nodeHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: '#c7d2fe',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.5,
      }}>
        {inp.map((port, i) => {
          const top = inp.length === 1 ? '50%' : `${((i + 1) / (inp.length + 1)) * 100}%`;
          const isBus = port.bits > 1;
          return (
            <div key={port.handleId}>
              <Handle type="target" position={Position.Left} id={port.handleId}
                style={{ top, background: isBus ? '#818cf8' : '#6b7280', width: isBus ? 14 : 10, height: isBus ? 24 : 10, borderRadius: isBus ? 3 : '50%', left: -8 }} />
              <div style={{ position: 'absolute', left: 10, top, transform: 'translateY(-50%)', fontSize: 9, color: '#6b7280', pointerEvents: 'none' }}>
                {port.label}{isBus ? `[${port.bits}]` : ''}
              </div>
            </div>
          );
        })}
        <span>{label}</span>
        {out.map((port, i) => {
          const top = out.length === 1 ? '50%' : `${((i + 1) / (out.length + 1)) * 100}%`;
          const isBus = port.bits > 1;
          return (
            <div key={port.handleId}>
              <Handle type="source" position={Position.Right} id={port.handleId}
                style={{ top, background: isBus ? '#818cf8' : '#6b7280', width: isBus ? 14 : 10, height: isBus ? 24 : 10, borderRadius: isBus ? 3 : '50%', right: -8 }} />
              <div style={{ position: 'absolute', right: 10, top, transform: 'translateY(-50%)', fontSize: 9, color: '#6b7280', pointerEvents: 'none', textAlign: 'right' }}>
                {port.label}{isBus ? `[${port.bits}]` : ''}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // scalar fallback — dynamic height so port labels and gate name never share the same row
  const inputLabels = data['inputLabels'] as string[] | undefined;
  const outputLabels = data['outputLabels'] as string[] | undefined;
  const nodeHeight = Math.max(72, Math.max(inputCount, outputCount) * 36 + 24);

  return (
    <div style={{
      background: '#1a2540',
      border: '2px solid #6366f1',
      borderRadius: 8,
      padding: '10px 18px',
      minWidth: 120,
      height: nodeHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      color: '#a5b4fc',
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 0.5,
    }}>
      {Array.from({ length: inputCount }, (_, i) => {
        const top = inputCount === 1 ? '50%' : `${((i + 1) / (inputCount + 1)) * 100}%`;
        const portLabel = inputLabels?.[i];
        return (
          <div key={`input-${i}`}>
            <Handle type="target" position={Position.Left} id={`input-${i}`} style={{ top, background: '#6b7280', width: 10, height: 10 }} />
            {portLabel && (
              <div style={{ position: 'absolute', left: 12, top, transform: 'translateY(-50%)', fontSize: 9, color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>
                {portLabel}
              </div>
            )}
          </div>
        );
      })}
      <span>{label}</span>
      {Array.from({ length: outputCount }, (_, i) => {
        const top = outputCount === 1 ? '50%' : `${((i + 1) / (outputCount + 1)) * 100}%`;
        const portLabel = outputLabels?.[i];
        return (
          <div key={`output-${i}`}>
            <Handle type="source" position={Position.Right} id={`output-${i}`} style={{ top, background: '#6b7280', width: 10, height: 10 }} />
            {portLabel && (
              <div style={{ position: 'absolute', right: 12, top, transform: 'translateY(-50%)', fontSize: 9, color: '#6b7280', pointerEvents: 'none', userSelect: 'none', textAlign: 'right' }}>
                {portLabel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
