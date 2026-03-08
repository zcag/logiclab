import type { GateType } from './types.js';

export const GATE_INPUT_COUNT: Record<GateType, number> = {
  INPUT: 0,
  OUTPUT: 1,
  NOT: 1,
  AND: 2,
  OR: 2,
  NAND: 2,
  NOR: 2,
  XOR: 2,
  XNOR: 2,
  DFF: 1,
};

export const GATE_OUTPUT_COUNT: Record<GateType, number> = {
  OUTPUT: 0,
  INPUT: 1,
  NOT: 1,
  AND: 1,
  OR: 1,
  NAND: 1,
  NOR: 1,
  XOR: 1,
  XNOR: 1,
  DFF: 1,
};

export function evaluateGate(type: GateType, inputs: boolean[]): boolean {
  switch (type) {
    case 'AND':  return inputs[0]! && inputs[1]!;
    case 'OR':   return inputs[0]! || inputs[1]!;
    case 'NAND': return !(inputs[0]! && inputs[1]!);
    case 'NOR':  return !(inputs[0]! || inputs[1]!);
    case 'XOR':  return inputs[0]! !== inputs[1]!;
    case 'XNOR': return inputs[0]! === inputs[1]!;
    case 'NOT':  return !inputs[0]!;
    case 'OUTPUT': return inputs[0]!;
    case 'INPUT': return false; // not called directly
    case 'DFF': return inputs[0]!; // fallback; real DFF logic is in simulate.ts
  }
}
