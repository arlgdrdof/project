/**
 * Character sheet component displaying stats, equipment, and abilities
 * Comprehensive character information panel for the D&D RPG
 */

import React from 'react';
import { Heart, Shield, Zap, Sword, Star, Clock } from 'lucide-react';
import type { Character } from '../../game/core/types.js';
import { getModifier, getProficiencyBonus, getSpellSaveDC, getSpellAttackBonus } from '../../game/core/stats.js';
import { CLASSES } from '../../game/data/classes.js';

interface CharacterSheetProps {
  character: Character;
  onLevelUp?: () => void;
  onRestRequest?: (type: 'short' | 'long') => void;
  compact?: boolean;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
  character, 
  onLevelUp, 
  onRestRequest,
  compact = false 
}) => {
  const classData = CLASSES[character.class];
  const proficiencyBonus = getProficiencyBonus(character.level);
  const spellSaveDC = getSpellSaveDC(character);
  const spellAttackBonus = getSpellAttackBonus(character);

  const StatBlock = ({ label, value, modifier }: { label: string; value: number; modifier: number }) => (
    <div className="bg-gray-700 p-3 rounded text-center">
      <div className="text-xs text-gray-400 uppercase">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-sm text-gray-300">
        {modifier >= 0 ? '+' : ''}{modifier}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-600">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg">{character.name}</h3>
            <p className="text-gray-400 text-sm">Level {character.level} {classData.name}</p>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center gap-1 text-red-400">
              <Heart className="w-4 h-4" />
              {character.health.current}/{character.health.maximum}
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Shield className="w-4 h-4" />
              AC {character.armorClass}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 text-xs">
          {Object.entries(character.stats).map(([stat, value]) => (
            <div key={stat} className="text-center bg-gray-700 p-1 rounded">
              <div className="text-gray-400 uppercase">{stat.slice(0, 3)}</div>
              <div className="font-bold">{value}</div>
              <div className="text-gray-300">{getModifier(value) >= 0 ? '+' : ''}{getModifier(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold">{character.name}</h2>
            <p className="text-gray-400">Level {character.level} {classData.name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">XP: {character.experience}/{character.experienceToNext}</div>
            {character.experience >= character.experienceToNext && onLevelUp && (
              <button
                onClick={onLevelUp}
                className="mt-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
              >
                Level Up!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vital Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-900 p-3 rounded text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-300">Hit Points</span>
          </div>
          <div className="text-xl font-bold text-white">
            {character.health.current}/{character.health.maximum}
          </div>
          {character.health.temporary > 0 && (
            <div className="text-xs text-blue-300">+{character.health.temporary} temp</div>
          )}
        </div>

        <div className="bg-blue-900 p-3 rounded text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Armor Class</span>
          </div>
          <div className="text-xl font-bold text-white">{character.armorClass}</div>
        </div>

        <div className="bg-green-900 p-3 rounded text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-300">Proficiency</span>
          </div>
          <div className="text-xl font-bold text-white">+{proficiencyBonus}</div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sword className="w-5 h-5" />
          Ability Scores
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatBlock 
            label="STR" 
            value={character.stats.strength} 
            modifier={getModifier(character.stats.strength)} 
          />
          <StatBlock 
            label="DEX" 
            value={character.stats.dexterity} 
            modifier={getModifier(character.stats.dexterity)} 
          />
          <StatBlock 
            label="CON" 
            value={character.stats.constitution} 
            modifier={getModifier(character.stats.constitution)} 
          />
          <StatBlock 
            label="INT" 
            value={character.stats.intelligence} 
            modifier={getModifier(character.stats.intelligence)} 
          />
          <StatBlock 
            label="WIS" 
            value={character.stats.wisdom} 
            modifier={getModifier(character.stats.wisdom)} 
          />
          <StatBlock 
            label="CHA" 
            value={character.stats.charisma} 
            modifier={getModifier(character.stats.charisma)} 
          />
        </div>
      </div>

      {/* Spellcasting (if applicable) */}
      {classData.spellcaster && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Spellcasting
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="text-xs text-gray-400">Spell Save DC</div>
              <div className="text-lg font-bold">{spellSaveDC}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="text-xs text-gray-400">Spell Attack</div>
              <div className="text-lg font-bold">+{spellAttackBonus}</div>
            </div>
          </div>
          
          {/* Spell Slots */}
          <div className="space-y-2">
            {Object.entries(character.resources.spellSlots).map(([level, slots]) => (
              <div key={level} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <span className="text-sm">Level {level}</span>
                <div className="flex gap-1">
                  {Array.from({ length: slots.maximum }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border ${
                        i < slots.current
                          ? 'bg-blue-500 border-blue-400'
                          : 'bg-gray-600 border-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rest Actions */}
      {onRestRequest && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Rest
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onRestRequest('short')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Short Rest
            </button>
            <button
              onClick={() => onRestRequest('long')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              Long Rest
            </button>
          </div>
        </div>
      )}

      {/* Status Effects */}
      {character.statusEffects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Status Effects</h3>
          <div className="space-y-2">
            {character.statusEffects.map((effect, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{effect.name}</span>
                  <span className="text-xs text-gray-400">{effect.duration} turns</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{effect.description || 'Active effect'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};