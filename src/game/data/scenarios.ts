/**
 * Narrative Scenarios and Story Content
 * Defines the main story scenes and branching narratives
 */

import type { Scene, TextScene, MerchantScene, Character } from '../core/types.js';
import { createOrcBehavior, createGoblinBehavior } from '../combat/ai.js';

/**
 * Main story scenarios with branching narratives
 */
export const STORY_SCENES: Record<string, Scene> = {
  intro: {
    id: 'intro',
    type: 'text',
    data: {
      id: 'intro',
      title: 'The Crossroads Tavern',
      description: `You sit in the dimly lit Crossroads Tavern, nursing a mug of ale. The fire crackles in the hearth as rain patters against the windows. An old man in a weathered cloak approaches your table, his eyes gleaming with urgency.

"Adventurer," he whispers, "I have a proposition that could make you rich... or get you killed. The ancient ruins of Shadowmere Hold have been unsealed. Treasures beyond imagination await, but so do dangers untold."

He slides a crude map across the table. "What say you?"`,
      choices: [
        {
          id: 'accept_quest',
          text: 'Accept the quest and take the map',
          consequences: {
            addItem: 'shadowmere_map',
            nextSceneId: 'forest_path'
          }
        },
        {
          id: 'ask_details',
          text: 'Ask for more details about the ruins',
          consequences: {
            nextSceneId: 'old_man_story'
          }
        },
        {
          id: 'decline_quest',
          text: 'Politely decline and finish your drink',
          consequences: {
            nextSceneId: 'tavern_night'
          }
        }
      ]
    } as TextScene
  },

  old_man_story: {
    id: 'old_man_story',
    type: 'text',
    data: {
      id: 'old_man_story',
      title: 'Tales of Shadowmere',
      description: `The old man leans closer, his voice dropping to barely a whisper.

"Shadowmere Hold was once the fortress of Lord Malachar, a powerful wizard who delved too deep into forbidden magic. When the hold fell, it was sealed by the combined might of three kingdoms. But the seals have weakened..."

He pauses, glancing around nervously. "Strange lights have been seen in the ruins. Merchants report their caravans being attacked by creatures that shouldn't exist. And there are whispers... whispers of a great treasure hidden in the deepest vaults."

The old man's eyes gleam with desperate hope. "I was once a scholar there, before... before everything went wrong. I know the secret ways, the hidden passages. But I'm too old for such adventures now."`,
      choices: [
        {
          id: 'accept_with_knowledge',
          text: 'Accept the quest with his guidance',
          consequences: {
            addItem: 'shadowmere_map',
            addItem: 'scholar_notes',
            nextSceneId: 'forest_path'
          }
        },
        {
          id: 'ask_about_dangers',
          text: 'What kind of dangers should I expect?',
          consequences: {
            nextSceneId: 'danger_warning'
          }
        },
        {
          id: 'decline_after_story',
          text: 'This sounds too dangerous for me',
          consequences: {
            nextSceneId: 'tavern_night'
          }
        }
      ]
    } as TextScene
  },

  forest_path: {
    id: 'forest_path',
    type: 'text',
    data: {
      id: 'forest_path',
      title: 'The Dark Forest',
      description: `You follow the winding forest path toward Shadowmere Hold. Ancient trees tower overhead, their branches forming a canopy so thick that little sunlight reaches the forest floor. The air is heavy with the scent of moss and decay.

As you walk, you hear rustling in the underbrush. Suddenly, a figure emerges from behind a tree - a young woman in leather armor, her hand on her sword hilt.

"Hold there, traveler!" she calls out. "These woods are dangerous. I'm Lyra, a ranger of the Greenwood. I've been tracking a band of goblins that have been terrorizing merchants on this road."`,
      choices: [
        {
          id: 'offer_help',
          text: 'Offer to help her deal with the goblins',
          consequences: {
            nextSceneId: 'goblin_ambush'
          }
        },
        {
          id: 'ask_join',
          text: 'Ask if she wants to join your quest',
          consequences: {
            nextSceneId: 'lyra_considers'
          }
        },
        {
          id: 'continue_alone',
          text: 'Thank her for the warning and continue alone',
          consequences: {
            nextSceneId: 'ruins_approach'
          }
        },
        {
          id: 'cast_light',
          text: '[Cast Light] Illuminate the dark forest',
          condition: (gameState) => {
            return gameState.playerCharacter?.knownSpells.includes('light') || false;
          },
          consequences: {
            castSpell: 'light',
            nextSceneId: 'forest_path_lit'
          }
        }
      ]
    } as TextScene
  },

  forest_path_lit: {
    id: 'forest_path_lit',
    type: 'text',
    data: {
      id: 'forest_path_lit',
      title: 'The Illuminated Path',
      description: `Your magical light reveals hidden details in the forest. Ancient runes are carved into some of the trees, and you notice a hidden path that was previously obscured by shadows.

Lyra looks impressed. "Handy magic, that. The light reveals something interesting - look at those runes. They're warning markers, placed here long ago to warn travelers away from Shadowmere."

She points to the hidden path. "That way leads to a secret entrance to the ruins. Much safer than the main approach, which is likely guarded."`,
      choices: [
        {
          id: 'take_secret_path',
          text: 'Take the secret path with Lyra',
          consequences: {
            addCompanion: createLyraCompanion(),
            nextSceneId: 'secret_entrance'
          }
        },
        {
          id: 'study_runes',
          text: 'Study the warning runes more carefully',
          consequences: {
            nextSceneId: 'rune_knowledge'
          }
        }
      ]
    } as TextScene
  },

  goblin_ambush: {
    id: 'goblin_ambush',
    type: 'combat',
    data: createGoblinAmbushCombat()
  },

  village_merchant: {
    id: 'village_merchant',
    type: 'merchant',
    data: {
      id: 'village_merchant',
      merchantName: 'Gareth the Trader',
      description: `Gareth's wagon is loaded with supplies and weapons. He eyes you with the practiced gaze of someone who knows adventurers when he sees them.

"Welcome, friend! I've got everything an adventurer needs - weapons, armor, potions, and supplies. Just came from the capital, so my prices are fair!"`,
      inventory: [
        { itemId: 'shortsword', quantity: 3, price: 15 },
        { itemId: 'longbow', quantity: 2, price: 75 },
        { itemId: 'leather_armor', quantity: 2, price: 45 },
        { itemId: 'healing_potion', quantity: 5, price: 25 },
        { itemId: 'rope', quantity: 10, price: 2 }
      ],
      buybackRate: 0.5,
      nextSceneId: 'village_square'
    } as MerchantScene
  }
};

/**
 * Create companion characters
 */
function createLyraCompanion(): Character {
  return {
    id: 'companion_lyra',
    name: 'Lyra Greenwood',
    class: 'ranger',
    level: 2,
    experience: 300,
    experienceToNext: 900,
    stats: {
      strength: 13,
      dexterity: 16,
      constitution: 14,
      intelligence: 12,
      wisdom: 15,
      charisma: 11
    },
    health: { current: 18, maximum: 18, temporary: 0 },
    armorClass: 14,
    speed: 30,
    resources: {
      spellSlots: {
        1: { current: 2, maximum: 2 }
      }
    },
    spells: [],
    knownSpells: ['cure_wounds', 'hunter_mark'],
    preparedSpells: ['cure_wounds', 'hunter_mark'],
    inventory: [],
    equipment: {
      mainHand: { id: 'longbow', name: 'Longbow', type: 'weapon', rarity: 'common', value: 50, weight: 2, properties: {}, description: 'A well-crafted longbow' },
      armor: { id: 'leather_armor', name: 'Leather Armor', type: 'armor', rarity: 'common', value: 10, weight: 10, properties: { ac: 11 }, description: 'Flexible leather armor' },
      accessories: []
    },
    gold: 25,
    position: { x: 0, y: 0 },
    type: 'companion',
    aiRole: 'dps',
    statusEffects: [],
    initiative: 0,
    hasUsedAction: false,
    hasUsedBonusAction: false,
    hasUsedReaction: false,
    movementUsed: 0
  };
}

/**
 * Create combat encounters
 */
function createGoblinAmbushCombat(): import('../core/types.js').CombatState {
  const goblin1: Character = {
    id: 'enemy_goblin_1',
    name: 'Goblin Scout',
    class: 'rogue',
    level: 1,
    experience: 0,
    experienceToNext: 300,
    stats: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
    health: { current: 7, maximum: 7, temporary: 0 },
    armorClass: 15,
    speed: 30,
    resources: { spellSlots: {} },
    spells: [],
    knownSpells: [],
    preparedSpells: [],
    inventory: [],
    equipment: {
      mainHand: { id: 'shortbow', name: 'Shortbow', type: 'weapon', rarity: 'common', value: 25, weight: 2, properties: {}, description: 'A goblin shortbow' },
      accessories: []
    },
    gold: 5,
    position: { x: 8, y: 3 },
    type: 'enemy',
    aiBehavior: createGoblinBehavior(),
    statusEffects: [],
    initiative: 0,
    hasUsedAction: false,
    hasUsedBonusAction: false,
    hasUsedReaction: false,
    movementUsed: 0
  };

  const goblin2: Character = {
    ...goblin1,
    id: 'enemy_goblin_2',
    name: 'Goblin Warrior',
    position: { x: 9, y: 5 },
    equipment: {
      mainHand: { id: 'shortsword', name: 'Shortsword', type: 'weapon', rarity: 'common', value: 10, weight: 2, properties: {}, description: 'A rusty shortsword' },
      accessories: []
    }
  };

  return {
    round: 1,
    turn: 1,
    characters: [goblin1, goblin2],
    initiativeOrder: [],
    currentCharacterId: '',
    combatLog: [],
    battlefield: {
      width: 12,
      height: 8,
      obstacles: [
        { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 7, y: 5 }, { x: 8, y: 6 }
      ],
      effects: []
    },
    isActive: true
  };
}

/**
 * Generate Mermaid graph for story flow
 */
export function generateStoryGraph(): string {
  return `
graph TD
    A[Crossroads Tavern] -->|Accept Quest| B[Forest Path]
    A -->|Ask Details| C[Old Man's Story]
    A -->|Decline| D[Tavern Night]
    
    C -->|Accept with Knowledge| B
    C -->|Ask About Dangers| E[Danger Warning]
    C -->|Decline After Story| D
    
    B -->|Offer Help| F[Goblin Ambush]
    B -->|Ask to Join| G[Lyra Considers]
    B -->|Continue Alone| H[Ruins Approach]
    B -->|Cast Light| I[Forest Path Lit]
    
    I -->|Secret Path| J[Secret Entrance]
    I -->|Study Runes| K[Rune Knowledge]
    
    F -->|Victory| L[Lyra Joins Party]
    G -->|She Agrees| L
    
    L --> M[Village Merchant]
    H --> N[Main Entrance]
    J --> O[Underground Tunnels]
    
    M --> P[Shadowmere Hold]
    N --> P
    O --> P
    
    P --> Q[Final Boss Battle]
    Q --> R[Victory & Treasure]
    Q --> S[Defeat & Escape]
  `;
}