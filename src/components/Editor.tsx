import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Background,
  Controls,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Circuit, GateType, CompositeGateDef, FlattenResult } from '../engine/index.js';
import { GATE_INPUT_COUNT, flattenCircuit, evaluateAllGateValues, BUILTIN_GATE_DEFS, BUILTIN_GATE_LABELS } from '../engine/index.js';
import type { PortDef } from '../engine/index.js';
import { GateNode } from './GateNode.js';
import { InputNode } from './InputNode.js';
import { OutputNode } from './OutputNode.js';
import { CompositeGateNode } from './CompositeGateNode.js';
import { BusInputNode } from './BusInputNode.js';
import { BusOutputNode } from './BusOutputNode.js';

const nodeTypes = {
  gate: GateNode,
  input: InputNode,
  output: OutputNode,
  composite: CompositeGateNode,
  busInput: BusInputNode,
  busOutput: BusOutputNode,
};

interface EditorProps {
  availableGates: (GateType | string)[];
  inputLabels: string[];
  outputLabels: string[];
  onCircuitChange: (circuit: Circuit, inputValues: boolean[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onStateChange?: (nodes: Node[], edges: Edge[]) => void;
  compositeGates?: Map<string, { label: string; inputCount: number; outputCount: number; circuit: Circuit; portGroups?: { inputs: PortDef[]; outputs: PortDef[] }; inputLabels?: string[]; outputLabels?: string[] }>;
  busInputBits?: number[];
  busOutputBits?: number[];
  tickSignal?: number;
}

function getPortDef(
  side: 'source' | 'target',
  edge: Edge,
  node: Node,
  compositeMap: Map<string, CompositeGateDef>,
): PortDef | null {
  if (node.type === 'busInput') {
    return { handleId: 'bus-out-0', label: '', bits: (node.data['bits'] as number) ?? 16, startIndex: 0 };
  }
  if (node.type === 'busOutput') {
    return { handleId: 'bus-in-0', label: '', bits: (node.data['bits'] as number) ?? 16, startIndex: 0 };
  }
  if (node.type === 'composite') {
    const compositeId = node.data['compositeId'] as string;
    const storedPortGroups = node.data['portGroups'] as { inputs: PortDef[]; outputs: PortDef[] } | undefined;
    const portGroups = storedPortGroups ?? compositeMap.get(compositeId)?.portGroups;
    if (!portGroups) return null;
    const handleId = side === 'source' ? (edge.sourceHandle ?? '') : (edge.targetHandle ?? '');
    const portList = side === 'source' ? portGroups.outputs : portGroups.inputs;
    return portList.find(p => p.handleId === handleId) ?? null;
  }
  return null;
}

export function buildCircuit(
  nodes: Node[],
  edges: Edge[],
  compositeMap?: Map<string, CompositeGateDef>,
): Circuit {
  const cmap = compositeMap ?? new Map<string, CompositeGateDef>();
  const gates: Array<{ id: string; type: GateType }> = [];

  for (const n of nodes) {
    if (n.type === 'busInput') {
      const bits = (n.data['bits'] as number) ?? 16;
      for (let i = 0; i < bits; i++) {
        const ii = String(i).padStart(2, '0');
        gates.push({ id: `${n.id}-bit-${ii}`, type: 'INPUT' as GateType });
      }
    } else if (n.type === 'busOutput') {
      const bits = (n.data['bits'] as number) ?? 16;
      for (let i = 0; i < bits; i++) {
        const ii = String(i).padStart(2, '0');
        gates.push({ id: `${n.id}-bit-${ii}`, type: 'OUTPUT' as GateType });
      }
    } else {
      gates.push({
        id: n.id,
        type: (n.type === 'input'
          ? 'INPUT'
          : n.type === 'output'
          ? 'OUTPUT'
          : n.type === 'composite'
          ? (n.data['compositeId'] as string)
          : (n.data['type'] as string)) as GateType,
      });
    }
  }

  const connections: Array<{ from: { id: string; gateId: string; index: number }; to: { id: string; gateId: string; index: number } }> = [];

  for (const e of edges) {
    const srcNode = nodes.find(n => n.id === e.source);
    const tgtNode = nodes.find(n => n.id === e.target);
    if (!srcNode || !tgtNode) continue;

    const srcPortDef = getPortDef('source', e, srcNode, cmap);
    const tgtPortDef = getPortDef('target', e, tgtNode, cmap);
    const bits = srcPortDef ? srcPortDef.bits : (tgtPortDef ? tgtPortDef.bits : 1);

    if (bits > 1) {
      for (let i = 0; i < bits; i++) {
        const ii = String(i).padStart(2, '0');
        const fromGateId = srcNode.type === 'busInput' ? `${e.source}-bit-${ii}` : e.source;
        const toGateId = tgtNode.type === 'busOutput' ? `${e.target}-bit-${ii}` : e.target;
        const fromIndex = srcNode.type === 'busInput' ? 0 : (srcPortDef?.startIndex ?? 0) + i;
        const toIndex = tgtNode.type === 'busOutput' ? 0 : (tgtPortDef?.startIndex ?? 0) + i;
        connections.push({
          from: { id: `${e.id}-b${i}`, gateId: fromGateId, index: fromIndex },
          to: { id: `${e.id}-b${i}`, gateId: toGateId, index: toIndex },
        });
      }
    } else {
      const fromIndex = srcPortDef && srcPortDef.bits === 1
        ? srcPortDef.startIndex
        : parseInt(e.sourceHandle?.split('-')[1] ?? '0', 10);
      const toIndex = tgtPortDef && tgtPortDef.bits === 1
        ? tgtPortDef.startIndex
        : parseInt(e.targetHandle?.split('-')[1] ?? '0', 10);
      connections.push({
        from: { id: e.id, gateId: e.source, index: fromIndex },
        to: { id: e.id, gateId: e.target, index: toIndex },
      });
    }
  }

  return { gates, connections };
}

function makeInputNodes(inputLabels: string[], onToggle: (id: string) => void): Node[] {
  return inputLabels.map((label, i) => ({
    id: `input-${i}`,
    type: 'input',
    position: { x: 60, y: 80 + i * 120 },
    data: { label, value: false, onToggle: () => onToggle(`input-${i}`) },
  }));
}

function makeOutputNodes(outputLabels: string[]): Node[] {
  return outputLabels.map((label, i) => ({
    id: `output-${i}`,
    type: 'output',
    position: { x: 700, y: 80 + i * 120 },
    data: { label, value: false },
  }));
}

function makeBusInputNodes(
  inputLabels: string[],
  busInputBits: number[],
  onToggle: (id: string) => void,
  onValueChange: (id: string, value: number) => void,
): Node[] {
  return inputLabels.map((label, i) => {
    const bits = busInputBits[i] ?? 16;
    if (bits === 1) {
      return {
        id: `input-${i}`,
        type: 'input',
        position: { x: 60, y: 80 + i * 100 },
        data: { label, value: false, onToggle: () => onToggle(`input-${i}`) },
      };
    }
    return {
      id: `input-${i}`,
      type: 'busInput',
      position: { x: 60, y: 80 + i * 130 },
      data: { label, bits, value: 0, onValueChange },
    };
  });
}

function makeBusOutputNodes(outputLabels: string[], busOutputBits: number[]): Node[] {
  return outputLabels.map((label, i) => {
    const bits = busOutputBits[i] ?? 16;
    if (bits === 1) {
      return {
        id: `output-${i}`,
        type: 'output',
        position: { x: 700, y: 80 + i * 100 },
        data: { label, value: false },
      };
    }
    return {
      id: `output-${i}`,
      type: 'busOutput',
      position: { x: 700, y: 80 + i * 130 },
      data: { label, bits, value: 0 },
    };
  });
}

function runVisualEval(
  nodes: Node[],
  edges: Edge[],
  inputValues: Map<string, boolean>,
  busInputValues: Map<string, number>,
  composites: Map<string, CompositeGateDef>,
  dffStates: Map<string, boolean>,
): { gateValues: Map<string, boolean>; flatResult: FlattenResult } {
  const circuit = buildCircuit(nodes, edges, composites);
  const flatResult = flattenCircuit(circuit, composites);

  const allInputGates = flatResult.circuit.gates
    .filter(g => g.type === 'INPUT')
    .sort((a, b) => a.id.localeCompare(b.id));

  const inputVals = allInputGates.map(g => {
    const m = g.id.match(/^(.+)-bit-(\d+)$/);
    if (m) {
      const busNodeId = m[1]!;
      const bitIndex = parseInt(m[2]!, 10);
      const intVal = busInputValues.get(busNodeId) ?? 0;
      return Boolean((intVal >> bitIndex) & 1);
    }
    return inputValues.get(g.id) ?? false;
  });

  const evalResult = evaluateAllGateValues(flatResult.circuit, inputVals, dffStates);
  const gateValues = evalResult instanceof Map ? evalResult : new Map<string, boolean>();
  return { gateValues, flatResult };
}

// Inner component that uses useReactFlow hooks
function EditorInner({
  inputLabels,
  outputLabels,
  onCircuitChange,
  initialNodes,
  initialEdges,
  onStateChange,
  compositeGates,
  busInputBits,
  busOutputBits,
  tickSignal,
}: Omit<EditorProps, 'availableGates'>) {
  const { screenToFlowPosition } = useReactFlow();

  const compositesMap = useMemo<Map<string, CompositeGateDef>>(() => {
    const map = new Map<string, CompositeGateDef>();
    for (const [k, v] of BUILTIN_GATE_DEFS) map.set(k, v);
    if (compositeGates) {
      for (const [k, v] of compositeGates.entries()) {
        map.set(k, { circuit: v.circuit, inputCount: v.inputCount, outputCount: v.outputCount, portGroups: v.portGroups });
      }
    }
    return map;
  }, [compositeGates]);

  const compositesMapRef = useRef(compositesMap);
  compositesMapRef.current = compositesMap;

  // Start counter above any restored gate IDs to avoid collisions
  const nodeIdCounter = useRef(
    initialNodes
      ? Math.max(0, ...initialNodes.filter(n => n.type === 'gate').map(n => parseInt(n.id.split('-')[1] ?? '0', 10)))
      : 0
  );

  // Track input values separately so we can update them
  const inputValuesRef = useRef<Map<string, boolean>>(
    new Map(
      initialNodes
        ? initialNodes.filter(n => n.type === 'input').map(n => [n.id, (n.data['value'] as boolean) ?? false])
        : inputLabels.map((_, i) => [`input-${i}`, false])
    )
  );

  const busInputValuesRef = useRef<Map<string, number>>(
    new Map(
      initialNodes
        ? initialNodes.filter(n => n.type === 'busInput').map(n => [n.id, (n.data['value'] as number) ?? 0])
        : []
    )
  );

  const dffStatesRef = useRef<Map<string, boolean>>(new Map());

  const triggerEvalRef = useRef<((nodes: Node[], edges?: Edge[]) => void) | null>(null);

  const handleToggle = useCallback((id: string) => {
    const newVal = !inputValuesRef.current.get(id);
    inputValuesRef.current.set(id, newVal);
    const updated = nodesRef.current.map(n =>
      n.id === id ? { ...n, data: { ...n.data, value: newVal } } : n
    );
    setNodes(updated);
    triggerEvalRef.current?.(updated);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBusValueChange = useCallback((id: string, value: number) => {
    busInputValuesRef.current.set(id, value);
    const updated = nodesRef.current.map(n =>
      n.id === id ? { ...n, data: { ...n.data, value } } : n
    );
    setNodes(updated);
    triggerEvalRef.current?.(updated);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    const srcNode = nodesRef.current.find(n => n.id === connection.source);
    const tgtNode = nodesRef.current.find(n => n.id === connection.target);
    if (!srcNode || !tgtNode) return true;
    const srcIsBus = srcNode.type === 'busInput' || ((connection.sourceHandle ?? '').startsWith('bus-'));
    const tgtIsBus = tgtNode.type === 'busOutput' || ((connection.targetHandle ?? '').startsWith('bus-'));
    return srcIsBus === tgtIsBus;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore initial nodes, re-binding callbacks for input nodes to this instance's handlers
  const getInitialNodes = (): Node[] => {
    if (initialNodes) {
      return initialNodes.map(n => {
        if (n.type === 'input') return { ...n, data: { ...n.data, onToggle: () => handleToggle(n.id) } };
        if (n.type === 'busInput') return { ...n, data: { ...n.data, onValueChange: handleBusValueChange } };
        return n;
      });
    }
    if (busInputBits && busInputBits.length > 0) {
      return [
        ...makeBusInputNodes(inputLabels, busInputBits, handleToggle, handleBusValueChange),
        ...makeBusOutputNodes(outputLabels, busOutputBits ?? []),
      ];
    }
    return [...makeInputNodes(inputLabels, handleToggle), ...makeOutputNodes(outputLabels)];
  };

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges ?? []);

  // We need a stable ref to latest nodes/edges to avoid stale closures
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const triggerEval = useCallback((currentNodes: Node[], currentEdges?: Edge[]) => {
    const edgesToUse = currentEdges ?? edgesRef.current;
    const inputVals = inputValuesRef.current;

    const { gateValues, flatResult } = runVisualEval(currentNodes, edgesToUse, inputVals, busInputValuesRef.current, compositesMapRef.current, dffStatesRef.current);

    // Update node data.value and data.active
    setNodes(nds =>
      nds.map(n => {
        if (n.type === 'busInput') {
          return { ...n, data: { ...n.data, value: busInputValuesRef.current.get(n.id) ?? 0 } };
        }
        if (n.type === 'busOutput') {
          const bits = (n.data['bits'] as number) ?? 16;
          let intVal = 0;
          for (let i = 0; i < bits; i++) {
            const ii = String(i).padStart(2, '0');
            if (gateValues.get(`${n.id}-bit-${ii}`)) intVal |= (1 << i);
          }
          return { ...n, data: { ...n.data, value: intVal } };
        }
        if (n.type === 'input') {
          return { ...n, data: { ...n.data, value: inputVals.get(n.id) ?? false } };
        }
        if (n.type === 'composite') {
          // composite is "active" if any of its outputs are active
          const sources = flatResult.outputSources.get(n.id) ?? [];
          const active = sources.some(src => gateValues.get(src) ?? false);
          return { ...n, data: { ...n.data, value: active, active } };
        }
        const val = gateValues.get(n.id) ?? false;
        return { ...n, data: { ...n.data, value: val, active: val } };
      })
    );

    // Update edge styles based on source gate output
    setEdges(eds =>
      eds.map(e => {
        const srcNode = currentNodes.find(n => n.id === e.source);
        const isBusEdge = srcNode?.type === 'busInput' || (e.sourceHandle?.startsWith('bus-') ?? false);
        if (isBusEdge) {
          return { ...e, style: { stroke: '#818cf8', strokeWidth: 3 } };
        }

        let active: boolean;
        if (srcNode?.type === 'composite') {
          const outputIndex = parseInt(e.sourceHandle?.split('-')[1] ?? '0', 10);
          const flatGateId = flatResult.outputSources.get(e.source)?.[outputIndex];
          active = flatGateId ? (gateValues.get(flatGateId) ?? false) : false;
        } else {
          active = gateValues.get(e.source) ?? false;
        }
        return {
          ...e,
          style: {
            stroke: active ? '#60a5fa' : '#374151',
            strokeWidth: active ? 2 : 1.5,
          },
        };
      })
    );

  }, [inputLabels, compositeGates]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep ref current so handleToggle (stable closure) always calls latest triggerEval
  useEffect(() => { triggerEvalRef.current = triggerEval; }, [triggerEval]);

  // Advance DFF states on clock tick
  useEffect(() => {
    if (!tickSignal) return;
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const circuit = buildCircuit(currentNodes, currentEdges, compositesMapRef.current);
    const flatResult = flattenCircuit(circuit, compositesMapRef.current);

    const allInputGates = flatResult.circuit.gates
      .filter(g => g.type === 'INPUT')
      .sort((a, b) => a.id.localeCompare(b.id));
    const inputVals = allInputGates.map(g => {
      const m = g.id.match(/^(.+)-bit-(\d+)$/);
      if (m) {
        const busNodeId = m[1]!;
        const bitIndex = parseInt(m[2]!, 10);
        const intVal = busInputValuesRef.current.get(busNodeId) ?? 0;
        return Boolean((intVal >> bitIndex) & 1);
      }
      return inputValuesRef.current.get(g.id) ?? false;
    });

    const evalResult = evaluateAllGateValues(flatResult.circuit, inputVals, dffStatesRef.current);
    if (!(evalResult instanceof Map)) return;

    // Compute new DFF states from the evaluated D inputs
    const newDffStates = new Map<string, boolean>();
    for (const gate of flatResult.circuit.gates) {
      if (gate.type === 'DFF') {
        const incoming = flatResult.circuit.connections.find(c => c.to.gateId === gate.id && c.to.index === 0);
        if (incoming) {
          newDffStates.set(gate.id, evalResult.get(incoming.from.gateId) ?? false);
        } else {
          newDffStates.set(gate.id, dffStatesRef.current.get(gate.id) ?? false);
        }
      }
    }
    dffStatesRef.current = newDffStates;

    // Re-trigger visual eval with updated DFF states
    triggerEval(currentNodes, currentEdges);
  }, [tickSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire onCircuitChange after every edge state commit (reliable, not tied to event timing)
  useEffect(() => {
    const circuit = buildCircuit(nodesRef.current, edges, compositesMapRef.current);
    const inputValuesArr = inputLabels.map((_, i) => inputValuesRef.current.get(`input-${i}`) ?? false);
    onCircuitChange(circuit, inputValuesArr);
  }, [edges]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist layout state for the parent to cache
  useEffect(() => {
    onStateChange?.(nodes, edges);
  }, [nodes, edges]); // eslint-disable-line react-hooks/exhaustive-deps


  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const filtered = edgesRef.current.filter(
      e => !(e.target === connection.target && e.targetHandle === connection.targetHandle)
    );
    const newEdges = addEdge(connection, filtered);
    setEdges(newEdges);
    triggerEval(nodesRef.current, newEdges);
  }, [triggerEval]);

  const handleReset = useCallback(() => {
    inputValuesRef.current = new Map(inputLabels.map((_, i) => [`input-${i}`, false]));
    busInputValuesRef.current = new Map();
    dffStatesRef.current = new Map();
    const fresh = busInputBits && busInputBits.length > 0
      ? [...makeBusInputNodes(inputLabels, busInputBits, handleToggle, handleBusValueChange), ...makeBusOutputNodes(outputLabels, busOutputBits ?? [])]
      : [...makeInputNodes(inputLabels, handleToggle), ...makeOutputNodes(outputLabels)];
    setNodes(fresh);
    setEdges([]);
    triggerEval(fresh, []);
  }, [inputLabels, outputLabels, busInputBits, busOutputBits, triggerEval, handleToggle, handleBusValueChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('application/gate-type');
    if (!gateType) return;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    nodeIdCounter.current += 1;
    const id = `gate-${nodeIdCounter.current}`;

    const compositeDef = compositesMapRef.current.get(gateType);
    let newNode: Node;
    if (compositeDef) {
      const compositeEntry = compositeGates?.get(gateType);
      newNode = {
        id,
        type: 'composite',
        position,
        data: {
          compositeId: gateType,
          label: compositeEntry?.label ?? BUILTIN_GATE_LABELS.get(gateType) ?? gateType,
          inputCount: compositeDef.inputCount,
          outputCount: compositeDef.outputCount,
          portGroups: compositeDef.portGroups,
          inputLabels: compositeEntry?.inputLabels,
          outputLabels: compositeEntry?.outputLabels,
        },
      };
    } else {
      if (!(gateType in GATE_INPUT_COUNT)) return;
      newNode = {
        id,
        type: 'gate',
        position,
        data: { type: gateType as GateType, active: false },
      };
    }

    const updated = [...nodesRef.current, newNode];
    setNodes(updated);
    triggerEval(updated);
  }, [screenToFlowPosition, triggerEval]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      isValidConnection={isValidConnection}
      nodeTypes={nodeTypes}
      fitView
      style={{ background: '#0f1117', width: '100%', height: '100%' }}
    >
      <Background color="#2d3148" gap={20} />
      <Controls />
      <Panel position="top-right">
        <button
          onClick={handleReset}
          style={{
            background: '#1e2030',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#9ca3af',
            fontSize: 12,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#f87171'; (e.target as HTMLButtonElement).style.borderColor = '#f87171'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#9ca3af'; (e.target as HTMLButtonElement).style.borderColor = '#374151'; }}
        >
          reset canvas
        </button>
      </Panel>
    </ReactFlow>
  );
}

export function Editor(props: EditorProps) {
  return (
    <ReactFlowProvider>
      <EditorInner {...props} />
    </ReactFlowProvider>
  );
}
