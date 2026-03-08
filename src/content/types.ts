import type { Circuit, GateType, TruthTable } from '../engine/index.js';

export type SeqTestStep = {
  label?: string;
  inputs: (boolean | number)[];  // one value per input group (bool for scalar, number for bus)
  tick?: boolean;                // advance clock after this step
  checkOutputs?: (number | null)[];  // expected output per group (null = skip); scalar 0/1, bus as int
};

export interface Challenge {
  id: string;
  title: string;
  description: string;
  section: string;
  availableGates: (GateType | string)[];
  inputs: number;
  outputs: number;
  inputLabels: string[];
  outputLabels: string[];
  targetTable: TruthTable;
  unlocks?: string;
  hint?: string;
  starterCircuit?: Circuit;
  referenceImpl?: (inputs: number[]) => number[];
  busInputBits?: number[];
  busOutputBits?: number[];
  seqTests?: SeqTestStep[];
}

export interface Section {
  id: string;
  title: string;
  challenges: Challenge[];
}
