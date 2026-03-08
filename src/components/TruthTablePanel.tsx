import type { TruthTable } from '../engine/index.js';

interface TruthTablePanelProps {
  targetTable: TruthTable;
  userTable: TruthTable | null;
  inputLabels: string[];
  outputLabels: string[];
  success: boolean;
  sampledResults?: { inputs: number[]; passed: boolean }[] | null;
  isBusChallenge?: boolean;
}

function SuccessBanner() {
  return (
    <div style={{
      background: '#14532d', color: '#86efac', textAlign: 'center',
      padding: '6px 0', borderRadius: 4, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5,
    }}>
      Circuit matches!
    </div>
  );
}

export function TruthTablePanel({
  targetTable,
  userTable,
  inputLabels,
  outputLabels,
  success,
  sampledResults,
  isBusChallenge,
}: TruthTablePanelProps) {
  if (isBusChallenge) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
        {success && <SuccessBanner />}
        {!sampledResults ? (
          <div style={{ color: '#4b5563', fontSize: 12 }}>Wire up the circuit to run verification…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>
              Sampled verification ({sampledResults.filter(r => r.passed).length}/{sampledResults.length} passed)
            </div>
            <table style={{ borderCollapse: 'collapse', color: '#d1d5db' }}>
              <thead>
                <tr>
                  {inputLabels.map(l => <Th key={l}>{l}</Th>)}
                  <Th>Result</Th>
                </tr>
              </thead>
              <tbody>
                {sampledResults.slice(0, 16).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#1f2937' : '#111827' }}>
                    {row.inputs.map((v, j) => (
                      <Td key={j} style={{ color: '#6b7280' }}>
                        {`0x${v.toString(16).toUpperCase().padStart(4, '0')}`}
                      </Td>
                    ))}
                    <Td style={{ color: row.passed ? '#4ade80' : '#f87171' }}>
                      {row.passed ? '✓' : '✗'}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sampledResults.length > 16 && (
              <div style={{ color: '#4b5563', fontSize: 11, marginTop: 4 }}>
                +{sampledResults.length - 16} more cases
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const MAX_ROWS = 64;
  const displayTable = targetTable.length > MAX_ROWS ? targetTable.slice(0, MAX_ROWS) : targetTable;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
      {success && <SuccessBanner />}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            color: '#d1d5db',
          }}
        >
          <thead>
            <tr>
              {inputLabels.map((label) => (
                <Th key={label}>{label}</Th>
              ))}
              {outputLabels.map((label) => (
                <Th key={`target-${label}`} style={{ color: '#9ca3af' }}>
                  {label} <span style={{ opacity: 0.6 }}>(target)</span>
                </Th>
              ))}
              {outputLabels.map((label) => (
                <Th key={`user-${label}`} style={{ color: '#9ca3af' }}>
                  {label} <span style={{ opacity: 0.6 }}>(yours)</span>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayTable.map((targetRow, rowIdx) => {
              const userRow = userTable ? userTable[rowIdx] : null;
              const isEven = rowIdx % 2 === 0;
              return (
                <tr
                  key={rowIdx}
                  style={{ background: isEven ? '#1f2937' : '#111827' }}
                >
                  {targetRow.inputs.map((val, i) => (
                    <Td key={i} style={{ color: '#6b7280' }}>
                      {val ? 1 : 0}
                    </Td>
                  ))}
                  {targetRow.outputs.map((val, i) => (
                    <Td key={i} style={{ color: '#9ca3af' }}>
                      {val ? 1 : 0}
                    </Td>
                  ))}
                  {outputLabels.map((_, i) => {
                    if (userRow === null) {
                      return (
                        <Td key={i} style={{ color: '#4b5563' }}>
                          ?
                        </Td>
                      );
                    }
                    const userVal = userRow.outputs[i];
                    const targetVal = targetRow.outputs[i];
                    const matches = userVal === targetVal;
                    return (
                      <Td key={i} style={{ color: matches ? '#4ade80' : '#f87171' }}>
                        {userVal ? 1 : 0}
                      </Td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {targetTable.length > MAX_ROWS && (
          <div style={{ color: '#4b5563', fontSize: 11, marginTop: 4 }}>
            Showing {MAX_ROWS} of {targetTable.length} rows
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={{
        padding: '4px 10px',
        textAlign: 'center',
        borderBottom: '1px solid #374151',
        color: '#9ca3af',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: '3px 10px',
        textAlign: 'center',
        borderRight: '1px solid #1f2937',
        ...style,
      }}
    >
      {children}
    </td>
  );
}
