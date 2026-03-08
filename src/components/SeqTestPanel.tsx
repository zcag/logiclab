interface SeqTestPanelProps {
  steps: Array<{
    label?: string;
    inputs: (boolean | number)[];
    tick?: boolean;
    actual: number[];
    expected: (number | null)[];
    passed: boolean;
  }> | null;
  inputLabels: string[];
  outputLabels: string[];
  success: boolean;
  busInputBits: number[];
  busOutputBits: number[];
}

function fmtVal(val: boolean | number, bits: number): string {
  if (bits <= 1) return val ? '1' : '0';
  const n = typeof val === 'boolean' ? (val ? 1 : 0) : val;
  return `0x${n.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')}`;
}

function fmtOut(val: number, bits: number): string {
  if (bits <= 1) return val ? '1' : '0';
  return `0x${val.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')}`;
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      padding: '4px 10px',
      textAlign: 'center',
      borderBottom: '1px solid #374151',
      color: '#9ca3af',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding: '3px 10px',
      textAlign: 'center',
      borderRight: '1px solid #1f2937',
      ...style,
    }}>
      {children}
    </td>
  );
}

export function SeqTestPanel({
  steps,
  inputLabels,
  outputLabels,
  success,
  busInputBits,
  busOutputBits,
}: SeqTestPanelProps) {
  const passed = steps ? steps.filter(s => s.passed).length : 0;
  const total = steps ? steps.length : 0;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
      {success && (
        <div style={{
          background: '#14532d', color: '#86efac', textAlign: 'center',
          padding: '6px 0', borderRadius: 4, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5,
        }}>
          All sequential tests passed!
        </div>
      )}
      {!steps ? (
        <div style={{ color: '#4b5563', fontSize: 12 }}>Wire up the circuit to run sequential tests…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>
            Sequential tests ({passed}/{total} passed)
          </div>
          <table style={{ borderCollapse: 'collapse', color: '#d1d5db' }}>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Label</Th>
                <Th style={{ color: '#60a5fa' }}>Tick</Th>
                {inputLabels.map((l, i) => <Th key={i}>{l}</Th>)}
                {outputLabels.map((l, i) => (
                  <Th key={i} style={{ color: '#9ca3af' }}>
                    {l} <span style={{ opacity: 0.6 }}>(actual)</span>
                  </Th>
                ))}
                {outputLabels.map((l, i) => (
                  <Th key={i} style={{ color: '#9ca3af' }}>
                    {l} <span style={{ opacity: 0.6 }}>(exp)</span>
                  </Th>
                ))}
                <Th>Pass</Th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#1f2937' : '#111827' }}>
                  <Td style={{ color: '#4b5563' }}>{idx}</Td>
                  <Td style={{ color: '#6b7280' }}>{step.label ?? ''}</Td>
                  <Td style={{ color: step.tick ? '#60a5fa' : '#374151' }}>
                    {step.tick ? '↑' : '·'}
                  </Td>
                  {step.inputs.map((val, i) => (
                    <Td key={i} style={{ color: '#6b7280' }}>
                      {fmtVal(val, busInputBits[i] ?? 1)}
                    </Td>
                  ))}
                  {step.actual.map((val, i) => (
                    <Td key={i} style={{ color: step.expected[i] === null ? '#9ca3af' : (step.expected[i] === val ? '#4ade80' : '#f87171') }}>
                      {fmtOut(val, busOutputBits[i] ?? 1)}
                    </Td>
                  ))}
                  {step.expected.map((exp, i) => (
                    <Td key={i} style={{ color: '#6b7280' }}>
                      {exp === null ? '–' : fmtOut(exp, busOutputBits[i] ?? 1)}
                    </Td>
                  ))}
                  <Td style={{ color: step.passed ? '#4ade80' : '#f87171' }}>
                    {step.passed ? '✓' : '✗'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
