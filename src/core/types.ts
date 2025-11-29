export type Side = 'player' | 'ai';

export interface UnitConfig {
  id: string;
  name: string;
  hp: number;
  attack: number;
  attackSpeed: number; // attacks per second
  moveSpeed: number; // pixels per second
  range: number; // pixels
  cost: number;
  spawnCooldown: number;
  spriteKey: string;
}

export type BuildingType = 'barracks' | 'economy';

export interface BuildingConfigBase {
  id: string;
  name: string;
  type: BuildingType;
  cost: number;
  hp: number;
  spriteKey: string;
}

export interface BarracksBuildingConfig extends BuildingConfigBase {
  type: 'barracks';
  unitType: string;
  spawnInterval: number; // seconds
  maxCount: number;
}

export interface EconomyBuildingConfig extends BuildingConfigBase {
  type: 'economy';
  goldPerSecond: number;
}

export type BuildingConfig = BarracksBuildingConfig | EconomyBuildingConfig;

export interface SkillConfig {
  id: string;
  name: string;
  cooldown: number;
  duration: number;
  attackMultiplier: number;
  moveSpeedMultiplier: number;
}

export interface GameConfig {
  castleHp: number;
  startingGold: number;
  baseGoldPerSecond: number;
  killGoldReward: number;
  laneY: number;
  playerCastleX: number;
  aiCastleX: number;
  skillInspire: SkillConfig;
}

export function oppositeSide(side: Side): Side {
  return side === 'player' ? 'ai' : 'player';
}
