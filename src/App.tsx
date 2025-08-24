import React, { useState, useEffect } from 'react';
import { Sword, Users, Map, Settings, Sun, Moon, Clock } from 'lucide-react';
import { CharacterCreation } from './app/screens/CharacterCreation.js';
import { CombatScreen } from './app/screens/CombatScreen.js';
import { TextScene } from './app/screens/TextScene.js';
import { CharacterSheet } from './app/components/CharacterSheet.js';
import { useGameStore } from './app/state/gameStore.js';
import type { Character, CombatState, Scene } from './game/core/types.js';
import { globalRNG } from './game/core/rng.js';
import { createOrcBehavior, createGoblinBehavior } from './game/combat/ai.js';

type Screen = 'menu' | 'character_creation' | 'party' | 'world' | 'combat' | 'settings' | 'story';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const { 
    party, 
    time, 
    combat, 
    scenes, 
    playerCharacter,
    addCharacter, 
    setPlayerCharacter,
    startCombat, 
    endCombat, 
    advanceTime,
    navigateToScene 
  } = useGameStore();

  useEffect(() => {
    // Auto-advance time every 10 seconds (for demo purposes)
    const interval = setInterval(() => {
      advanceTime(10); // Advance 10 minutes of game time
    }, 10000);

    return () => clearInterval(interval);
  }, [advanceTime]);

  // Get current scene
  const currentScene = scenes.availableScenes[scenes.currentSceneId];

  const startDemoCombat = () => {
    if (party.length === 0) {
      alert('Create at least one character first!');
      return;
    }

    // Create some demo enemies
    const goblin: Character = {
      id: 'enemy_goblin',
      name: 'Goblin Warrior',
      class: 'fighter',
      level: 1,
      experience: 0,
      experienceToNext: 300,
      stats: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8
      },
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
      gold: 0,
      position: { x: 8, y: 5 },
      type: 'enemy',
      aiBehavior: createGoblinBehavior(),
      statusEffects: [],
      initiative: globalRNG.rollDice(1, 20, 2),
      hasUsedAction: false,
      hasUsedBonusAction: false,
      hasUsedReaction: false,
      movementUsed: 0
    };

    const orc: Character = {
      id: 'enemy_orc',
      name: 'Orc Brute',
      class: 'barbarian',
      level: 1,
      experience: 0,
      experienceToNext: 300,
      stats: {
        strength: 16,
        dexterity: 12,
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10
      },
      health: { current: 15, maximum: 15, temporary: 0 },
      armorClass: 13,
      speed: 30,
      resources: { spellSlots: {} },
      spells: [],
      knownSpells: [],
      preparedSpells: [],
      inventory: [],
      equipment: { 
        mainHand: { id: 'greataxe', name: 'Greataxe', type: 'weapon', rarity: 'common', value: 30, weight: 7, properties: {}, description: 'A massive two-handed axe' },
        accessories: [] 
      },
      gold: 0,
      position: { x: 9, y: 6 },
      type: 'enemy',
      aiBehavior: createOrcBehavior(),
      statusEffects: [],
      initiative: globalRNG.rollDice(1, 20, 1),
      hasUsedAction: false,
      hasUsedBonusAction: false,
      hasUsedReaction: false,
      movementUsed: 0
    };

    // Set party positions
    const combatParty = party.map((char, index) => ({
      ...char,
      position: { x: 1 + index, y: 5 },
      initiative: globalRNG.rollDice(1, 20, 2)
    }));

    const allCharacters = [...combatParty, goblin, orc];
    const initiativeOrder = allCharacters
      .sort((a, b) => b.initiative - a.initiative)
      .map(char => char.id);

    const combatState: CombatState = {
      round: 1,
      turn: 1,
      characters: allCharacters,
      initiativeOrder,
      currentCharacterId: initiativeOrder[0],
      combatLog: [],
      battlefield: {
        width: 12,
        height: 10,
        obstacles: [
          { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 6, y: 3 },
          { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 8, y: 8 }
        ],
        effects: []
      },
      isActive: true
    };

    startCombat(combatState);
    setCurrentScreen('combat');
  };

  const startStoryMode = () => {
    if (party.length === 0) {
      alert('Create at least one character first!');
      return;
    }

    // Set the first party member as the player character
    setPlayerCharacter(party[0]);
    navigateToScene('intro');
    setCurrentScreen('story');
  };

  const formatTime = (time: typeof useGameStore.getState.time) => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  if (currentScreen === 'character_creation') {
    return (
      <CharacterCreation
        onComplete={() => setCurrentScreen('party')}
        onCancel={() => setCurrentScreen('menu')}
      />
    );
  }

  if (currentScreen === 'combat' && combat) {
    return (
      <CombatScreen
        onEndCombat={() => {
          endCombat();
          setCurrentScreen('party');
        }}
      />
    );
  }

  if (currentScreen === 'story' && currentScene) {
    if (currentScene.type === 'text') {
      return (
        <TextScene 
          scene={currentScene.data as any}
          playerCharacter={playerCharacter}
        />
      );
    }
    
    if (currentScene.type === 'combat') {
      return (
        <CombatScreen
          onEndCombat={() => {
            endCombat();
            setCurrentScreen('story');
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Sword className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold">D&D Tactical RPG</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Time Display */}
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Day {time.day}</span>
              <span className="text-sm">{formatTime(time)}</span>
              {time.isNight ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-2">
              {[
                { key: 'menu', icon: Map, label: 'Menu' },
                { key: 'party', icon: Users, label: 'Party' },
                { key: 'story', icon: Sword, label: 'Adventure' },
                { key: 'settings', icon: Settings, label: 'Settings' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setCurrentScreen(key as Screen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    currentScreen === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {currentScreen === 'menu' && (
          <div className="text-center">
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4">Welcome to the Adventure</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                A tactical RPG inspired by D&D 5e with turn-based combat, character progression, 
                intelligent AI enemies, and immersive storytelling with branching narratives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Create Characters</h3>
                <p className="text-gray-400 mb-4">
                  Build your party with 12 unique classes, each with distinct abilities and playstyles.
                </p>
                <button
                  onClick={() => setCurrentScreen('character_creation')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Create Character
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
                <Map className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Start Adventure</h3>
                <p className="text-gray-400 mb-4">
                  Begin your journey with branching narratives, choices that matter, and epic encounters.
                </p>
                <button
                  onClick={startStoryMode}
                  disabled={party.length === 0}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Begin Story
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-colors">
                <Sword className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Start Combat</h3>
                <p className="text-gray-400 mb-4">
                  Enter tactical turn-based combat with intelligent AI enemies and strategic positioning.
                </p>
                <button
                  onClick={startDemoCombat}
                  disabled={party.length === 0}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Demo Combat
                </button>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Game Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Combat System</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Tactical grid-based movement</li>
                    <li>• Turn-based initiative order</li>
                    <li>• Intelligent AI with different personalities</li>
                    <li>• Line of sight and cover</li>
                    <li>• Detailed combat logging</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Story & Magic</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Branching narrative choices</li>
                    <li>• Spells usable outside combat</li>
                    <li>• Multiple scene types</li>
                    <li>• Character-driven story</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'party' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Your Party</h2>
              <button
                onClick={() => setCurrentScreen('character_creation')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add Character
              </button>
            </div>

            {party.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Characters Created</h3>
                <p className="text-gray-400 mb-6">
                  Create your first character to start your adventure.
                </p>
                <button
                  onClick={() => setCurrentScreen('character_creation')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Create Your First Character
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {party.map((character) => (
                  <CharacterSheet
                    key={character.id}
                    character={character}
                    onLevelUp={() => {
                      console.log('Level up!', character.name);
                      // Implement level up logic
                    }}
                    onRestRequest={(type) => {
                      console.log(`${character.name} requests ${type} rest`);
                      // Implement rest logic
                      if (type === 'long') {
                        advanceTime(480); // 8 hours
                      } else {
                        advanceTime(60); // 1 hour
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {party.length > 0 && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Party Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={startStoryMode}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Start Adventure
                  </button>
                  <button
                    onClick={startDemoCombat}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-2"
                  >
                    <Sword className="w-4 h-4" />
                    Start Demo Combat
                  </button>
                  <button
                    onClick={() => advanceTime(60)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Rest (1 hour)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentScreen === 'settings' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            <div className="max-w-2xl space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Random Seed</label>
                    <input
                      type="text"
                      value={globalRNG.getSeed()}
                      onChange={(e) => globalRNG.setSeed(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Change this to generate different random encounters and loot
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Save/Load</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => useGameStore.getState().saveGame()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Save Game
                  </button>
                  <button
                    onClick={() => useGameStore.getState().resetGame()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Reset Game
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Games auto-save every hour of game time
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;