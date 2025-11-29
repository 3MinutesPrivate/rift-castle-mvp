import type { Side } from './types';
import type { GameCore } from './GameCore';

export class AIController {
  private gameCore: GameCore;
  private side: Side;

  private decisionTimer = 0;
  private hasBuiltFirstMine = false;
  private hasBuiltFirstMelee = false;

  constructor(gameCore: GameCore, side: Side) {
    this.gameCore = gameCore;
    this.side = side;
  }

  update(deltaTime: number): void {
    if (this.gameCore.isGameOver) {
      return;
    }

    this.decisionTimer -= deltaTime;
    if (this.decisionTimer > 0) {
      return;
    }
    this.decisionTimer = 1.0;

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

    if (ownUnits + 2 < enemyUnits) {
      if (this.gameCore.buildBuilding(this.side, 'barracks_melee')) {
        return;
      }
      if (this.gameCore.buildBuilding(this.side, 'barracks_ranged')) {
        return;
      }
    }

    if (gold >= 120) {
      if (this.gameCore.buildBuilding(this.side, 'gold_mine')) {
        return;
      }
    }

    const cooldown = this.gameCore.getSkillCooldownRemaining(this.side);
    if (cooldown <= 0) {
      const ownManyUnits = ownUnits >= 5;
      const castleUnderHalf =
        (this.side === 'ai'
          ? aiCastle.hp / aiCastle.maxHp
          : playerCastle.hp / playerCastle.maxHp) < 0.5;

      if (ownManyUnits || castleUnderHalf) {
        this.gameCore.castSkill(this.side, this.gameCore.gameConfig.skillInspire.id);
      }
    }
  }
}
