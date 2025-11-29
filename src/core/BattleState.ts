import type { Side } from './types';
import type { Unit } from './Unit';
import type { Building } from './Building';

export interface CastleState {
  hp: number;
  maxHp: number;
}

export class BattleState {
  time = 0; // seconds since game start
  gold: Record<Side, number>;
  castles: Record<Side, CastleState>;
  units: Unit[] = [];
  buildings: Building[] = [];

  constructor(startingGold: number, castleHp: number) {
    this.gold = {
      player: startingGold,
      ai: startingGold
    };
    this.castles = {
      player: { hp: castleHp, maxHp: castleHp },
      ai: { hp: castleHp, maxHp: castleHp }
    };
  }
}
