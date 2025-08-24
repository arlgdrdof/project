/**
 * Spell System for Out-of-Combat Magic
 * Handles spell effects that can be used outside of combat scenarios
 */

import type { Character, GameState, Spell } from '../core/types.js';
import { SPELLS, getOutOfCombatSpells } from '../data/spells.js';
import { getSpellcastingAbility, getModifier } from '../core/stats.js';

export interface SpellCastResult {
  success: boolean;
  message: string;
  effects: SpellEffect[];
}

export interface SpellEffect {
  type: 'narrative' | 'stat_change' | 'item_gain' | 'scene_unlock';
  data: any;
}

export class OutOfCombatSpellSystem {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Get all spells that can be cast outside of combat
   */
  getAvailableSpells(character: Character): Spell[] {
    return getOutOfCombatSpells().filter(spell => {
      // Check if character knows the spell
      if (!character.knownSpells.includes(spell.id)) {
        return false;
      }

      // Check if character has spell slots (for leveled spells)
      if (spell.level > 0) {
        const spellSlots = character.resources.spellSlots[spell.level];
        return spellSlots && spellSlots.current > 0;
      }

      return true; // Cantrips are always available
    });
  }

  /**
   * Cast a spell outside of combat
   */
  castSpell(character: Character, spellId: string, context?: any): SpellCastResult {
    const spell = SPELLS[spellId];
    if (!spell) {
      return {
        success: false,
        message: 'Spell not found',
        effects: []
      };
    }

    if (!spell.outOfCombat) {
      return {
        success: false,
        message: 'This spell cannot be cast outside of combat',
        effects: []
      };
    }

    // Check if character can cast the spell
    if (!this.canCastSpell(character, spell)) {
      return {
        success: false,
        message: 'You cannot cast this spell right now',
        effects: []
      };
    }

    // Consume spell slot if needed
    if (spell.level > 0) {
      const spellSlots = character.resources.spellSlots[spell.level];
      if (spellSlots) {
        spellSlots.current--;
      }
    }

    // Apply spell effects
    const effects = this.applySpellEffects(character, spell, context);

    return {
      success: true,
      message: `${character.name} casts ${spell.name}`,
      effects
    };
  }

  private canCastSpell(character: Character, spell: Spell): boolean {
    // Check if character knows the spell
    if (!character.knownSpells.includes(spell.id)) {
      return false;
    }

    // Check spell slots for leveled spells
    if (spell.level > 0) {
      const spellSlots = character.resources.spellSlots[spell.level];
      return spellSlots && spellSlots.current > 0;
    }

    return true;
  }

  private applySpellEffects(character: Character, spell: Spell, context?: any): SpellEffect[] {
    const effects: SpellEffect[] = [];

    switch (spell.id) {
      case 'light':
        effects.push({
          type: 'narrative',
          data: {
            message: 'The area is illuminated by magical light, revealing hidden details.',
            narrativeEffects: spell.narrativeEffects
          }
        });
        break;

      case 'mage_armor':
        // Increase AC temporarily
        character.armorClass += 3; // Simplified implementation
        effects.push({
          type: 'stat_change',
          data: {
            stat: 'armorClass',
            change: 3,
            duration: spell.duration
          }
        });
        break;

      case 'cure_wounds':
      case 'healing_word':
        const healingAmount = this.calculateHealing(character, spell);
        character.health.current = Math.min(
          character.health.maximum,
          character.health.current + healingAmount
        );
        effects.push({
          type: 'stat_change',
          data: {
            stat: 'health',
            change: healingAmount
          }
        });
        break;

      case 'detect_magic':
        effects.push({
          type: 'narrative',
          data: {
            message: 'You sense magical auras in the area.',
            narrativeEffects: spell.narrativeEffects
          }
        });
        break;

      case 'prestidigitation':
        effects.push({
          type: 'narrative',
          data: {
            message: 'You perform minor magical tricks.',
            narrativeEffects: spell.narrativeEffects
          }
        });
        break;

      case 'misty_step':
        effects.push({
          type: 'narrative',
          data: {
            message: 'You teleport through the mists to a new location.',
            narrativeEffects: spell.narrativeEffects
          }
        });
        break;

      case 'bless':
        // Apply blessing effect to party members
        effects.push({
          type: 'stat_change',
          data: {
            message: 'Your party feels blessed and more confident.',
            targets: 'party',
            bonus: 'd4 to attack rolls and saves'
          }
        });
        break;

      case 'haste':
        effects.push({
          type: 'stat_change',
          data: {
            message: 'You feel magically quickened.',
            stat: 'speed',
            multiplier: 2,
            duration: spell.duration
          }
        });
        break;

      default:
        effects.push({
          type: 'narrative',
          data: {
            message: `${spell.name} is cast successfully.`,
            narrativeEffects: spell.narrativeEffects || []
          }
        });
    }

    return effects;
  }

  private calculateHealing(character: Character, spell: Spell): number {
    if (!spell.healing) return 0;

    const spellcastingAbility = getSpellcastingAbility(character.class);
    const abilityModifier = spellcastingAbility ? getModifier(character.stats[spellcastingAbility]) : 0;

    // Parse dice string and add ability modifier
    const baseDice = spell.healing.dice;
    // This would use the RNG system to roll dice
    // For now, using average values
    const diceValue = baseDice === '1d4' ? 2.5 : baseDice === '1d8' ? 4.5 : 3;
    
    return Math.floor(diceValue + abilityModifier);
  }

  /**
   * Check if a spell effect applies to current narrative context
   */
  hasNarrativeEffect(spellId: string, effectType: string): boolean {
    const spell = SPELLS[spellId];
    return spell?.narrativeEffects?.includes(effectType) || false;
  }

  /**
   * Get narrative choices unlocked by spells
   */
  getSpellChoices(character: Character, context: string): Array<{
    spellId: string;
    choiceText: string;
    description: string;
  }> {
    const availableSpells = this.getAvailableSpells(character);
    const choices: Array<{ spellId: string; choiceText: string; description: string }> = [];

    for (const spell of availableSpells) {
      if (spell.narrativeEffects) {
        // Context-specific spell choices
        if (context === 'darkness' && spell.narrativeEffects.includes('illuminate_darkness')) {
          choices.push({
            spellId: spell.id,
            choiceText: `[Cast ${spell.name}] Illuminate the area`,
            description: 'Use magic to light up the darkness'
          });
        }
        
        if (context === 'social' && spell.narrativeEffects.includes('impress_npcs')) {
          choices.push({
            spellId: spell.id,
            choiceText: `[Cast ${spell.name}] Impress with magic`,
            description: 'Use magical tricks to influence the conversation'
          });
        }

        if (context === 'exploration' && spell.narrativeEffects.includes('reach_inaccessible_areas')) {
          choices.push({
            spellId: spell.id,
            choiceText: `[Cast ${spell.name}] Teleport across the gap`,
            description: 'Use magic to reach otherwise inaccessible areas'
          });
        }

        if (context === 'investigation' && spell.narrativeEffects.includes('reveal_magic_items')) {
          choices.push({
            spellId: spell.id,
            choiceText: `[Cast ${spell.name}] Detect magical auras`,
            description: 'Sense the presence of magic in the area'
          });
        }
      }
    }

    return choices;
  }
}