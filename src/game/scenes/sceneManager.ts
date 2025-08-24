/**
 * Scene Management System
 * Handles navigation between different game scenes and states
 */

import type { Scene, SceneState, GameState, TextScene, MerchantScene, ExplorationScene, CombatState } from '../core/types.js';
import { globalRNG } from '../core/rng.js';

export class SceneManager {
  private gameState: GameState;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  getCurrentScene(): Scene | null {
    const currentId = this.gameState.scenes.currentSceneId;
    return this.gameState.scenes.availableScenes[currentId] || null;
  }

  navigateToScene(sceneId: string): boolean {
    const scene = this.gameState.scenes.availableScenes[sceneId];
    if (!scene) {
      console.warn(`Scene ${sceneId} not found`);
      return false;
    }

    // Add current scene to history
    this.gameState.scenes.sceneHistory.push(this.gameState.scenes.currentSceneId);
    
    // Navigate to new scene
    this.gameState.scenes.currentSceneId = sceneId;
    
    return true;
  }

  goBack(): boolean {
    if (this.gameState.scenes.sceneHistory.length === 0) {
      return false;
    }

    const previousSceneId = this.gameState.scenes.sceneHistory.pop()!;
    this.gameState.scenes.currentSceneId = previousSceneId;
    
    return true;
  }

  processChoice(choiceId: string): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene || currentScene.type !== 'text') {
      return;
    }

    const textScene = currentScene.data as TextScene;
    const choice = textScene.choices.find(c => c.id === choiceId);
    
    if (!choice) {
      console.warn(`Choice ${choiceId} not found in scene ${currentScene.id}`);
      return;
    }

    // Check condition if present
    if (choice.condition && !choice.condition(this.gameState)) {
      console.warn(`Choice ${choiceId} condition not met`);
      return;
    }

    // Apply consequences
    if (choice.consequences) {
      this.applyConsequences(choice.consequences);
    }

    // Navigate to next scene if specified
    if (choice.consequences?.nextSceneId) {
      this.navigateToScene(choice.consequences.nextSceneId);
    }
  }

  private applyConsequences(consequences: NonNullable<import('../core/types.js').SceneChoice['consequences']>): void {
    const player = this.gameState.playerCharacter;
    if (!player) return;

    // Add/remove gold
    if (consequences.addGold) {
      player.gold += consequences.addGold;
    }
    if (consequences.removeGold) {
      player.gold = Math.max(0, player.gold - consequences.removeGold);
    }

    // Add/remove items
    if (consequences.addItem) {
      // Implementation depends on item system
      console.log(`Adding item: ${consequences.addItem}`);
    }
    if (consequences.removeItem) {
      // Implementation depends on item system
      console.log(`Removing item: ${consequences.removeItem}`);
    }

    // Add companion
    if (consequences.addCompanion) {
      this.gameState.party.push(consequences.addCompanion);
    }

    // Start combat
    if (consequences.startCombat) {
      this.gameState.combat = consequences.startCombat;
    }

    // Cast spell
    if (consequences.castSpell) {
      console.log(`Casting spell: ${consequences.castSpell}`);
      // Implementation depends on spell system
    }
  }

  generateExplorationEncounter(scene: ExplorationScene): Scene | null {
    if (scene.currentEncounters >= scene.maxEncounters) {
      return null;
    }

    // Select random encounter based on probabilities
    const totalProbability = scene.encounters.reduce((sum, enc) => sum + enc.probability, 0);
    const roll = globalRNG.next() * totalProbability;
    
    let currentProbability = 0;
    for (const encounter of scene.encounters) {
      currentProbability += encounter.probability;
      if (roll <= currentProbability) {
        scene.currentEncounters++;
        
        // Generate encounter scene
        return this.createEncounterScene(encounter.type, encounter.data);
      }
    }

    return null;
  }

  private createEncounterScene(type: 'combat' | 'treasure' | 'text', data: any): Scene {
    const sceneId = `encounter_${Date.now()}`;
    
    switch (type) {
      case 'combat':
        return {
          id: sceneId,
          type: 'combat',
          data: this.generateCombatEncounter(data)
        };
      
      case 'treasure':
        return {
          id: sceneId,
          type: 'text',
          data: this.generateTreasureScene(data)
        };
      
      case 'text':
        return {
          id: sceneId,
          type: 'text',
          data: data as TextScene
        };
      
      default:
        throw new Error(`Unknown encounter type: ${type}`);
    }
  }

  private generateCombatEncounter(data: any): CombatState {
    // Generate a basic combat encounter
    // This would be expanded with proper enemy generation
    return {
      round: 1,
      turn: 1,
      characters: [...this.gameState.party],
      initiativeOrder: [],
      currentCharacterId: '',
      combatLog: [],
      battlefield: {
        width: 12,
        height: 10,
        obstacles: [],
        effects: []
      },
      isActive: true
    };
  }

  private generateTreasureScene(data: any): TextScene {
    const treasureValue = globalRNG.nextInt(10, 100);
    
    return {
      id: `treasure_${Date.now()}`,
      title: 'Hidden Treasure',
      description: `You discover a small cache containing ${treasureValue} gold pieces!`,
      choices: [
        {
          id: 'take_treasure',
          text: 'Take the gold',
          consequences: {
            addGold: treasureValue,
            nextSceneId: 'continue_exploration'
          }
        },
        {
          id: 'leave_treasure',
          text: 'Leave it alone',
          consequences: {
            nextSceneId: 'continue_exploration'
          }
        }
      ]
    };
  }

  addScene(scene: Scene): void {
    this.gameState.scenes.availableScenes[scene.id] = scene;
  }

  removeScene(sceneId: string): void {
    delete this.gameState.scenes.availableScenes[sceneId];
  }
}

/**
 * Create initial scene state
 */
export function createInitialSceneState(): SceneState {
  return {
    currentSceneId: 'intro',
    sceneHistory: [],
    availableScenes: {}
  };
}