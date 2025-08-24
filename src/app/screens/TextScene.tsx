/**
 * Text Scene Component
 * Handles narrative scenes with choices and story progression
 */

import React from 'react';
import { Book, Sparkles, ArrowRight } from 'lucide-react';
import type { TextScene as TextSceneType, Character } from '../../game/core/types.js';
import { useGameStore } from '../state/gameStore.js';
import { OutOfCombatSpellSystem } from '../../game/systems/spellSystem.js';

interface TextSceneProps {
  scene: TextSceneType;
  playerCharacter?: Character;
}

export const TextScene: React.FC<TextSceneProps> = ({ scene, playerCharacter }) => {
  const { processSceneChoice } = useGameStore();
  const spellSystem = playerCharacter ? new OutOfCombatSpellSystem(useGameStore.getState()) : null;

  const handleChoice = (choiceId: string) => {
    processSceneChoice(choiceId);
  };

  const getSpellChoices = () => {
    if (!playerCharacter || !spellSystem) return [];
    
    // Determine context based on scene content
    let context = 'general';
    if (scene.description.toLowerCase().includes('dark') || scene.description.toLowerCase().includes('shadow')) {
      context = 'darkness';
    }
    if (scene.description.toLowerCase().includes('merchant') || scene.description.toLowerCase().includes('trader')) {
      context = 'social';
    }
    if (scene.description.toLowerCase().includes('gap') || scene.description.toLowerCase().includes('cliff')) {
      context = 'exploration';
    }
    if (scene.description.toLowerCase().includes('magic') || scene.description.toLowerCase().includes('mysterious')) {
      context = 'investigation';
    }

    return spellSystem.getSpellChoices(playerCharacter, context);
  };

  const spellChoices = getSpellChoices();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Scene Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-100">{scene.title}</h1>
          </div>
        </div>

        {/* Scene Image (if provided) */}
        {scene.imageUrl && (
          <div className="mb-8">
            <img 
              src={scene.imageUrl} 
              alt={scene.title}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border border-gray-700"
            />
          </div>
        )}

        {/* Scene Description */}
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="prose prose-invert max-w-none">
              {scene.description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-200 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Choices */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-amber-200 mb-4">What do you do?</h2>
          
          {/* Regular choices */}
          {scene.choices.map((choice, index) => {
            const isAvailable = !choice.condition || choice.condition(useGameStore.getState());
            
            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={!isAvailable}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  isAvailable
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-blue-500 cursor-pointer'
                    : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isAvailable ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{choice.text}</span>
                  </div>
                  {isAvailable && <ArrowRight className="w-5 h-5 text-gray-400" />}
                </div>
              </button>
            );
          })}

          {/* Spell choices */}
          {spellChoices.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Magical Options
              </h3>
              {spellChoices.map((spellChoice, index) => (
                <button
                  key={spellChoice.spellId}
                  onClick={() => {
                    // Cast spell and then process as choice
                    if (playerCharacter && spellSystem) {
                      const result = spellSystem.castSpell(playerCharacter, spellChoice.spellId);
                      if (result.success) {
                        // Create a synthetic choice for spell casting
                        processSceneChoice(`spell_${spellChoice.spellId}`);
                      }
                    }
                  }}
                  className="w-full text-left p-4 rounded-lg border bg-purple-900 border-purple-600 hover:bg-purple-800 hover:border-purple-500 transition-all duration-200 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="font-medium text-purple-200">{spellChoice.choiceText}</div>
                        <div className="text-sm text-purple-300 mt-1">{spellChoice.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto-advance indicator */}
        {scene.autoAdvance && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900 border border-yellow-600 rounded-lg text-yellow-200">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">
                Continuing automatically in {Math.ceil(scene.autoAdvance.delay / 1000)} seconds...
              </span>
            </div>
          </div>
        )}

        {/* Player Status (if available) */}
        {playerCharacter && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>Health: {playerCharacter.health.current}/{playerCharacter.health.maximum}</span>
                <span>Gold: {playerCharacter.gold}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Level {playerCharacter.level} {playerCharacter.class}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};