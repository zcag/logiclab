import type { Gate, Connection, CompositeGateDef, GateType } from './types.js';

// Helper to create a composite-type gate (type not in GateType enum but handled by flattenCircuit)
function cg(id: string, type: string): Gate {
  return { id, type: type as GateType };
}

function gc(id: string, fromGate: string, fromIdx: number, toGate: string, toIdx: number): Connection {
  return {
    from: { id, gateId: fromGate, index: fromIdx },
    to: { id, gateId: toGate, index: toIdx },
  };
}

function not16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `not16-in-${ii}`, type: 'INPUT' },
      { id: `not16-g-${ii}`, type: 'NOT' },
      { id: `not16-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`not16-c-in-${ii}`, `not16-in-${ii}`, 0, `not16-g-${ii}`, 0),
      gc(`not16-c-out-${ii}`, `not16-g-${ii}`, 0, `not16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 16,
    outputCount: 16,
    portGroups: {
      inputs: [{ handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 }],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function and16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `and16-in-a-${ii}`, type: 'INPUT' },
      { id: `and16-in-b-${ii}`, type: 'INPUT' },
      { id: `and16-g-${ii}`, type: 'AND' },
      { id: `and16-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`and16-ca-${ii}`, `and16-in-a-${ii}`, 0, `and16-g-${ii}`, 0),
      gc(`and16-cb-${ii}`, `and16-in-b-${ii}`, 0, `and16-g-${ii}`, 1),
      gc(`and16-co-${ii}`, `and16-g-${ii}`, 0, `and16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 32,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function or16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `or16-in-a-${ii}`, type: 'INPUT' },
      { id: `or16-in-b-${ii}`, type: 'INPUT' },
      { id: `or16-g-${ii}`, type: 'OR' },
      { id: `or16-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`or16-ca-${ii}`, `or16-in-a-${ii}`, 0, `or16-g-${ii}`, 0),
      gc(`or16-cb-${ii}`, `or16-in-b-${ii}`, 0, `or16-g-${ii}`, 1),
      gc(`or16-co-${ii}`, `or16-g-${ii}`, 0, `or16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 32,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function mux16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `mux16-in-a-${ii}`, type: 'INPUT' },
      { id: `mux16-in-b-${ii}`, type: 'INPUT' },
      { id: `mux16-not-${ii}`, type: 'NOT' },
      { id: `mux16-and-a-${ii}`, type: 'AND' },
      { id: `mux16-and-b-${ii}`, type: 'AND' },
      { id: `mux16-or-${ii}`, type: 'OR' },
      { id: `mux16-out-${ii}`, type: 'OUTPUT' },
    );
  }
  // sel sorts after a and b inputs (s > b lexicographically)
  gates.push({ id: 'mux16-in-sel', type: 'INPUT' });

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    connections.push(
      gc(`mux16-sel-not-${ii}`, 'mux16-in-sel', 0, `mux16-not-${ii}`, 0),
      gc(`mux16-a-anda-${ii}`, `mux16-in-a-${ii}`, 0, `mux16-and-a-${ii}`, 0),
      gc(`mux16-nots-anda-${ii}`, `mux16-not-${ii}`, 0, `mux16-and-a-${ii}`, 1),
      gc(`mux16-b-andb-${ii}`, `mux16-in-b-${ii}`, 0, `mux16-and-b-${ii}`, 0),
      gc(`mux16-sel-andb-${ii}`, 'mux16-in-sel', 0, `mux16-and-b-${ii}`, 1),
      gc(`mux16-anda-or-${ii}`, `mux16-and-a-${ii}`, 0, `mux16-or-${ii}`, 0),
      gc(`mux16-andb-or-${ii}`, `mux16-and-b-${ii}`, 0, `mux16-or-${ii}`, 1),
      gc(`mux16-or-out-${ii}`, `mux16-or-${ii}`, 0, `mux16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 33,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
        { handleId: 'input-0', label: 'sel', bits: 1, startIndex: 32 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function add16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `add16-in-a-${ii}`, type: 'INPUT' });
    gates.push({ id: `add16-in-b-${ii}`, type: 'INPUT' });
  }

  // bit 0: half adder (no carry in)
  gates.push({ id: 'add16-xor-00', type: 'XOR' });
  gates.push({ id: 'add16-and-00', type: 'AND' });
  connections.push(
    gc('add16-a00-xor', 'add16-in-a-00', 0, 'add16-xor-00', 0),
    gc('add16-b00-xor', 'add16-in-b-00', 0, 'add16-xor-00', 1),
    gc('add16-a00-and', 'add16-in-a-00', 0, 'add16-and-00', 0),
    gc('add16-b00-and', 'add16-in-b-00', 0, 'add16-and-00', 1),
  );

  // bits 1-15: full adder
  for (let i = 1; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    const pp = String(i - 1).padStart(2, '0');
    const carryIn = i === 1 ? 'add16-and-00' : `add16-or-${pp}`;
    gates.push(
      { id: `add16-xor1-${ii}`, type: 'XOR' },
      { id: `add16-xor2-${ii}`, type: 'XOR' },
      { id: `add16-and1-${ii}`, type: 'AND' },
      { id: `add16-and2-${ii}`, type: 'AND' },
      { id: `add16-or-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`add16-a${ii}-x1`, `add16-in-a-${ii}`, 0, `add16-xor1-${ii}`, 0),
      gc(`add16-b${ii}-x1`, `add16-in-b-${ii}`, 0, `add16-xor1-${ii}`, 1),
      gc(`add16-x1${ii}-x2`, `add16-xor1-${ii}`, 0, `add16-xor2-${ii}`, 0),
      gc(`add16-cy${ii}-x2`, carryIn, 0, `add16-xor2-${ii}`, 1),
      gc(`add16-a${ii}-a1`, `add16-in-a-${ii}`, 0, `add16-and1-${ii}`, 0),
      gc(`add16-b${ii}-a1`, `add16-in-b-${ii}`, 0, `add16-and1-${ii}`, 1),
      gc(`add16-x1${ii}-a2`, `add16-xor1-${ii}`, 0, `add16-and2-${ii}`, 0),
      gc(`add16-cy${ii}-a2`, carryIn, 0, `add16-and2-${ii}`, 1),
      gc(`add16-a1${ii}-or`, `add16-and1-${ii}`, 0, `add16-or-${ii}`, 0),
      gc(`add16-a2${ii}-or`, `add16-and2-${ii}`, 0, `add16-or-${ii}`, 1),
    );
  }

  // sum output gates
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    const sumSrc = i === 0 ? 'add16-xor-00' : `add16-xor2-${ii}`;
    gates.push({ id: `add16-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`add16-sum${ii}-out`, sumSrc, 0, `add16-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 32,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'sum', bits: 16, startIndex: 0 }],
    },
  };
}

function or8wayDef(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  for (let i = 0; i < 8; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `or8way-in-${ii}`, type: 'INPUT' });
  }
  // layer 1: 4 OR gates
  for (let i = 0; i < 4; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `or8way-or1-${ii}`, type: 'OR' });
    connections.push(
      gc(`or8way-c1a-${ii}`, `or8way-in-${String(i * 2).padStart(2, '0')}`, 0, `or8way-or1-${ii}`, 0),
      gc(`or8way-c1b-${ii}`, `or8way-in-${String(i * 2 + 1).padStart(2, '0')}`, 0, `or8way-or1-${ii}`, 1),
    );
  }
  // layer 2: 2 OR gates
  for (let i = 0; i < 2; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `or8way-or2-${ii}`, type: 'OR' });
    connections.push(
      gc(`or8way-c2a-${ii}`, `or8way-or1-${String(i * 2).padStart(2, '0')}`, 0, `or8way-or2-${ii}`, 0),
      gc(`or8way-c2b-${ii}`, `or8way-or1-${String(i * 2 + 1).padStart(2, '0')}`, 0, `or8way-or2-${ii}`, 1),
    );
  }
  // layer 3: final OR
  gates.push({ id: 'or8way-or3', type: 'OR' });
  connections.push(
    gc('or8way-c3a', 'or8way-or2-00', 0, 'or8way-or3', 0),
    gc('or8way-c3b', 'or8way-or2-01', 0, 'or8way-or3', 1),
  );
  gates.push({ id: 'or8way-out', type: 'OUTPUT' });
  connections.push(gc('or8way-cout', 'or8way-or3', 0, 'or8way-out', 0));
  return {
    circuit: { gates, connections },
    inputCount: 8,
    outputCount: 1,
    portGroups: {
      inputs: [
        { handleId: 'input-0', label: 'in[0]', bits: 1, startIndex: 0 },
        { handleId: 'input-1', label: 'in[1]', bits: 1, startIndex: 1 },
        { handleId: 'input-2', label: 'in[2]', bits: 1, startIndex: 2 },
        { handleId: 'input-3', label: 'in[3]', bits: 1, startIndex: 3 },
        { handleId: 'input-4', label: 'in[4]', bits: 1, startIndex: 4 },
        { handleId: 'input-5', label: 'in[5]', bits: 1, startIndex: 5 },
        { handleId: 'input-6', label: 'in[6]', bits: 1, startIndex: 6 },
        { handleId: 'input-7', label: 'in[7]', bits: 1, startIndex: 7 },
      ],
      outputs: [{ handleId: 'output-0', label: 'out', bits: 1, startIndex: 0 }],
    },
  };
}

function mux4way16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  // inputs for a[16], b[16], c[16], d[16] — lex sorted: a < b < c < d < sel
  for (const letter of ['a', 'b', 'c', 'd']) {
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      gates.push({ id: `mux4w16-in-${letter}-${ii}`, type: 'INPUT' });
    }
  }
  // sel bits — 'sel' > 'd' lexicographically, sorts after d inputs
  gates.push({ id: 'mux4w16-sel-0', type: 'INPUT' }); // sel[0] — index 64
  gates.push({ id: 'mux4w16-sel-1', type: 'INPUT' }); // sel[1] — index 65

  // MUX16 level 1: mux(a,b,sel[0]) → ab, mux(c,d,sel[0]) → cd
  // Each bit of the bus needs NOT(sel0) internally — we inline a MUX per bit
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    // mux ab: out = a if sel0=0, b if sel0=1
    gates.push(
      { id: `mux4w16-not0ab-${ii}`, type: 'NOT' },
      { id: `mux4w16-anda-${ii}`, type: 'AND' },
      { id: `mux4w16-andb-${ii}`, type: 'AND' },
      { id: `mux4w16-orab-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`mux4w16-s0-not0ab-${ii}`, 'mux4w16-sel-0', 0, `mux4w16-not0ab-${ii}`, 0),
      gc(`mux4w16-a-anda-${ii}`, `mux4w16-in-a-${ii}`, 0, `mux4w16-anda-${ii}`, 0),
      gc(`mux4w16-ns0-anda-${ii}`, `mux4w16-not0ab-${ii}`, 0, `mux4w16-anda-${ii}`, 1),
      gc(`mux4w16-b-andb-${ii}`, `mux4w16-in-b-${ii}`, 0, `mux4w16-andb-${ii}`, 0),
      gc(`mux4w16-s0-andb-${ii}`, 'mux4w16-sel-0', 0, `mux4w16-andb-${ii}`, 1),
      gc(`mux4w16-anda-orab-${ii}`, `mux4w16-anda-${ii}`, 0, `mux4w16-orab-${ii}`, 0),
      gc(`mux4w16-andb-orab-${ii}`, `mux4w16-andb-${ii}`, 0, `mux4w16-orab-${ii}`, 1),
    );
    // mux cd: out = c if sel0=0, d if sel0=1
    gates.push(
      { id: `mux4w16-not0cd-${ii}`, type: 'NOT' },
      { id: `mux4w16-andc-${ii}`, type: 'AND' },
      { id: `mux4w16-andd-${ii}`, type: 'AND' },
      { id: `mux4w16-orcd-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`mux4w16-s0-not0cd-${ii}`, 'mux4w16-sel-0', 0, `mux4w16-not0cd-${ii}`, 0),
      gc(`mux4w16-c-andc-${ii}`, `mux4w16-in-c-${ii}`, 0, `mux4w16-andc-${ii}`, 0),
      gc(`mux4w16-ns0-andc-${ii}`, `mux4w16-not0cd-${ii}`, 0, `mux4w16-andc-${ii}`, 1),
      gc(`mux4w16-d-andd-${ii}`, `mux4w16-in-d-${ii}`, 0, `mux4w16-andd-${ii}`, 0),
      gc(`mux4w16-s0-andd-${ii}`, 'mux4w16-sel-0', 0, `mux4w16-andd-${ii}`, 1),
      gc(`mux4w16-andc-orcd-${ii}`, `mux4w16-andc-${ii}`, 0, `mux4w16-orcd-${ii}`, 0),
      gc(`mux4w16-andd-orcd-${ii}`, `mux4w16-andd-${ii}`, 0, `mux4w16-orcd-${ii}`, 1),
    );
    // MUX level 2: mux(ab, cd, sel[1]) → out
    gates.push(
      { id: `mux4w16-not1-${ii}`, type: 'NOT' },
      { id: `mux4w16-andab-${ii}`, type: 'AND' },
      { id: `mux4w16-andcd-${ii}`, type: 'AND' },
      { id: `mux4w16-orout-${ii}`, type: 'OR' },
      { id: `mux4w16-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`mux4w16-s1-not1-${ii}`, 'mux4w16-sel-1', 0, `mux4w16-not1-${ii}`, 0),
      gc(`mux4w16-orab-andab-${ii}`, `mux4w16-orab-${ii}`, 0, `mux4w16-andab-${ii}`, 0),
      gc(`mux4w16-ns1-andab-${ii}`, `mux4w16-not1-${ii}`, 0, `mux4w16-andab-${ii}`, 1),
      gc(`mux4w16-orcd-andcd-${ii}`, `mux4w16-orcd-${ii}`, 0, `mux4w16-andcd-${ii}`, 0),
      gc(`mux4w16-s1-andcd-${ii}`, 'mux4w16-sel-1', 0, `mux4w16-andcd-${ii}`, 1),
      gc(`mux4w16-andab-orout-${ii}`, `mux4w16-andab-${ii}`, 0, `mux4w16-orout-${ii}`, 0),
      gc(`mux4w16-andcd-orout-${ii}`, `mux4w16-andcd-${ii}`, 0, `mux4w16-orout-${ii}`, 1),
      gc(`mux4w16-orout-out-${ii}`, `mux4w16-orout-${ii}`, 0, `mux4w16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 66,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
        { handleId: 'bus-in-2', label: 'c', bits: 16, startIndex: 32 },
        { handleId: 'bus-in-3', label: 'd', bits: 16, startIndex: 48 },
        { handleId: 'input-0', label: 'sel[0]', bits: 1, startIndex: 64 },
        { handleId: 'input-1', label: 'sel[1]', bits: 1, startIndex: 65 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function mux8way16Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  // inputs for a[16]..h[16] — letters sort a<b<c<d<e<f<g<h < 's' (sel)
  for (const letter of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      gates.push({ id: `mux8w16-in-${letter}-${ii}`, type: 'INPUT' });
    }
  }
  // sel[0], sel[1], sel[2] — sorts after 'h' inputs
  gates.push({ id: 'mux8w16-sel-0', type: 'INPUT' }); // index 128
  gates.push({ id: 'mux8w16-sel-1', type: 'INPUT' }); // index 129
  gates.push({ id: 'mux8w16-sel-2', type: 'INPUT' }); // index 130

  // Helper: inline a 1-bit MUX
  // level 1: mux(a,b,sel0)→ab, mux(c,d,sel0)→cd, mux(e,f,sel0)→ef, mux(g,h,sel0)→gh
  // level 2: mux(ab,cd,sel1)→abcd, mux(ef,gh,sel1)→efgh
  // level 3: mux(abcd,efgh,sel2)→out
  const pairs: Array<[string, string, string]> = [
    ['a', 'b', 'ab'],
    ['c', 'd', 'cd'],
    ['e', 'f', 'ef'],
    ['g', 'h', 'gh'],
  ];
  for (const [la, lb, lout] of pairs) {
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      gates.push(
        { id: `mux8w16-not0${lout}-${ii}`, type: 'NOT' },
        { id: `mux8w16-and${la}-${ii}`, type: 'AND' },
        { id: `mux8w16-and${lb}-${ii}`, type: 'AND' },
        { id: `mux8w16-or${lout}-${ii}`, type: 'OR' },
      );
      connections.push(
        gc(`mux8w16-s0-not0${lout}-${ii}`, 'mux8w16-sel-0', 0, `mux8w16-not0${lout}-${ii}`, 0),
        gc(`mux8w16-${la}-and${la}-${ii}`, `mux8w16-in-${la}-${ii}`, 0, `mux8w16-and${la}-${ii}`, 0),
        gc(`mux8w16-ns0-and${la}-${ii}`, `mux8w16-not0${lout}-${ii}`, 0, `mux8w16-and${la}-${ii}`, 1),
        gc(`mux8w16-${lb}-and${lb}-${ii}`, `mux8w16-in-${lb}-${ii}`, 0, `mux8w16-and${lb}-${ii}`, 0),
        gc(`mux8w16-s0-and${lb}-${ii}`, 'mux8w16-sel-0', 0, `mux8w16-and${lb}-${ii}`, 1),
        gc(`mux8w16-and${la}-or${lout}-${ii}`, `mux8w16-and${la}-${ii}`, 0, `mux8w16-or${lout}-${ii}`, 0),
        gc(`mux8w16-and${lb}-or${lout}-${ii}`, `mux8w16-and${lb}-${ii}`, 0, `mux8w16-or${lout}-${ii}`, 1),
      );
    }
  }
  // level 2
  const pairs2: Array<[string, string, string]> = [
    ['ab', 'cd', 'abcd'],
    ['ef', 'gh', 'efgh'],
  ];
  for (const [la, lb, lout] of pairs2) {
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      gates.push(
        { id: `mux8w16-not1${lout}-${ii}`, type: 'NOT' },
        { id: `mux8w16-and1${la}-${ii}`, type: 'AND' },
        { id: `mux8w16-and1${lb}-${ii}`, type: 'AND' },
        { id: `mux8w16-or1${lout}-${ii}`, type: 'OR' },
      );
      connections.push(
        gc(`mux8w16-s1-not1${lout}-${ii}`, 'mux8w16-sel-1', 0, `mux8w16-not1${lout}-${ii}`, 0),
        gc(`mux8w16-or${la}-and1${la}-${ii}`, `mux8w16-or${la}-${ii}`, 0, `mux8w16-and1${la}-${ii}`, 0),
        gc(`mux8w16-ns1-and1${la}-${ii}`, `mux8w16-not1${lout}-${ii}`, 0, `mux8w16-and1${la}-${ii}`, 1),
        gc(`mux8w16-or${lb}-and1${lb}-${ii}`, `mux8w16-or${lb}-${ii}`, 0, `mux8w16-and1${lb}-${ii}`, 0),
        gc(`mux8w16-s1-and1${lb}-${ii}`, 'mux8w16-sel-1', 0, `mux8w16-and1${lb}-${ii}`, 1),
        gc(`mux8w16-and1${la}-or1${lout}-${ii}`, `mux8w16-and1${la}-${ii}`, 0, `mux8w16-or1${lout}-${ii}`, 0),
        gc(`mux8w16-and1${lb}-or1${lout}-${ii}`, `mux8w16-and1${lb}-${ii}`, 0, `mux8w16-or1${lout}-${ii}`, 1),
      );
    }
  }
  // level 3: mux(abcd, efgh, sel2) → out
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `mux8w16-not2-${ii}`, type: 'NOT' },
      { id: `mux8w16-and2a-${ii}`, type: 'AND' },
      { id: `mux8w16-and2b-${ii}`, type: 'AND' },
      { id: `mux8w16-or2-${ii}`, type: 'OR' },
      { id: `mux8w16-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`mux8w16-s2-not2-${ii}`, 'mux8w16-sel-2', 0, `mux8w16-not2-${ii}`, 0),
      gc(`mux8w16-or1abcd-and2a-${ii}`, `mux8w16-or1abcd-${ii}`, 0, `mux8w16-and2a-${ii}`, 0),
      gc(`mux8w16-ns2-and2a-${ii}`, `mux8w16-not2-${ii}`, 0, `mux8w16-and2a-${ii}`, 1),
      gc(`mux8w16-or1efgh-and2b-${ii}`, `mux8w16-or1efgh-${ii}`, 0, `mux8w16-and2b-${ii}`, 0),
      gc(`mux8w16-s2-and2b-${ii}`, 'mux8w16-sel-2', 0, `mux8w16-and2b-${ii}`, 1),
      gc(`mux8w16-and2a-or2-${ii}`, `mux8w16-and2a-${ii}`, 0, `mux8w16-or2-${ii}`, 0),
      gc(`mux8w16-and2b-or2-${ii}`, `mux8w16-and2b-${ii}`, 0, `mux8w16-or2-${ii}`, 1),
      gc(`mux8w16-or2-out-${ii}`, `mux8w16-or2-${ii}`, 0, `mux8w16-out-${ii}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 131,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'a', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'b', bits: 16, startIndex: 16 },
        { handleId: 'bus-in-2', label: 'c', bits: 16, startIndex: 32 },
        { handleId: 'bus-in-3', label: 'd', bits: 16, startIndex: 48 },
        { handleId: 'bus-in-4', label: 'e', bits: 16, startIndex: 64 },
        { handleId: 'bus-in-5', label: 'f', bits: 16, startIndex: 80 },
        { handleId: 'bus-in-6', label: 'g', bits: 16, startIndex: 96 },
        { handleId: 'bus-in-7', label: 'h', bits: 16, startIndex: 112 },
        { handleId: 'input-0', label: 'sel[0]', bits: 1, startIndex: 128 },
        { handleId: 'input-1', label: 'sel[1]', bits: 1, startIndex: 129 },
        { handleId: 'input-2', label: 'sel[2]', bits: 1, startIndex: 130 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

function dmux4wayDef(): CompositeGateDef {
  // in, sel[0], sel[1] → a, b, c, d
  // Input lex sort: dmux4-in (index 0), dmux4-sel-0 (index 1), dmux4-sel-1 (index 2)
  // 'dmux4-i' < 'dmux4-s' — correct: in at 0, sel0 at 1, sel1 at 2
  const gates: Gate[] = [
    { id: 'dmux4-in', type: 'INPUT' },    // index 0
    { id: 'dmux4-sel-0', type: 'INPUT' }, // index 1
    { id: 'dmux4-sel-1', type: 'INPUT' }, // index 2
    { id: 'dmux4-not0', type: 'NOT' },
    { id: 'dmux4-not1', type: 'NOT' },
    // a = in AND NOT(sel1) AND NOT(sel0)
    { id: 'dmux4-and-ns1', type: 'AND' }, // in AND NOT(sel1)
    { id: 'dmux4-and-a', type: 'AND' },   // (in AND NOT(sel1)) AND NOT(sel0)
    // b = in AND NOT(sel1) AND sel0
    { id: 'dmux4-and-b', type: 'AND' },   // (in AND NOT(sel1)) AND sel0
    // c = in AND sel1 AND NOT(sel0)
    { id: 'dmux4-and-s1', type: 'AND' },  // in AND sel1
    { id: 'dmux4-and-c', type: 'AND' },   // (in AND sel1) AND NOT(sel0)
    // d = in AND sel1 AND sel0
    { id: 'dmux4-and-d', type: 'AND' },   // (in AND sel1) AND sel0
    { id: 'dmux4-out-a', type: 'OUTPUT' },
    { id: 'dmux4-out-b', type: 'OUTPUT' },
    { id: 'dmux4-out-c', type: 'OUTPUT' },
    { id: 'dmux4-out-d', type: 'OUTPUT' },
  ];
  const connections: Connection[] = [
    gc('dmux4-sel0-not0', 'dmux4-sel-0', 0, 'dmux4-not0', 0),
    gc('dmux4-sel1-not1', 'dmux4-sel-1', 0, 'dmux4-not1', 0),
    // in AND NOT(sel1)
    gc('dmux4-in-ns1', 'dmux4-in', 0, 'dmux4-and-ns1', 0),
    gc('dmux4-not1-ns1', 'dmux4-not1', 0, 'dmux4-and-ns1', 1),
    // a
    gc('dmux4-ns1-a', 'dmux4-and-ns1', 0, 'dmux4-and-a', 0),
    gc('dmux4-not0-a', 'dmux4-not0', 0, 'dmux4-and-a', 1),
    gc('dmux4-a-out', 'dmux4-and-a', 0, 'dmux4-out-a', 0),
    // b
    gc('dmux4-ns1-b', 'dmux4-and-ns1', 0, 'dmux4-and-b', 0),
    gc('dmux4-sel0-b', 'dmux4-sel-0', 0, 'dmux4-and-b', 1),
    gc('dmux4-b-out', 'dmux4-and-b', 0, 'dmux4-out-b', 0),
    // in AND sel1
    gc('dmux4-in-s1', 'dmux4-in', 0, 'dmux4-and-s1', 0),
    gc('dmux4-sel1-s1', 'dmux4-sel-1', 0, 'dmux4-and-s1', 1),
    // c
    gc('dmux4-s1-c', 'dmux4-and-s1', 0, 'dmux4-and-c', 0),
    gc('dmux4-not0-c', 'dmux4-not0', 0, 'dmux4-and-c', 1),
    gc('dmux4-c-out', 'dmux4-and-c', 0, 'dmux4-out-c', 0),
    // d
    gc('dmux4-s1-d', 'dmux4-and-s1', 0, 'dmux4-and-d', 0),
    gc('dmux4-sel0-d', 'dmux4-sel-0', 0, 'dmux4-and-d', 1),
    gc('dmux4-d-out', 'dmux4-and-d', 0, 'dmux4-out-d', 0),
  ];
  return {
    circuit: { gates, connections },
    inputCount: 3,
    outputCount: 4,
    portGroups: {
      inputs: [
        { handleId: 'input-0', label: 'in', bits: 1, startIndex: 0 },
        { handleId: 'input-1', label: 'sel[0]', bits: 1, startIndex: 1 },
        { handleId: 'input-2', label: 'sel[1]', bits: 1, startIndex: 2 },
      ],
      outputs: [
        { handleId: 'output-0', label: 'a', bits: 1, startIndex: 0 },
        { handleId: 'output-1', label: 'b', bits: 1, startIndex: 1 },
        { handleId: 'output-2', label: 'c', bits: 1, startIndex: 2 },
        { handleId: 'output-3', label: 'd', bits: 1, startIndex: 3 },
      ],
    },
  };
}

function dmux8wayDef(): CompositeGateDef {
  // in, sel[0], sel[1], sel[2] → a..h
  // Lex sort: 'dmux8-in' < 'dmux8-sel-0' < 'dmux8-sel-1' < 'dmux8-sel-2'
  // in=index0, sel0=1, sel1=2, sel2=3
  const gates: Gate[] = [
    { id: 'dmux8-in', type: 'INPUT' },    // index 0
    { id: 'dmux8-sel-0', type: 'INPUT' }, // index 1
    { id: 'dmux8-sel-1', type: 'INPUT' }, // index 2
    { id: 'dmux8-sel-2', type: 'INPUT' }, // index 3
    { id: 'dmux8-not0', type: 'NOT' },
    { id: 'dmux8-not1', type: 'NOT' },
    { id: 'dmux8-not2', type: 'NOT' },
  ];
  // Compute 8 combinations of sel2, sel1, sel0 with the input
  // For each output x ∈ {a..h}, index i ∈ 0..7:
  //   bits: sel2=bit2, sel1=bit1, sel0=bit0
  //   e.g. a=000: in AND NOT(sel2) AND NOT(sel1) AND NOT(sel0)
  // We'll build: and_s2[0/1] = in AND NOT(sel2)/sel2, then subdivide
  // Intermediate: in AND NOT(sel2), in AND sel2
  gates.push({ id: 'dmux8-and-ns2', type: 'AND' }); // in AND NOT(sel2)
  gates.push({ id: 'dmux8-and-s2', type: 'AND' });  // in AND sel2
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  // For each letter, two AND gates: one for sel1 part, one for sel0 part
  for (const lt of letters) {
    gates.push({ id: `dmux8-and1-${lt}`, type: 'AND' }); // intermediate (handles sel1)
    gates.push({ id: `dmux8-and2-${lt}`, type: 'AND' }); // final (handles sel0)
    gates.push({ id: `dmux8-out-${lt}`, type: 'OUTPUT' });
  }
  const connections: Connection[] = [
    gc('dmux8-sel0-not0', 'dmux8-sel-0', 0, 'dmux8-not0', 0),
    gc('dmux8-sel1-not1', 'dmux8-sel-1', 0, 'dmux8-not1', 0),
    gc('dmux8-sel2-not2', 'dmux8-sel-2', 0, 'dmux8-not2', 0),
    gc('dmux8-in-ns2', 'dmux8-in', 0, 'dmux8-and-ns2', 0),
    gc('dmux8-not2-ns2', 'dmux8-not2', 0, 'dmux8-and-ns2', 1),
    gc('dmux8-in-s2', 'dmux8-in', 0, 'dmux8-and-s2', 0),
    gc('dmux8-sel2-s2', 'dmux8-sel-2', 0, 'dmux8-and-s2', 1),
  ];
  // a=000: NOT2 AND NOT1 AND NOT0 (from ns2)
  // b=001: NOT2 AND NOT1 AND sel0
  // c=010: NOT2 AND sel1 AND NOT0
  // d=011: NOT2 AND sel1 AND sel0
  // e=100: sel2 AND NOT1 AND NOT0
  // f=101: sel2 AND NOT1 AND sel0
  // g=110: sel2 AND sel1 AND NOT0
  // h=111: sel2 AND sel1 AND sel0
  const configs: Array<[string, string, string, string]> = [
    // [letter, sel2src, sel1src, sel0src]
    ['a', 'dmux8-and-ns2', 'dmux8-not1', 'dmux8-not0'],
    ['b', 'dmux8-and-ns2', 'dmux8-not1', 'dmux8-sel-0'],
    ['c', 'dmux8-and-ns2', 'dmux8-sel-1', 'dmux8-not0'],
    ['d', 'dmux8-and-ns2', 'dmux8-sel-1', 'dmux8-sel-0'],
    ['e', 'dmux8-and-s2', 'dmux8-not1', 'dmux8-not0'],
    ['f', 'dmux8-and-s2', 'dmux8-not1', 'dmux8-sel-0'],
    ['g', 'dmux8-and-s2', 'dmux8-sel-1', 'dmux8-not0'],
    ['h', 'dmux8-and-s2', 'dmux8-sel-1', 'dmux8-sel-0'],
  ];
  for (const [lt, sel2src, sel1src, sel0src] of configs) {
    connections.push(
      gc(`dmux8-${sel2src}-and1${lt}`, sel2src, 0, `dmux8-and1-${lt}`, 0),
      gc(`dmux8-${sel1src}-and1${lt}`, sel1src, 0, `dmux8-and1-${lt}`, 1),
      gc(`dmux8-and1${lt}-and2${lt}`, `dmux8-and1-${lt}`, 0, `dmux8-and2-${lt}`, 0),
      gc(`dmux8-${sel0src}-and2${lt}`, sel0src, 0, `dmux8-and2-${lt}`, 1),
      gc(`dmux8-and2${lt}-out${lt}`, `dmux8-and2-${lt}`, 0, `dmux8-out-${lt}`, 0),
    );
  }
  return {
    circuit: { gates, connections },
    inputCount: 4,
    outputCount: 8,
    portGroups: {
      inputs: [
        { handleId: 'input-0', label: 'in', bits: 1, startIndex: 0 },
        { handleId: 'input-1', label: 'sel[0]', bits: 1, startIndex: 1 },
        { handleId: 'input-2', label: 'sel[1]', bits: 1, startIndex: 2 },
        { handleId: 'input-3', label: 'sel[2]', bits: 1, startIndex: 3 },
      ],
      outputs: [
        { handleId: 'output-0', label: 'a', bits: 1, startIndex: 0 },
        { handleId: 'output-1', label: 'b', bits: 1, startIndex: 1 },
        { handleId: 'output-2', label: 'c', bits: 1, startIndex: 2 },
        { handleId: 'output-3', label: 'd', bits: 1, startIndex: 3 },
        { handleId: 'output-4', label: 'e', bits: 1, startIndex: 4 },
        { handleId: 'output-5', label: 'f', bits: 1, startIndex: 5 },
        { handleId: 'output-6', label: 'g', bits: 1, startIndex: 6 },
        { handleId: 'output-7', label: 'h', bits: 1, startIndex: 7 },
      ],
    },
  };
}

function aluDef(): CompositeGateDef {
  // Input lex sort (all prefixed 'alu-'):
  //   'alu-x-00'..'alu-x-15' (indices 0-15)
  //   'alu-y-00'..'alu-y-15' (indices 16-31)
  //   'alu-z-f'  (index 32)
  //   'alu-z-no' (index 33)
  //   'alu-z-nx' (index 34)
  //   'alu-z-ny' (index 35)
  //   'alu-z-zx' (index 36)
  //   'alu-z-zy' (index 37)
  // Sort check: 'alu-x' < 'alu-y' < 'alu-z'. Within z: f<no<nx<ny<zx<zy ✓
  // portGroups: x=0..15, y=16..31, f=32, no=33, nx=34, ny=35, zx=36, zy=37
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `alu-x-${ii}`, type: 'INPUT' });
  }
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `alu-y-${ii}`, type: 'INPUT' });
  }
  gates.push({ id: 'alu-z-f', type: 'INPUT' });   // index 32: f
  gates.push({ id: 'alu-z-no', type: 'INPUT' });  // index 33: no
  gates.push({ id: 'alu-z-nx', type: 'INPUT' });  // index 34: nx
  gates.push({ id: 'alu-z-ny', type: 'INPUT' });  // index 35: ny
  gates.push({ id: 'alu-z-zx', type: 'INPUT' });  // index 36: zx
  gates.push({ id: 'alu-z-zy', type: 'INPUT' });  // index 37: zy

  // NOT gates for control bits
  gates.push({ id: 'alu-not-zx', type: 'NOT' });
  gates.push({ id: 'alu-not-zy', type: 'NOT' });
  gates.push({ id: 'alu-not-nx', type: 'NOT' });
  gates.push({ id: 'alu-not-ny', type: 'NOT' });
  gates.push({ id: 'alu-not-f', type: 'NOT' });
  gates.push({ id: 'alu-not-no', type: 'NOT' });
  connections.push(
    gc('alu-zx-notzx', 'alu-z-zx', 0, 'alu-not-zx', 0),
    gc('alu-zy-notzy', 'alu-z-zy', 0, 'alu-not-zy', 0),
    gc('alu-nx-notnx', 'alu-z-nx', 0, 'alu-not-nx', 0),
    gc('alu-ny-notny', 'alu-z-ny', 0, 'alu-not-ny', 0),
    gc('alu-f-notf', 'alu-z-f', 0, 'alu-not-f', 0),
    gc('alu-no-notno', 'alu-z-no', 0, 'alu-not-no', 0),
  );

  // Per bit: zx stage, nx stage, zy stage, ny stage, f stage, no stage
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');

    // zx: if zx=1 then x=0 else x=original → MUX: out = orig AND NOT(zx)  (sel=zx: 0→orig, 1→0)
    // MUX(orig, 0, zx) = orig AND NOT(zx)
    gates.push(
      { id: `alu-zx-and-${ii}`, type: 'AND' }, // orig AND NOT(zx)
    );
    connections.push(
      gc(`alu-x-zxand-${ii}`, `alu-x-${ii}`, 0, `alu-zx-and-${ii}`, 0),
      gc(`alu-notzx-zxand-${ii}`, 'alu-not-zx', 0, `alu-zx-and-${ii}`, 1),
    );

    // nx: if nx=1 then x=NOT(x_after_zx) else x_after_zx → XOR with nx bit
    gates.push({ id: `alu-nx-xor-${ii}`, type: 'XOR' });
    connections.push(
      gc(`alu-zxand-nxxor-${ii}`, `alu-zx-and-${ii}`, 0, `alu-nx-xor-${ii}`, 0),
      gc(`alu-nx-nxxor-${ii}`, 'alu-z-nx', 0, `alu-nx-xor-${ii}`, 1),
    );

    // zy: if zy=1 then y=0 else y=original
    gates.push({ id: `alu-zy-and-${ii}`, type: 'AND' });
    connections.push(
      gc(`alu-y-zyand-${ii}`, `alu-y-${ii}`, 0, `alu-zy-and-${ii}`, 0),
      gc(`alu-notzy-zyand-${ii}`, 'alu-not-zy', 0, `alu-zy-and-${ii}`, 1),
    );

    // ny: if ny=1 then y=NOT(y_after_zy) else y_after_zy
    gates.push({ id: `alu-ny-xor-${ii}`, type: 'XOR' });
    connections.push(
      gc(`alu-zyand-nyxor-${ii}`, `alu-zy-and-${ii}`, 0, `alu-ny-xor-${ii}`, 0),
      gc(`alu-ny-nyxor-${ii}`, 'alu-z-ny', 0, `alu-ny-xor-${ii}`, 1),
    );

    // f stage: AND part (x AND y)
    gates.push({ id: `alu-f-and-${ii}`, type: 'AND' });
    connections.push(
      gc(`alu-nxxor-fand-${ii}`, `alu-nx-xor-${ii}`, 0, `alu-f-and-${ii}`, 0),
      gc(`alu-nyxor-fand-${ii}`, `alu-ny-xor-${ii}`, 0, `alu-f-and-${ii}`, 1),
    );
  }

  // ADD stage: ripple carry adder over nx-xor and ny-xor outputs
  // bit 0: half adder
  gates.push({ id: 'alu-add-xor-00', type: 'XOR' });
  gates.push({ id: 'alu-add-and-00', type: 'AND' });
  connections.push(
    gc('alu-nx00-addxor', 'alu-nx-xor-00', 0, 'alu-add-xor-00', 0),
    gc('alu-ny00-addxor', 'alu-ny-xor-00', 0, 'alu-add-xor-00', 1),
    gc('alu-nx00-addand', 'alu-nx-xor-00', 0, 'alu-add-and-00', 0),
    gc('alu-ny00-addand', 'alu-ny-xor-00', 0, 'alu-add-and-00', 1),
  );
  // bits 1-15: full adder
  for (let i = 1; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    const pp = String(i - 1).padStart(2, '0');
    const carryIn = i === 1 ? 'alu-add-and-00' : `alu-add-or-${pp}`;
    gates.push(
      { id: `alu-add-xor1-${ii}`, type: 'XOR' },
      { id: `alu-add-xor2-${ii}`, type: 'XOR' },
      { id: `alu-add-and1-${ii}`, type: 'AND' },
      { id: `alu-add-and2-${ii}`, type: 'AND' },
      { id: `alu-add-or-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`alu-nx${ii}-ax1`, `alu-nx-xor-${ii}`, 0, `alu-add-xor1-${ii}`, 0),
      gc(`alu-ny${ii}-ax1`, `alu-ny-xor-${ii}`, 0, `alu-add-xor1-${ii}`, 1),
      gc(`alu-ax1${ii}-ax2`, `alu-add-xor1-${ii}`, 0, `alu-add-xor2-${ii}`, 0),
      gc(`alu-cy${ii}-ax2`, carryIn, 0, `alu-add-xor2-${ii}`, 1),
      gc(`alu-nx${ii}-aa1`, `alu-nx-xor-${ii}`, 0, `alu-add-and1-${ii}`, 0),
      gc(`alu-ny${ii}-aa1`, `alu-ny-xor-${ii}`, 0, `alu-add-and1-${ii}`, 1),
      gc(`alu-ax1${ii}-aa2`, `alu-add-xor1-${ii}`, 0, `alu-add-and2-${ii}`, 0),
      gc(`alu-cy${ii}-aa2`, carryIn, 0, `alu-add-and2-${ii}`, 1),
      gc(`alu-aa1${ii}-aor`, `alu-add-and1-${ii}`, 0, `alu-add-or-${ii}`, 0),
      gc(`alu-aa2${ii}-aor`, `alu-add-and2-${ii}`, 0, `alu-add-or-${ii}`, 1),
    );
  }

  // f MUX: select between AND result and ADD result
  // out[i] = (f AND add[i]) OR (NOT(f) AND and[i])
  // add sum sources
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    const addSrc = i === 0 ? 'alu-add-xor-00' : `alu-add-xor2-${ii}`;
    // MUX: if f=1 → add, if f=0 → and
    gates.push(
      { id: `alu-fmux-anda-${ii}`, type: 'AND' }, // f AND add
      { id: `alu-fmux-andb-${ii}`, type: 'AND' }, // NOT(f) AND and
      { id: `alu-fmux-or-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`alu-f-fmuxanda-${ii}`, 'alu-z-f', 0, `alu-fmux-anda-${ii}`, 0),
      gc(`alu-add-fmuxanda-${ii}`, addSrc, 0, `alu-fmux-anda-${ii}`, 1),
      gc(`alu-notf-fmuxandb-${ii}`, 'alu-not-f', 0, `alu-fmux-andb-${ii}`, 0),
      gc(`alu-fand-fmuxandb-${ii}`, `alu-f-and-${ii}`, 0, `alu-fmux-andb-${ii}`, 1),
      gc(`alu-fmuxanda-or-${ii}`, `alu-fmux-anda-${ii}`, 0, `alu-fmux-or-${ii}`, 0),
      gc(`alu-fmuxandb-or-${ii}`, `alu-fmux-andb-${ii}`, 0, `alu-fmux-or-${ii}`, 1),
    );
  }

  // no stage: XOR with no bit (if no=1, invert)
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `alu-no-xor-${ii}`, type: 'XOR' });
    connections.push(
      gc(`alu-fmuxor-noxor-${ii}`, `alu-fmux-or-${ii}`, 0, `alu-no-xor-${ii}`, 0),
      gc(`alu-no-noxor-${ii}`, 'alu-z-no', 0, `alu-no-xor-${ii}`, 1),
    );
  }

  // out[16]: output gates (sorted: 'alu-out-' > 'alu-no-xor-' so they come after xors)
  // Wait — we need OUTPUT gates. Their IDs don't affect input port ordering.
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `alu-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`alu-noxor-out-${ii}`, `alu-no-xor-${ii}`, 0, `alu-out-${ii}`, 0));
  }

  // zr: out == 0? OR all 16 output bits, then NOT
  // Use 4-level OR tree
  for (let i = 0; i < 8; i++) {
    const ii = String(i).padStart(2, '0');
    const a = String(i * 2).padStart(2, '0');
    const b = String(i * 2 + 1).padStart(2, '0');
    gates.push({ id: `alu-zr-or1-${ii}`, type: 'OR' });
    connections.push(
      gc(`alu-noxor${a}-zror1${ii}`, `alu-no-xor-${a}`, 0, `alu-zr-or1-${ii}`, 0),
      gc(`alu-noxor${b}-zror1${ii}`, `alu-no-xor-${b}`, 0, `alu-zr-or1-${ii}`, 1),
    );
  }
  for (let i = 0; i < 4; i++) {
    const ii = String(i).padStart(2, '0');
    const a = String(i * 2).padStart(2, '0');
    const b = String(i * 2 + 1).padStart(2, '0');
    gates.push({ id: `alu-zr-or2-${ii}`, type: 'OR' });
    connections.push(
      gc(`alu-zror1${a}-zror2${ii}`, `alu-zr-or1-${a}`, 0, `alu-zr-or2-${ii}`, 0),
      gc(`alu-zror1${b}-zror2${ii}`, `alu-zr-or1-${b}`, 0, `alu-zr-or2-${ii}`, 1),
    );
  }
  for (let i = 0; i < 2; i++) {
    const ii = String(i).padStart(2, '0');
    const a = String(i * 2).padStart(2, '0');
    const b = String(i * 2 + 1).padStart(2, '0');
    gates.push({ id: `alu-zr-or3-${ii}`, type: 'OR' });
    connections.push(
      gc(`alu-zror2${a}-zror3${ii}`, `alu-zr-or2-${a}`, 0, `alu-zr-or3-${ii}`, 0),
      gc(`alu-zror2${b}-zror3${ii}`, `alu-zr-or2-${b}`, 0, `alu-zr-or3-${ii}`, 1),
    );
  }
  gates.push({ id: 'alu-zr-or4', type: 'OR' });
  gates.push({ id: 'alu-zr-not', type: 'NOT' });
  gates.push({ id: 'alu-zr-out', type: 'OUTPUT' });
  connections.push(
    gc('alu-zror30-or4', 'alu-zr-or3-00', 0, 'alu-zr-or4', 0),
    gc('alu-zror31-or4', 'alu-zr-or3-01', 0, 'alu-zr-or4', 1),
    gc('alu-or4-not', 'alu-zr-or4', 0, 'alu-zr-not', 0),
    gc('alu-not-zrout', 'alu-zr-not', 0, 'alu-zr-out', 0),
  );

  // ng: MSB of out (bit 15) is sign bit
  gates.push({ id: 'alu-ng-out', type: 'OUTPUT' });
  connections.push(gc('alu-out15-ng', 'alu-no-xor-15', 0, 'alu-ng-out', 0));

  return {
    circuit: { gates, connections },
    inputCount: 38,
    outputCount: 18,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'x', bits: 16, startIndex: 0 },
        { handleId: 'bus-in-1', label: 'y', bits: 16, startIndex: 16 },
        { handleId: 'input-0', label: 'f', bits: 1, startIndex: 32 },
        { handleId: 'input-1', label: 'no', bits: 1, startIndex: 33 },
        { handleId: 'input-2', label: 'nx', bits: 1, startIndex: 34 },
        { handleId: 'input-3', label: 'ny', bits: 1, startIndex: 35 },
        { handleId: 'input-4', label: 'zx', bits: 1, startIndex: 36 },
        { handleId: 'input-5', label: 'zy', bits: 1, startIndex: 37 },
      ],
      outputs: [
        { handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 },
        { handleId: 'output-0', label: 'zr', bits: 1, startIndex: 16 },
        { handleId: 'output-1', label: 'ng', bits: 1, startIndex: 17 },
      ],
    },
  };
}

// ─── Sequential chips ──────────────────────────────────────────────────────────

// Bit: 1-bit register using DFF + MUX
// INPUTs sorted lex: bit-in (port 0), bit-load (port 1)
function bitDef(): CompositeGateDef {
  const gates: Gate[] = [
    { id: 'bit-in', type: 'INPUT' },       // port 0
    { id: 'bit-load', type: 'INPUT' },     // port 1  ('bit-lo' > 'bit-in')
    { id: 'bit-dff', type: 'DFF' },
    { id: 'bit-not-load', type: 'NOT' },
    { id: 'bit-and-in', type: 'AND' },     // in AND load
    { id: 'bit-and-fb', type: 'AND' },     // dff AND NOT(load)
    { id: 'bit-or', type: 'OR' },          // mux result
    { id: 'bit-out', type: 'OUTPUT' },
  ];
  const connections: Connection[] = [
    // MUX: if load=1, store 'in'; else keep DFF output
    gc('bit-in-andin0', 'bit-in', 0, 'bit-and-in', 0),
    gc('bit-load-andin1', 'bit-load', 0, 'bit-and-in', 1),
    gc('bit-load-notload', 'bit-load', 0, 'bit-not-load', 0),
    gc('bit-dff-andfb0', 'bit-dff', 0, 'bit-and-fb', 0),
    gc('bit-notload-andfb1', 'bit-not-load', 0, 'bit-and-fb', 1),
    gc('bit-andin-or0', 'bit-and-in', 0, 'bit-or', 0),
    gc('bit-andfb-or1', 'bit-and-fb', 0, 'bit-or', 1),
    gc('bit-or-dff', 'bit-or', 0, 'bit-dff', 0),       // feeds DFF D input
    gc('bit-dff-out', 'bit-dff', 0, 'bit-out', 0),     // Q output
  ];
  return {
    circuit: { gates, connections },
    inputCount: 2,
    outputCount: 1,
    portGroups: {
      inputs: [
        { handleId: 'input-0', label: 'in', bits: 1, startIndex: 0 },
        { handleId: 'input-1', label: 'ld', bits: 1, startIndex: 1 },
      ],
      outputs: [{ handleId: 'output-0', label: 'out', bits: 1, startIndex: 0 }],
    },
  };
}

// Register: 16-bit register using 16 Bit gates (inline DFF+MUX per bit)
// INPUTs sorted lex: reg-in-00..15 (ports 0-15), reg-load (port 16)
// 'reg-i' < 'reg-l' — correct
function registerDef(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  // 16 data inputs
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `reg-in-${ii}`, type: 'INPUT' });
  }
  // load input (sorts after reg-in-* because 'reg-l' > 'reg-i')
  gates.push({ id: 'reg-load', type: 'INPUT' });

  // shared NOT for load
  gates.push({ id: 'reg-not-load', type: 'NOT' });
  connections.push(gc('reg-load-notload', 'reg-load', 0, 'reg-not-load', 0));

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `reg-dff-${ii}`, type: 'DFF' },
      { id: `reg-and-in-${ii}`, type: 'AND' },   // in AND load
      { id: `reg-and-fb-${ii}`, type: 'AND' },   // dff AND NOT(load)
      { id: `reg-or-${ii}`, type: 'OR' },
      { id: `reg-out-${ii}`, type: 'OUTPUT' },
    );
    connections.push(
      gc(`reg-in${ii}-andin0`, `reg-in-${ii}`, 0, `reg-and-in-${ii}`, 0),
      gc(`reg-load-andin${ii}1`, 'reg-load', 0, `reg-and-in-${ii}`, 1),
      gc(`reg-dff-andfb${ii}0`, `reg-dff-${ii}`, 0, `reg-and-fb-${ii}`, 0),
      gc(`reg-notload-andfb${ii}1`, 'reg-not-load', 0, `reg-and-fb-${ii}`, 1),
      gc(`reg-andin${ii}-or0`, `reg-and-in-${ii}`, 0, `reg-or-${ii}`, 0),
      gc(`reg-andfb${ii}-or1`, `reg-and-fb-${ii}`, 0, `reg-or-${ii}`, 1),
      gc(`reg-or${ii}-dff`, `reg-or-${ii}`, 0, `reg-dff-${ii}`, 0),
      gc(`reg-dff${ii}-out`, `reg-dff-${ii}`, 0, `reg-out-${ii}`, 0),
    );
  }

  return {
    circuit: { gates, connections },
    inputCount: 17,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// RAM8: 8 x 16-bit registers
// INPUTs sorted lex: ram8-di-00..15 (ports 0-15), ram8-load (port 16), ram8-za-0/1/2 (ports 17-19)
// 'ram8-d' < 'ram8-l' < 'ram8-z' — correct
// DMUX8WAY: in=port0, sel0=port1, sel1=port2, sel2=port3 → outputs a..h (0..7)
// Register: in[0..15]=ports 0-15, load=port16 → out[0..15]
// MUX8WAY16: a..h[0..15]=ports 0-127, sel0=128, sel1=129, sel2=130 → out[0..15]
function ram8Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  // 16 data inputs
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram8-di-${ii}`, type: 'INPUT' }); // ports 0-15
  }
  // load input
  gates.push({ id: 'ram8-load', type: 'INPUT' }); // port 16
  // 3 address inputs
  gates.push({ id: 'ram8-za-0', type: 'INPUT' }); // port 17
  gates.push({ id: 'ram8-za-1', type: 'INPUT' }); // port 18
  gates.push({ id: 'ram8-za-2', type: 'INPUT' }); // port 19

  // DMUX8WAY: routes load to one of 8 registers based on addr
  // dmux8-in=port0 (load), dmux8-sel-0=port1, dmux8-sel-1=port2, dmux8-sel-2=port3
  gates.push(cg('ram8-dmux', 'DMUX8WAY'));
  connections.push(
    gc('ram8-load-dmux-in', 'ram8-load', 0, 'ram8-dmux', 0),
    gc('ram8-za0-dmux-sel0', 'ram8-za-0', 0, 'ram8-dmux', 1),
    gc('ram8-za1-dmux-sel1', 'ram8-za-1', 0, 'ram8-dmux', 2),
    gc('ram8-za2-dmux-sel2', 'ram8-za-2', 0, 'ram8-dmux', 3),
  );

  // 8 Register gates
  for (let r = 0; r < 8; r++) {
    const rId = `ram8-reg-${r}`;
    gates.push(cg(rId, 'Register'));
    // Connect data inputs (ports 0-15)
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      connections.push(gc(`ram8-di${ii}-reg${r}`, `ram8-di-${ii}`, 0, rId, i));
    }
    // Connect load from dmux output (output index r = letter r)
    connections.push(gc(`ram8-dmux${r}-reg${r}load`, 'ram8-dmux', r, rId, 16));
  }

  // MUX8WAY16: selects the addressed register output
  // mux8w16-in-a-00..15 = ports 0-15 (a=reg0), b=16-31 (reg1), ... h=112-127 (reg7)
  // sel0=128, sel1=129, sel2=130
  gates.push(cg('ram8-mux', 'MUX8WAY16'));
  for (let r = 0; r < 8; r++) {
    for (let i = 0; i < 16; i++) {
      // MUX8WAY16 input port index for reg[r] bit[i]: r*16 + i
      connections.push(gc(`ram8-reg${r}out${i}-mux`, `ram8-reg-${r}`, i, 'ram8-mux', r * 16 + i));
    }
  }
  // addr bits → MUX8WAY16 sel
  connections.push(
    gc('ram8-za0-mux-sel0', 'ram8-za-0', 0, 'ram8-mux', 128),
    gc('ram8-za1-mux-sel1', 'ram8-za-1', 0, 'ram8-mux', 129),
    gc('ram8-za2-mux-sel2', 'ram8-za-2', 0, 'ram8-mux', 130),
  );

  // 16 output gates
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram8-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`ram8-mux${i}-out`, 'ram8-mux', i, `ram8-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 20,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'addr[0]', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'addr[1]', bits: 1, startIndex: 18 },
        { handleId: 'input-3', label: 'addr[2]', bits: 1, startIndex: 19 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// RAM64: 8 x RAM8 (64 registers total)
// INPUTs: ram64-di-00..15 (0-15), ram64-load (16), ram64-za-0..5 (17-22)
// Bottom 3 addr bits (za-0,1,2) → RAM8 addr; Top 3 (za-3,4,5) → bank select
// RAM8 inputs: data[0..15]=0-15, load=16, addr[0..2]=17-19
function ram64Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram64-di-${ii}`, type: 'INPUT' });
  }
  gates.push({ id: 'ram64-load', type: 'INPUT' });  // port 16
  for (let i = 0; i < 6; i++) {
    gates.push({ id: `ram64-za-${i}`, type: 'INPUT' }); // ports 17-22
  }

  // DMUX8WAY routes load to one of 8 RAM8 banks using top 3 addr bits (za-3,4,5)
  gates.push(cg('ram64-dmux', 'DMUX8WAY'));
  connections.push(
    gc('ram64-load-dmux', 'ram64-load', 0, 'ram64-dmux', 0),
    gc('ram64-za3-dmux-sel0', 'ram64-za-3', 0, 'ram64-dmux', 1),
    gc('ram64-za4-dmux-sel1', 'ram64-za-4', 0, 'ram64-dmux', 2),
    gc('ram64-za5-dmux-sel2', 'ram64-za-5', 0, 'ram64-dmux', 3),
  );

  // 8 RAM8 gates
  for (let r = 0; r < 8; r++) {
    const rId = `ram64-ram8-${r}`;
    gates.push(cg(rId, 'RAM8'));
    // data inputs
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      connections.push(gc(`ram64-di${ii}-r${r}`, `ram64-di-${ii}`, 0, rId, i));
    }
    // load from dmux
    connections.push(gc(`ram64-dmux${r}-r${r}load`, 'ram64-dmux', r, rId, 16));
    // bottom 3 addr bits → RAM8 addr
    connections.push(
      gc(`ram64-za0-r${r}addr0`, 'ram64-za-0', 0, rId, 17),
      gc(`ram64-za1-r${r}addr1`, 'ram64-za-1', 0, rId, 18),
      gc(`ram64-za2-r${r}addr2`, 'ram64-za-2', 0, rId, 19),
    );
  }

  // MUX8WAY16 selects output from the addressed RAM8 bank (using top 3 addr bits)
  gates.push(cg('ram64-mux', 'MUX8WAY16'));
  for (let r = 0; r < 8; r++) {
    for (let i = 0; i < 16; i++) {
      connections.push(gc(`ram64-r${r}out${i}-mux`, `ram64-ram8-${r}`, i, 'ram64-mux', r * 16 + i));
    }
  }
  connections.push(
    gc('ram64-za3-mux-sel0', 'ram64-za-3', 0, 'ram64-mux', 128),
    gc('ram64-za4-mux-sel1', 'ram64-za-4', 0, 'ram64-mux', 129),
    gc('ram64-za5-mux-sel2', 'ram64-za-5', 0, 'ram64-mux', 130),
  );

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram64-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`ram64-mux${i}-out`, 'ram64-mux', i, `ram64-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 23,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'addr[0]', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'addr[1]', bits: 1, startIndex: 18 },
        { handleId: 'input-3', label: 'addr[2]', bits: 1, startIndex: 19 },
        { handleId: 'input-4', label: 'addr[3]', bits: 1, startIndex: 20 },
        { handleId: 'input-5', label: 'addr[4]', bits: 1, startIndex: 21 },
        { handleId: 'input-6', label: 'addr[5]', bits: 1, startIndex: 22 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// RAM512: 8 x RAM64
// INPUTs: ram512-di-00..15 (0-15), ram512-load (16), ram512-za-0..8 (17-25)
// Bottom 6 addr bits → RAM64 addr; Top 3 (za-6,7,8) → bank select
// RAM64 inputs: data[0..15]=0-15, load=16, addr[0..5]=17-22
function ram512Def(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram512-di-${ii}`, type: 'INPUT' });
  }
  gates.push({ id: 'ram512-load', type: 'INPUT' }); // port 16
  for (let i = 0; i < 9; i++) {
    gates.push({ id: `ram512-za-${i}`, type: 'INPUT' }); // ports 17-25
  }

  gates.push(cg('ram512-dmux', 'DMUX8WAY'));
  connections.push(
    gc('ram512-load-dmux', 'ram512-load', 0, 'ram512-dmux', 0),
    gc('ram512-za6-dmux-sel0', 'ram512-za-6', 0, 'ram512-dmux', 1),
    gc('ram512-za7-dmux-sel1', 'ram512-za-7', 0, 'ram512-dmux', 2),
    gc('ram512-za8-dmux-sel2', 'ram512-za-8', 0, 'ram512-dmux', 3),
  );

  for (let r = 0; r < 8; r++) {
    const rId = `ram512-ram64-${r}`;
    gates.push(cg(rId, 'RAM64'));
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      connections.push(gc(`ram512-di${ii}-r${r}`, `ram512-di-${ii}`, 0, rId, i));
    }
    connections.push(gc(`ram512-dmux${r}-r${r}load`, 'ram512-dmux', r, rId, 16));
    for (let i = 0; i < 6; i++) {
      connections.push(gc(`ram512-za${i}-r${r}addr${i}`, `ram512-za-${i}`, 0, rId, 17 + i));
    }
  }

  gates.push(cg('ram512-mux', 'MUX8WAY16'));
  for (let r = 0; r < 8; r++) {
    for (let i = 0; i < 16; i++) {
      connections.push(gc(`ram512-r${r}out${i}-mux`, `ram512-ram64-${r}`, i, 'ram512-mux', r * 16 + i));
    }
  }
  connections.push(
    gc('ram512-za6-mux-sel0', 'ram512-za-6', 0, 'ram512-mux', 128),
    gc('ram512-za7-mux-sel1', 'ram512-za-7', 0, 'ram512-mux', 129),
    gc('ram512-za8-mux-sel2', 'ram512-za-8', 0, 'ram512-mux', 130),
  );

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram512-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`ram512-mux${i}-out`, 'ram512-mux', i, `ram512-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 26,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'addr[0]', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'addr[1]', bits: 1, startIndex: 18 },
        { handleId: 'input-3', label: 'addr[2]', bits: 1, startIndex: 19 },
        { handleId: 'input-4', label: 'addr[3]', bits: 1, startIndex: 20 },
        { handleId: 'input-5', label: 'addr[4]', bits: 1, startIndex: 21 },
        { handleId: 'input-6', label: 'addr[5]', bits: 1, startIndex: 22 },
        { handleId: 'input-7', label: 'addr[6]', bits: 1, startIndex: 23 },
        { handleId: 'input-8', label: 'addr[7]', bits: 1, startIndex: 24 },
        { handleId: 'input-9', label: 'addr[8]', bits: 1, startIndex: 25 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// RAM4K: 8 x RAM512
// INPUTs: ram4k-di-00..15 (0-15), ram4k-load (16), ram4k-za-0..11 (17-28)
// Bottom 9 addr bits → RAM512; Top 3 (za-9,10,11) → bank select
// RAM512 inputs: data[0..15]=0-15, load=16, addr[0..8]=17-25
function ram4kDef(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram4k-di-${ii}`, type: 'INPUT' });
  }
  gates.push({ id: 'ram4k-load', type: 'INPUT' }); // port 16
  for (let i = 0; i < 12; i++) {
    gates.push({ id: `ram4k-za-${i}`, type: 'INPUT' }); // ports 17-28
  }

  gates.push(cg('ram4k-dmux', 'DMUX8WAY'));
  connections.push(
    gc('ram4k-load-dmux', 'ram4k-load', 0, 'ram4k-dmux', 0),
    gc('ram4k-za9-dmux-sel0', 'ram4k-za-9', 0, 'ram4k-dmux', 1),
    gc('ram4k-za10-dmux-sel1', 'ram4k-za-10', 0, 'ram4k-dmux', 2),
    gc('ram4k-za11-dmux-sel2', 'ram4k-za-11', 0, 'ram4k-dmux', 3),
  );

  for (let r = 0; r < 8; r++) {
    const rId = `ram4k-ram512-${r}`;
    gates.push(cg(rId, 'RAM512'));
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      connections.push(gc(`ram4k-di${ii}-r${r}`, `ram4k-di-${ii}`, 0, rId, i));
    }
    connections.push(gc(`ram4k-dmux${r}-r${r}load`, 'ram4k-dmux', r, rId, 16));
    for (let i = 0; i < 9; i++) {
      connections.push(gc(`ram4k-za${i}-r${r}addr${i}`, `ram4k-za-${i}`, 0, rId, 17 + i));
    }
  }

  gates.push(cg('ram4k-mux', 'MUX8WAY16'));
  for (let r = 0; r < 8; r++) {
    for (let i = 0; i < 16; i++) {
      connections.push(gc(`ram4k-r${r}out${i}-mux`, `ram4k-ram512-${r}`, i, 'ram4k-mux', r * 16 + i));
    }
  }
  connections.push(
    gc('ram4k-za9-mux-sel0', 'ram4k-za-9', 0, 'ram4k-mux', 128),
    gc('ram4k-za10-mux-sel1', 'ram4k-za-10', 0, 'ram4k-mux', 129),
    gc('ram4k-za11-mux-sel2', 'ram4k-za-11', 0, 'ram4k-mux', 130),
  );

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram4k-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`ram4k-mux${i}-out`, 'ram4k-mux', i, `ram4k-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 29,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'addr[0]', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'addr[1]', bits: 1, startIndex: 18 },
        { handleId: 'input-3', label: 'addr[2]', bits: 1, startIndex: 19 },
        { handleId: 'input-4', label: 'addr[3]', bits: 1, startIndex: 20 },
        { handleId: 'input-5', label: 'addr[4]', bits: 1, startIndex: 21 },
        { handleId: 'input-6', label: 'addr[5]', bits: 1, startIndex: 22 },
        { handleId: 'input-7', label: 'addr[6]', bits: 1, startIndex: 23 },
        { handleId: 'input-8', label: 'addr[7]', bits: 1, startIndex: 24 },
        { handleId: 'input-9', label: 'addr[8]', bits: 1, startIndex: 25 },
        { handleId: 'input-10', label: 'addr[9]', bits: 1, startIndex: 26 },
        { handleId: 'input-11', label: 'addr[10]', bits: 1, startIndex: 27 },
        { handleId: 'input-12', label: 'addr[11]', bits: 1, startIndex: 28 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// RAM16K: 4 x RAM4K (uses DMUX4WAY and MUX4WAY16 for 2-bit bank select)
// INPUTs: ram16k-di-00..15 (0-15), ram16k-load (16), ram16k-za-0..13 (17-30)
// Bottom 12 addr bits → RAM4K; Top 2 (za-12,13) → bank select
// RAM4K inputs: data[0..15]=0-15, load=16, addr[0..11]=17-28
// DMUX4WAY: in=0, sel0=1, sel1=2 → a..d (0..3)
// MUX4WAY16: a..d[0..15]=0-63, sel0=64, sel1=65 → out[0..15]
function ram16kDef(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram16k-di-${ii}`, type: 'INPUT' });
  }
  gates.push({ id: 'ram16k-load', type: 'INPUT' }); // port 16
  for (let i = 0; i < 14; i++) {
    gates.push({ id: `ram16k-za-${i}`, type: 'INPUT' }); // ports 17-30
  }

  // DMUX4WAY: in=port0 (load), sel0=port1, sel1=port2 → a=0,b=1,c=2,d=3
  gates.push(cg('ram16k-dmux', 'DMUX4WAY'));
  connections.push(
    gc('ram16k-load-dmux', 'ram16k-load', 0, 'ram16k-dmux', 0),
    gc('ram16k-za12-dmux-sel0', 'ram16k-za-12', 0, 'ram16k-dmux', 1),
    gc('ram16k-za13-dmux-sel1', 'ram16k-za-13', 0, 'ram16k-dmux', 2),
  );

  // 4 RAM4K gates
  for (let r = 0; r < 4; r++) {
    const rId = `ram16k-ram4k-${r}`;
    gates.push(cg(rId, 'RAM4K'));
    for (let i = 0; i < 16; i++) {
      const ii = String(i).padStart(2, '0');
      connections.push(gc(`ram16k-di${ii}-r${r}`, `ram16k-di-${ii}`, 0, rId, i));
    }
    connections.push(gc(`ram16k-dmux${r}-r${r}load`, 'ram16k-dmux', r, rId, 16));
    for (let i = 0; i < 12; i++) {
      connections.push(gc(`ram16k-za${i}-r${r}addr${i}`, `ram16k-za-${i}`, 0, rId, 17 + i));
    }
  }

  // MUX4WAY16: a..d[0..15]=0-63, sel0=64, sel1=65
  gates.push(cg('ram16k-mux', 'MUX4WAY16'));
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 16; i++) {
      connections.push(gc(`ram16k-r${r}out${i}-mux`, `ram16k-ram4k-${r}`, i, 'ram16k-mux', r * 16 + i));
    }
  }
  connections.push(
    gc('ram16k-za12-mux-sel0', 'ram16k-za-12', 0, 'ram16k-mux', 64),
    gc('ram16k-za13-mux-sel1', 'ram16k-za-13', 0, 'ram16k-mux', 65),
  );

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `ram16k-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`ram16k-mux${i}-out`, 'ram16k-mux', i, `ram16k-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 31,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'addr[0]', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'addr[1]', bits: 1, startIndex: 18 },
        { handleId: 'input-3', label: 'addr[2]', bits: 1, startIndex: 19 },
        { handleId: 'input-4', label: 'addr[3]', bits: 1, startIndex: 20 },
        { handleId: 'input-5', label: 'addr[4]', bits: 1, startIndex: 21 },
        { handleId: 'input-6', label: 'addr[5]', bits: 1, startIndex: 22 },
        { handleId: 'input-7', label: 'addr[6]', bits: 1, startIndex: 23 },
        { handleId: 'input-8', label: 'addr[7]', bits: 1, startIndex: 24 },
        { handleId: 'input-9', label: 'addr[8]', bits: 1, startIndex: 25 },
        { handleId: 'input-10', label: 'addr[9]', bits: 1, startIndex: 26 },
        { handleId: 'input-11', label: 'addr[10]', bits: 1, startIndex: 27 },
        { handleId: 'input-12', label: 'addr[11]', bits: 1, startIndex: 28 },
        { handleId: 'input-13', label: 'addr[12]', bits: 1, startIndex: 29 },
        { handleId: 'input-14', label: 'addr[13]', bits: 1, startIndex: 30 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

// PC: Program Counter (16-bit)
// Logic: if reset → out=0; elif load → out=in; elif inc → out=out+1; else → out=out
// INPUTs sorted lex:
//   pc-in-00..15 (ports 0-15): 'pc-in'
//   pc-ld       (port 16):     'pc-ld' > 'pc-in' ✓
//   pc-zi       (port 17, inc):'pc-zi' > 'pc-ld' ✓
//   pc-zr       (port 18, res):'pc-zr' > 'pc-zi' ✓
//
// Structure:
//   - Register stores current PC value
//   - 16-bit incrementer (XOR+AND chain): inc_out[i] = bit-by-bit +1
//   - Three MUX16 levels (inline AND/NOT/OR per bit):
//     1. sel1 = MUX16(reg_out, inc_out, inc)    — inc or hold
//     2. sel2 = MUX16(sel1, in, load)            — load overrides
//     3. sel3 = MUX16(sel2, 0, reset)            — reset overrides (b=0, unconnected)
//   - sel3 feeds back into Register input
function pcDef(): CompositeGateDef {
  const gates: Gate[] = [];
  const connections: Connection[] = [];

  // 16 data inputs
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `pc-in-${ii}`, type: 'INPUT' }); // ports 0-15
  }
  // control inputs
  gates.push({ id: 'pc-ld', type: 'INPUT' }); // port 16 (load)
  gates.push({ id: 'pc-zi', type: 'INPUT' }); // port 17 (inc)
  gates.push({ id: 'pc-zr', type: 'INPUT' }); // port 18 (reset)

  // Register: inline 16-bit DFF+MUX (to avoid needing Register in compositeMap during flatten)
  // reg-not-load, reg-dff-00..15, etc. — but we need the register to read its own output.
  // The Register's output is a feedback path through DFFs.
  // Use inline DFF+MUX logic (same as registerDef but with pc- prefix for reg part)

  // shared NOT for reg-load (which is driven by sel3 combined with reg-load)
  // Actually the Register in the PC needs its load driven by a signal — but here the Register
  // always stores whatever we feed it (load=1 always, since we compute the mux externally).
  // So we use 16 bare DFFs as the register: DFF input = sel3[i], DFF output = current PC value.
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `pc-dff-${ii}`, type: 'DFF' });
  }

  // Incrementer: adds 1 to DFF outputs
  // bit 0: out[0] = NOT(dff[0]); carry[0] = dff[0]  (carry is just the bit itself)
  // bit i: out[i] = dff[i] XOR carry[i-1]; carry[i] = dff[i] AND carry[i-1]
  gates.push({ id: 'pc-inc-not-00', type: 'NOT' });
  connections.push(gc('pc-dff00-incnot', 'pc-dff-00', 0, 'pc-inc-not-00', 0));
  // carry[0] = dff[0] (no gate needed, use pc-dff-00 directly)

  for (let i = 1; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    const pp = String(i - 1).padStart(2, '0');
    const carryIn = i === 1 ? 'pc-dff-00' : `pc-inc-and-${pp}`;
    gates.push(
      { id: `pc-inc-xor-${ii}`, type: 'XOR' },
      { id: `pc-inc-and-${ii}`, type: 'AND' },
    );
    connections.push(
      gc(`pc-dff${ii}-incxor0`, `pc-dff-${ii}`, 0, `pc-inc-xor-${ii}`, 0),
      gc(`pc-carry${ii}-incxor1`, carryIn, 0, `pc-inc-xor-${ii}`, 1),
      gc(`pc-dff${ii}-incand0`, `pc-dff-${ii}`, 0, `pc-inc-and-${ii}`, 0),
      gc(`pc-carry${ii}-incand1`, carryIn, 0, `pc-inc-and-${ii}`, 1),
    );
  }

  // Helper: get incremented value source for bit i
  // inc_src(0) = 'pc-inc-not-00'; inc_src(i>0) = 'pc-inc-xor-{ii}'
  const incSrc = (i: number) => i === 0 ? 'pc-inc-not-00' : `pc-inc-xor-${String(i).padStart(2, '0')}`;
  const dffSrc = (i: number) => `pc-dff-${String(i).padStart(2, '0')}`;

  // MUX level 1: mux(dff[i], inc_out[i], inc_ctrl) → sel1[i]
  // if inc=1 → inc_out[i]; else → dff[i]
  // NOT(inc) shared
  gates.push({ id: 'pc-not-inc', type: 'NOT' });
  connections.push(gc('pc-zi-notinc', 'pc-zi', 0, 'pc-not-inc', 0));

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `pc-mux1-anda-${ii}`, type: 'AND' }, // dff AND NOT(inc)
      { id: `pc-mux1-andb-${ii}`, type: 'AND' }, // inc_out AND inc
      { id: `pc-mux1-or-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`pc-dff${ii}-m1a0`, dffSrc(i), 0, `pc-mux1-anda-${ii}`, 0),
      gc(`pc-notinc-m1a1`, 'pc-not-inc', 0, `pc-mux1-anda-${ii}`, 1),
      gc(`pc-inc${ii}-m1b0`, incSrc(i), 0, `pc-mux1-andb-${ii}`, 0),
      gc(`pc-zi-m1b1`, 'pc-zi', 0, `pc-mux1-andb-${ii}`, 1),
      gc(`pc-m1a${ii}-or0`, `pc-mux1-anda-${ii}`, 0, `pc-mux1-or-${ii}`, 0),
      gc(`pc-m1b${ii}-or1`, `pc-mux1-andb-${ii}`, 0, `pc-mux1-or-${ii}`, 1),
    );
  }

  // MUX level 2: mux(sel1[i], in[i], load) → sel2[i]
  // if load=1 → in[i]; else → sel1[i]
  gates.push({ id: 'pc-not-load', type: 'NOT' });
  connections.push(gc('pc-ld-notload', 'pc-ld', 0, 'pc-not-load', 0));

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push(
      { id: `pc-mux2-anda-${ii}`, type: 'AND' }, // sel1 AND NOT(load)
      { id: `pc-mux2-andb-${ii}`, type: 'AND' }, // in AND load
      { id: `pc-mux2-or-${ii}`, type: 'OR' },
    );
    connections.push(
      gc(`pc-m1or${ii}-m2a0`, `pc-mux1-or-${ii}`, 0, `pc-mux2-anda-${ii}`, 0),
      gc(`pc-notload-m2a1`, 'pc-not-load', 0, `pc-mux2-anda-${ii}`, 1),
      gc(`pc-in${ii}-m2b0`, `pc-in-${ii}`, 0, `pc-mux2-andb-${ii}`, 0),
      gc(`pc-ld-m2b1`, 'pc-ld', 0, `pc-mux2-andb-${ii}`, 1),
      gc(`pc-m2a${ii}-or0`, `pc-mux2-anda-${ii}`, 0, `pc-mux2-or-${ii}`, 0),
      gc(`pc-m2b${ii}-or1`, `pc-mux2-andb-${ii}`, 0, `pc-mux2-or-${ii}`, 1),
    );
  }

  // MUX level 3: mux(sel2[i], 0, reset) → sel3[i]
  // if reset=1 → 0; else → sel2[i]
  // MUX(sel2, 0, reset) = sel2 AND NOT(reset)  (since b=0)
  gates.push({ id: 'pc-not-reset', type: 'NOT' });
  connections.push(gc('pc-zr-notreset', 'pc-zr', 0, 'pc-not-reset', 0));

  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `pc-mux3-and-${ii}`, type: 'AND' }); // sel2 AND NOT(reset)
    connections.push(
      gc(`pc-m2or${ii}-m3and0`, `pc-mux2-or-${ii}`, 0, `pc-mux3-and-${ii}`, 0),
      gc(`pc-notreset-m3and1`, 'pc-not-reset', 0, `pc-mux3-and-${ii}`, 1),
    );
    // Feed sel3 into DFF D input
    connections.push(gc(`pc-m3and${ii}-dff`, `pc-mux3-and-${ii}`, 0, `pc-dff-${ii}`, 0));
  }

  // Output gates (sorted by ID — 'pc-out-' sorts after 'pc-mux...')
  for (let i = 0; i < 16; i++) {
    const ii = String(i).padStart(2, '0');
    gates.push({ id: `pc-out-${ii}`, type: 'OUTPUT' });
    connections.push(gc(`pc-dff${ii}-out`, `pc-dff-${ii}`, 0, `pc-out-${ii}`, 0));
  }

  return {
    circuit: { gates, connections },
    inputCount: 19,
    outputCount: 16,
    portGroups: {
      inputs: [
        { handleId: 'bus-in-0', label: 'in', bits: 16, startIndex: 0 },
        { handleId: 'input-0', label: 'load', bits: 1, startIndex: 16 },
        { handleId: 'input-1', label: 'inc', bits: 1, startIndex: 17 },
        { handleId: 'input-2', label: 'reset', bits: 1, startIndex: 18 },
      ],
      outputs: [{ handleId: 'bus-out-0', label: 'out', bits: 16, startIndex: 0 }],
    },
  };
}

export const BUILTIN_GATE_DEFS: Map<string, CompositeGateDef> = new Map([
  ['NOT16', not16Def()],
  ['AND16', and16Def()],
  ['OR16', or16Def()],
  ['MUX16', mux16Def()],
  ['ADD16', add16Def()],
  ['OR8WAY', or8wayDef()],
  ['MUX4WAY16', mux4way16Def()],
  ['MUX8WAY16', mux8way16Def()],
  ['DMUX4WAY', dmux4wayDef()],
  ['DMUX8WAY', dmux8wayDef()],
  ['ALU', aluDef()],
  ['Bit', bitDef()],
  ['Register', registerDef()],
  ['RAM8', ram8Def()],
  ['RAM64', ram64Def()],
  ['RAM512', ram512Def()],
  ['RAM4K', ram4kDef()],
  ['RAM16K', ram16kDef()],
  ['PC', pcDef()],
]);

export const BUILTIN_GATE_LABELS: Map<string, string> = new Map([
  ['NOT16', 'NOT16'],
  ['AND16', 'AND16'],
  ['OR16', 'OR16'],
  ['MUX16', 'MUX16'],
  ['ADD16', 'ADD16'],
  ['OR8WAY', 'OR8WAY'],
  ['MUX4WAY16', 'MUX4WAY16'],
  ['MUX8WAY16', 'MUX8WAY16'],
  ['DMUX4WAY', 'DMUX4WAY'],
  ['DMUX8WAY', 'DMUX8WAY'],
  ['ALU', 'ALU'],
  ['Bit', 'Bit'],
  ['Register', 'Register'],
  ['RAM8', 'RAM8'],
  ['RAM64', 'RAM64'],
  ['RAM512', 'RAM512'],
  ['RAM4K', 'RAM4K'],
  ['RAM16K', 'RAM16K'],
  ['PC', 'PC'],
]);
