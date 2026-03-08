import type { Circuit, CompositeGateDef, FlattenResult, SimulationError, TruthTable, TruthTableRow } from './types.js';
import { evaluateGate } from './gates.js';

export function evaluateCircuit(
  circuit: Circuit,
  inputValues: boolean[],
  dffStates?: Map<string, boolean>,
): { outputs: boolean[]; newDffStates: Map<string, boolean> } | SimulationError {
  const { gates, connections } = circuit;

  // Sort INPUT and OUTPUT gates by id for stable ordering
  const inputGates = [...gates.filter(g => g.type === 'INPUT')].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const outputGates = [...gates.filter(g => g.type === 'OUTPUT')].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const dffGates = gates.filter(g => g.type === 'DFF');

  // Check all OUTPUT gates have an incoming connection
  for (const og of outputGates) {
    if (!connections.some(c => c.to.gateId === og.id)) {
      return { type: 'disconnected_output' };
    }
  }

  // Build adjacency: gateId -> set of gateIds that depend on it
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>(); // gateId -> gates that consume its output

  for (const g of gates) {
    inDegree.set(g.id, 0);
    dependents.set(g.id, []);
  }

  for (const conn of connections) {
    // DFF inputs don't contribute to inDegree of the DFF (DFF treated like INPUT in topo sort)
    if (gates.find(g => g.id === conn.to.gateId)?.type === 'DFF') continue;
    inDegree.set(conn.to.gateId, (inDegree.get(conn.to.gateId) ?? 0) + 1);
    dependents.get(conn.from.gateId)!.push(conn.to.gateId);
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const dep of dependents.get(id) ?? []) {
      const newDeg = (inDegree.get(dep) ?? 0) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) queue.push(dep);
    }
  }

  if (order.length !== gates.length) {
    return { type: 'cycle' };
  }

  // Assign input values to INPUT gates
  const gateValues = new Map<string, boolean>();
  inputGates.forEach((g, i) => {
    gateValues.set(g.id, inputValues[i] ?? false);
  });

  // Pre-set DFF outputs from stored states (treated like INPUT during evaluation)
  for (const dff of dffGates) {
    gateValues.set(dff.id, dffStates?.get(dff.id) ?? false);
  }

  // Build a lookup: for each gate, the connections coming into it sorted by port index
  const incomingByGate = new Map<string, { index: number; fromGateId: string }[]>();
  for (const conn of connections) {
    if (!incomingByGate.has(conn.to.gateId)) incomingByGate.set(conn.to.gateId, []);
    incomingByGate.get(conn.to.gateId)!.push({ index: conn.to.index, fromGateId: conn.from.gateId });
  }

  // Evaluate in topological order
  for (const id of order) {
    const gate = gates.find(g => g.id === id)!;
    if (gate.type === 'INPUT' || gate.type === 'DFF') continue; // already set

    const incoming = (incomingByGate.get(id) ?? []).sort((a, b) => a.index - b.index);
    const inputs = incoming.map(c => gateValues.get(c.fromGateId) ?? false);
    gateValues.set(id, evaluateGate(gate.type, inputs));
  }

  // Compute newDffStates: for each DFF, find the connection feeding its D input (index 0)
  const newDffStates = new Map<string, boolean>();
  for (const dff of dffGates) {
    const incoming = connections.find(c => c.to.gateId === dff.id && c.to.index === 0);
    if (incoming) {
      newDffStates.set(dff.id, gateValues.get(incoming.from.gateId) ?? false);
    } else {
      newDffStates.set(dff.id, dffStates?.get(dff.id) ?? false);
    }
  }

  const outputs = outputGates.map(g => gateValues.get(g.id) ?? false);
  return { outputs, newDffStates };
}

export function flattenCircuit(
  circuit: Circuit,
  composites: Map<string, CompositeGateDef>,
): FlattenResult {
  let gates = [...circuit.gates];
  let connections = [...circuit.connections];
  const outputSources = new Map<string, string[]>();

  let changed = true;
  while (changed) {
    changed = false;
    const compositeGate = gates.find(g => composites.has(g.type));
    if (!compositeGate) break;
    changed = true;

    const def = composites.get(compositeGate.type)!;
    const inner = def.circuit;

    const innerInputs = inner.gates
      .filter(g => g.type === 'INPUT')
      .sort((a, b) => a.id.localeCompare(b.id));
    const innerOutputs = inner.gates
      .filter(g => g.type === 'OUTPUT')
      .sort((a, b) => a.id.localeCompare(b.id));

    // Build namespaced inner gates (non-INPUT, non-OUTPUT)
    const newInnerGates = inner.gates
      .filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT')
      .map(g => ({ id: `${compositeGate.id}::${g.id}`, type: g.type }));

    // For each inner input gate, find the outer connection's source that feeds compositeGate at that input index
    // connections feeding into compositeGate: to.gateId === compositeGate.id
    const outerInputConns = connections.filter(c => c.to.gateId === compositeGate.id);
    // Map: input index → outer source port
    const inputIndexToSource = new Map<number, { gateId: string; index: number }>();
    for (const conn of outerInputConns) {
      inputIndexToSource.set(conn.to.index, { gateId: conn.from.gateId, index: conn.from.index });
    }

    // Outer connections FROM compositeGate (target connections)
    const outerOutputConns = connections.filter(c => c.from.gateId === compositeGate.id);
    // Map: output index → list of outer target ports
    const outputIndexToTargets = new Map<number, { gateId: string; index: number }[]>();
    for (const conn of outerOutputConns) {
      const idx = conn.from.index;
      if (!outputIndexToTargets.has(idx)) outputIndexToTargets.set(idx, []);
      outputIndexToTargets.get(idx)!.push({ gateId: conn.to.gateId, index: conn.to.index });
    }

    // Build inner input gate id → position index
    const innerInputIdToIndex = new Map<string, number>();
    innerInputs.forEach((g, i) => innerInputIdToIndex.set(g.id, i));

    // Build inner output gate id → position index
    const innerOutputIdToIndex = new Map<string, number>();
    innerOutputs.forEach((g, i) => innerOutputIdToIndex.set(g.id, i));

    // outputSources for this composite gate
    const thisOutputSources: string[] = new Array(innerOutputs.length).fill('');

    let connIdCounter = 0;
    const makeConnId = () => `${compositeGate.id}-flat-${connIdCounter++}`;

    const newConnections = [];
    for (const ic of inner.connections) {
      const fromIsInput = innerInputIdToIndex.has(ic.from.gateId);
      const toIsOutput = innerOutputIdToIndex.has(ic.to.gateId);

      if (fromIsInput && toIsOutput) {
        // Pass-through: inner INPUT → inner OUTPUT (unlikely but handle it)
        const inputIdx = innerInputIdToIndex.get(ic.from.gateId)!;
        const outputIdx = innerOutputIdToIndex.get(ic.to.gateId)!;
        const outerSrc = inputIndexToSource.get(inputIdx);
        if (outerSrc) {
          thisOutputSources[outputIdx] = outerSrc.gateId;
          for (const target of outputIndexToTargets.get(outputIdx) ?? []) {
            newConnections.push({
              from: { id: makeConnId(), gateId: outerSrc.gateId, index: outerSrc.index },
              to: { id: makeConnId(), gateId: target.gateId, index: target.index },
            });
          }
        }
      } else if (fromIsInput) {
        // Replace from-side with outer source
        const inputIdx = innerInputIdToIndex.get(ic.from.gateId)!;
        const outerSrc = inputIndexToSource.get(inputIdx);
        if (outerSrc) {
          newConnections.push({
            from: { id: makeConnId(), gateId: outerSrc.gateId, index: outerSrc.index },
            to: { id: makeConnId(), gateId: `${compositeGate.id}::${ic.to.gateId}`, index: ic.to.index },
          });
        }
      } else if (toIsOutput) {
        // Replace to-side with outer targets; record output source
        const outputIdx = innerOutputIdToIndex.get(ic.to.gateId)!;
        const flatFromId = `${compositeGate.id}::${ic.from.gateId}`;
        thisOutputSources[outputIdx] = flatFromId;
        for (const target of outputIndexToTargets.get(outputIdx) ?? []) {
          newConnections.push({
            from: { id: makeConnId(), gateId: flatFromId, index: ic.from.index },
            to: { id: makeConnId(), gateId: target.gateId, index: target.index },
          });
        }
      } else {
        // Internal connection: namespace both sides
        newConnections.push({
          from: { id: makeConnId(), gateId: `${compositeGate.id}::${ic.from.gateId}`, index: ic.from.index },
          to: { id: makeConnId(), gateId: `${compositeGate.id}::${ic.to.gateId}`, index: ic.to.index },
        });
      }
    }

    outputSources.set(compositeGate.id, thisOutputSources);

    // Remove compositeGate and its connections, add inner gates and new connections
    gates = gates.filter(g => g.id !== compositeGate.id).concat(newInnerGates);
    connections = connections
      .filter(c => c.from.gateId !== compositeGate.id && c.to.gateId !== compositeGate.id)
      .concat(newConnections);
  }

  return { circuit: { gates, connections }, outputSources };
}

export function evaluateAllGateValues(
  circuit: Circuit,
  inputValues: boolean[],
  dffStates?: Map<string, boolean>,
): Map<string, boolean> | SimulationError {
  const { gates, connections } = circuit;

  const inputGates = [...gates.filter(g => g.type === 'INPUT')].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const dffGates = gates.filter(g => g.type === 'DFF');

  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const g of gates) {
    inDegree.set(g.id, 0);
    dependents.set(g.id, []);
  }
  for (const conn of connections) {
    // DFF inputs don't contribute to inDegree of the DFF (treated like INPUT in topo sort)
    if (gates.find(g => g.id === conn.to.gateId)?.type === 'DFF') continue;
    inDegree.set(conn.to.gateId, (inDegree.get(conn.to.gateId) ?? 0) + 1);
    dependents.get(conn.from.gateId)!.push(conn.to.gateId);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const dep of dependents.get(id) ?? []) {
      const newDeg = (inDegree.get(dep) ?? 0) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) queue.push(dep);
    }
  }

  if (order.length !== gates.length) return { type: 'cycle' };

  const gateValues = new Map<string, boolean>();
  inputGates.forEach((g, i) => gateValues.set(g.id, inputValues[i] ?? false));

  // Pre-set DFF outputs from stored states
  for (const dff of dffGates) {
    gateValues.set(dff.id, dffStates?.get(dff.id) ?? false);
  }

  const incomingByGate = new Map<string, { index: number; fromGateId: string }[]>();
  for (const conn of connections) {
    if (!incomingByGate.has(conn.to.gateId)) incomingByGate.set(conn.to.gateId, []);
    incomingByGate.get(conn.to.gateId)!.push({ index: conn.to.index, fromGateId: conn.from.gateId });
  }

  for (const id of order) {
    const gate = gates.find(g => g.id === id)!;
    if (gate.type === 'INPUT' || gate.type === 'DFF') continue;
    const incoming = (incomingByGate.get(id) ?? []).sort((a, b) => a.index - b.index);
    const inputs = incoming.map(c => gateValues.get(c.fromGateId) ?? false);
    gateValues.set(id, evaluateGate(gate.type as Parameters<typeof evaluateGate>[0], inputs));
  }

  return gateValues;
}

export function generateTruthTable(
  circuit: Circuit,
  composites?: Map<string, CompositeGateDef>,
): TruthTable | SimulationError {
  const flatCircuit = composites && composites.size > 0
    ? flattenCircuit(circuit, composites).circuit
    : circuit;

  const inputGates = flatCircuit.gates
    .filter(g => g.type === 'INPUT')
    .sort((a, b) => a.id.localeCompare(b.id));

  const n = inputGates.length;
  const rows: TruthTableRow[] = [];

  for (let i = 0; i < 2 ** n; i++) {
    const inputs: boolean[] = Array.from({ length: n }, (_, bit) =>
      Boolean((i >> (n - 1 - bit)) & 1),
    );
    const result = evaluateCircuit(flatCircuit, inputs);
    if ('type' in result) return result; // SimulationError
    rows.push({ inputs, outputs: result.outputs });
  }

  return rows;
}
