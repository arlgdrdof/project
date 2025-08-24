/**
 * Tactical combat grid component with movement and targeting
 * Handles character positioning, pathfinding visualization, and action selection
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Sword, Shield, Zap, Move, Eye, Target } from 'lucide-react';
import type { Position, CombatState, Character, CombatAction } from '../../game/core/types.js';
import { findPath, getPositionsInRange, hasLineOfSight } from '../../game/combat/pathfinding.js';

interface CombatGridProps {
  combatState: CombatState;
  onAction: (action: CombatAction) => void;
  selectedAction?: string;
}

export const CombatGrid: React.FC<CombatGridProps> = ({ 
  combatState, 
  onAction, 
  selectedAction 
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [showMovementRange, setShowMovementRange] = useState(false);
  const [showAttackRange, setShowAttackRange] = useState(false);

  const currentCharacter = useMemo(() => {
    return combatState.characters.find(c => c.id === combatState.currentCharacterId);
  }, [combatState]);

  const movementRange = useMemo(() => {
    if (!currentCharacter || !showMovementRange) return [];
    const remainingMovement = currentCharacter.speed - currentCharacter.movementUsed;
    return getPositionsInRange(currentCharacter.position, Math.floor(remainingMovement / 5), combatState);
  }, [currentCharacter, showMovementRange, combatState]);

  const attackRange = useMemo(() => {
    if (!currentCharacter || !showAttackRange) return [];
    // Simplified: assume 5ft melee range or 120ft ranged
    const range = currentCharacter.equipment.mainHand?.type === 'weapon' ? 1 : 24;
    return getPositionsInRange(currentCharacter.position, range, combatState);
  }, [currentCharacter, showAttackRange, combatState]);

  const pathToHovered = useMemo(() => {
    if (!currentCharacter || !hoveredPosition || !movementRange.some(p => p.x === hoveredPosition.x && p.y === hoveredPosition.y)) {
      return null;
    }
    return findPath(currentCharacter.position, hoveredPosition, combatState, currentCharacter.id);
  }, [currentCharacter, hoveredPosition, movementRange, combatState]);

  const handleCellClick = useCallback((position: Position) => {
    if (!currentCharacter) return;

    if (selectedAction === 'move' && !currentCharacter.hasUsedAction) {
      const path = findPath(currentCharacter.position, position, combatState, currentCharacter.id);
      if (path && path.length > 1) {
        onAction({
          id: `move_${Date.now()}`,
          type: 'move',
          characterId: currentCharacter.id,
          target: position,
          path: path,
          description: `Move to position (${position.x}, ${position.y})`
        });
      }
    } else if (selectedAction === 'attack') {
      const targetCharacter = combatState.characters.find(c => 
        c.position.x === position.x && c.position.y === position.y && c.id !== currentCharacter.id
      );
      
      if (targetCharacter && targetCharacter.health.current > 0 && hasLineOfSight(currentCharacter.position, position, combatState)) {
        onAction({
          id: `attack_${Date.now()}`,
          type: 'attack',
          characterId: currentCharacter.id,
          target: targetCharacter.id,
          description: `Attack ${targetCharacter.name}`
        });
      }
    } else if (selectedAction === 'spell') {
      const targetCharacter = combatState.characters.find(c => 
        c.position.x === position.x && c.position.y === position.y && c.id !== currentCharacter.id
      );
      
      if (targetCharacter && targetCharacter.health.current > 0) {
        // For now, cast a simple damage spell
        onAction({
          id: `spell_${Date.now()}`,
          type: 'spell',
          characterId: currentCharacter.id,
          target: targetCharacter.id,
          spellId: 'magic_missile',
          description: `Cast Magic Missile on ${targetCharacter.name}`
        });
      }
    }
    
    setSelectedPosition(position);
  }, [currentCharacter, selectedAction, combatState, onAction]);

  const getCellClass = useCallback((x: number, y: number) => {
    const position = { x, y };
    const character = combatState.characters.find(c => c.position.x === x && c.position.y === y);
    const isObstacle = combatState.battlefield.obstacles.some(obs => obs.x === x && obs.y === y);
    const isCurrentCharacter = character?.id === combatState.currentCharacterId;
    const isInMovementRange = movementRange.some(p => p.x === x && p.y === y);
    const isInAttackRange = attackRange.some(p => p.x === x && p.y === y);
    const isOnPath = pathToHovered?.some(p => p.x === x && p.y === y);
    const isSelected = selectedPosition?.x === x && selectedPosition?.y === y;
    const isHovered = hoveredPosition?.x === x && hoveredPosition?.y === y;

    let classes = 'relative w-8 h-8 border border-gray-600 cursor-pointer transition-all duration-150 ';

    if (isObstacle) {
      classes += 'bg-gray-800 ';
    } else {
      classes += 'bg-gray-700 hover:bg-gray-600 ';
    }

    if (isCurrentCharacter) {
      classes += 'ring-2 ring-blue-400 bg-blue-600 ';
    } else if (character) {
      if (character.type === 'enemy') {
        classes += 'bg-red-600 ';
      } else if (character.type === 'companion') {
        classes += 'bg-green-600 ';
      }
    }

    if (isInMovementRange && selectedAction === 'move') {
      classes += 'bg-blue-400 bg-opacity-30 ';
    }

    if (isInAttackRange && selectedAction === 'attack') {
      classes += 'bg-red-400 bg-opacity-30 ';
    }

    if (isOnPath) {
      classes += 'bg-yellow-400 bg-opacity-50 ';
    }

    if (isSelected) {
      classes += 'ring-2 ring-yellow-400 ';
    }

    if (isHovered) {
      classes += 'scale-110 z-10 ';
    }

    return classes;
  }, [combatState, movementRange, attackRange, pathToHovered, selectedPosition, hoveredPosition, selectedAction]);

  const getCharacterIcon = (character: Character) => {
    if (character.type === 'enemy') {
      return <Target className="w-4 h-4 text-white" />;
    } else if (character.type === 'companion') {
      return <Shield className="w-4 h-4 text-white" />;
    } else {
      return <Sword className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowMovementRange(!showMovementRange)}
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
            showMovementRange 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Move className="w-4 h-4" />
          Movement
        </button>
        <button
          onClick={() => setShowAttackRange(!showAttackRange)}
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
            showAttackRange 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Sword className="w-4 h-4" />
          Attack Range
        </button>
        <button
          className="px-3 py-1 rounded text-sm flex items-center gap-1 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Line of Sight
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div 
          className="inline-grid gap-0 border-2 border-gray-600 bg-gray-800 p-2 rounded"
          style={{ 
            gridTemplateColumns: `repeat(${combatState.battlefield.width}, minmax(0, 1fr))` 
          }}
        >
          {Array.from({ length: combatState.battlefield.height }, (_, y) =>
            Array.from({ length: combatState.battlefield.width }, (_, x) => {
              const character = combatState.characters.find(c => c.position.x === x && c.position.y === y);
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={getCellClass(x, y)}
                  onClick={() => handleCellClick({ x, y })}
                  onMouseEnter={() => setHoveredPosition({ x, y })}
                  onMouseLeave={() => setHoveredPosition(null)}
                  title={`(${x}, ${y})${character ? ` - ${character.name}` : ''}`}
                >
                  {character && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getCharacterIcon(character)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 text-xs text-gray-400 bg-gray-800 px-1 rounded opacity-70">
                    {x},{y}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>Round {combatState.round} - Turn {combatState.turn}</p>
        {currentCharacter && (
          <p>Current: {currentCharacter.name} ({currentCharacter.class})</p>
        )}
        {hoveredPosition && (
          <p>Hovered: ({hoveredPosition.x}, {hoveredPosition.y})</p>
        )}
      </div>
    </div>
  );
};