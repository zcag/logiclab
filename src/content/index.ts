export type { Challenge, Section } from './types.js';
export { sections } from './challenges.js';

import { sections } from './challenges.js';
import type { Challenge } from './types.js';

export function getChallengeById(id: string): Challenge | undefined {
  for (const section of sections) {
    const found = section.challenges.find(c => c.id === id);
    if (found) return found;
  }
  return undefined;
}
