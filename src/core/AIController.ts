import type { Side, BuildingConfig } from './types';
import type { GameCore } from './GameCore';

export class AIController {
  private gameCore: GameCore;
  private side: Side;
  private difficulty: 'normal' | 'hard';

  private decisionTimer = 0;
  private hasBuiltFirstMine = false;
  private hasBuiltFirstMelee = false;

  constructor(
    gameCore: GameCore,
    side: Side,
    difficulty: 'normal' | 'hard' = 'normal'
  ) {
    this.gameCore = gameCore;
    this.side = side;
    this.difficulty = difficulty;
  }

  update(deltaTime: number): void {
    if (this.gameCore.isGameOver) {
      return;
    }

    this.decisionTimer -= deltaTime;
    if (this.decisionTimer > 0) {
      return;
    }
    const interval = this.difficulty === 'hard' ? 0.5 : 1.0;
    this.decisionTimer = interval;

    const state = this.gameCore.state;
    const time = state.time;
    const gold = state.gold[this.side];

    const ownUnits = state.units.filter(
      (u) => u.side === this.side && !u.isDead
    ).length;
    const enemyUnits = state.units.filter(
      (u) => u.side !== this.side && !u.isDead
    ).length;

    const playerCastle = state.castles.player;
    const aiCastle = state.castles.ai;

    const buildings = state.buildings;
    let economyCount = 0;
    let barracksCount = 0;
    for (const b of buildings) {
      if (b.side !== this.side) continue;
      const cfg = this.gameCore.getBuildingConfig(b.configId) as
        | BuildingConfig
        | undefined;
      if (!cfg) continue;
      if (cfg.type === 'economy') {
        economyCount += 1;
      } else if (cfg.type === 'barracks') {
        barracksCount += 1;
      }
    }

    if (!this.hasBuiltFirstMine && time < 30) {
      if (this.gameCore.buildBuilding(this.side, 'gold_mine')) {
        this.hasBuiltFirstMine = true;
        return;
      }
    }

    if (!this.hasBuiltFirstMelee) {
      if (this.gameCore.buildBuilding(this.side, 'barracks_melee')) {
        this.hasBuiltFirstMelee = true;
        return;
      }
    }

    if (this.difficulty === 'hard') {
      if (ownUnits <= enemyUnits) {
        if (this.gameCore.buildBuilding(this.side, 'barracks_melee')) {
          return;
        }
        if (this.gameCore.buildBuilding(this.side, 'barracks_ranged')) {
          return;
        }
      } else {
        if (this.gameCore.buildBuilding(this.side, 'barracks_ranged')) {
          return;
        }
      }

      if (gold >= 150 && barracksCount >= 2 && economyCount < 3) {
        if (this.gameCore.buildBuilding(this.side, 'gold_mine')) {
          return;
        }
      }
    } else {
      if (ownUnits + 2 < enemyUnits) {
        if (this.gameCore.buildBuilding(this.side, 'barracks_melee')) {
          return;
        }
        if (this.gameCore.buildBuilding(this.side, 'barracks_ranged')) {
          return;
        }
      }

      if (gold >= 120 && economyCount < 3) {
        if (this.gameCore.buildBuilding(this.side, 'gold_mine')) {
          return;
        }
      }
    }

    const cooldown = this.gameCore.getSkillCooldownRemaining(this.side);
    if (cooldown <= 0) {
      if (this.difficulty === 'hard') {
        const hasAdvantage = ownUnits >= enemyUnits + 1 && ownUnits >= 3;

        if (hasAdvantage) {
          this.gameCore.castSkill(
            this.side,
            this.gameCore.gameConfig.skillInspire.id
          );
        }
      } else {
        const ownManyUnits = ownUnits >= 5;
        const castleUnderHalf =
          (this.side === 'ai'
            ? aiCastle.hp / aiCastle.maxHp
            : playerCastle.hp / playerCastle.maxHp) < 0.5;

        if (ownManyUnits || castleUnderHalf) {
          this.gameCore.castSkill(
            this.side,
            this.gameCore.gameConfig.skillInspire.id
          );
        }
      }
    }
  }
}
