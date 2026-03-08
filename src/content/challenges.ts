import type { Circuit, TruthTable } from '../engine/index.js';
import { generateTruthTable } from '../engine/index.js';
import type { Challenge, Section } from './types.js';

function computeTable(circuit: Circuit): TruthTable {
  const result = generateTruthTable(circuit);
  if (!Array.isArray(result)) {
    throw new Error(`Reference circuit error: ${result.type}`);
  }
  return result;
}

// ─── Section 1: Basic Gates (build each from NAND only) ───────────────────────

const nandGate: Challenge = {
  id: 'nand-gate',
  title: 'NAND Gate',
  description: 'The universal gate. Connect two inputs through a NAND gate to see its truth table.',
  section: 'basic-gates',
  unlocks: 'NAND',
  availableGates: ['NAND'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Q'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-nand', type: 'NAND' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-nand', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-nand', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-nand', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const notGate: Challenge = {
  id: 'not-gate',
  title: 'NOT Gate',
  description: 'Build a NOT gate using only NAND gates. Output is the opposite of the input.',
  section: 'basic-gates',
  availableGates: ['NAND'],
  inputs: 1,
  outputs: 1,
  inputLabels: ['A'],
  outputLabels: ['Q'],
  unlocks: 'NOT',
  hint: 'A NAND gate with both inputs tied to the same signal acts as NOT.',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-not', type: 'NOT' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-not', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-not', index: 0 }, to: { id: 'c1', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const andGate: Challenge = {
  id: 'and-gate',
  title: 'AND Gate',
  description: 'Build an AND gate using only NAND gates. Output is 1 only when both inputs are 1.',
  section: 'basic-gates',
  availableGates: ['NAND'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Q'],
  unlocks: 'AND',
  hint: 'AND(A,B) = NOT(NAND(A,B)). You already know how to build NOT from NAND.',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-and', type: 'AND' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-and', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-and', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-and', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const orGate: Challenge = {
  id: 'or-gate',
  title: 'OR Gate',
  description: 'Build an OR gate using only NAND gates. Output is 1 when at least one input is 1.',
  section: 'basic-gates',
  availableGates: ['NAND'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Q'],
  unlocks: 'OR',
  hint: "By De Morgan's law: OR(A,B) = NAND(NOT A, NOT B).",
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-or', type: 'OR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-or', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-or', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-or', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const norGate: Challenge = {
  id: 'nor-gate',
  title: 'NOR Gate',
  description: 'Build a NOR gate using only NAND gates. Output is 1 only when both inputs are 0.',
  section: 'basic-gates',
  unlocks: 'NOR',
  availableGates: ['NAND'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Q'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-nor', type: 'NOR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-nor', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-nor', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-nor', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const xorFromNand: Challenge = {
  id: 'xor-from-nand',
  title: 'XOR from NAND',
  description: 'Build an XOR gate using only NAND gates. The trickiest of the basics — requires 4 NANDs.',
  section: 'basic-gates',
  unlocks: 'XOR',
  availableGates: ['NAND'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Q'],
  hint: 'Compute NAND(A,B) first and save that result. Then feed it alongside each original input into two more NANDs, and combine those two outputs with a final NAND.',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-xor', type: 'XOR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xor', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xor', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-xor', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

// ─── Section 2: Combinational Circuits ───────────────────────────────────────

const halfAdder: Challenge = {
  id: 'half-adder',
  title: 'Half Adder',
  description: 'Add two 1-bit numbers (A and B). Sum is the ones place of the result; Carry is the twos place — it\'s 1 only when both inputs are 1 (1+1=10 in binary).',
  section: 'combinational',
  unlocks: 'half-adder',
  availableGates: ['AND', 'XOR'],
  inputs: 2,
  outputs: 2,
  inputLabels: ['A', 'B'],
  outputLabels: ['Sum', 'Carry'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-xor', type: 'XOR' },
      { id: 'ref-and', type: 'AND' },
      { id: 'ref-out-0', type: 'OUTPUT' }, // Sum
      { id: 'ref-out-1', type: 'OUTPUT' }, // Carry
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xor', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xor', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-in-0', index: 0 }, to: { id: 'c2', gateId: 'ref-and', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-in-1', index: 0 }, to: { id: 'c3', gateId: 'ref-and', index: 1 } },
      { from: { id: 'c4', gateId: 'ref-xor', index: 0 }, to: { id: 'c4', gateId: 'ref-out-0', index: 0 } },
      { from: { id: 'c5', gateId: 'ref-and', index: 0 }, to: { id: 'c5', gateId: 'ref-out-1', index: 0 } },
    ],
  }),
};

const fullAdder: Challenge = {
  id: 'full-adder',
  title: 'Full Adder',
  description: 'Like the half adder but with a third input: Cin (carry from a previous stage). A full adder can be chained to add multi-bit numbers. Sum is the ones place of A+B+Cin; Cout carries into the next stage. You can also solve this more elegantly using the Half Adder you already built — complete that challenge first to unlock it as a primitive.',
  section: 'combinational',
  unlocks: 'full-adder',
  availableGates: ['AND', 'OR', 'XOR', 'half-adder'],
  inputs: 3,
  outputs: 2,
  inputLabels: ['A', 'B', 'Cin'],
  outputLabels: ['Sum', 'Cout'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-in-2', type: 'INPUT' },
      { id: 'ref-xor-ab', type: 'XOR' },
      { id: 'ref-xor-sum', type: 'XOR' },
      { id: 'ref-and-ab', type: 'AND' },
      { id: 'ref-and-cin', type: 'AND' },
      { id: 'ref-or-cout', type: 'OR' },
      { id: 'ref-out-0', type: 'OUTPUT' }, // Sum
      { id: 'ref-out-1', type: 'OUTPUT' }, // Cout
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xor-ab', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xor-ab', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-xor-ab', index: 0 }, to: { id: 'c2', gateId: 'ref-xor-sum', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-in-2', index: 0 }, to: { id: 'c3', gateId: 'ref-xor-sum', index: 1 } },
      { from: { id: 'c4', gateId: 'ref-in-0', index: 0 }, to: { id: 'c4', gateId: 'ref-and-ab', index: 0 } },
      { from: { id: 'c5', gateId: 'ref-in-1', index: 0 }, to: { id: 'c5', gateId: 'ref-and-ab', index: 1 } },
      { from: { id: 'c6', gateId: 'ref-xor-ab', index: 0 }, to: { id: 'c6', gateId: 'ref-and-cin', index: 0 } },
      { from: { id: 'c7', gateId: 'ref-in-2', index: 0 }, to: { id: 'c7', gateId: 'ref-and-cin', index: 1 } },
      { from: { id: 'c8', gateId: 'ref-and-ab', index: 0 }, to: { id: 'c8', gateId: 'ref-or-cout', index: 0 } },
      { from: { id: 'c9', gateId: 'ref-and-cin', index: 0 }, to: { id: 'c9', gateId: 'ref-or-cout', index: 1 } },
      { from: { id: 'c10', gateId: 'ref-xor-sum', index: 0 }, to: { id: 'c10', gateId: 'ref-out-0', index: 0 } },
      { from: { id: 'c11', gateId: 'ref-or-cout', index: 0 }, to: { id: 'c11', gateId: 'ref-out-1', index: 0 } },
    ],
  }),
};

// Half Subtractor: Diff = A XOR B, Borrow = NOT(A) AND B
const halfSubtractor: Challenge = {
  id: 'half-subtractor',
  title: 'Half Subtractor',
  description: 'Compute A − B. Diff is the result bit (same rule as XOR). Borrow is 1 when A=0 and B=1 — meaning you had to borrow from a higher bit to complete the subtraction.',
  section: 'combinational',
  unlocks: 'half-subtractor',
  availableGates: ['XOR', 'AND', 'NOT'],
  inputs: 2,
  outputs: 2,
  inputLabels: ['A', 'B'],
  outputLabels: ['Diff', 'Borrow'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-xor', type: 'XOR' },
      { id: 'ref-not-a', type: 'NOT' },
      { id: 'ref-and', type: 'AND' },
      { id: 'ref-out-0', type: 'OUTPUT' }, // Diff
      { id: 'ref-out-1', type: 'OUTPUT' }, // Borrow
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xor', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xor', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-in-0', index: 0 }, to: { id: 'c2', gateId: 'ref-not-a', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-not-a', index: 0 }, to: { id: 'c3', gateId: 'ref-and', index: 0 } },
      { from: { id: 'c4', gateId: 'ref-in-1', index: 0 }, to: { id: 'c4', gateId: 'ref-and', index: 1 } },
      { from: { id: 'c5', gateId: 'ref-xor', index: 0 }, to: { id: 'c5', gateId: 'ref-out-0', index: 0 } },
      { from: { id: 'c6', gateId: 'ref-and', index: 0 }, to: { id: 'c6', gateId: 'ref-out-1', index: 0 } },
    ],
  }),
};

// 1-bit Equality: Q = XNOR(A, B) = NOT(A XOR B)
const equalityComparator: Challenge = {
  id: 'equality-comparator',
  title: '1-bit Equality',
  description: 'Output 1 when both inputs are equal — both 0 or both 1. This is the XNOR function, the inverse of XOR. Used as a building block in comparators.',
  section: 'combinational',
  unlocks: 'XNOR',
  availableGates: ['XOR', 'NOT'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['A', 'B'],
  outputLabels: ['Equal'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-xnor', type: 'XNOR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xnor', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xnor', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-xnor', index: 0 }, to: { id: 'c2', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

// 3-bit Parity Checker: P = A XOR B XOR C
const parityChecker: Challenge = {
  id: 'parity-checker',
  title: '3-bit Parity Checker',
  description: 'Output 1 when an odd number of the three inputs are 1. Parity bits are used in error detection — if a single bit flips during transmission, the parity changes and the error is caught.',
  section: 'combinational',
  unlocks: 'parity-checker',
  availableGates: ['XOR'],
  inputs: 3,
  outputs: 1,
  inputLabels: ['A', 'B', 'C'],
  outputLabels: ['P'],
  hint: 'XOR is associative — you can chain two XOR gates: (A XOR B) XOR C.',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-in-2', type: 'INPUT' },
      { id: 'ref-xor-ab', type: 'XOR' },
      { id: 'ref-xor-abc', type: 'XOR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-xor-ab', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-xor-ab', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-xor-ab', index: 0 }, to: { id: 'c2', gateId: 'ref-xor-abc', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-in-2', index: 0 }, to: { id: 'c3', gateId: 'ref-xor-abc', index: 1 } },
      { from: { id: 'c4', gateId: 'ref-xor-abc', index: 0 }, to: { id: 'c4', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

// 2-to-1 MUX: Q = (A AND NOT S) OR (B AND S)
const mux2to1: Challenge = {
  id: 'mux-2to1',
  title: '2-to-1 Multiplexer',
  description: 'A MUX routes one of two data inputs to the output based on a selector. When S=0 the output follows A; when S=1 it follows B. MUXes are fundamental — processors use them everywhere to select between values.',
  section: 'combinational',
  unlocks: 'mux-2to1',
  availableGates: ['AND', 'OR', 'NOT'],
  inputs: 3,
  outputs: 1,
  inputLabels: ['A', 'B', 'S'],
  outputLabels: ['Q'],
  hint: 'Gate A with NOT(S), gate B with S, then OR the results together.',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' }, // A
      { id: 'ref-in-1', type: 'INPUT' }, // B
      { id: 'ref-in-2', type: 'INPUT' }, // S
      { id: 'ref-not-s', type: 'NOT' },
      { id: 'ref-and-a', type: 'AND' },
      { id: 'ref-and-b', type: 'AND' },
      { id: 'ref-or', type: 'OR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-2', index: 0 }, to: { id: 'c0', gateId: 'ref-not-s', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-0', index: 0 }, to: { id: 'c1', gateId: 'ref-and-a', index: 0 } },
      { from: { id: 'c2', gateId: 'ref-not-s', index: 0 }, to: { id: 'c2', gateId: 'ref-and-a', index: 1 } },
      { from: { id: 'c3', gateId: 'ref-in-1', index: 0 }, to: { id: 'c3', gateId: 'ref-and-b', index: 0 } },
      { from: { id: 'c4', gateId: 'ref-in-2', index: 0 }, to: { id: 'c4', gateId: 'ref-and-b', index: 1 } },
      { from: { id: 'c5', gateId: 'ref-and-a', index: 0 }, to: { id: 'c5', gateId: 'ref-or', index: 0 } },
      { from: { id: 'c6', gateId: 'ref-and-b', index: 0 }, to: { id: 'c6', gateId: 'ref-or', index: 1 } },
      { from: { id: 'c7', gateId: 'ref-or', index: 0 }, to: { id: 'c7', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const dmux: Challenge = {
  id: 'dmux',
  title: 'DMux',
  description: 'A demultiplexer routes one input to one of two outputs based on a selector. When Sel=0 the input goes to A; when Sel=1 it goes to B. The idle output is always 0.',
  section: 'combinational',
  unlocks: 'dmux',
  availableGates: ['AND', 'NOT'],
  inputs: 2,
  outputs: 2,
  inputLabels: ['In', 'Sel'],
  outputLabels: ['A', 'B'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in', type: 'INPUT' },
      { id: 'ref-sel', type: 'INPUT' },
      { id: 'ref-not', type: 'NOT' },
      { id: 'ref-and-a', type: 'AND' },
      { id: 'ref-and-b', type: 'AND' },
      { id: 'ref-out-a', type: 'OUTPUT' },
      { id: 'ref-out-b', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-sel', index: 0 }, to: { id: 'c0', gateId: 'ref-not', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in', index: 0 }, to: { id: 'c1', gateId: 'ref-and-a', index: 0 } },
      { from: { id: 'c2', gateId: 'ref-not', index: 0 }, to: { id: 'c2', gateId: 'ref-and-a', index: 1 } },
      { from: { id: 'c3', gateId: 'ref-in', index: 0 }, to: { id: 'c3', gateId: 'ref-and-b', index: 0 } },
      { from: { id: 'c4', gateId: 'ref-sel', index: 0 }, to: { id: 'c4', gateId: 'ref-and-b', index: 1 } },
      { from: { id: 'c5', gateId: 'ref-and-a', index: 0 }, to: { id: 'c5', gateId: 'ref-out-a', index: 0 } },
      { from: { id: 'c6', gateId: 'ref-and-b', index: 0 }, to: { id: 'c6', gateId: 'ref-out-b', index: 0 } },
    ],
  }),
};

// ─── Section 2b: Multi-way Combinational ──────────────────────────────────────

const or8wayChallenge: Challenge = {
  id: 'or8way',
  title: 'OR8WAY',
  description: 'Build an 8-way OR gate: output is 1 if any of the 8 inputs is 1. Chain OR gates across all 8 inputs.',
  section: 'multi-way',
  unlocks: 'OR8WAY',
  availableGates: ['OR'],
  inputs: 8,
  outputs: 1,
  inputLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  outputLabels: ['Out'],
  hint: 'OR all 8 inputs in a tree: OR(OR(OR(A,B),OR(C,D)),OR(OR(E,F),OR(G,H))).',
  targetTable: computeTable({
    gates: [
      { id: 'ref-in-0', type: 'INPUT' },
      { id: 'ref-in-1', type: 'INPUT' },
      { id: 'ref-in-2', type: 'INPUT' },
      { id: 'ref-in-3', type: 'INPUT' },
      { id: 'ref-in-4', type: 'INPUT' },
      { id: 'ref-in-5', type: 'INPUT' },
      { id: 'ref-in-6', type: 'INPUT' },
      { id: 'ref-in-7', type: 'INPUT' },
      { id: 'ref-or-01', type: 'OR' },
      { id: 'ref-or-23', type: 'OR' },
      { id: 'ref-or-45', type: 'OR' },
      { id: 'ref-or-67', type: 'OR' },
      { id: 'ref-or-0123', type: 'OR' },
      { id: 'ref-or-4567', type: 'OR' },
      { id: 'ref-or-all', type: 'OR' },
      { id: 'ref-out-0', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-in-0', index: 0 }, to: { id: 'c0', gateId: 'ref-or-01', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-in-1', index: 0 }, to: { id: 'c1', gateId: 'ref-or-01', index: 1 } },
      { from: { id: 'c2', gateId: 'ref-in-2', index: 0 }, to: { id: 'c2', gateId: 'ref-or-23', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-in-3', index: 0 }, to: { id: 'c3', gateId: 'ref-or-23', index: 1 } },
      { from: { id: 'c4', gateId: 'ref-in-4', index: 0 }, to: { id: 'c4', gateId: 'ref-or-45', index: 0 } },
      { from: { id: 'c5', gateId: 'ref-in-5', index: 0 }, to: { id: 'c5', gateId: 'ref-or-45', index: 1 } },
      { from: { id: 'c6', gateId: 'ref-in-6', index: 0 }, to: { id: 'c6', gateId: 'ref-or-67', index: 0 } },
      { from: { id: 'c7', gateId: 'ref-in-7', index: 0 }, to: { id: 'c7', gateId: 'ref-or-67', index: 1 } },
      { from: { id: 'c8', gateId: 'ref-or-01', index: 0 }, to: { id: 'c8', gateId: 'ref-or-0123', index: 0 } },
      { from: { id: 'c9', gateId: 'ref-or-23', index: 0 }, to: { id: 'c9', gateId: 'ref-or-0123', index: 1 } },
      { from: { id: 'c10', gateId: 'ref-or-45', index: 0 }, to: { id: 'c10', gateId: 'ref-or-4567', index: 0 } },
      { from: { id: 'c11', gateId: 'ref-or-67', index: 0 }, to: { id: 'c11', gateId: 'ref-or-4567', index: 1 } },
      { from: { id: 'c12', gateId: 'ref-or-0123', index: 0 }, to: { id: 'c12', gateId: 'ref-or-all', index: 0 } },
      { from: { id: 'c13', gateId: 'ref-or-4567', index: 0 }, to: { id: 'c13', gateId: 'ref-or-all', index: 1 } },
      { from: { id: 'c14', gateId: 'ref-or-all', index: 0 }, to: { id: 'c14', gateId: 'ref-out-0', index: 0 } },
    ],
  }),
};

const mux4way16Challenge: Challenge = {
  id: 'mux4way16',
  title: 'MUX4WAY16',
  description: 'A 4-way 16-bit multiplexer: sel=00→a, sel=01→b, sel=10→c, sel=11→d. Use MUX16 gates in two levels.',
  section: 'multi-way',
  unlocks: 'MUX4WAY16',
  availableGates: ['MUX16'],
  inputs: 6,
  outputs: 1,
  inputLabels: ['a', 'b', 'c', 'd', 'sel[0]', 'sel[1]'],
  outputLabels: ['out'],
  targetTable: [],
  referenceImpl: (inputs) => {
    const [a, b, c, d, sel0, sel1] = inputs as [number, number, number, number, number, number];
    const sel = ((sel1 & 1) << 1) | (sel0 & 1);
    const choices = [a, b, c, d];
    return [(choices[sel]!) & 0xFFFF];
  },
  busInputBits: [16, 16, 16, 16, 1, 1],
  busOutputBits: [16],
};

const mux8way16Challenge: Challenge = {
  id: 'mux8way16',
  title: 'MUX8WAY16',
  description: 'An 8-way 16-bit multiplexer: sel[2:0] selects one of 8 bus inputs (a..h) to route to out. Build from MUX4WAY16 or MUX16 gates.',
  section: 'multi-way',
  unlocks: 'MUX8WAY16',
  availableGates: ['MUX16', 'MUX4WAY16'],
  inputs: 11,
  outputs: 1,
  inputLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'sel[0]', 'sel[1]', 'sel[2]'],
  outputLabels: ['out'],
  targetTable: [],
  referenceImpl: (inputs) => {
    const a = inputs[0]!, b = inputs[1]!, c = inputs[2]!, d = inputs[3]!;
    const e = inputs[4]!, f = inputs[5]!, g = inputs[6]!, h = inputs[7]!;
    const sel0 = inputs[8]! & 1, sel1 = inputs[9]! & 1, sel2 = inputs[10]! & 1;
    const sel = (sel2 << 2) | (sel1 << 1) | sel0;
    const choices = [a, b, c, d, e, f, g, h];
    return [(choices[sel]!) & 0xFFFF];
  },
  busInputBits: [16, 16, 16, 16, 16, 16, 16, 16, 1, 1, 1],
  busOutputBits: [16],
};

const dmux4wayChallenge: Challenge = {
  id: 'dmux4way',
  title: 'DMUX4WAY',
  description: 'A 4-way demultiplexer: routes the single input to one of four outputs (a, b, c, d) based on sel[1:0]. The other outputs are 0.',
  section: 'multi-way',
  unlocks: 'DMUX4WAY',
  availableGates: ['AND', 'NOT', 'dmux'],
  inputs: 3,
  outputs: 4,
  inputLabels: ['In', 'sel[0]', 'sel[1]'],
  outputLabels: ['a', 'b', 'c', 'd'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in', type: 'INPUT' },
      { id: 'ref-sel0', type: 'INPUT' },
      { id: 'ref-sel1', type: 'INPUT' },
      { id: 'ref-not0', type: 'NOT' },
      { id: 'ref-not1', type: 'NOT' },
      { id: 'ref-and-ns1', type: 'AND' },
      { id: 'ref-and-a', type: 'AND' },
      { id: 'ref-and-b', type: 'AND' },
      { id: 'ref-and-s1', type: 'AND' },
      { id: 'ref-and-c', type: 'AND' },
      { id: 'ref-and-d', type: 'AND' },
      { id: 'ref-out-a', type: 'OUTPUT' },
      { id: 'ref-out-b', type: 'OUTPUT' },
      { id: 'ref-out-c', type: 'OUTPUT' },
      { id: 'ref-out-d', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-sel0', index: 0 }, to: { id: 'c0', gateId: 'ref-not0', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-sel1', index: 0 }, to: { id: 'c1', gateId: 'ref-not1', index: 0 } },
      { from: { id: 'c2', gateId: 'ref-in', index: 0 }, to: { id: 'c2', gateId: 'ref-and-ns1', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-not1', index: 0 }, to: { id: 'c3', gateId: 'ref-and-ns1', index: 1 } },
      { from: { id: 'c4', gateId: 'ref-and-ns1', index: 0 }, to: { id: 'c4', gateId: 'ref-and-a', index: 0 } },
      { from: { id: 'c5', gateId: 'ref-not0', index: 0 }, to: { id: 'c5', gateId: 'ref-and-a', index: 1 } },
      { from: { id: 'c6', gateId: 'ref-and-ns1', index: 0 }, to: { id: 'c6', gateId: 'ref-and-b', index: 0 } },
      { from: { id: 'c7', gateId: 'ref-sel0', index: 0 }, to: { id: 'c7', gateId: 'ref-and-b', index: 1 } },
      { from: { id: 'c8', gateId: 'ref-in', index: 0 }, to: { id: 'c8', gateId: 'ref-and-s1', index: 0 } },
      { from: { id: 'c9', gateId: 'ref-sel1', index: 0 }, to: { id: 'c9', gateId: 'ref-and-s1', index: 1 } },
      { from: { id: 'c10', gateId: 'ref-and-s1', index: 0 }, to: { id: 'c10', gateId: 'ref-and-c', index: 0 } },
      { from: { id: 'c11', gateId: 'ref-not0', index: 0 }, to: { id: 'c11', gateId: 'ref-and-c', index: 1 } },
      { from: { id: 'c12', gateId: 'ref-and-s1', index: 0 }, to: { id: 'c12', gateId: 'ref-and-d', index: 0 } },
      { from: { id: 'c13', gateId: 'ref-sel0', index: 0 }, to: { id: 'c13', gateId: 'ref-and-d', index: 1 } },
      { from: { id: 'c14', gateId: 'ref-and-a', index: 0 }, to: { id: 'c14', gateId: 'ref-out-a', index: 0 } },
      { from: { id: 'c15', gateId: 'ref-and-b', index: 0 }, to: { id: 'c15', gateId: 'ref-out-b', index: 0 } },
      { from: { id: 'c16', gateId: 'ref-and-c', index: 0 }, to: { id: 'c16', gateId: 'ref-out-c', index: 0 } },
      { from: { id: 'c17', gateId: 'ref-and-d', index: 0 }, to: { id: 'c17', gateId: 'ref-out-d', index: 0 } },
    ],
  }),
};

const dmux8wayChallenge: Challenge = {
  id: 'dmux8way',
  title: 'DMUX8WAY',
  description: 'An 8-way demultiplexer: routes input to one of 8 outputs (a..h) based on sel[2:0]. Build from DMUX4WAY or AND/NOT gates.',
  section: 'multi-way',
  unlocks: 'DMUX8WAY',
  availableGates: ['AND', 'NOT', 'dmux', 'DMUX4WAY'],
  inputs: 4,
  outputs: 8,
  inputLabels: ['In', 'sel[0]', 'sel[1]', 'sel[2]'],
  outputLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  targetTable: computeTable({
    gates: [
      { id: 'ref-in', type: 'INPUT' },
      { id: 'ref-sel0', type: 'INPUT' },
      { id: 'ref-sel1', type: 'INPUT' },
      { id: 'ref-sel2', type: 'INPUT' },
      { id: 'ref-not0', type: 'NOT' },
      { id: 'ref-not1', type: 'NOT' },
      { id: 'ref-not2', type: 'NOT' },
      { id: 'ref-and-ns2', type: 'AND' },
      { id: 'ref-and-s2', type: 'AND' },
      { id: 'ref-and1-a', type: 'AND' },
      { id: 'ref-and2-a', type: 'AND' },
      { id: 'ref-and1-b', type: 'AND' },
      { id: 'ref-and2-b', type: 'AND' },
      { id: 'ref-and1-c', type: 'AND' },
      { id: 'ref-and2-c', type: 'AND' },
      { id: 'ref-and1-d', type: 'AND' },
      { id: 'ref-and2-d', type: 'AND' },
      { id: 'ref-and1-e', type: 'AND' },
      { id: 'ref-and2-e', type: 'AND' },
      { id: 'ref-and1-f', type: 'AND' },
      { id: 'ref-and2-f', type: 'AND' },
      { id: 'ref-and1-g', type: 'AND' },
      { id: 'ref-and2-g', type: 'AND' },
      { id: 'ref-and1-h', type: 'AND' },
      { id: 'ref-and2-h', type: 'AND' },
      { id: 'ref-out-a', type: 'OUTPUT' },
      { id: 'ref-out-b', type: 'OUTPUT' },
      { id: 'ref-out-c', type: 'OUTPUT' },
      { id: 'ref-out-d', type: 'OUTPUT' },
      { id: 'ref-out-e', type: 'OUTPUT' },
      { id: 'ref-out-f', type: 'OUTPUT' },
      { id: 'ref-out-g', type: 'OUTPUT' },
      { id: 'ref-out-h', type: 'OUTPUT' },
    ],
    connections: [
      { from: { id: 'c0', gateId: 'ref-sel0', index: 0 }, to: { id: 'c0', gateId: 'ref-not0', index: 0 } },
      { from: { id: 'c1', gateId: 'ref-sel1', index: 0 }, to: { id: 'c1', gateId: 'ref-not1', index: 0 } },
      { from: { id: 'c2', gateId: 'ref-sel2', index: 0 }, to: { id: 'c2', gateId: 'ref-not2', index: 0 } },
      { from: { id: 'c3', gateId: 'ref-in', index: 0 }, to: { id: 'c3', gateId: 'ref-and-ns2', index: 0 } },
      { from: { id: 'c4', gateId: 'ref-not2', index: 0 }, to: { id: 'c4', gateId: 'ref-and-ns2', index: 1 } },
      { from: { id: 'c5', gateId: 'ref-in', index: 0 }, to: { id: 'c5', gateId: 'ref-and-s2', index: 0 } },
      { from: { id: 'c6', gateId: 'ref-sel2', index: 0 }, to: { id: 'c6', gateId: 'ref-and-s2', index: 1 } },
      // a = ns2 AND ns1 AND ns0
      { from: { id: 'c7', gateId: 'ref-and-ns2', index: 0 }, to: { id: 'c7', gateId: 'ref-and1-a', index: 0 } },
      { from: { id: 'c8', gateId: 'ref-not1', index: 0 }, to: { id: 'c8', gateId: 'ref-and1-a', index: 1 } },
      { from: { id: 'c9', gateId: 'ref-and1-a', index: 0 }, to: { id: 'c9', gateId: 'ref-and2-a', index: 0 } },
      { from: { id: 'c10', gateId: 'ref-not0', index: 0 }, to: { id: 'c10', gateId: 'ref-and2-a', index: 1 } },
      // b = ns2 AND ns1 AND sel0
      { from: { id: 'c11', gateId: 'ref-and-ns2', index: 0 }, to: { id: 'c11', gateId: 'ref-and1-b', index: 0 } },
      { from: { id: 'c12', gateId: 'ref-not1', index: 0 }, to: { id: 'c12', gateId: 'ref-and1-b', index: 1 } },
      { from: { id: 'c13', gateId: 'ref-and1-b', index: 0 }, to: { id: 'c13', gateId: 'ref-and2-b', index: 0 } },
      { from: { id: 'c14', gateId: 'ref-sel0', index: 0 }, to: { id: 'c14', gateId: 'ref-and2-b', index: 1 } },
      // c = ns2 AND sel1 AND ns0
      { from: { id: 'c15', gateId: 'ref-and-ns2', index: 0 }, to: { id: 'c15', gateId: 'ref-and1-c', index: 0 } },
      { from: { id: 'c16', gateId: 'ref-sel1', index: 0 }, to: { id: 'c16', gateId: 'ref-and1-c', index: 1 } },
      { from: { id: 'c17', gateId: 'ref-and1-c', index: 0 }, to: { id: 'c17', gateId: 'ref-and2-c', index: 0 } },
      { from: { id: 'c18', gateId: 'ref-not0', index: 0 }, to: { id: 'c18', gateId: 'ref-and2-c', index: 1 } },
      // d = ns2 AND sel1 AND sel0
      { from: { id: 'c19', gateId: 'ref-and-ns2', index: 0 }, to: { id: 'c19', gateId: 'ref-and1-d', index: 0 } },
      { from: { id: 'c20', gateId: 'ref-sel1', index: 0 }, to: { id: 'c20', gateId: 'ref-and1-d', index: 1 } },
      { from: { id: 'c21', gateId: 'ref-and1-d', index: 0 }, to: { id: 'c21', gateId: 'ref-and2-d', index: 0 } },
      { from: { id: 'c22', gateId: 'ref-sel0', index: 0 }, to: { id: 'c22', gateId: 'ref-and2-d', index: 1 } },
      // e = s2 AND ns1 AND ns0
      { from: { id: 'c23', gateId: 'ref-and-s2', index: 0 }, to: { id: 'c23', gateId: 'ref-and1-e', index: 0 } },
      { from: { id: 'c24', gateId: 'ref-not1', index: 0 }, to: { id: 'c24', gateId: 'ref-and1-e', index: 1 } },
      { from: { id: 'c25', gateId: 'ref-and1-e', index: 0 }, to: { id: 'c25', gateId: 'ref-and2-e', index: 0 } },
      { from: { id: 'c26', gateId: 'ref-not0', index: 0 }, to: { id: 'c26', gateId: 'ref-and2-e', index: 1 } },
      // f = s2 AND ns1 AND sel0
      { from: { id: 'c27', gateId: 'ref-and-s2', index: 0 }, to: { id: 'c27', gateId: 'ref-and1-f', index: 0 } },
      { from: { id: 'c28', gateId: 'ref-not1', index: 0 }, to: { id: 'c28', gateId: 'ref-and1-f', index: 1 } },
      { from: { id: 'c29', gateId: 'ref-and1-f', index: 0 }, to: { id: 'c29', gateId: 'ref-and2-f', index: 0 } },
      { from: { id: 'c30', gateId: 'ref-sel0', index: 0 }, to: { id: 'c30', gateId: 'ref-and2-f', index: 1 } },
      // g = s2 AND sel1 AND ns0
      { from: { id: 'c31', gateId: 'ref-and-s2', index: 0 }, to: { id: 'c31', gateId: 'ref-and1-g', index: 0 } },
      { from: { id: 'c32', gateId: 'ref-sel1', index: 0 }, to: { id: 'c32', gateId: 'ref-and1-g', index: 1 } },
      { from: { id: 'c33', gateId: 'ref-and1-g', index: 0 }, to: { id: 'c33', gateId: 'ref-and2-g', index: 0 } },
      { from: { id: 'c34', gateId: 'ref-not0', index: 0 }, to: { id: 'c34', gateId: 'ref-and2-g', index: 1 } },
      // h = s2 AND sel1 AND sel0
      { from: { id: 'c35', gateId: 'ref-and-s2', index: 0 }, to: { id: 'c35', gateId: 'ref-and1-h', index: 0 } },
      { from: { id: 'c36', gateId: 'ref-sel1', index: 0 }, to: { id: 'c36', gateId: 'ref-and1-h', index: 1 } },
      { from: { id: 'c37', gateId: 'ref-and1-h', index: 0 }, to: { id: 'c37', gateId: 'ref-and2-h', index: 0 } },
      { from: { id: 'c38', gateId: 'ref-sel0', index: 0 }, to: { id: 'c38', gateId: 'ref-and2-h', index: 1 } },
      // outputs
      { from: { id: 'c39', gateId: 'ref-and2-a', index: 0 }, to: { id: 'c39', gateId: 'ref-out-a', index: 0 } },
      { from: { id: 'c40', gateId: 'ref-and2-b', index: 0 }, to: { id: 'c40', gateId: 'ref-out-b', index: 0 } },
      { from: { id: 'c41', gateId: 'ref-and2-c', index: 0 }, to: { id: 'c41', gateId: 'ref-out-c', index: 0 } },
      { from: { id: 'c42', gateId: 'ref-and2-d', index: 0 }, to: { id: 'c42', gateId: 'ref-out-d', index: 0 } },
      { from: { id: 'c43', gateId: 'ref-and2-e', index: 0 }, to: { id: 'c43', gateId: 'ref-out-e', index: 0 } },
      { from: { id: 'c44', gateId: 'ref-and2-f', index: 0 }, to: { id: 'c44', gateId: 'ref-out-f', index: 0 } },
      { from: { id: 'c45', gateId: 'ref-and2-g', index: 0 }, to: { id: 'c45', gateId: 'ref-out-g', index: 0 } },
      { from: { id: 'c46', gateId: 'ref-and2-h', index: 0 }, to: { id: 'c46', gateId: 'ref-out-h', index: 0 } },
    ],
  }),
};

// ─── Section 3: 16-bit Bus Operations ─────────────────────────────────────────

const and16Challenge: Challenge = {
  id: 'and16',
  title: 'AND16',
  description: 'Apply bitwise AND to two 16-bit buses. Double-click a bus input node to set its value in hex. Connect both bus inputs through the AND16 gate to the output.',
  section: 'bus-ops',
  unlocks: 'AND16',
  availableGates: ['AND16'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['a', 'b'],
  outputLabels: ['out'],
  targetTable: [],
  referenceImpl: (inputs) => [(inputs[0]! & inputs[1]!) & 0xFFFF],
  busInputBits: [16, 16],
  busOutputBits: [16],
};

const add16Challenge: Challenge = {
  id: 'add16',
  title: 'ADD16',
  description: 'Add two 16-bit numbers (wraps on overflow). Connect the two bus inputs through ADD16 to the bus output.',
  section: 'bus-ops',
  unlocks: 'ADD16',
  availableGates: ['ADD16'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['a', 'b'],
  outputLabels: ['sum'],
  targetTable: [],
  referenceImpl: (inputs) => [(inputs[0]! + inputs[1]!) & 0xFFFF],
  busInputBits: [16, 16],
  busOutputBits: [16],
};

// ─── Section 4: ALU ───────────────────────────────────────────────────────────

const aluChallenge: Challenge = {
  id: 'alu',
  title: 'ALU',
  description: 'The Hack ALU: computes a function of x[16] and y[16] controlled by 6 bits (zx, nx, zy, ny, f, no). Also outputs zr=1 if result is 0, ng=1 if result is negative. Connect the bus and scalar inputs through the ALU gate.',
  section: 'alu-section',
  unlocks: 'ALU',
  availableGates: ['ALU'],
  inputs: 8,
  outputs: 3,
  inputLabels: ['x', 'y', 'f', 'no', 'nx', 'ny', 'zx', 'zy'],
  outputLabels: ['out', 'zr', 'ng'],
  targetTable: [],
  referenceImpl: (inputs) => {
    let x = inputs[0]! & 0xFFFF;
    let y = inputs[1]! & 0xFFFF;
    const f  = inputs[2]! & 1;
    const no = inputs[3]! & 1;
    const nx = inputs[4]! & 1;
    const ny = inputs[5]! & 1;
    const zx = inputs[6]! & 1;
    const zy = inputs[7]! & 1;
    if (zx) x = 0;
    if (nx) x = (~x) & 0xFFFF;
    if (zy) y = 0;
    if (ny) y = (~y) & 0xFFFF;
    let out = f ? (x + y) & 0xFFFF : (x & y) & 0xFFFF;
    if (no) out = (~out) & 0xFFFF;
    const zr = out === 0 ? 1 : 0;
    const ng = (out >> 15) & 1;
    return [out, zr, ng];
  },
  busInputBits: [16, 16, 1, 1, 1, 1, 1, 1],
  busOutputBits: [16, 1, 1],
};

// ─── Section 5: Sequential Chips ──────────────────────────────────────────────

// Timing model: checkOutputs checks BEFORE tick; after tick=true, DFF states advance.
// So:
//   step with tick=false: evaluate and check; no state change
//   step with tick=true:  evaluate and check (current DFF output); then advance DFF states

const bitChallenge: Challenge = {
  id: 'bit',
  title: 'Bit',
  description: 'A 1-bit register: when load=1, the stored value updates to in on the next clock tick. When load=0, the stored value holds. Use a DFF and a Mux.',
  section: 'sequential',
  unlocks: 'Bit',
  availableGates: ['DFF', 'mux-2to1'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['in', 'load'],
  outputLabels: ['out'],
  targetTable: [],
  busInputBits: [1, 1],
  busOutputBits: [1],
  seqTests: [
    { label: 'init',    inputs: [0, 0], tick: false, checkOutputs: [0] },
    { label: 'no-load', inputs: [1, 0], tick: true,  checkOutputs: [0] },  // out=0 before tick
    { label: 'hold',    inputs: [0, 0], tick: false, checkOutputs: [0] },  // still 0
    { label: 'load=1',  inputs: [1, 1], tick: true,  checkOutputs: [0] },  // out=0 before tick; after tick DFF=1
    { label: 'stored',  inputs: [0, 0], tick: false, checkOutputs: [1] },  // now out=1
    { label: 'hold1',   inputs: [0, 0], tick: true,  checkOutputs: [1] },  // holds; after tick DFF stays 1
    { label: 'hold2',   inputs: [0, 0], tick: false, checkOutputs: [1] },  // still 1
    { label: 'reset',   inputs: [0, 1], tick: true,  checkOutputs: [1] },  // out=1 before tick; after tick DFF=0
    { label: 'cleared', inputs: [0, 0], tick: false, checkOutputs: [0] },  // now 0
  ],
};

const registerChallenge: Challenge = {
  id: 'register',
  title: 'Register',
  description: 'A 16-bit register. When load=1, stores in[16] on next clock tick. When load=0, holds current value. Build using Bit chips or DFF+MUX16.',
  section: 'sequential',
  unlocks: 'Register',
  availableGates: ['Bit', 'MUX16'],
  inputs: 2,
  outputs: 1,
  inputLabels: ['in', 'load'],
  outputLabels: ['out'],
  targetTable: [],
  busInputBits: [16, 1],
  busOutputBits: [16],
  seqTests: [
    { inputs: [0,        0], tick: false, checkOutputs: [0]      },
    { inputs: [0x1234,   0], tick: true,  checkOutputs: [0]      },  // no load
    { inputs: [0,        0], tick: false, checkOutputs: [0]      },
    { inputs: [0x1234,   1], tick: true,  checkOutputs: [0]      },  // load: stores 0x1234
    { inputs: [0,        0], tick: false, checkOutputs: [0x1234] },  // output = 0x1234
    { inputs: [0xFFFF,   0], tick: true,  checkOutputs: [0x1234] },  // no load, holds
    { inputs: [0,        0], tick: false, checkOutputs: [0x1234] },
    { inputs: [0,        1], tick: true,  checkOutputs: [0x1234] },  // load 0
    { inputs: [0,        0], tick: false, checkOutputs: [0]      },
  ],
};

const ram8Challenge: Challenge = {
  id: 'ram8',
  title: 'RAM8',
  description: 'An 8-register 16-bit RAM. addr[2:0] selects which register to read/write. When load=1, the selected register stores in on the next tick. Build using Register and DMUX8WAY/MUX8WAY16.',
  section: 'sequential',
  unlocks: 'RAM8',
  availableGates: ['Register', 'DMUX8WAY', 'MUX8WAY16'],
  inputs: 5,
  outputs: 1,
  inputLabels: ['in', 'load', 'addr[0]', 'addr[1]', 'addr[2]'],
  outputLabels: ['out'],
  targetTable: [],
  busInputBits: [16, 1, 1, 1, 1],
  busOutputBits: [16],
  seqTests: [
    { label: 'init',       inputs: [0,      0, 0, 0, 0], tick: false, checkOutputs: [0]      },
    { label: 'wr-r0',      inputs: [0xABCD, 1, 0, 0, 0], tick: true,  checkOutputs: [0]      },
    { label: 'rd-r0',      inputs: [0,      0, 0, 0, 0], tick: false, checkOutputs: [0xABCD] },
    { label: 'wr-r3',      inputs: [0x1234, 1, 1, 1, 0], tick: true,  checkOutputs: [0xABCD] },
    { label: 'rd-r3',      inputs: [0,      0, 1, 1, 0], tick: false, checkOutputs: [0x1234] },
    { label: 'rd-r0-still',inputs: [0,      0, 0, 0, 0], tick: false, checkOutputs: [0xABCD] },
    { label: 'wr-r7',      inputs: [0xFFFF, 1, 1, 1, 1], tick: true,  checkOutputs: [0xABCD] },
    { label: 'rd-r7',      inputs: [0,      0, 1, 1, 1], tick: false, checkOutputs: [0xFFFF] },
  ],
};

const pcChallenge: Challenge = {
  id: 'pc',
  title: 'PC',
  description: 'Program Counter: if reset=1 → out=0; elif load=1 → out=in; elif inc=1 → out=out+1; else → hold. Build using Register, Add16, and Mux16 chips.',
  section: 'sequential',
  unlocks: 'PC',
  availableGates: ['Register', 'ADD16', 'MUX16'],
  inputs: 4,
  outputs: 1,
  inputLabels: ['in', 'load', 'inc', 'reset'],
  outputLabels: ['out'],
  targetTable: [],
  busInputBits: [16, 1, 1, 1],
  busOutputBits: [16],
  seqTests: [
    { label: 'init',    inputs: [0,     0, 0, 0], tick: false, checkOutputs: [0] },
    { label: 'reset',   inputs: [0,     0, 0, 1], tick: true,  checkOutputs: [0] },  // reset: out=0
    { label: 'inc',     inputs: [0,     0, 1, 0], tick: true,  checkOutputs: [0] },  // inc: after tick out=1
    { label: 'inc2',    inputs: [0,     0, 1, 0], tick: true,  checkOutputs: [1] },  // out=1 before tick; after=2
    { label: 'inc3',    inputs: [0,     0, 1, 0], tick: true,  checkOutputs: [2] },  // out=2; after=3
    { label: 'load',    inputs: [0x100, 1, 0, 0], tick: true,  checkOutputs: [3] },  // load 0x100; after=0x100
    { label: 'aft-ld',  inputs: [0,     0, 0, 0], tick: false, checkOutputs: [0x100] },
    { label: 'inc-ld',  inputs: [0,     0, 1, 0], tick: true,  checkOutputs: [0x100] }, // after=0x101
    { label: 'aft-inc', inputs: [0,     0, 0, 0], tick: false, checkOutputs: [0x101] },
    { label: 'rst-all', inputs: [0,     0, 0, 1], tick: true,  checkOutputs: [0x101] }, // reset; after=0
    { label: 'zeroed',  inputs: [0,     0, 0, 0], tick: false, checkOutputs: [0] },
  ],
};

// ─── Sections ─────────────────────────────────────────────────────────────────

export const sections: Section[] = [
  {
    id: 'basic-gates',
    title: 'Basic Gates',
    challenges: [nandGate, notGate, andGate, orGate, norGate, xorFromNand],
  },
  {
    id: 'combinational',
    title: 'Combinational Circuits',
    challenges: [halfAdder, fullAdder, halfSubtractor, equalityComparator, parityChecker, mux2to1, dmux],
  },
  {
    id: 'multi-way',
    title: 'Multi-way Gates',
    challenges: [or8wayChallenge, mux4way16Challenge, mux8way16Challenge, dmux4wayChallenge, dmux8wayChallenge],
  },
  {
    id: 'bus-ops',
    title: '16-bit Operations',
    challenges: [and16Challenge, add16Challenge],
  },
  {
    id: 'alu-section',
    title: 'ALU',
    challenges: [aluChallenge],
  },
  {
    id: 'sequential',
    title: 'Sequential Chips',
    challenges: [bitChallenge, registerChallenge, ram8Challenge, pcChallenge],
  },
];
