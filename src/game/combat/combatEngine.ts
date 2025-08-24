/**
 * Combat Engine
 * Handles combat mechanics, AI turns, and action resolution
 */

import type { CombatState, Character, CombatAction } from '../core/types.js';
import { EnemyAI } from './ai.js';
import { CombatLogger, rollAttack } from '../systems/combatLog.js';
import { globalRNG } from '../core/rng.js';

export class CombatEngine {
  private combatState: CombatState;
  private logger: CombatLogger;
  private enemyAI: EnemyAI;

  constructor(combatState: CombatState) {
    this.combatState = combatState;
    this.logger = new CombatLogger();
    this.enemyAI = new EnemyAI(combatState);
  }

  /**
   * Initialize combat with proper turn order
   */
  initializeCombat(): void {
    // Roll initiative for all characters
    this.combatState.characters.forEach(character => {
      const dexModifier = Math.floor((character.stats.dexterity - 10) / 2);
      character.initiative = globalRNG.rollDie(20) + dexModifier;
    });

    // Sort by initiative (highest first)
    this.combatState.initiativeOrder = this.combatState.characters
      .sort((a, b) => b.initiative - a.initiative)
      .map(char => char.id);

    this.combatState.currentCharacterId = this.combatState.initiativeOrder[0];
    this.combatState.combatLog = [];

    this.logger.logRoundStart(this.combatState.round);
    this.logger.logTurnStart(this.getCurrentCharacter()!);
  }

  /**
   * Process a combat action
   */
  processAction(action: CombatAction): boolean {
    const character = this.getCharacterById(action.characterId);
    if (!character) return false;

    switch (action.type) {
      case 'move':
        return this.processMovement(character, action);
      case 'attack':
        return this.processAttack(character, action);
      case 'spell':
        return this.processSpell(character, action);
      case 'dash':
        return this.processDash(character);
      case 'dodge':
        return this.processDodge(character);
      default:
        return false;
    }
  }

  /**
   * Process AI turn for enemy characters
   */
  processAITurn(): CombatAction | null {
    const currentCharacter = this.getCurrentCharacter();
    if (!currentCharacter || currentCharacter.type !== 'enemy') {
      return null;
    }

    const action = this.enemyAI.generateAction(currentCharacter);
    if (action) {
      this.processAction(action);
    }

    return action;
  }

  /**
   * End current character's turn and advance to next
   */
  endTurn(): void {
    const currentCharacter = this.getCurrentCharacter();
    if (currentCharacter) {
      // Reset turn-based flags
      currentCharacter.hasUsedAction = false;
      currentCharacter.hasUsedBonusAction = false;
      currentCharacter.hasUsedReaction = false;
      currentCharacter.movementUsed = 0;
    }

    // Advance to next character
    const currentIndex = this.combatState.initiativeOrder.indexOf(this.combatState.currentCharacterId);
    const nextIndex = (currentIndex + 1) % this.combatState.initiativeOrder.length;
    
    this.combatState.currentCharacterId = this.combatState.initiativeOrder[nextIndex];
    this.combatState.turn++;

    // New round if we've cycled through all characters
    if (nextIndex === 0) {
      this.combatState.round++;
      this.logger.logRoundStart(this.combatState.round);
    }

    const nextCharacter = this.getCurrentCharacter();
    if (nextCharacter) {
      this.logger.logTurnStart(nextCharacter);
    }
  }

  /**
   * Check if combat should end
   */
  checkCombatEnd(): 'players' | 'enemies' | null {
    const alivePlayers = this.combatState.characters.filter(c => 
      (c.type === 'player' || c.type === 'companion') && c.health.current > 0
    );
    
    const aliveEnemies = this.combatState.characters.filter(c => 
      c.type === 'enemy' && c.health.current > 0
    );

    if (alivePlayers.length === 0) {
      this.combatState.victor = 'enemies';
      this.combatState.isActive = false;
      return 'enemies';
    }

    if (aliveEnemies.length === 0) {
      this.combatState.victor = 'players';
      this.combatState.isActive = false;
      return 'players';
    }

    return null;
  }

  /**
   * Get current combat log
   */
  getCombatLog() {
    return this.logger.getLog();
  }

  /**
   * Get current combat state
   */
  get currentCombatState(): CombatState {
    return this.combatState;
  }

  /**
   * Private helper methods
   */
  private getCurrentCharacter(): Character | null {
    return this.getCharacterById(this.combatState.currentCharacterId);
  }

  private getCharacterById(id: string): Character | null {
    return this.combatState.characters.find(c => c.id === id) || null;
  }

  private processMovement(character: Character, action: CombatAction): boolean {
    if (!action.target || typeof action.target === 'string') return false;

    const oldPosition = { ...character.position };
    character.position = action.target;
    
    // Calculate movement used (simplified - each square = 5 feet)
    const distance = Math.abs(oldPosition.x - action.target.x) + Math.abs(oldPosition.y - action.target.y);
    character.movementUsed += distance * 5;

    this.logger.logMovement(character, oldPosition, action.target);
    return true;
  }

  private processAttack(character: Character, action: CombatAction): boolean {
    if (!action.target || typeof action.target !== 'string') return false;

    const target = this.getCharacterById(action.target);
    if (!target) return false;

    character.hasUsedAction = true;

    // Roll attack
    const attackResult = rollAttack(character, target, action.weaponId);
    
    // Update action with roll results for logging
    action.attackRoll = attackResult.attackRoll;
    action.targetAC = target.armorClass;
    action.damage = attackResult.damage;

    // Log attack
    this.logger.logAttack(character, target, action, attackResult.hit, attackResult.damage);

    if (attackResult.hit) {
      // Apply damage
      target.health.current = Math.max(0, target.health.current - attackResult.damage);
      this.logger.logDamage(target, attackResult.damage);

      // Check for death
      if (target.health.current === 0) {
        this.logger.logDeath(target);
      }
    }

    return true;
  }

  private processSpell(character: Character, action: CombatAction): boolean {
    if (!action.spellId) return false;

    character.hasUsedAction = true;

    // Find target if specified
    let target: Character | undefined;
    if (action.target && typeof action.target === 'string') {
      target = this.getCharacterById(action.target);
    }

    this.logger.logSpellCast(character, action.spellId, target);

    // Simple spell damage implementation
    if (action.spellId === 'magic_missile' && target) {
      const damage = 3 + Math.floor(Math.random() * 4) + 1; // 1d4+1 per missile, 3 missiles
      target.health.current = Math.max(0, target.health.current - damage);
      this.logger.logDamage(target, damage, 'force');
      
      if (target.health.current === 0) {
        this.logger.logDeath(target);
      }
    } else if (action.spellId === 'firebolt' && target) {
      const damage = Math.floor(Math.random() * 10) + 1; // 1d10
      target.health.current = Math.max(0, target.health.current - damage);
      this.logger.logDamage(target, damage, 'fire');
      
      if (target.health.current === 0) {
        this.logger.logDeath(target);
      }
    }

    return true;
  }

  private processDash(character: Character): boolean {
    character.hasUsedAction = true;
    // Dash doubles movement speed for the turn
    character.speed *= 2;
    return true;
  }

  private processDodge(character: Character): boolean {
    character.hasUsedAction = true;
    // Add dodge status effect (simplified)
    character.statusEffects.push({
      id: 'dodge',
      name: 'Dodging',
      duration: 1,
      effect: {
        type: 'buff',
        modifiers: { ac: 2 }
      }
    });
    return true;
  }
}