/**
 * A* pathfinding algorithm for tactical combat movement
 * Handles obstacles, other characters, and movement costs
 */

import type { Position, CombatState } from '../core/types.js';

interface PathNode {
  position: Position;
  gCost: number;
  hCost: number;
  fCost: number;
  parent?: PathNode;
}

export function calculateDistance(start: Position, end: Position): number {
  return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
}

export function getNeighbors(position: Position, battlefield: { width: number; height: number }): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }
  ];
  
  for (const dir of directions) {
    const newPos = { x: position.x + dir.x, y: position.y + dir.y };
    if (newPos.x >= 0 && newPos.x < battlefield.width && 
        newPos.y >= 0 && newPos.y < battlefield.height) {
      neighbors.push(newPos);
    }
  }
  
  return neighbors;
}

export function isPositionBlocked(position: Position, combatState: CombatState, excludeCharacter?: string): boolean {
  // Check obstacles
  if (combatState.battlefield.obstacles.some(obs => obs.x === position.x && obs.y === position.y)) {
    return true;
  }
  
  // Check other characters
  return combatState.characters.some(char => 
    char.id !== excludeCharacter &&
    char.position.x === position.x && 
    char.position.y === position.y &&
    char.health.current > 0
  );
}

export function findPath(
  start: Position, 
  end: Position, 
  combatState: CombatState, 
  excludeCharacter?: string
): Position[] | null {
  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();
  
  const startNode: PathNode = {
    position: start,
    gCost: 0,
    hCost: calculateDistance(start, end),
    fCost: 0
  };
  startNode.fCost = startNode.gCost + startNode.hCost;
  
  openSet.push(startNode);
  
  while (openSet.length > 0) {
    // Find node with lowest fCost
    openSet.sort((a, b) => a.fCost - b.fCost);
    const currentNode = openSet.shift()!;
    
    const nodeKey = `${currentNode.position.x},${currentNode.position.y}`;
    closedSet.add(nodeKey);
    
    // Check if we reached the target
    if (currentNode.position.x === end.x && currentNode.position.y === end.y) {
      const path: Position[] = [];
      let current: PathNode | undefined = currentNode;
      
      while (current) {
        path.unshift(current.position);
        current = current.parent;
      }
      
      return path;
    }
    
    // Check neighbors
    for (const neighborPos of getNeighbors(currentNode.position, combatState.battlefield)) {
      const neighborKey = `${neighborPos.x},${neighborPos.y}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      // Skip if blocked (unless it's the target)
      if (isPositionBlocked(neighborPos, combatState, excludeCharacter) && 
          !(neighborPos.x === end.x && neighborPos.y === end.y)) {
        continue;
      }
      
      const tentativeGCost = currentNode.gCost + 1;
      
      // Check if this neighbor is already in open set with better path
      const existingNode = openSet.find(node => 
        node.position.x === neighborPos.x && node.position.y === neighborPos.y
      );
      
      if (existingNode && tentativeGCost >= existingNode.gCost) {
        continue;
      }
      
      // Create new node or update existing one
      const neighborNode: PathNode = existingNode || {
        position: neighborPos,
        gCost: 0,
        hCost: calculateDistance(neighborPos, end),
        fCost: 0
      };
      
      neighborNode.gCost = tentativeGCost;
      neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
      neighborNode.parent = currentNode;
      
      if (!existingNode) {
        openSet.push(neighborNode);
      }
    }
  }
  
  return null; // No path found
}

export function getPositionsInRange(center: Position, range: number, combatState: CombatState): Position[] {
  const positions: Position[] = [];
  
  for (let x = Math.max(0, center.x - range); x <= Math.min(combatState.battlefield.width - 1, center.x + range); x++) {
    for (let y = Math.max(0, center.y - range); y <= Math.min(combatState.battlefield.height - 1, center.y + range); y++) {
      const distance = calculateDistance(center, { x, y });
      if (distance <= range) {
        positions.push({ x, y });
      }
    }
  }
  
  return positions;
}

export function hasLineOfSight(start: Position, end: Position, combatState: CombatState): boolean {
  // Simple line of sight using Bresenham's line algorithm
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;
  
  let x = start.x;
  let y = start.y;
  
  while (true) {
    // Check if current position blocks line of sight (except start and end)
    if (!(x === start.x && y === start.y) && !(x === end.x && y === end.y)) {
      if (combatState.battlefield.obstacles.some(obs => obs.x === x && obs.y === y)) {
        return false;
      }
    }
    
    if (x === end.x && y === end.y) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  
  return true;
}