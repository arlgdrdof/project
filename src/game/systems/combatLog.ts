/**
 * Combat Log System
 * Handles detailed logging of all combat actions and events
 */

import type { CombatLogEntry, Character, CombatAction } from '../core/types.js';
import { globalRNG } from '../core/rng.js';
import { getModifier } from '../core/stats.js';
import { getWeaponById } from '../data/weapons.js';
import { SPELLS } from '../data/spells.js';

export class CombatLogger {
  private log: CombatLogEntry[] = [];

  getLog(): CombatLogEntry[] {
    return [...this.log];
  }

  clearLog(): void {
    this.log = [];
  }

  logTurnStart(character: Character): void {
    this.addEntry({
      type: 'turn',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name}'s turn begins`
    });
  }

  logRoundStart(round: number): void {
    this.addEntry({
      type: 'round',
      characterId: '',
      characterName: '',
      message: `Round ${round} begins`
    });
  }

  logMovement(character: Character, fromPosition: import('../core/types.js').Position, toPosition: import('../core/types.js').Position): void {
    this.addEntry({
      type: 'move',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name} moves from (${fromPosition.x}, ${fromPosition.y}) to (${toPosition.x}, ${toPosition.y})`,
      details: {
        fromPosition,
        toPosition
      }
    });
  }

  logAttack(attacker: Character, target: Character, action: CombatAction, hit: boolean, damage?: number): void {
    const weapon = action.weaponId ? getWeaponById(action.weaponId) : null;
    const weaponName = weapon?.name || 'unarmed strike';
    
    if (hit) {
      this.addEntry({
        type: 'attack',
        characterId: attacker.id,
        characterName: attacker.name,
        message: `${attacker.name} hits ${target.name} with ${weaponName} for ${damage} damage`,
        details: {
          targetId: target.id,
          targetName: target.name,
          weaponName,
          damage,
          attackRoll: action.attackRoll
        }
      });
    } else {
      this.addEntry({
        type: 'attack',
        characterId: attacker.id,
        characterName: attacker.name,
        message: `${attacker.name} misses ${target.name} with ${weaponName} (rolled ${action.attackRoll} vs AC ${action.targetAC})`,
        details: {
          targetId: target.id,
          targetName: target.name,
          weaponName,
          attackRoll: action.attackRoll,
          targetAC: action.targetAC
        }
      });
    }
  }

  logSpellCast(caster: Character, spellId: string, target?: Character): void {
    const spell = SPELLS[spellId];
    if (!spell) return;

    const targetText = target ? ` on ${target.name}` : '';
    this.addEntry({
      type: 'spell',
      characterId: caster.id,
      characterName: caster.name,
      message: `${caster.name} casts ${spell.name}${targetText}`,
      details: {
        spellName: spell.name,
        targetId: target?.id,
        targetName: target?.name
      }
    });
  }

  logDamage(character: Character, damage: number, damageType?: string): void {
    const typeText = damageType ? ` ${damageType}` : '';
    this.addEntry({
      type: 'damage',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name} takes ${damage}${typeText} damage`,
      details: {
        damage
      }
    });
  }

  logHealing(character: Character, healing: number): void {
    this.addEntry({
      type: 'heal',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name} recovers ${healing} hit points`,
      details: {
        damage: healing // Reuse damage field for healing amount
      }
    });
  }

  logStatusEffect(character: Character, effectName: string, applied: boolean): void {
    const action = applied ? 'gains' : 'loses';
    this.addEntry({
      type: 'status',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name} ${action} ${effectName}`
    });
  }

  logDeath(character: Character): void {
    this.addEntry({
      type: 'status',
      characterId: character.id,
      characterName: character.name,
      message: `${character.name} falls unconscious`
    });
  }

  private addEntry(entry: Omit<CombatLogEntry, 'id' | 'timestamp'>): void {
    this.log.push({
      id: `log_${Date.now()}_${globalRNG.nextInt(1000, 9999)}`,
      timestamp: Date.now(),
      ...entry
    });

    // Keep log size manageable
    if (this.log.length > 100) {
      this.log = this.log.slice(-50);
    }
  }
}

/**
 * Calculate attack roll and determine hit/miss
 */
export function rollAttack(attacker: Character, target: Character, weaponId?: string): {
  hit: boolean;
  attackRoll: number;
  damage: number;
} {
  const weapon = weaponId ? getWeaponById(weaponId) : null;
  
  // Calculate attack bonus
  let attackBonus = getModifier(attacker.stats.strength); // Default to STR
  if (weapon?.properties.includes('finesse')) {
    attackBonus = Math.max(getModifier(attacker.stats.strength), getModifier(attacker.stats.dexterity));
  } else if (weapon?.category === 'ranged') {
    attackBonus = getModifier(attacker.stats.dexterity);
  }
  
  // Add proficiency bonus (simplified - assume all characters are proficient)
  attackBonus += Math.ceil(attacker.level / 4) + 1;
  
  // Roll attack
  const d20Roll = globalRNG.rollDie(20);
  const attackRoll = d20Roll + attackBonus;
  const hit = attackRoll >= target.armorClass;
  
  let damage = 0;
  if (hit) {
    // Calculate damage
    const damageDice = weapon?.damage?.dice || '1d4';
    damage = globalRNG.parseDiceString(damageDice);
    
    // Add ability modifier to damage
    if (weapon?.category === 'ranged') {
      damage += getModifier(attacker.stats.dexterity);
    } else {
      damage += getModifier(attacker.stats.strength);
    }
    
    damage = Math.max(1, damage); // Minimum 1 damage
    
    // Critical hit on natural 20
    if (d20Roll === 20) {
      const critDamage = globalRNG.parseDiceString(damageDice);
      damage += critDamage;
    }
  }
  
  return { hit, attackRoll, damage };
}