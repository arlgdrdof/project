/**
 * Main combat screen component
 * Orchestrates the tactical combat interface with grid, character sheets, and actions
 */

import React, { useState, useCallback } from 'react';
import { Sword, Shield, Zap, Move, RotateCcw, Play, Pause } from 'lucide-react';
import { CombatGrid } from '../components/CombatGrid.js';
import { CharacterSheet } from '../components/CharacterSheet.js';
import type { CombatAction, CombatState, CombatLogEntry } from '../../game/core/types.js';
import { useGameStore } from '../state/gameStore.js';
import { CombatEngine } from '../../game/combat/combatEngine.js';

interface CombatScreenProps {
  onEndCombat: () => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ onEndCombat }) => {
  const { combat, updateCombat } = useGameStore();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  const initializedRef = React.useRef(false);

  // Initialize combat engine
  React.useEffect(() => {
    if (combat && !combatEngine && !initializedRef.current) {
      const engine = new CombatEngine(combat);
      engine.initializeCombat();
      setCombatEngine(engine);
      updateCombat(engine.currentCombatState);
      initializedRef.current = true;
    }
  }, [combat, combatEngine, updateCombat, initializedRef]);

  if (!combat) return null;

  const currentCharacter = combat.characters.find(c => c.id === combat.currentCharacterId);
  const playerCharacters = combat.characters.filter(c => c.type === 'player' || c.type === 'companion');
  const enemies = combat.characters.filter(c => c.type === 'enemy');
  const isPlayerTurn = currentCharacter?.type === 'player' || currentCharacter?.type === 'companion';

  const handleAction = useCallback((action: CombatAction) => {
    if (!combatEngine) return;

    const success = combatEngine.processAction(action);
    if (success) {
      updateCombat({ 
        characters: combat.characters,
        combatLog: combatEngine.getCombatLog()
      });

      // Check for combat end
      const victor = combatEngine.checkCombatEnd();
      if (victor) {
        updateCombat({ victor, isActive: false });
        setTimeout(() => {
          onEndCombat();
        }, 2000);
      }
    }
    
    setSelectedAction('');
  }, [combat, combatEngine, updateCombat, onEndCombat]);

  const handleEndTurn = useCallback(() => {
    if (!combatEngine) return;

    combatEngine.endTurn();
    updateCombat({
      currentCharacterId: combat.currentCharacterId,
      turn: combat.turn,
      round: combat.round,
      characters: combat.characters,
      combatLog: combatEngine.getCombatLog()
    });

    // Process AI turn if next character is an enemy
    const nextCharacter = combat.characters.find(c => c.id === combat.currentCharacterId);
    if (nextCharacter?.type === 'enemy') {
      setTimeout(() => {
        const aiAction = combatEngine.processAITurn();
        if (aiAction) {
          updateCombat({
            characters: combat.characters,
            combatLog: combatEngine.getCombatLog()
          });
        }
        
        // Auto-advance AI turn
        setTimeout(() => {
          combatEngine.endTurn();
          updateCombat({
            currentCharacterId: combat.currentCharacterId,
            turn: combat.turn,
            round: combat.round,
            characters: combat.characters,
            combatLog: combatEngine.getCombatLog()
          });
        }, 1500);
      }, 1000);
    }
  }, [combat, combatEngine, updateCombat]);

  const CombatLogDisplay = ({ log }: { log: CombatLogEntry[] }) => (
    <div className="bg-gray-800 border border-gray-700 rounded p-3 h-48 overflow-y-auto text-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-200">Combat Log</h3>
      <div className="space-y-1">
        {log.slice(-20).map((entry) => (
          <div key={entry.id} className={`text-xs ${
            entry.type === 'attack' ? 'text-red-300' :
            entry.type === 'damage' ? 'text-orange-300' :
            entry.type === 'heal' ? 'text-green-300' :
            entry.type === 'spell' ? 'text-purple-300' :
            entry.type === 'move' ? 'text-blue-300' :
            entry.type === 'turn' ? 'text-yellow-300' :
            entry.type === 'round' ? 'text-amber-300 font-semibold' :
            'text-gray-400'
          }`}>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );

  const ActionButton = ({ 
    action, 
    icon: Icon, 
    label, 
    disabled = false 
  }: { 
    action: string; 
    icon: any; 
    label: string; 
    disabled?: boolean;
  }) => (
    <button
      onClick={() => setSelectedAction(action)}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
        selectedAction === action
          ? 'bg-blue-600 text-white'
          : disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Combat Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tactical Combat</h1>
            <div className="flex items-center gap-4">
              <div className="text-lg">
                Round <span className="font-bold text-yellow-400">{combat.round}</span>
              </div>
              {combat.victor && (
                <div className={`px-4 py-2 rounded font-bold ${
                  combat.victor === 'players' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {combat.victor === 'players' ? 'Victory!' : 'Defeat!'}
                </div>
              )}
              <button
                onClick={onEndCombat}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                End Combat
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Combat Grid */}
          <div className="xl:col-span-3">
            <CombatGrid
              combatState={combat}
              onAction={handleAction}
              selectedAction={selectedAction}
            />
            
            {/* Action Bar */}
            <div className={`mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700 ${
              !isPlayerTurn ? 'opacity-50' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {currentCharacter ? `${currentCharacter.name}'s Turn` : 'No Active Character'}
                  {!isPlayerTurn && currentCharacter && (
                    <span className="ml-2 text-sm text-gray-400">(AI Controlled)</span>
                  )}
                </h3>
                <button
                  onClick={handleEndTurn}
                  disabled={!isPlayerTurn}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  End Turn
                </button>
              </div>
              
              {currentCharacter && isPlayerTurn && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <ActionButton
                    action="move"
                    icon={Move}
                    label="Move"
                    disabled={currentCharacter.movementUsed >= currentCharacter.speed}
                  />
                  <ActionButton
                    action="attack"
                    icon={Sword}
                    label="Attack"
                    disabled={currentCharacter.hasUsedAction}
                  />
                  <ActionButton
                    action="spell"
                    icon={Zap}
                    label="Cast Spell"
                    disabled={currentCharacter.hasUsedAction}
                  />
                  <ActionButton
                    action="dodge"
                    icon={Shield}
                    label="Dodge"
                    disabled={currentCharacter.hasUsedAction}
                  />
                  <ActionButton
                    action="dash"
                    icon={Move}
                    label="Dash"
                    disabled={currentCharacter.hasUsedAction}
                  />
                  <ActionButton
                    action="ready"
                    icon={Pause}
                    label="Ready"
                    disabled={currentCharacter.hasUsedAction}
                  />
                </div>
              )}
              
              {!isPlayerTurn && currentCharacter && (
                <div className="text-center text-gray-400">
                  <p>AI is thinking...</p>
                </div>
              )}
            </div>
          </div>

          {/* Character Panels */}
          <div className="space-y-6">
            {/* Current Character */}
            {currentCharacter && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Active Character</h3>
                <CharacterSheet character={currentCharacter} compact />
              </div>
            )}

            {/* Party Members */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Party ({playerCharacters.length})</h3>
              <div className="space-y-3">
                {playerCharacters.slice(0, 3).map((character) => (
                  <CharacterSheet
                    key={character.id}
                    character={character}
                    compact
                  />
                ))}
              </div>
            </div>

            {/* Enemies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Enemies ({enemies.length})</h3>
              <div className="space-y-3">
                {enemies.slice(0, 3).map((character) => (
                  <CharacterSheet
                    key={character.id}
                    character={character}
                    compact
                  />
                ))}
              </div>
            </div>

            {/* Combat Log */}
            <CombatLogDisplay log={combat.combatLog || []} />
          </div>
        </div>
      </div>
    </div>
  );
};