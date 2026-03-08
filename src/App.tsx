import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { sections } from './content/index.js'
import type { Challenge } from './content/types.js'
import type { SeqTestStep } from './content/types.js'
import { generateTruthTable, BUILTIN_GATE_DEFS, BUILTIN_GATE_LABELS, evaluateCircuit, flattenCircuit } from './engine/index.js'
import type { Circuit, TruthTable } from './engine/index.js'
import type { PortDef, CompositeGateDef } from './engine/index.js'
import { Editor, buildCircuit } from './components/Editor.js'
import { Palette } from './components/Palette.js'
import { TruthTablePanel } from './components/TruthTablePanel.js'
import { SeqTestPanel } from './components/SeqTestPanel.js'

const PROGRESS_KEY = 'logiclab-progress'
const CIRCUITS_KEY = 'logiclab-circuits'

function resetAll() {
  localStorage.removeItem(PROGRESS_KEY)
  localStorage.removeItem(CIRCUITS_KEY)
}

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveProgress(completed: Set<string>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]))
}

type CircuitCache = Map<string, { nodes: Node[]; edges: Edge[] }>

function loadCircuits(): CircuitCache {
  try {
    const raw = localStorage.getItem(CIRCUITS_KEY)
    if (!raw) return new Map()
    const obj = JSON.parse(raw) as Record<string, { nodes: Node[]; edges: Edge[] }>
    return new Map(Object.entries(obj))
  } catch {
    return new Map()
  }
}

function stripFns(nodes: Node[]): Node[] {
  return nodes.map(n => ({
    ...n,
    data: Object.fromEntries(Object.entries(n.data).filter(([, v]) => typeof v !== 'function')),
  }))
}

function saveCircuits(cache: CircuitCache) {
  const obj: Record<string, { nodes: Node[]; edges: Edge[] }> = {}
  for (const [id, { nodes, edges }] of cache) {
    obj[id] = { nodes: stripFns(nodes), edges }
  }
  localStorage.setItem(CIRCUITS_KEY, JSON.stringify(obj))
}

type SeqResult = {
  label?: string;
  inputs: (boolean | number)[];
  tick?: boolean;
  actual: number[];
  expected: (number | null)[];
  passed: boolean;
};

function runSeqTests(
  nodes: Node[],
  edges: Edge[],
  compositeMap: Map<string, CompositeGateDef>,
  seqTests: SeqTestStep[],
  busInputBits: number[],
  busOutputBits: number[],
): SeqResult[] {
  const circuit = buildCircuit(nodes, edges, compositeMap);
  const flat = flattenCircuit(circuit, compositeMap);

  let dffStates = new Map<string, boolean>();
  const results: SeqResult[] = [];

  for (const step of seqTests) {
    // Expand step.inputs to boolean[] using busInputBits
    const boolInputs: boolean[] = step.inputs.flatMap((val, bi) => {
      const bits = busInputBits[bi] ?? 1;
      const n = typeof val === 'boolean' ? (val ? 1 : 0) : val;
      return Array.from({ length: bits }, (_, i) => Boolean((n >> i) & 1));
    });

    const result = evaluateCircuit(flat.circuit, boolInputs, dffStates);
    if ('type' in result) {
      results.push({
        label: step.label, inputs: step.inputs, tick: step.tick,
        actual: busOutputBits.map(() => 0),
        expected: step.checkOutputs ?? busOutputBits.map(() => null),
        passed: false,
      });
      continue;
    }

    // Convert outputs to integers per busOutputBits
    let outIdx = 0;
    const actual = busOutputBits.map(bits => {
      let val = 0;
      for (let i = 0; i < bits; i++) {
        if (result.outputs[outIdx + i]) val |= (1 << i);
      }
      outIdx += bits;
      return val;
    });

    const expected = step.checkOutputs ?? actual.map(() => null);
    const passed = expected.every((exp, i) => exp === null || exp === actual[i]);
    results.push({ label: step.label, inputs: step.inputs, tick: step.tick, actual, expected, passed });

    if (step.tick) {
      dffStates = result.newDffStates;
    }
  }
  return results;
}

export default function App() {
  const firstChallenge = sections[0]!.challenges[0]!
  const [challenge, setChallenge] = useState<Challenge>(firstChallenge)
  const [userTable, setUserTable] = useState<TruthTable | null>(null)
  const [success, setSuccess] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(loadProgress)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [sampledResults, setSampledResults] = useState<{ inputs: number[]; passed: boolean }[] | null>(null)
  const [seqResults, setSeqResults] = useState<SeqResult[] | null>(null)
  const [tickSignal, setTickSignal] = useState(0)
  const circuitCache = useRef<CircuitCache>(loadCircuits())

  useEffect(() => {
    saveProgress(completed)
  }, [completed])

  const unlockedGates = useMemo(() => {
    const gates = new Set<string>(['NAND']);
    for (const section of sections) {
      for (const c of section.challenges) {
        if (completed.has(c.id) && c.unlocks) gates.add(c.unlocks);
      }
    }
    // Auto-unlock 16-bit primitive variants once their scalar counterparts are mastered
    if (gates.has('NOT'))        gates.add('NOT16');
    if (gates.has('AND'))        gates.add('AND16');
    if (gates.has('OR'))         gates.add('OR16');
    if (gates.has('mux-2to1'))   gates.add('MUX16');
    if (gates.has('half-adder')) gates.add('ADD16');
    // ALU unlocks after OR8WAY (multi-way mastered); DFF unlocks after ALU (sequential tier)
    if (gates.has('OR8WAY'))     gates.add('ALU');
    if (gates.has('ALU'))        gates.add('DFF');
    return gates;
  }, [completed]);

  const compositeRegistry = useMemo(() => {
    const registry = new Map<string, { label: string; inputCount: number; outputCount: number; circuit: Circuit; portGroups?: { inputs: PortDef[]; outputs: PortDef[] }; inputLabels?: string[]; outputLabels?: string[] }>();
    for (const [id, def] of BUILTIN_GATE_DEFS) {
      if (unlockedGates.has(id)) {
        registry.set(id, {
          label: BUILTIN_GATE_LABELS.get(id) ?? id,
          inputCount: def.inputCount,
          outputCount: def.outputCount,
          circuit: def.circuit,
          portGroups: def.portGroups,
        });
      }
    }
    for (const section of sections) {
      for (const c of section.challenges) {
        if (completed.has(c.id) && c.unlocks && unlockedGates.has(c.unlocks)) {
          const cached = circuitCache.current.get(c.id);
          if (cached) {
            registry.set(c.id, {
              label: c.title,
              inputCount: c.inputs,
              outputCount: c.outputs,
              circuit: buildCircuit(cached.nodes, cached.edges),
              inputLabels: c.inputLabels,
              outputLabels: c.outputLabels,
            });
          }
        }
      }
    }
    return registry;
  }, [completed, unlockedGates]);

  const handleCircuitChange = useCallback((circuit: Circuit, _inputValues: boolean[]) => {
    if (challenge.seqTests && challenge.seqTests.length > 0) {
      const cached = circuitCache.current.get(challenge.id);
      if (!cached) { setSeqResults(null); setSuccess(false); return; }
      const busInputBits = challenge.busInputBits ?? challenge.seqTests[0]?.inputs.map(() => 1) ?? [];
      const busOutputBits = challenge.busOutputBits ?? [1];
      const results = runSeqTests(
        cached.nodes, cached.edges, compositeRegistry,
        challenge.seqTests, busInputBits, busOutputBits,
      );
      setSeqResults(results);
      setSampledResults(null);
      setUserTable(null);
      const allPassed = results.length > 0 && results.every(r => r.passed);
      setSuccess(allPassed);
      if (allPassed) setCompleted(prev => new Set([...prev, challenge.id]));
      return;
    }
    if (challenge.referenceImpl) {
      const flatResult = flattenCircuit(circuit, compositeRegistry);
      const busInputBits = challenge.busInputBits ?? [];
      const busOutputBits = challenge.busOutputBits ?? [];
      const testInts: number[][] = [
        busInputBits.map(() => 0),
        busInputBits.map(b => (1 << b) - 1),
        busInputBits.map(() => 1),
      ];
      for (let s = 3; s < 64; s++) {
        testInts.push(busInputBits.map(b => Math.floor(Math.random() * (1 << b))));
      }
      const results: { inputs: number[]; passed: boolean }[] = [];
      let allPassed = true;
      for (const intInputs of testInts) {
        const boolInputs: boolean[] = intInputs.flatMap((val, bi) => {
          const b = busInputBits[bi] ?? 16;
          return Array.from({ length: b }, (_, i) => Boolean((val >> i) & 1));
        });
        const result = evaluateCircuit(flatResult.circuit, boolInputs);
        if ('type' in result) { allPassed = false; break; } // SimulationError
        const expected = challenge.referenceImpl(intInputs);
        const expectedBool = expected.flatMap((val, oi) => {
          const b = busOutputBits[oi] ?? 16;
          return Array.from({ length: b }, (_, i) => Boolean((val >> i) & 1));
        });
        const passed = result.outputs.every((bit, i) => bit === expectedBool[i]);
        if (!passed) allPassed = false;
        results.push({ inputs: intInputs, passed });
      }
      setSampledResults(results);
      setSeqResults(null);
      setUserTable(null);
      setSuccess(allPassed);
      if (allPassed) setCompleted(prev => new Set([...prev, challenge.id]));
      return;
    }
    const result = generateTruthTable(circuit, compositeRegistry)
    setSampledResults(null);
    setSeqResults(null);
    if (!Array.isArray(result)) {
      setUserTable(null)
      setSuccess(false)
      return
    }
    setUserTable(result)
    const allMatch =
      result.length === challenge.targetTable.length &&
      result.every((row, i) =>
        row.outputs.every((v, j) => v === challenge.targetTable[i]!.outputs[j])
      )
    setSuccess(allMatch)
    if (allMatch) setCompleted(prev => new Set([...prev, challenge.id]))
  }, [challenge, compositeRegistry])

  const selectChallenge = useCallback((c: Challenge) => {
    setChallenge(c)
    setUserTable(null)
    setSuccess(false)
    setSampledResults(null)
    setSeqResults(null)
  }, [])

  const handleStateChange = useCallback((nodes: Node[], edges: Edge[]) => {
    circuitCache.current.set(challenge.id, { nodes, edges })
    saveCircuits(circuitCache.current)
  }, [challenge.id])

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0f1117' }}>

      {/* Nav sidebar */}
      <div style={{ width: 220, background: '#111827', borderRight: '1px solid #1f2937', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1f2937' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f9fafb', letterSpacing: -0.5 }}>logiclab</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map(section => {
          const isCollapsed = collapsed.has(section.id)
          return (
            <div key={section.id} style={{ padding: '4px 0' }}>
              <div
                onClick={() => toggleSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  userSelect: 'none',
                }}
              >
                {section.title}
                <span style={{ fontSize: 10, opacity: 0.6 }}>{isCollapsed ? '▶' : '▼'}</span>
              </div>
              {!isCollapsed && section.challenges.map(c => {
                const active = c.id === challenge.id
                const done = completed.has(c.id)
                return (
                  <div
                    key={c.id}
                    onClick={() => selectChallenge(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 16px',
                      cursor: 'pointer',
                      background: active ? '#1e3a5f' : 'transparent',
                      color: active ? '#93c5fd' : done ? '#6ee7b7' : '#d1d5db',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 10, opacity: done ? 1 : 0.25 }}>✓</span>
                    {c.title}
                  </div>
                )
              })}
            </div>
          )
        })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1f2937' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all progress? This cannot be undone.')) {
                resetAll()
                circuitCache.current = new Map()
                setCompleted(new Set())
              }
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: 6,
              color: '#6b7280',
              fontSize: 11,
              padding: '5px 0',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#f87171'; (e.target as HTMLButtonElement).style.borderColor = '#f87171'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#6b7280'; (e.target as HTMLButtonElement).style.borderColor = '#374151'; }}
          >
            reset progress
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Challenge header */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #1f2937', background: '#111827', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: 14 }}>{challenge.title}</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{challenge.description}</div>
          </div>
          {challenge.availableGates.filter(g => unlockedGates.has(g)).includes('DFF') && (
            <button
              onClick={() => setTickSignal(s => s + 1)}
              style={{
                background: '#1e2030',
                border: '1px solid #374151',
                borderRadius: 6,
                color: '#9ca3af',
                fontSize: 12,
                padding: '5px 12px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#60a5fa'; (e.target as HTMLButtonElement).style.borderColor = '#60a5fa'; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#9ca3af'; (e.target as HTMLButtonElement).style.borderColor = '#374151'; }}
              title="Advance clock by one tick"
            >
              Tick ▶
            </button>
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Editor
            key={challenge.id}
            availableGates={challenge.availableGates.filter(g => unlockedGates.has(g))}
            inputLabels={challenge.inputLabels}
            outputLabels={challenge.outputLabels}
            onCircuitChange={handleCircuitChange}
            initialNodes={circuitCache.current.get(challenge.id)?.nodes}
            initialEdges={circuitCache.current.get(challenge.id)?.edges}
            onStateChange={handleStateChange}
            compositeGates={compositeRegistry}
            busInputBits={challenge.busInputBits}
            busOutputBits={challenge.busOutputBits}
            tickSignal={tickSignal}
          />
        </div>

        {/* Gates palette — horizontal strip */}
        <Palette
          availableGates={challenge.availableGates.filter(g => unlockedGates.has(g))}
          compositeLabels={new Map([...compositeRegistry.entries()].map(([k, v]) => [k, v.label]))}
        />

        {/* Truth table / Sequential test — horizontal strip */}
        <div style={{ background: '#111827', borderTop: '1px solid #1f2937', padding: '12px 16px', flexShrink: 0, overflowX: 'auto', overflowY: 'auto', maxHeight: '160px' }}>
          {seqResults !== null ? (
            <SeqTestPanel
              steps={seqResults}
              inputLabels={challenge.inputLabels}
              outputLabels={challenge.outputLabels}
              success={success}
              busInputBits={challenge.busInputBits ?? []}
              busOutputBits={challenge.busOutputBits ?? []}
            />
          ) : (
            <TruthTablePanel
              targetTable={challenge.targetTable}
              userTable={userTable}
              inputLabels={challenge.inputLabels}
              outputLabels={challenge.outputLabels}
              success={success}
              sampledResults={sampledResults}
              isBusChallenge={!!challenge.referenceImpl}
            />
          )}
        </div>

      </div>
    </div>
  )
}
