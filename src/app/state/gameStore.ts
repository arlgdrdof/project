/**
 * Zustand store for game state management
 * Centralized state for the entire RPG game
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameState, Character, CombatState, GameTime, Scene, SceneState } from '../../game/core/types.js';
import { globalRNG } from '../../game/core/rng.js';
import { createInitialSceneState, SceneManager } from '../../game/scenes/sceneManager.js';
import { STORY_SCENES } from '../../game/data/scenarios.js';

interface GameStore extends GameState {
  // Actions
  setTime: (time: Partial<GameTime>) => void;
  advanceTime: (minutes: number) => void;
  startCombat: (combatState: CombatState) => void;
  endCombat: () => void;
  updateCombat: (updates: Partial<CombatState>) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  addCharacter: (character: Character) => void;
  removeCharacter: (characterId: string) => void;
  setPlayerCharacter: (character: Character) => void;
  navigateToScene: (sceneId: string) => void;
  processSceneChoice: (choiceId: string) => void;
  addScene: (scene: Scene) => void;
  saveGame: () => void;
  loadGame: (saveData: Partial<GameState>) => void;
  resetGame: () => void;
}

const initialTime: GameTime = {
  day: 1,
  hour: 8,
  minute: 0,
  isNight: false,
  shortRestsToday: 0,
  lastLongRest: 0
};

const initialScenes = createInitialSceneState();
// Add story scenes to initial state
Object.values(STORY_SCENES).forEach(scene => {
  initialScenes.availableScenes[scene.id] = scene;
});

const initialState: GameState = {
  time: initialTime,
  combat: undefined,
  scenes: initialScenes,
  party: [],
  playerCharacter: undefined,
  currentLocation: 'town_square',
  questProgress: {},
  worldSeed: globalRNG.getSeed().toString(),
  saveData: {
    version: '1.0.0',
    timestamp: Date.now(),
    playTime: 0
  }
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setTime: (timeUpdates) => {
      set((state) => {
        const newTime = { ...state.time, ...timeUpdates };
        newTime.isNight = newTime.hour < 6 || newTime.hour >= 20;
        return { time: newTime };
      });
    },

    advanceTime: (minutes) => {
      set((state) => {
        const newTime = { ...state.time };
        newTime.minute += minutes;
        
        while (newTime.minute >= 60) {
          newTime.minute -= 60;
          newTime.hour += 1;
        }
        
        while (newTime.hour >= 24) {
          newTime.hour -= 24;
          newTime.day += 1;
          newTime.shortRestsToday = 0; // Reset short rests on new day
        }
        
        newTime.isNight = newTime.hour < 6 || newTime.hour >= 20;
        
        return { time: newTime };
      });
    },

    startCombat: (combatState) => {
      set({ combat: combatState });
    },

    endCombat: () => {
      set({ combat: undefined });
    },

    updateCombat: (updates) => {
      set((state) => ({
        combat: state.combat ? { ...state.combat, ...updates } : undefined
      }));
    },

    updateCharacter: (characterId, updates) => {
      set((state) => ({
        party: state.party.map(char => 
          char.id === characterId ? { ...char, ...updates } : char
        ),
        playerCharacter: state.playerCharacter?.id === characterId 
          ? { ...state.playerCharacter, ...updates } 
          : state.playerCharacter,
        combat: state.combat ? {
          ...state.combat,
          characters: state.combat.characters.map(char =>
            char.id === characterId ? { ...char, ...updates } : char
          )
        } : state.combat
      }));
    },

    addCharacter: (character) => {
      set((state) => ({
        party: [...state.party, character]
      }));
    },

    removeCharacter: (characterId) => {
      set((state) => ({
        party: state.party.filter(char => char.id !== characterId)
      }));
    },

    setPlayerCharacter: (character) => {
      set({ playerCharacter: character });
    },

    navigateToScene: (sceneId) => {
      set((state) => {
        const sceneManager = new SceneManager(state);
        sceneManager.navigateToScene(sceneId);
        return { scenes: state.scenes };
      });
    },

    processSceneChoice: (choiceId) => {
      set((state) => {
        const sceneManager = new SceneManager(state);
        sceneManager.processChoice(choiceId);
        return { 
          scenes: state.scenes,
          party: state.party,
          playerCharacter: state.playerCharacter,
          combat: state.combat
        };
      });
    },

    addScene: (scene) => {
      set((state) => ({
        scenes: {
          ...state.scenes,
          availableScenes: {
            ...state.scenes.availableScenes,
            [scene.id]: scene
          }
        }
      }));
    },

    saveGame: () => {
      const state = get();
      const saveData = {
        ...state,
        saveData: {
          ...state.saveData,
          timestamp: Date.now()
        }
      };
      
      try {
        localStorage.setItem('dnd-rpg-save', JSON.stringify(saveData));
        console.log('Game saved successfully');
      } catch (error) {
        console.error('Failed to save game:', error);
      }
    },

    loadGame: (saveData) => {
      set((state) => ({
        ...state,
        ...saveData,
        saveData: {
          ...state.saveData,
          ...saveData.saveData
        }
      }));
    },

    resetGame: () => {
      set(initialState);
      localStorage.removeItem('dnd-rpg-save');
    }
  }))
);

// Auto-save functionality
useGameStore.subscribe(
  (state) => state.time,
  () => {
    const state = useGameStore.getState();
    // Auto-save every hour of game time
    if (state.time.minute === 0) {
      state.saveGame();
    }
  }
);

// Load game on initialization
try {
  const savedGame = localStorage.getItem('dnd-rpg-save');
  if (savedGame) {
    const parseData = JSON.parse(savedGame);
    useGameStore.getState().loadGame(parseData);
  }
} catch (error) {
  console.error('Failed to load saved game:', error);
}