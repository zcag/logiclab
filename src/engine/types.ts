export type GateType =
  | 'AND'
  | 'OR'
  | 'NAND'
  | 'NOR'
  | 'NOT'
  | 'XOR'
  | 'XNOR'
  | 'INPUT'
  | 'OUTPUT'
  | 'DFF';

export type Port = {
  id: string;
  gateId: string;
  index: number;
};

export type Connection = {
  from: Port;
  to: Port;
};

export type Gate = {
  id: string;
  type: GateType;
};

export type Circuit = {
  gates: Gate[];
  connections: Connection[];
};

export type TruthTableRow = {
  inputs: boolean[];
  outputs: boolean[];
};

export type TruthTable = TruthTableRow[];

export type SimulationError = {
  type: 'cycle' | 'disconnected_output';
};

export type PortDef = {
  handleId: string;
  label: string;
  bits: number;        // 1 for scalar, 16 for bus
  startIndex: number;  // engine-level port index offset within this gate
};

export interface CompositeGateDef {
  circuit: Circuit;
  inputCount: number;
  outputCount: number;
  portGroups?: {        // ADD THIS
    inputs: PortDef[];
    outputs: PortDef[];
  };
}

export interface FlattenResult {
  circuit: Circuit;
  // for each composite gate node id in the ORIGINAL circuit:
  // maps output index → the flat gate id whose value is that output
  outputSources: Map<string, string[]>;
}
