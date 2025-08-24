/**
 * Core type definitions for the D&D Tactical RPG
 * Following D&D 5e SRD mechanics with simplified implementations
 */

export type Die = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Health {
  current: number;
  maximum: number;
  temporary: number;
}

export interface Resources {
  spellSlots: Record<number, { current: number; maximum: number }>;
  actionSurge?: { current: number; maximum: number };
  rageUses?: { current: number; maximum: number };
  bardInspiration?: { current: number; maximum: number };
  channelDivinity?: { current: number; maximum: number };
  kiPoints?: { current: number; maximum: number };
  sorceryPoints?: { current: number; maximum: number };
  warlockSlots?: { current: number; maximum: number };
}

export type CharacterClass = 
  | 'fighter' | 'barbarian' | 'paladin' | 'ranger' 
  | 'rogue' | 'bard' | 'monk' | 'artificer'
  | 'sorcerer' | 'wizard' | 'warlock' | 'cleric';

export type CreatureType = 'player' | 'companion' | 'enemy';

export type AIRole = 'tank' | 'dps' | 'support' | 'controller';

export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  effect: {
    type: 'buff' | 'debuff' | 'neutral';
    modifiers: Partial<Stats & { ac: number; speed: number; damage: number }>;
    conditions?: Array<'prone' | 'unconscious' | 'charmed' | 'frightened' | 'paralyzed' | 'stunned' | 'poisoned'>;
  };
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: 'abjuration' | 'conjuration' | 'divination' | 'enchantment' | 'evocation' | 'illusion' | 'necromancy' | 'transmutation';
  castingTime: 'action' | 'bonus_action' | 'reaction' | 'ritual';
  range: number;
  duration: number;
  concentration: boolean;
  damage?: {
    dice: string;
    type: 'fire' | 'cold' | 'lightning' | 'acid' | 'poison' | 'necrotic' | 'radiant' | 'force' | 'psychic' | 'thunder';
  };
  healing?: {
    dice: string;
  };
  areaOfEffect?: {
    type: 'cone' | 'sphere' | 'line' | 'cube';
    size: number;
  };
  saveType?: keyof Stats;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'material' | 'treasure';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  value: number;
  weight: number;
  properties: {
    damage?: { dice: string; type: string };
    ac?: number;
    modifiers?: Partial<Stats & { ac: number; speed: number; xp_bonus: number }>;
    consumable?: boolean;
    stackable?: boolean;
  };
  description: string;
}

export interface Equipment {
  mainHand?: Item;
  offHand?: Item;
  armor?: Item;
  shield?: Item;
  accessories: Item[];
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNext: number;
  
  stats: Stats;
  health: Health;
  armorClass: number;
  speed: number;
  
  resources: Resources;
  spells: Spell[];
  knownSpells: string[];
  preparedSpells: string[];
  
  inventory: Item[];
  equipment: Equipment;
  gold: number;
  
  position: Position;
  type: CreatureType;
  aiRole?: AIRole;
  
  statusEffects: StatusEffect[];
  
  // Combat state
  initiative: number;
  hasUsedAction: boolean;
  hasUsedBonusAction: boolean;
  hasUsedReaction: boolean;
  movementUsed: number;
  concentratingOn?: string;
}

export interface CombatAction {
  id: string;
  type: 'move' | 'attack' | 'spell' | 'dash' | 'dodge' | 'help' | 'hide' | 'ready' | 'disengage';
  characterId: string;
  target?: Position | string;
  path?: Position[];
  spellId?: string;
  itemId?: string;
  weaponId?: string;
  damage?: number;
  attackRoll?: number;
  targetAC?: number;
  description: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: 'move' | 'attack' | 'spell' | 'damage' | 'heal' | 'status' | 'turn' | 'round';
  characterId: string;
  characterName: string;
  message: string;
  details?: {
    attackRoll?: number;
    damage?: number;
    targetId?: string;
    targetName?: string;
    spellName?: string;
    weaponName?: string;
    fromPosition?: Position;
    toPosition?: Position;
  };
}
  aiBehavior?: AIBehavior;

export type AIPersonality = 'aggressive' | 'defensive' | 'archer' | 'caster' | 'tactical';

export interface AIBehavior {
  personality: AIPersonality;
  preferredRange: 'melee' | 'ranged' | 'mixed';
  aggressiveness: number; // 0-1
  selfPreservation: number; // 0-1
  teamwork: number; // 0-1
  spellPriority: number; // 0-1
}

export interface CombatState {
  round: number;
  turn: number;
  characters: Character[];
  initiativeOrder: string[];
  currentCharacterId: string;
  combatLog: CombatLogEntry[];
  battlefield: {
    width: number;
    height: number;
    obstacles: Position[];
    effects: Array<{
      position: Position;
      effect: StatusEffect;
      duration: number;
    }>;
  };
  isActive: boolean;
  victor?: 'players' | 'enemies';
}

export type SceneType = 'combat' | 'text' | 'merchant' | 'exploration' | 'camp';

export interface SceneChoice {
  id: string;
  text: string;
  condition?: (gameState: GameState) => boolean;
  consequences?: {
    nextSceneId?: string;
    addItem?: string;
    removeItem?: string;
    addGold?: number;
    removeGold?: number;
    addCompanion?: Character;
    startCombat?: CombatState;
    castSpell?: string;
  };
}

export interface TextScene {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  choices: SceneChoice[];
  autoAdvance?: {
    delay: number;
    nextSceneId: string;
  };
}

export interface MerchantScene {
  id: string;
  merchantName: string;
  description: string;
  inventory: Array<{
    itemId: string;
    quantity: number;
    price: number;
  }>;
  buybackRate: number;
  nextSceneId?: string;
}

export interface ExplorationScene {
  id: string;
  title: string;
  description: string;
  encounters: Array<{
    type: 'combat' | 'treasure' | 'text';
    probability: number;
    data: any;
  }>;
  maxEncounters: number;
  currentEncounters: number;
}

export interface Scene {
  id: string;
  type: SceneType;
  data: TextScene | MerchantScene | ExplorationScene | CombatState;
}

export interface SceneState {
  currentSceneId: string;
  sceneHistory: string[];
  availableScenes: Record<string, Scene>;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
  isNight: boolean;
  shortRestsToday: number;
  lastLongRest: number;
}

export interface GameState {
  time: GameTime;
  combat?: CombatState;
  scenes: SceneState;
  party: Character[];
  playerCharacter?: Character;
  currentLocation: string;
  questProgress: Record<string, any>;
  worldSeed: string;
  saveData: {
    version: string;
    timestamp: number;
    playTime: number;
  };
}

export interface CraftingRecipe {
  id: string;
  name: string;
  result: { itemId: string; quantity: number };
  materials: Array<{ itemId: string; quantity: number }>;
  skill?: string;
  difficulty: number;
}

export interface Merchant {
  id: string;
  name: string;
  location: string;
  inventory: Array<{ itemId: string; quantity: number; priceMultiplier: number }>;
  buybackRate: number;
  specialties: Item['type'][];
}