/**
 * D&D 5e SRD Character Classes
 * Simplified implementations focusing on core mechanics
 */

import type { CharacterClass, Stats, Resources, Spell } from '../core/types.js';

export interface ClassDefinition {
  name: string;
  hitDie: number;
  primaryAbilities: Array<keyof Stats>;
  savingThrowProficiencies: Array<keyof Stats>;
  spellcaster: boolean;
  spellcastingAbility?: keyof Stats;
  features: Record<number, string[]>;
  spellSlots: Record<number, number[]>;
  knownSpells?: Record<number, number>;
}

export const CLASSES: Record<CharacterClass, ClassDefinition> = {
  fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAbilities: ['strength', 'dexterity'],
    savingThrowProficiencies: ['strength', 'constitution'],
    spellcaster: false,
    features: {
      1: ['Fighting Style', 'Second Wind'],
      2: ['Action Surge'],
      3: ['Martial Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
      6: ['Ability Score Improvement'],
      7: ['Martial Archetype Feature'],
      8: ['Ability Score Improvement'],
      9: ['Indomitable'],
      10: ['Martial Archetype Feature'],
      11: ['Extra Attack (2)'],
      12: ['Ability Score Improvement'],
      13: ['Indomitable (2)'],
      14: ['Ability Score Improvement'],
      15: ['Martial Archetype Feature'],
      16: ['Ability Score Improvement'],
      17: ['Action Surge (2)', 'Indomitable (3)'],
      18: ['Martial Archetype Feature'],
      19: ['Ability Score Improvement'],
      20: ['Extra Attack (3)']
    },
    spellSlots: {}
  },
  
  barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbilities: ['strength'],
    savingThrowProficiencies: ['strength', 'constitution'],
    spellcaster: false,
    features: {
      1: ['Rage', 'Unarmored Defense'],
      2: ['Reckless Attack', 'Danger Sense'],
      3: ['Primal Path'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack', 'Fast Movement'],
      6: ['Path Feature'],
      7: ['Feral Instinct'],
      8: ['Ability Score Improvement'],
      9: ['Brutal Critical'],
      10: ['Path Feature'],
      11: ['Relentless Rage'],
      12: ['Ability Score Improvement'],
      13: ['Brutal Critical (2)'],
      14: ['Path Feature'],
      15: ['Persistent Rage'],
      16: ['Ability Score Improvement'],
      17: ['Brutal Critical (3)'],
      18: ['Indomitable Might'],
      19: ['Ability Score Improvement'],
      20: ['Primal Champion']
    },
    spellSlots: {}
  },
  
  wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAbilities: ['intelligence'],
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    spellcaster: true,
    spellcastingAbility: 'intelligence',
    features: {
      1: ['Spellcasting', 'Arcane Recovery'],
      2: ['Arcane Tradition'],
      3: ['Cantrip Formulas'],
      4: ['Ability Score Improvement'],
      5: ['Arcane Tradition Feature'],
      6: ['Arcane Tradition Feature'],
      7: ['Arcane Tradition Feature'],
      8: ['Ability Score Improvement'],
      9: ['Arcane Tradition Feature'],
      10: ['Arcane Tradition Feature'],
      11: ['Spell Mastery'],
      12: ['Ability Score Improvement'],
      13: ['Arcane Tradition Feature'],
      14: ['Arcane Tradition Feature'],
      15: ['Arcane Tradition Feature'],
      16: ['Ability Score Improvement'],
      17: ['Arcane Tradition Feature'],
      18: ['Spell Mastery Improvement'],
      19: ['Ability Score Improvement'],
      20: ['Signature Spells']
    },
    spellSlots: {
      1: [2],
      2: [3],
      3: [4, 2],
      4: [4, 3],
      5: [4, 3, 2],
      6: [4, 3, 3],
      7: [4, 3, 3, 1],
      8: [4, 3, 3, 2],
      9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2],
      11: [4, 3, 3, 3, 2, 1],
      12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1],
      14: [4, 3, 3, 3, 2, 1, 1],
      15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1],
      17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
      18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
      20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    }
  },
  
  cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAbilities: ['wisdom'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    spellcaster: true,
    spellcastingAbility: 'wisdom',
    features: {
      1: ['Spellcasting', 'Divine Domain'],
      2: ['Channel Divinity', 'Divine Domain Feature'],
      3: ['Channel Divinity (2)'],
      4: ['Ability Score Improvement'],
      5: ['Destroy Undead (CR 1/2)'],
      6: ['Channel Divinity (2)', 'Divine Domain Feature'],
      7: ['Channel Divinity (3)'],
      8: ['Ability Score Improvement', 'Divine Domain Feature', 'Destroy Undead (CR 1)'],
      9: ['Destroy Undead (CR 2)'],
      10: ['Divine Intervention'],
      11: ['Destroy Undead (CR 3)'],
      12: ['Ability Score Improvement'],
      13: ['Destroy Undead (CR 4)'],
      14: ['Destroy Undead (CR 5)'],
      15: ['Channel Divinity (3)'],
      16: ['Ability Score Improvement'],
      17: ['Destroy Undead (CR 6)', 'Divine Domain Feature'],
      18: ['Channel Divinity (4)'],
      19: ['Ability Score Improvement'],
      20: ['Divine Intervention Improvement']
    },
    spellSlots: {
      1: [2],
      2: [3],
      3: [4, 2],
      4: [4, 3],
      5: [4, 3, 2],
      6: [4, 3, 3],
      7: [4, 3, 3, 1],
      8: [4, 3, 3, 2],
      9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2],
      11: [4, 3, 3, 3, 2, 1],
      12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1],
      14: [4, 3, 3, 3, 2, 1, 1],
      15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1],
      17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
      18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
      20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    }
  },
  
  rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAbilities: ['dexterity'],
    savingThrowProficiencies: ['dexterity', 'intelligence'],
    spellcaster: false,
    features: {
      1: ['Expertise', 'Sneak Attack', 'Thieves\' Cant'],
      2: ['Cunning Action'],
      3: ['Roguish Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Uncanny Dodge'],
      6: ['Expertise'],
      7: ['Evasion'],
      8: ['Ability Score Improvement'],
      9: ['Roguish Archetype Feature'],
      10: ['Ability Score Improvement'],
      11: ['Reliable Talent'],
      12: ['Ability Score Improvement'],
      13: ['Roguish Archetype Feature'],
      14: ['Blindsense'],
      15: ['Slippery Mind'],
      16: ['Ability Score Improvement'],
      17: ['Roguish Archetype Feature'],
      18: ['Elusive'],
      19: ['Ability Score Improvement'],
      20: ['Stroke of Luck']
    },
    spellSlots: {}
  },

  // Adding remaining classes with simplified data
  paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAbilities: ['strength', 'charisma'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    spellcaster: true,
    spellcastingAbility: 'charisma',
    features: {
      1: ['Divine Sense', 'Lay on Hands'],
      2: ['Fighting Style', 'Spellcasting', 'Divine Smite'],
      3: ['Divine Health', 'Sacred Oath'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
      6: ['Aura of Protection'],
      10: ['Aura of Courage'],
      11: ['Improved Divine Smite'],
      18: ['Aura Improvements'],
      20: ['Sacred Oath Capstone']
    },
    spellSlots: {
      2: [2],
      3: [3],
      4: [3],
      5: [4, 2],
      6: [4, 2],
      7: [4, 3],
      8: [4, 3],
      9: [4, 3, 2],
      10: [4, 3, 2],
      11: [4, 3, 3],
      12: [4, 3, 3],
      13: [4, 3, 3, 1],
      14: [4, 3, 3, 1],
      15: [4, 3, 3, 2],
      16: [4, 3, 3, 2],
      17: [4, 3, 3, 3, 1],
      18: [4, 3, 3, 3, 1],
      19: [4, 3, 3, 3, 2],
      20: [4, 3, 3, 3, 2]
    }
  },

  ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAbilities: ['dexterity', 'wisdom'],
    savingThrowProficiencies: ['strength', 'dexterity'],
    spellcaster: true,
    spellcastingAbility: 'wisdom',
    features: {
      1: ['Favored Enemy', 'Natural Explorer'],
      2: ['Fighting Style', 'Spellcasting'],
      3: ['Ranger Archetype'],
      5: ['Extra Attack'],
      14: ['Favored Enemy Improvement'],
      20: ['Foe Slayer']
    },
    spellSlots: {
      2: [2],
      3: [3],
      4: [3],
      5: [4, 2],
      6: [4, 2],
      7: [4, 3],
      8: [4, 3],
      9: [4, 3, 2],
      10: [4, 3, 2],
      11: [4, 3, 3],
      12: [4, 3, 3],
      13: [4, 3, 3, 1],
      14: [4, 3, 3, 1],
      15: [4, 3, 3, 2],
      16: [4, 3, 3, 2],
      17: [4, 3, 3, 3, 1],
      18: [4, 3, 3, 3, 1],
      19: [4, 3, 3, 3, 2],
      20: [4, 3, 3, 3, 2]
    }
  },

  bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAbilities: ['charisma'],
    savingThrowProficiencies: ['dexterity', 'charisma'],
    spellcaster: true,
    spellcastingAbility: 'charisma',
    features: {
      1: ['Bardic Inspiration', 'Spellcasting'],
      2: ['Jack of All Trades', 'Song of Rest'],
      3: ['Bard College', 'Expertise'],
      4: ['Ability Score Improvement'],
      5: ['Bardic Inspiration Die Improvement', 'Font of Inspiration'],
      6: ['Countercharm', 'Bard College Feature'],
      10: ['Bardic Inspiration Die Improvement', 'Magical Secrets'],
      15: ['Bardic Inspiration Die Improvement'],
      20: ['Superior Inspiration']
    },
    spellSlots: {
      1: [2],
      2: [3],
      3: [4, 2],
      4: [4, 3],
      5: [4, 3, 2],
      6: [4, 3, 3],
      7: [4, 3, 3, 1],
      8: [4, 3, 3, 2],
      9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2],
      11: [4, 3, 3, 3, 2, 1],
      12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1],
      14: [4, 3, 3, 3, 2, 1, 1],
      15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1],
      17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
      18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
      20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    },
    knownSpells: {
      1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
      11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
    }
  },

  monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAbilities: ['dexterity', 'wisdom'],
    savingThrowProficiencies: ['strength', 'dexterity'],
    spellcaster: false,
    features: {
      1: ['Unarmored Defense', 'Martial Arts'],
      2: ['Ki', 'Unarmored Movement'],
      3: ['Monastic Tradition', 'Deflect Missiles'],
      4: ['Ability Score Improvement', 'Slow Fall'],
      5: ['Extra Attack', 'Stunning Strike'],
      6: ['Ki-Empowered Strikes', 'Monastic Tradition Feature'],
      7: ['Evasion', 'Stillness of Mind'],
      8: ['Ability Score Improvement'],
      9: ['Unarmored Movement Improvement'],
      10: ['Purity of Body'],
      11: ['Monastic Tradition Feature'],
      13: ['Tongue of the Sun and Moon'],
      14: ['Diamond Soul'],
      15: ['Timeless Body'],
      17: ['Monastic Tradition Feature'],
      18: ['Empty Body'],
      20: ['Perfect Self']
    },
    spellSlots: {}
  },

  artificer: {
    name: 'Artificer',
    hitDie: 8,
    primaryAbilities: ['intelligence'],
    savingThrowProficiencies: ['constitution', 'intelligence'],
    spellcaster: true,
    spellcastingAbility: 'intelligence',
    features: {
      1: ['Magical Tinkering', 'Spellcasting'],
      2: ['Infuse Item'],
      3: ['Artificer Specialist'],
      5: ['Artificer Specialist Feature'],
      6: ['Tool Expertise'],
      9: ['Artificer Specialist Feature'],
      10: ['Magic Item Adept'],
      11: ['Spell-Storing Item'],
      14: ['Magic Item Savant'],
      15: ['Artificer Specialist Feature'],
      18: ['Magic Item Master'],
      20: ['Soul of Artifice']
    },
    spellSlots: {
      1: [2],
      2: [2],
      3: [3],
      4: [3],
      5: [4, 2],
      6: [4, 2],
      7: [4, 3],
      8: [4, 3],
      9: [4, 3, 2],
      10: [4, 3, 2],
      11: [4, 3, 3],
      12: [4, 3, 3],
      13: [4, 3, 3, 1],
      14: [4, 3, 3, 1],
      15: [4, 3, 3, 2],
      16: [4, 3, 3, 2],
      17: [4, 3, 3, 3, 1],
      18: [4, 3, 3, 3, 1],
      19: [4, 3, 3, 3, 2],
      20: [4, 3, 3, 3, 2]
    }
  },

  sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbilities: ['charisma'],
    savingThrowProficiencies: ['constitution', 'charisma'],
    spellcaster: true,
    spellcastingAbility: 'charisma',
    features: {
      1: ['Spellcasting', 'Sorcerous Origin'],
      2: ['Font of Magic'],
      3: ['Metamagic'],
      4: ['Ability Score Improvement'],
      6: ['Sorcerous Origin Feature'],
      10: ['Metamagic'],
      14: ['Sorcerous Origin Feature'],
      17: ['Metamagic'],
      18: ['Sorcerous Origin Feature'],
      20: ['Sorcerous Restoration']
    },
    spellSlots: {
      1: [2],
      2: [3],
      3: [4, 2],
      4: [4, 3],
      5: [4, 3, 2],
      6: [4, 3, 3],
      7: [4, 3, 3, 1],
      8: [4, 3, 3, 2],
      9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2],
      11: [4, 3, 3, 3, 2, 1],
      12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1],
      14: [4, 3, 3, 3, 2, 1, 1],
      15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1],
      17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
      18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
      20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    },
    knownSpells: {
      1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
      11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15
    }
  },

  warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAbilities: ['charisma'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    spellcaster: true,
    spellcastingAbility: 'charisma',
    features: {
      1: ['Otherworldly Patron', 'Pact Magic'],
      2: ['Eldritch Invocations'],
      3: ['Pact Boon'],
      4: ['Ability Score Improvement'],
      5: ['Eldritch Invocation'],
      6: ['Otherworldly Patron Feature'],
      7: ['Eldritch Invocation'],
      9: ['Eldritch Invocation'],
      10: ['Otherworldly Patron Feature'],
      11: ['Mystic Arcanum (6th level)'],
      12: ['Ability Score Improvement', 'Eldritch Invocation'],
      13: ['Mystic Arcanum (7th level)'],
      14: ['Otherworldly Patron Feature'],
      15: ['Mystic Arcanum (8th level)', 'Eldritch Invocation'],
      17: ['Mystic Arcanum (9th level)'],
      18: ['Eldritch Invocation'],
      20: ['Eldritch Master']
    },
    spellSlots: {
      1: [1], 2: [2], 3: [2], 4: [2], 5: [2], 6: [2], 7: [2], 8: [2], 9: [2], 10: [2],
      11: [3], 12: [3], 13: [3], 14: [3], 15: [3], 16: [3], 17: [4], 18: [4], 19: [4], 20: [4]
    },
    knownSpells: {
      1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
      11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15
    }
  }
};

export function getClassFeatures(characterClass: CharacterClass, level: number): string[] {
  const classData = CLASSES[characterClass];
  const features: string[] = [];
  
  for (let i = 1; i <= level; i++) {
    if (classData.features[i]) {
      features.push(...classData.features[i]);
    }
  }
  
  return features;
}

export function getSpellSlots(characterClass: CharacterClass, level: number): number[] {
  const classData = CLASSES[characterClass];
  return classData.spellSlots[level] || [];
}

export function getKnownSpells(characterClass: CharacterClass, level: number): number {
  const classData = CLASSES[characterClass];
  return classData.knownSpells?.[level] || 0;
}