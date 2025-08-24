/**
 * Character statistics and ability score calculations
 * Following D&D 5e SRD rules
 */

import type { Stats, Character } from './types.js';

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function getSavingThrowBonus(character: Character, ability: keyof Stats): number {
  const modifier = getModifier(character.stats[ability]);
  const proficiency = getProficiencyBonus(character.level);
  
  // Simplified proficiency system - each class gets specific saves
  const classSaves: Record<string, Array<keyof Stats>> = {
    fighter: ['strength', 'constitution'],
    barbarian: ['strength', 'constitution'],
    paladin: ['wisdom', 'charisma'],
    ranger: ['strength', 'dexterity'],
    rogue: ['dexterity', 'intelligence'],
    bard: ['dexterity', 'charisma'],
    monk: ['strength', 'dexterity'],
    artificer: ['constitution', 'intelligence'],
    sorcerer: ['constitution', 'charisma'],
    wizard: ['intelligence', 'wisdom'],
    warlock: ['wisdom', 'charisma'],
    cleric: ['wisdom', 'charisma']
  };
  
  const isProficient = classSaves[character.class]?.includes(ability) || false;
  return modifier + (isProficient ? proficiency : 0);
}

export function getSkillBonus(character: Character, skill: string): number {
  const skillAbilities: Record<string, keyof Stats> = {
    athletics: 'strength',
    acrobatics: 'dexterity',
    sleightOfHand: 'dexterity',
    stealth: 'dexterity',
    arcana: 'intelligence',
    history: 'intelligence',
    investigation: 'intelligence',
    nature: 'intelligence',
    religion: 'intelligence',
    animalHandling: 'wisdom',
    insight: 'wisdom',
    medicine: 'wisdom',
    perception: 'wisdom',
    survival: 'wisdom',
    deception: 'charisma',
    intimidation: 'charisma',
    performance: 'charisma',
    persuasion: 'charisma'
  };
  
  const ability = skillAbilities[skill];
  if (!ability) return 0;
  
  const modifier = getModifier(character.stats[ability]);
  // Simplified - assume all characters are proficient in class skills
  const proficiency = getProficiencyBonus(character.level);
  
  return modifier + proficiency;
}

export function calculateArmorClass(character: Character): number {
  let baseAC = 10 + getModifier(character.stats.dexterity);
  
  // Armor bonuses
  if (character.equipment.armor) {
    baseAC = character.equipment.armor.properties.ac || baseAC;
  }
  
  if (character.equipment.shield) {
    baseAC += character.equipment.shield.properties.ac || 0;
  }
  
  // Class-specific AC calculations
  if (character.class === 'monk' && !character.equipment.armor) {
    baseAC = 10 + getModifier(character.stats.dexterity) + getModifier(character.stats.wisdom);
  } else if (character.class === 'barbarian' && !character.equipment.armor) {
    baseAC = 10 + getModifier(character.stats.dexterity) + getModifier(character.stats.constitution);
  }
  
  return baseAC;
}

export function calculateHitPoints(character: Character): number {
  const classHitDie: Record<string, number> = {
    fighter: 10,
    barbarian: 12,
    paladin: 10,
    ranger: 10,
    rogue: 8,
    bard: 8,
    monk: 8,
    artificer: 8,
    sorcerer: 6,
    wizard: 6,
    warlock: 8,
    cleric: 8
  };
  
  const hitDie = classHitDie[character.class] || 8;
  const conModifier = getModifier(character.stats.constitution);
  
  // Level 1 gets max HP, subsequent levels get average + con modifier
  const level1HP = hitDie + conModifier;
  const additionalHP = (character.level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier);
  
  return level1HP + additionalHP;
}

export function getSpellcastingAbility(characterClass: string): keyof Stats | null {
  const spellcastingAbilities: Record<string, keyof Stats> = {
    paladin: 'charisma',
    ranger: 'wisdom',
    bard: 'charisma',
    artificer: 'intelligence',
    sorcerer: 'charisma',
    wizard: 'intelligence',
    warlock: 'charisma',
    cleric: 'wisdom'
  };
  
  return spellcastingAbilities[characterClass] || null;
}

export function getSpellSaveDC(character: Character): number {
  const spellcastingAbility = getSpellcastingAbility(character.class);
  if (!spellcastingAbility) return 10;
  
  const abilityModifier = getModifier(character.stats[spellcastingAbility]);
  const proficiencyBonus = getProficiencyBonus(character.level);
  
  return 8 + proficiencyBonus + abilityModifier;
}

export function getSpellAttackBonus(character: Character): number {
  const spellcastingAbility = getSpellcastingAbility(character.class);
  if (!spellcastingAbility) return 0;
  
  const abilityModifier = getModifier(character.stats[spellcastingAbility]);
  const proficiencyBonus = getProficiencyBonus(character.level);
  
  return proficiencyBonus + abilityModifier;
}