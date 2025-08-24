/**
 * D&D 5e SRD Weapons Database
 * Basic weapons with damage, range, and properties
 */

import type { Item } from '../core/types.js';

export interface WeaponData extends Item {
  damage: {
    dice: string;
    type: 'slashing' | 'piercing' | 'bludgeoning';
  };
  range: {
    normal: number;
    long?: number;
  };
  weaponType: 'simple' | 'martial';
  category: 'melee' | 'ranged';
  properties: Array<'light' | 'finesse' | 'versatile' | 'two-handed' | 'heavy' | 'reach' | 'thrown' | 'ammunition'>;
}

export const WEAPONS: Record<string, WeaponData> = {
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    type: 'weapon',
    rarity: 'common',
    value: 2,
    weight: 1,
    damage: {
      dice: '1d4',
      type: 'piercing'
    },
    range: {
      normal: 5,
      long: 20
    },
    weaponType: 'simple',
    category: 'melee',
    properties: ['light', 'finesse', 'thrown'],
    description: 'A simple, versatile blade good for close combat or throwing.',
    properties: {
      damage: { dice: '1d4', type: 'piercing' }
    }
  },

  shortsword: {
    id: 'shortsword',
    name: 'Shortsword',
    type: 'weapon',
    rarity: 'common',
    value: 10,
    weight: 2,
    damage: {
      dice: '1d6',
      type: 'piercing'
    },
    range: {
      normal: 5
    },
    weaponType: 'martial',
    category: 'melee',
    properties: ['light', 'finesse'],
    description: 'A light, quick blade favored by rogues and duelists.',
    properties: {
      damage: { dice: '1d6', type: 'piercing' }
    }
  },

  longsword: {
    id: 'longsword',
    name: 'Longsword',
    type: 'weapon',
    rarity: 'common',
    value: 15,
    weight: 3,
    damage: {
      dice: '1d8',
      type: 'slashing'
    },
    range: {
      normal: 5
    },
    weaponType: 'martial',
    category: 'melee',
    properties: ['versatile'],
    description: 'A classic knightly weapon, effective in one or two hands.',
    properties: {
      damage: { dice: '1d8', type: 'slashing' }
    }
  },

  greataxe: {
    id: 'greataxe',
    name: 'Greataxe',
    type: 'weapon',
    rarity: 'common',
    value: 30,
    weight: 7,
    damage: {
      dice: '1d12',
      type: 'slashing'
    },
    range: {
      normal: 5
    },
    weaponType: 'martial',
    category: 'melee',
    properties: ['two-handed', 'heavy'],
    description: 'A massive two-handed axe that deals devastating damage.',
    properties: {
      damage: { dice: '1d12', type: 'slashing' }
    }
  },

  shortbow: {
    id: 'shortbow',
    name: 'Shortbow',
    type: 'weapon',
    rarity: 'common',
    value: 25,
    weight: 2,
    damage: {
      dice: '1d6',
      type: 'piercing'
    },
    range: {
      normal: 80,
      long: 320
    },
    weaponType: 'simple',
    category: 'ranged',
    properties: ['ammunition', 'two-handed'],
    description: 'A compact bow suitable for quick shots and mobility.',
    properties: {
      damage: { dice: '1d6', type: 'piercing' }
    }
  },

  longbow: {
    id: 'longbow',
    name: 'Longbow',
    type: 'weapon',
    rarity: 'common',
    value: 50,
    weight: 2,
    damage: {
      dice: '1d8',
      type: 'piercing'
    },
    range: {
      normal: 150,
      long: 600
    },
    weaponType: 'martial',
    category: 'ranged',
    properties: ['ammunition', 'heavy', 'two-handed'],
    description: 'A powerful bow with exceptional range and accuracy.',
    properties: {
      damage: { dice: '1d8', type: 'piercing' }
    }
  },

  handaxe: {
    id: 'handaxe',
    name: 'Handaxe',
    type: 'weapon',
    rarity: 'common',
    value: 5,
    weight: 2,
    damage: {
      dice: '1d6',
      type: 'slashing'
    },
    range: {
      normal: 5,
      long: 20
    },
    weaponType: 'simple',
    category: 'melee',
    properties: ['light', 'thrown'],
    description: 'A versatile axe that can be wielded or thrown.',
    properties: {
      damage: { dice: '1d6', type: 'slashing' }
    }
  },

  quarterstaff: {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    type: 'weapon',
    rarity: 'common',
    value: 2,
    weight: 4,
    damage: {
      dice: '1d6',
      type: 'bludgeoning'
    },
    range: {
      normal: 5
    },
    weaponType: 'simple',
    category: 'melee',
    properties: ['versatile'],
    description: 'A simple wooden staff, favored by monks and travelers.',
    properties: {
      damage: { dice: '1d6', type: 'bludgeoning' }
    }
  },

  crossbow_light: {
    id: 'crossbow_light',
    name: 'Light Crossbow',
    type: 'weapon',
    rarity: 'common',
    value: 25,
    weight: 5,
    damage: {
      dice: '1d8',
      type: 'piercing'
    },
    range: {
      normal: 80,
      long: 320
    },
    weaponType: 'simple',
    category: 'ranged',
    properties: ['ammunition', 'light'],
    description: 'A mechanical bow that\'s easy to use and reload.',
    properties: {
      damage: { dice: '1d8', type: 'piercing' }
    }
  },

  warhammer: {
    id: 'warhammer',
    name: 'Warhammer',
    type: 'weapon',
    rarity: 'common',
    value: 15,
    weight: 2,
    damage: {
      dice: '1d8',
      type: 'bludgeoning'
    },
    range: {
      normal: 5
    },
    weaponType: 'martial',
    category: 'melee',
    properties: ['versatile'],
    description: 'A balanced weapon effective against armor.',
    properties: {
      damage: { dice: '1d8', type: 'bludgeoning' }
    }
  }
};

export function getWeaponById(id: string): WeaponData | undefined {
  return WEAPONS[id];
}

export function getWeaponsByCategory(category: 'melee' | 'ranged'): WeaponData[] {
  return Object.values(WEAPONS).filter(weapon => weapon.category === category);
}

export function getWeaponsByType(weaponType: 'simple' | 'martial'): WeaponData[] {
  return Object.values(WEAPONS).filter(weapon => weapon.weaponType === weaponType);
}