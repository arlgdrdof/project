/**
 * D&D 5e SRD Spells Database
 * Focused on core combat and utility spells for MVP
 */

import type { Spell } from '../core/types.js';

export const SPELLS: Record<string, Spell> = {
  // Cantrips (Level 0)
  firebolt: {
    id: 'firebolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: 'action',
    range: 120,
    duration: 0,
    concentration: false,
    damage: {
      dice: '1d10',
      type: 'fire'
    },
    description: 'A mote of fire streaks toward a creature within range. Make a ranged spell attack. On hit, the target takes fire damage.'
  },

  magicMissile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: 'action',
    range: 120,
    duration: 0,
    concentration: false,
    damage: {
      dice: '1d4+1',
      type: 'force'
    },
    description: 'Three darts of magical force hit their targets automatically, each dealing force damage.'
  },

  healingWord: {
    id: 'healing_word',
    name: 'Healing Word',
    level: 1,
    school: 'evocation',
    castingTime: 'bonus_action',
    range: 60,
    duration: 0,
    concentration: false,
    healing: {
      dice: '1d4'
    },
    description: 'A creature regains hit points equal to the roll plus your spellcasting ability modifier.'
  },

  cureWounds: {
    id: 'cure_wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'evocation',
    castingTime: 'action',
    range: 5,
    duration: 0,
    concentration: false,
    healing: {
      dice: '1d8'
    },
    description: 'Touch a creature to heal its wounds. The target regains hit points.'
  },

  shield: {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'abjuration',
    castingTime: 'reaction',
    range: 0,
    duration: 1,
    concentration: false,
    description: 'An invisible barrier springs into existence, granting +5 AC until the start of your next turn.',
    outOfCombat: false,
  },

  burningHands: {
    id: 'burning_hands',
    name: 'Burning Hands',
    level: 1,
    school: 'evocation',
    light: {
      id: 'light',
      name: 'Light',
      level: 0,
      school: 'evocation',
      castingTime: 'action',
      range: 5,
      duration: 3600,
      concentration: false,
      outOfCombat: true,
      narrativeEffects: ['illuminate_darkness', 'reveal_hidden_paths', 'scare_creatures'],
      description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius.'
    },

    prestidigitation: {
      id: 'prestidigitation',
      name: 'Prestidigitation',
      level: 0,
      school: 'transmutation',
      castingTime: 'action',
      range: 10,
      duration: 3600,
      concentration: false,
      outOfCombat: true,
      narrativeEffects: ['impress_npcs', 'distract_guards', 'clean_items', 'create_minor_illusions'],
      description: 'This spell is a minor magical trick that novice spellcasters use for practice.'
    },

    castingTime: 'action',
    range: 15,
    duration: 0,
    concentration: false,
    damage: {
      dice: '3d6',
      type: 'fire'
    },
    areaOfEffect: {
      outOfCombat: false,
      type: 'cone',
      size: 15
    },
    saveType: 'dexterity',
    description: 'A thin sheet of flames shoots forth, dealing fire damage to creatures in a 15-foot cone.'
  },

  holdPerson: {
    id: 'hold_person',
    name: 'Hold Person',
    level: 2,
    school: 'enchantment',
    castingTime: 'action',
    range: 60,
    duration: 60,
    concentration: true,
    outOfCombat: true,
    saveType: 'wisdom',
    description: 'Target humanoid must succeed on a Wisdom save or be paralyzed for the duration.'
  },

  fireball: {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: 'action',
    range: 150,
    duration: 0,
    concentration: false,
    damage: {
      dice: '8d6',
      outOfCombat: true,
      type: 'fire'
    },
    areaOfEffect: {
      type: 'sphere',
      size: 20
    },
    saveType: 'dexterity',
    description: 'A bright flash of fire expands from a point within range, dealing fire damage in a 20-foot radius.'
  },

  lightningBolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    level: 3,
    school: 'evocation',
    outOfCombat: false,
    castingTime: 'action',
    range: 100,
    duration: 0,
    mageArmor: {
      id: 'mage_armor',
      name: 'Mage Armor',
      level: 1,
      school: 'abjuration',
      castingTime: 'action',
      range: 5,
      duration: 28800,
      concentration: false,
      outOfCombat: true,
      narrativeEffects: ['increase_ac'],
      description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dex modifier.'
    },

    detectMagic: {
      id: 'detect_magic',
      name: 'Detect Magic',
      level: 1,
      school: 'divination',
      castingTime: 'action',
      range: 30,
      duration: 600,
      concentration: true,
      outOfCombat: true,
      narrativeEffects: ['reveal_magic_items', 'detect_illusions', 'find_secret_doors'],
      description: 'For the duration, you sense the presence of magic within 30 feet of you.'
    },

    concentration: false,
    damage: {
      dice: '8d6',
      type: 'lightning'
    },
    areaOfEffect: {
      type: 'line',
      size: 100
    },
    outOfCombat: false,
    saveType: 'dexterity',
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you.'
  },

  bless: {
    id: 'bless',
    name: 'Bless',
    level: 1,
    school: 'enchantment',
    castingTime: 'action',
    range: 30,
    duration: 600,
    concentration: true,
    description: 'Up to three creatures add 1d4 to attack rolls and saving throws for the duration.'
  },

  spiritualWeapon: {
    id: 'spiritual_weapon',
    name: 'Spiritual Weapon',
    level: 2,
    school: 'evocation',
    outOfCombat: false,
    castingTime: 'bonus_action',
    range: 60,
    duration: 600,
    concentration: false,
    damage: {
      dice: '1d8',
      type: 'force'
    },
    description: 'Create a floating spectral weapon that can attack enemies as a bonus action.'
  },

  web: {
    id: 'web',
    outOfCombat: false,
    name: 'Web',
    level: 2,
    school: 'conjuration',
    castingTime: 'action',
    range: 60,
    duration: 600,
    concentration: true,
    areaOfEffect: {
      type: 'cube',
      size: 20
    },
    saveType: 'dexterity',
    description: 'Thick, sticky webbing fills a 20-foot cube, restraining creatures that fail their save.'
  },

  mistyStep: {
    id: 'misty_step',
    name: 'Misty Step',
    level: 2,
    school: 'conjuration',
    castingTime: 'bonus_action',
    outOfCombat: false,
    range: 30,
    duration: 0,
    concentration: false,
    description: 'Teleport up to 30 feet to an unoccupied space you can see.'
  },

  counterspell: {
    id: 'counterspell',
    name: 'Counterspell',
    level: 3,
    school: 'abjuration',
    castingTime: 'reaction',
    range: 60,
    duration: 0,
    concentration: false,
    description: 'Attempt to interrupt a creature in the process of casting a spell.'
  },

  haste: {
    id: 'haste',
    name: 'Haste',
    outOfCombat: true,
    level: 3,
    school: 'transmutation',
    castingTime: 'action',
    range: 30,
    duration: 600,
    concentration: true,
    description: 'Target gains doubled speed, +2 AC, advantage on Dex saves, and an additional action each turn.'
  }
};

export function getOutOfCombatSpells(): Spell[] {
  return Object.values(SPELLS).filter(spell => spell.outOfCombat);
}

export function getSpellsWithNarrativeEffects(): Spell[] {
  return Object.values(SPELLS).filter(spell => spell.narrativeEffects && spell.narrativeEffects.length > 0);
}

export function getSpellsByClass(characterClass: string, level: number): Spell[] {
  const classSpellLists: Record<string, string[]> = {
    wizard: [
      'firebol', 'magic_missile', 'shield', 'burning_hands', 'hold_person',
      'web', 'misty_step', 'fireball', 'lightning_bolt', 'counterspell', 'haste'
    ],
    cleric: [
      'healing_word', 'cure_wounds', 'bless', 'spiritual_weapon'
    ],
    sorcerer: [
      'firebol', 'magic_missile', 'shield', 'burning_hands', 'hold_person',
      'misty_step', 'fireball', 'lightning_bolt', 'counterspell', 'haste'
    ],
    bard: [
      'healing_word', 'cure_wounds', 'hold_person', 'web', 'misty_step', 'counterspell'
    ],
    warlock: [
      'firebol', 'magic_missile', 'burning_hands', 'hold_person', 'misty_step', 'fireball', 'counterspell'
    ],
    paladin: [
      'cure_wounds', 'bless'
    ],
    ranger: [
      'cure_wounds', 'web'
    ],
    artificer: [
      'cure_wounds', 'shield', 'web'
    ]
  };

  const availableSpells = classSpellLists[characterClass] || [];
  return availableSpells
    .map(id => SPELLS[id])
    .filter(spell => spell && spell.level <= Math.ceil(level / 2));
}

export function getCantrips(characterClass: string): Spell[] {
  return getSpellsByClass(characterClass, 1).filter(spell => spell.level === 0);
}

export function getSpellDamage(spell: Spell, casterLevel: number, spellSlotLevel: number = spell.level): number {
  if (!spell.damage && !spell.healing) return 0;

  const baseDice = spell.damage?.dice || spell.healing?.dice || '1d4';

  // Handle scaling spells
  let scaledDice = baseDice;
  if (spell.level === 0) {
    // Cantrips scale with character level
    const cantripScaling = Math.floor((casterLevel + 1) / 6);
    if (cantripScaling > 0) {
      scaledDice = scaledDice.replace(/(\d+)d/, `${parseInt(scaledDice.match(/(\d+)d/)?.[1] || '1') + cantripScaling}d`);
    }
  } else {
    // Higher level spell slots
    const extraLevels = spellSlotLevel - spell.level;
    // Most damage spells add 1 die per extra level
    scaledDice = scaledDice.replace(/(\d+)d/, `${parseInt(scaledDice.match(/(\d+)d/)?.[1] || '1') + extraLevels}d`);
  }

  return parseInt(scaledDice) || 1;
}