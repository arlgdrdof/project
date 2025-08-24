/**
 * AI System for Enemy Characters
 * Implements different AI personalities and tactical behaviors
 */

import type { Character, Position, CombatState, CombatAction, AIPersonality } from '../core/types.js';
import { findPath, calculateDistance, hasLineOfSight, getPositionsInRange } from './pathfinding.js';
import { globalRNG } from '../core/rng.js';
import { getWeaponById } from '../data/weapons.js';

export class EnemyAI {
  private combatState: CombatState;
  
  constructor(combatState: CombatState) {
    this.combatState = combatState;
  }

  /**
   * Generate AI action for an enemy character
   */
  generateAction(character: Character): CombatAction | null {
    if (!character.aiBehavior) {
      return this.generateDefaultAction(character);
    }

    switch (character.aiBehavior.personality) {
      case 'aggressive':
        return this.generateAggressiveAction(character);
      case 'archer':
        return this.generateArcherAction(character);
      case 'caster':
        return this.generateCasterAction(character);
      case 'defensive':
        return this.generateDefensiveAction(character);
      case 'tactical':
        return this.generateTacticalAction(character);
      default:
        return this.generateDefaultAction(character);
    }
  }

  /**
   * Aggressive AI (Orc-like): Rush to melee, focus on damage
   */
  private generateAggressiveAction(character: Character): CombatAction | null {
    const targets = this.getEnemyTargets(character);
    if (targets.length === 0) return null;

    // Prioritize closest enemy
    const closestTarget = targets.reduce((closest, target) => {
      const distToCurrent = calculateDistance(character.position, target.position);
      const distToClosest = calculateDistance(character.position, closest.position);
      return distToCurrent < distToClosest ? target : closest;
    });

    const distanceToTarget = calculateDistance(character.position, closestTarget.position);

    // If in melee range, attack
    if (distanceToTarget <= 1) {
      return this.createAttackAction(character, closestTarget);
    }

    // Move towards target
    const path = findPath(character.position, closestTarget.position, this.combatState, character.id);
    if (path && path.length > 1) {
      const maxMovement = Math.floor((character.speed - character.movementUsed) / 5);
      const targetPosition = path[Math.min(maxMovement, path.length - 1)];
      
      return {
        id: `ai_move_${Date.now()}`,
        type: 'move',
        characterId: character.id,
        target: targetPosition,
        path: path.slice(0, maxMovement + 1),
        description: `${character.name} charges toward ${closestTarget.name}`
      };
    }

    return null;
  }

  /**
   * Archer AI (Goblin-like): Keep distance, use ranged attacks
   */
  private generateArcherAction(character: Character): CombatAction | null {
    const targets = this.getEnemyTargets(character);
    if (targets.length === 0) return null;

    const rangedWeapon = this.getRangedWeapon(character);
    const closestTarget = this.getClosestTarget(character, targets);
    const distanceToTarget = calculateDistance(character.position, closestTarget.position);

    // If too close and has movement, try to retreat
    if (distanceToTarget <= 3 && character.movementUsed < character.speed) {
      const retreatPosition = this.findRetreatPosition(character, closestTarget);
      if (retreatPosition) {
        return {
          id: `ai_retreat_${Date.now()}`,
          type: 'move',
          characterId: character.id,
          target: retreatPosition,
          description: `${character.name} retreats to maintain distance`
        };
      }
    }

    // Attack with ranged weapon if available and in range
    if (rangedWeapon && hasLineOfSight(character.position, closestTarget.position, this.combatState)) {
      const weaponRange = rangedWeapon.range.normal / 5; // Convert feet to grid squares
      if (distanceToTarget <= weaponRange) {
        return this.createAttackAction(character, closestTarget, rangedWeapon.id);
      }
    }

    // Move to better position for ranged attack
    const optimalPosition = this.findOptimalRangedPosition(character, closestTarget);
    if (optimalPosition) {
      const path = findPath(character.position, optimalPosition, this.combatState, character.id);
      if (path && path.length > 1) {
        const maxMovement = Math.floor((character.speed - character.movementUsed) / 5);
        const targetPosition = path[Math.min(maxMovement, path.length - 1)];
        
        return {
          id: `ai_position_${Date.now()}`,
          type: 'move',
          characterId: character.id,
          target: targetPosition,
          path: path.slice(0, maxMovement + 1),
          description: `${character.name} moves to a better position`
        };
      }
    }

    return null;
  }

  /**
   * Caster AI (Mage-like): Use spells, maintain distance
   */
  private generateCasterAction(character: Character): CombatAction | null {
    const targets = this.getEnemyTargets(character);
    if (targets.length === 0) return null;

    // Try to cast a spell first
    const spellAction = this.trySpellAction(character, targets);
    if (spellAction) return spellAction;

    // Fall back to archer-like behavior
    return this.generateArcherAction(character);
  }

  /**
   * Default AI behavior
   */
  private generateDefaultAction(character: Character): CombatAction | null {
    const targets = this.getEnemyTargets(character);
    if (targets.length === 0) return null;

    const closestTarget = this.getClosestTarget(character, targets);
    const distanceToTarget = calculateDistance(character.position, closestTarget.position);

    // Attack if in range
    if (distanceToTarget <= 1) {
      return this.createAttackAction(character, closestTarget);
    }

    // Move towards target
    const path = findPath(character.position, closestTarget.position, this.combatState, character.id);
    if (path && path.length > 1) {
      const maxMovement = Math.floor((character.speed - character.movementUsed) / 5);
      const targetPosition = path[Math.min(maxMovement, path.length - 1)];
      
      return {
        id: `ai_move_${Date.now()}`,
        type: 'move',
        characterId: character.id,
        target: targetPosition,
        path: path.slice(0, maxMovement + 1),
        description: `${character.name} moves toward ${closestTarget.name}`
      };
    }

    return null;
  }

  private generateDefensiveAction(character: Character): CombatAction | null {
    // Implement defensive behavior (healing, buffing, protecting allies)
    return this.generateDefaultAction(character);
  }

  private generateTacticalAction(character: Character): CombatAction | null {
    // Implement tactical behavior (flanking, coordinated attacks)
    return this.generateDefaultAction(character);
  }

  /**
   * Helper methods
   */
  private getEnemyTargets(character: Character): Character[] {
    return this.combatState.characters.filter(c => 
      c.type !== character.type && 
      c.health.current > 0 &&
      c.id !== character.id
    );
  }

  private getClosestTarget(character: Character, targets: Character[]): Character {
    return targets.reduce((closest, target) => {
      const distToCurrent = calculateDistance(character.position, target.position);
      const distToClosest = calculateDistance(character.position, closest.position);
      return distToCurrent < distToClosest ? target : closest;
    });
  }

  private getRangedWeapon(character: Character) {
    const mainHand = character.equipment.mainHand;
    if (mainHand) {
      const weapon = getWeaponById(mainHand.id);
      if (weapon && weapon.category === 'ranged') {
        return weapon;
      }
    }
    return null;
  }

  private findRetreatPosition(character: Character, threat: Character): Position | null {
    const possiblePositions = getPositionsInRange(character.position, 2, this.combatState);
    
    return possiblePositions
      .filter(pos => !this.isPositionOccupied(pos))
      .sort((a, b) => {
        const distA = calculateDistance(a, threat.position);
        const distB = calculateDistance(b, threat.position);
        return distB - distA; // Prefer positions farther from threat
      })[0] || null;
  }

  private findOptimalRangedPosition(character: Character, target: Character): Position | null {
    const rangedWeapon = this.getRangedWeapon(character);
    if (!rangedWeapon) return null;

    const maxRange = Math.floor(rangedWeapon.range.normal / 5);
    const possiblePositions = getPositionsInRange(character.position, 3, this.combatState);
    
    return possiblePositions
      .filter(pos => !this.isPositionOccupied(pos))
      .filter(pos => {
        const distance = calculateDistance(pos, target.position);
        return distance >= 3 && distance <= maxRange;
      })
      .filter(pos => hasLineOfSight(pos, target.position, this.combatState))
      .sort((a, b) => {
        const distA = calculateDistance(a, target.position);
        const distB = calculateDistance(b, target.position);
        return distA - distB; // Prefer closer positions within optimal range
      })[0] || null;
  }

  private isPositionOccupied(position: Position): boolean {
    return this.combatState.characters.some(c => 
      c.position.x === position.x && 
      c.position.y === position.y &&
      c.health.current > 0
    );
  }

  private trySpellAction(character: Character, targets: Character[]): CombatAction | null {
    const availableSpells = character.spells.filter(spell => {
      // Check if character has spell slots for this spell
      const spellSlots = character.resources.spellSlots[spell.level];
      return spellSlots && spellSlots.current > 0;
    });

    if (availableSpells.length === 0) return null;

    // Simple spell selection - prefer damage spells
    const damageSpells = availableSpells.filter(spell => spell.damage);
    if (damageSpells.length > 0) {
      const spell = globalRNG.choice(damageSpells);
      const target = this.getClosestTarget(character, targets);
      
      return {
        id: `ai_spell_${Date.now()}`,
        type: 'spell',
        characterId: character.id,
        target: target.id,
        spellId: spell.id,
        description: `${character.name} casts ${spell.name}`
      };
    }

    return null;
  }

  private createAttackAction(character: Character, target: Character, weaponId?: string): CombatAction {
    return {
      id: `ai_attack_${Date.now()}`,
      type: 'attack',
      characterId: character.id,
      target: target.id,
      weaponId: weaponId || character.equipment.mainHand?.id,
      description: `${character.name} attacks ${target.name}`
    };
  }
}

/**
 * Create AI behavior profiles for different enemy types
 */
export function createOrcBehavior(): import('../core/types.js').AIBehavior {
  return {
    personality: 'aggressive',
    preferredRange: 'melee',
    aggressiveness: 0.9,
    selfPreservation: 0.2,
    teamwork: 0.3,
    spellPriority: 0.1
  };
}

export function createGoblinBehavior(): import('../core/types.js').AIBehavior {
  return {
    personality: 'archer',
    preferredRange: 'ranged',
    aggressiveness: 0.6,
    selfPreservation: 0.8,
    teamwork: 0.7,
    spellPriority: 0.2
  };
}

export function createMageBehavior(): import('../core/types.js').AIBehavior {
  return {
    personality: 'caster',
    preferredRange: 'ranged',
    aggressiveness: 0.4,
    selfPreservation: 0.9,
    teamwork: 0.5,
    spellPriority: 0.9
  };
}