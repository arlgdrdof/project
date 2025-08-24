/**
 * Character creation screen for D&D RPG
 * Allows players to create their character with class, stats, and equipment selection
 */

import React, { useState } from 'react';
import { Dice1, Plus, Minus, Shuffle, Check } from 'lucide-react';
import type { Character, CharacterClass, Stats } from '../../game/core/types.js';
import { CLASSES } from '../../game/data/classes.js';
import { getModifier, calculateArmorClass, calculateHitPoints } from '../../game/core/stats.js';
import { globalRNG } from '../../game/core/rng.js';
import { useGameStore } from '../state/gameStore.js';

interface CharacterCreationProps {
  onComplete: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const { addCharacter } = useGameStore();
  const [step, setStep] = useState<'class' | 'stats' | 'details' | 'review'>('class');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('fighter');
  const [characterName, setCharacterName] = useState('');
  const [stats, setStats] = useState<Stats>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  const [pointBuy, setPointBuy] = useState(27); // Standard point buy

  const rollStats = () => {
    const newStats: Stats = {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat()
    };
    setStats(newStats);
  };

  const rollStat = () => {
    // Roll 4d6, drop lowest
    const rolls = [
      globalRNG.rollDie(6),
      globalRNG.rollDie(6),
      globalRNG.rollDie(6),
      globalRNG.rollDie(6)
    ].sort((a, b) => b - a);
    
    return rolls[0] + rolls[1] + rolls[2];
  };

  const adjustStat = (stat: keyof Stats, delta: number) => {
    const currentValue = stats[stat];
    const newValue = Math.max(8, Math.min(15, currentValue + delta));
    const cost = getStatCost(newValue) - getStatCost(currentValue);
    
    if (pointBuy - cost >= 0) {
      setStats(prev => ({ ...prev, [stat]: newValue }));
      setPointBuy(prev => prev - cost);
    }
  };

  const getStatCost = (value: number) => {
    if (value <= 13) return value - 8;
    if (value === 14) return 7;
    if (value === 15) return 9;
    return 0;
  };

  const createCharacter = (): Character => {
    const classData = CLASSES[selectedClass];
    const level = 1;
    
    const character: Character = {
      id: `char_${Date.now()}`,
      name: characterName || 'Hero',
      class: selectedClass,
      level,
      experience: 0,
      experienceToNext: 300,
      
      stats,
      health: {
        current: 0,
        maximum: 0,
        temporary: 0
      },
      armorClass: 10,
      speed: 30,
      
      resources: {
        spellSlots: {}
      },
      spells: [],
      knownSpells: [],
      preparedSpells: [],
      
      inventory: [],
      equipment: {
        accessories: []
      },
      gold: 100,
      
      position: { x: 0, y: 0 },
      type: 'player',
      
      statusEffects: [],
      
      initiative: 0,
      hasUsedAction: false,
      hasUsedBonusAction: false,
      hasUsedReaction: false,
      movementUsed: 0
    };
    
    // Calculate derived stats
    character.health.maximum = calculateHitPoints(character);
    character.health.current = character.health.maximum;
    character.armorClass = calculateArmorClass(character);
    
    // Set up spell slots if spellcaster
    if (classData.spellcaster) {
      const spellSlots = classData.spellSlots[level] || [];
      spellSlots.forEach((slots, index) => {
        const spellLevel = index + 1;
        character.resources.spellSlots[spellLevel] = {
          current: slots,
          maximum: slots
        };
      });
    }
    
    return character;
  };

  const handleComplete = () => {
    const character = createCharacter();
    addCharacter(character);
    
    // If this is the first character, set as player character
    const gameState = useGameStore.getState();
    if (gameState.party.length === 0) {
      useGameStore.getState().setPlayerCharacter(character);
    }
    
    onComplete(character);
  };

  const ClassCard = ({ classKey, classData }: { classKey: CharacterClass; classData: typeof CLASSES[CharacterClass] }) => (
    <div
      onClick={() => setSelectedClass(classKey)}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selectedClass === classKey
          ? 'border-blue-500 bg-blue-900 bg-opacity-50'
          : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
      }`}
    >
      <h3 className="text-lg font-bold mb-2">{classData.name}</h3>
      <div className="text-sm text-gray-300 mb-2">
        Hit Die: d{classData.hitDie}
      </div>
      <div className="text-sm text-gray-300 mb-2">
        Primary: {classData.primaryAbilities.map(ability => 
          ability.charAt(0).toUpperCase() + ability.slice(1)
        ).join(', ')}
      </div>
      <div className="text-sm text-gray-300">
        {classData.spellcaster ? 'Spellcaster' : 'Martial'}
      </div>
    </div>
  );

  const StatRow = ({ stat, label }: { stat: keyof Stats; label: string }) => {
    const value = stats[stat];
    const modifier = getModifier(value);
    const isPrimary = CLASSES[selectedClass].primaryAbilities.includes(stat);
    
    return (
      <div className={`flex items-center justify-between p-3 rounded ${
        isPrimary ? 'bg-blue-900 bg-opacity-50 border border-blue-500' : 'bg-gray-700'
      }`}>
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => adjustStat(stat, -1)}
            disabled={value <= 8}
            className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[4rem]">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-sm text-gray-400">
              {modifier >= 0 ? '+' : ''}{modifier}
            </div>
          </div>
          <button
            onClick={() => adjustStat(stat, 1)}
            disabled={value >= 15 || pointBuy < getStatCost(value + 1) - getStatCost(value)}
            className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Character</h1>
          <div className="flex gap-2">
            {['class', 'stats', 'details', 'review'].map((stepName, index) => (
              <div
                key={stepName}
                className={`px-3 py-1 rounded text-sm ${
                  step === stepName
                    ? 'bg-blue-600 text-white'
                    : index < ['class', 'stats', 'details', 'review'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {index + 1}. {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {step === 'class' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Choose Your Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CLASSES).map(([classKey, classData]) => (
                  <ClassCard
                    key={classKey}
                    classKey={classKey as CharacterClass}
                    classData={classData}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Assign Ability Scores</h2>
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg">
                  Point Buy Remaining: <span className="font-bold text-blue-400">{pointBuy}</span>
                </div>
                <button
                  onClick={rollStats}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                >
                  <Dice1 className="w-4 h-4" />
                  Roll Stats
                </button>
              </div>
              
              <div className="space-y-3 max-w-md">
                <StatRow stat="strength" label="Strength" />
                <StatRow stat="dexterity" label="Dexterity" />
                <StatRow stat="constitution" label="Constitution" />
                <StatRow stat="intelligence" label="Intelligence" />
                <StatRow stat="wisdom" label="Wisdom" />
                <StatRow stat="charisma" label="Charisma" />
              </div>
              
              <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded border border-blue-500">
                <p className="text-sm text-blue-200">
                  <strong>Tip:</strong> Primary abilities for {CLASSES[selectedClass].name} are highlighted in blue. 
                  Focus your highest scores here for optimal performance.
                </p>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Character Details</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Character Name</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="p-4 bg-gray-700 rounded">
                  <h3 className="font-semibold mb-2">Starting Equipment</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Starting Gold: 100 gp</li>
                    <li>• Basic adventuring gear</li>
                    <li>• Class-appropriate weapons</li>
                    <li>• Leather armor (if proficient)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Review Your Character</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                    <div className="bg-gray-700 p-3 rounded">
                      <p><strong>Name:</strong> {characterName || 'Hero'}</p>
                      <p><strong>Class:</strong> {CLASSES[selectedClass].name}</p>
                      <p><strong>Level:</strong> 1</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vital Statistics</h3>
                    <div className="bg-gray-700 p-3 rounded space-y-1">
                      <p><strong>Hit Points:</strong> {calculateHitPoints(createCharacter())}</p>
                      <p><strong>Armor Class:</strong> {calculateArmorClass(createCharacter())}</p>
                      <p><strong>Speed:</strong> 30 feet</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ability Scores</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(stats).map(([stat, value]) => (
                      <div key={stat} className="bg-gray-700 p-2 rounded text-center">
                        <div className="text-xs text-gray-400 uppercase">{stat.slice(0, 3)}</div>
                        <div className="font-bold">{value}</div>
                        <div className="text-sm text-gray-300">
                          {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={step === 'class' ? onCancel : () => {
              const steps = ['class', 'stats', 'details', 'review'];
              const currentIndex = steps.indexOf(step);
              setStep(steps[currentIndex - 1] as any);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            {step === 'class' ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={step === 'review' ? handleComplete : () => {
              const steps = ['class', 'stats', 'details', 'review'];
              const currentIndex = steps.indexOf(step);
              setStep(steps[currentIndex + 1] as any);
            }}
            disabled={step === 'details' && !characterName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2"
          >
            {step === 'review' ? (
              <>
                <Check className="w-4 h-4" />
                Create Character
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};