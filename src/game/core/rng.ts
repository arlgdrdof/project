/**
 * Deterministic Random Number Generator for consistent gameplay
 * Uses Linear Congruential Generator for reproducible results
 */

export class SeededRNG {
  private seed: number;
  
  constructor(seed?: string | number) {
    this.seed = typeof seed === 'string' 
      ? this.hashString(seed) 
      : seed ?? Math.floor(Math.random() * 2147483647);
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  rollDie(sides: number): number {
    return this.nextInt(1, sides);
  }
  
  rollDice(count: number, sides: number, modifier: number = 0): number {
    let total = modifier;
    for (let i = 0; i < count; i++) {
      total += this.rollDie(sides);
    }
    return total;
  }
  
  parseDiceString(diceString: string): number {
    const match = diceString.match(/(\d+)?d(\d+)([+\-]\d+)?/);
    if (!match) return 0;
    
    const count = parseInt(match[1] || '1');
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3] || '0');
    
    return this.rollDice(count, sides, modifier);
  }
  
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  getSeed(): number {
    return this.seed;
  }
  
  setSeed(seed: string | number): void {
    this.seed = typeof seed === 'string' 
      ? this.hashString(seed) 
      : seed;
  }
}

export const globalRNG = new SeededRNG();