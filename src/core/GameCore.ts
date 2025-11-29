import { BattleState } from './BattleState';
import { Unit } from './Unit';
import { Building } from './Building';
import {
  type Side,
  type UnitConfig,
  type BuildingConfig,
  type GameConfig,
  oppositeSide
} from './types';
import { AIController } from './AIController';

import unitsData from '../config/units.json';
import buildingsData from '../config/buildings.json';
import gameConfigData from '../config/gameConfig.json';

const UNITS_CONFIG = unitsData as UnitConfig[];
const BUILDINGS_CONFIG = buildingsData as BuildingConfig[];
const GAME_CONFIG = gameConfigData as GameConfig;

export class GameCore {
  state: BattleState;
  readonly gameConfig: GameConfig;

  private unitsConfigMap: Map<string, UnitConfig>;
  private buildingsConfigMap: Map<string, BuildingConfig>;

  private nextUnitId = 1;
  private nextBuildingId = 1;

  isGameOver = false;
  winner: Side | 'draw' | null = null;

  private aiController: AIController;

  private skillCooldownRemaining: Record<Side, number>;
  private skillBuffRemaining: Record<Side, number>;

  private nextBuildingIndex: Record<Side, number>;

  constructor() {
    this.gameConfig = GAME_CONFIG;
    this.state = new BattleState(
      this.gameConfig.startingGold,
      this.gameConfig.castleHp
    );

    this.unitsConfigMap = new Map(
      UNITS_CONFIG.map((cfg) => [cfg.id, cfg])
    );
    this.buildingsConfigMap = new Map(
      BUILDINGS_CONFIG.map((cfg) => [cfg.id, cfg])
    );

    this.skillCooldownRemaining = {
      player: 0,
      ai: 0
    };
    this.skillBuffRemaining = {
      player: 0,
      ai: 0
    };

    this.nextBuildingIndex = {
      player: 0,
      ai: 0
    };

    this.aiController = new AIController(this, 'ai');
  }

  update(deltaTime: number): void {
    if (this.isGameOver) {
      return;
    }

    this.state.time += deltaTime;

    this.updateSkills(deltaTime);
    this.updateEconomy(deltaTime);
    this.updateBuildings(deltaTime);
    this.updateUnits(deltaTime);
    this.cleanupDeadUnits();
    this.checkGameOver();

    if (!this.isGameOver) {
      this.aiController.update(deltaTime);
    }
  }

  buildBuilding(side: Side, buildingId: string): boolean {
    const config = this.buildingsConfigMap.get(buildingId);
    if (!config) {
      return false;
    }

    const cost = config.cost;
    const currentGold = this.state.gold[side];

    if (currentGold < cost) {
      return false;
    }

    this.state.gold[side] -= cost;

    const index = this.nextBuildingIndex[side]++;
    const { laneY, playerCastleX, aiCastleX } = this.gameConfig;

    const direction = side === 'player' ? 1 : -1;
    const baseCastleX = side === 'player' ? playerCastleX : aiCastleX;
    const baseX = baseCastleX + direction * 60;
    const x = baseX + direction * (index * 30);
    const y = laneY - 80 + (index % 3) * 40;

    const building = new Building(
      this.nextBuildingId++,
      side,
      x,
      y,
      config
    );

    this.state.buildings.push(building);
    return true;
  }

  castSkill(side: Side, skillId: string): boolean {
    if (skillId !== this.gameConfig.skillInspire.id) {
      return false;
    }

    const cooldownRemaining = this.skillCooldownRemaining[side];
    if (cooldownRemaining > 0) {
      return false;
    }

    const skill = this.gameConfig.skillInspire;
    this.skillCooldownRemaining[side] = skill.cooldown;
    this.skillBuffRemaining[side] = skill.duration;

    return true;
  }

  getGold(side: Side): number {
    return this.state.gold[side];
  }

  getSkillCooldownRemaining(side: Side): number {
    return this.skillCooldownRemaining[side];
  }

  getSkillBuffRemaining(side: Side): number {
    return this.skillBuffRemaining[side];
  }

  getUnitConfig(id: string): UnitConfig | undefined {
    return this.unitsConfigMap.get(id);
  }

  getBuildingConfig(id: string): BuildingConfig | undefined {
    return this.buildingsConfigMap.get(id);
  }

  // --- Internal update helpers ---

  private updateSkills(deltaTime: number): void {
    (['player', 'ai'] as Side[]).forEach((side) => {
      if (this.skillCooldownRemaining[side] > 0) {
        this.skillCooldownRemaining[side] -= deltaTime;
        if (this.skillCooldownRemaining[side] < 0) {
          this.skillCooldownRemaining[side] = 0;
        }
      }
      if (this.skillBuffRemaining[side] > 0) {
        this.skillBuffRemaining[side] -= deltaTime;
        if (this.skillBuffRemaining[side] < 0) {
          this.skillBuffRemaining[side] = 0;
        }
      }
    });
  }

  private updateEconomy(deltaTime: number): void {
    const baseIncome = this.gameConfig.baseGoldPerSecond;

    this.state.gold.player += baseIncome * deltaTime;
    this.state.gold.ai += baseIncome * deltaTime;

    for (const building of this.state.buildings) {
      const cfg = this.buildingsConfigMap.get(building.configId);
      if (!cfg) continue;

      if (cfg.type === 'economy') {
        this.state.gold[building.side] += cfg.goldPerSecond * deltaTime;
      }
    }
  }

  private updateBuildings(deltaTime: number): void {
    for (const building of this.state.buildings) {
      const cfg = this.buildingsConfigMap.get(building.configId);
      if (!cfg) continue;

      if (cfg.type === 'barracks') {
        if (building.spawnTimer === null) {
          building.spawnTimer = 0;
        }
        building.spawnTimer += deltaTime;
        if (building.spawnTimer >= cfg.spawnInterval) {
          building.spawnTimer -= cfg.spawnInterval;
          this.spawnUnitFromBarracks(building, cfg);
        }
      }
    }
  }

  private spawnUnitFromBarracks(
    building: Building,
    barracksConfig: BuildingConfig
  ): void {
    if (barracksConfig.type !== 'barracks') return;

    const unitCfg = this.unitsConfigMap.get(barracksConfig.unitType);
    if (!unitCfg) return;

    const laneY = this.gameConfig.laneY;
    const direction = building.side === 'player' ? 1 : -1;
    const spawnX = building.x + direction * 10;

    const unit = new Unit(
      this.nextUnitId++,
      building.side,
      spawnX,
      laneY,
      unitCfg
    );

    this.state.units.push(unit);
  }

  private updateUnits(deltaTime: number): void {
    for (const unit of this.state.units) {
      if (unit.isDead) continue;
      this.updateSingleUnit(unit, deltaTime);
    }
  }

  private updateSingleUnit(unit: Unit, deltaTime: number): void {
    const enemySide = oppositeSide(unit.side);
    const playerCastleX = this.gameConfig.playerCastleX;
    const aiCastleX = this.gameConfig.aiCastleX;
    const enemyCastleX = unit.side === 'player' ? aiCastleX : playerCastleX;

    const buffActive = this.skillBuffRemaining[unit.side] > 0;
    const skillCfg = this.gameConfig.skillInspire;
    const attackMultiplier = buffActive ? skillCfg.attackMultiplier : 1;
    const moveMultiplier = buffActive ? skillCfg.moveSpeedMultiplier : 1;

    if (unit.attackCooldown > 0) {
      unit.attackCooldown -= deltaTime;
      if (unit.attackCooldown < 0) {
        unit.attackCooldown = 0;
      }
    }

    const enemyUnit = this.findNearestEnemyUnit(unit);
    if (enemyUnit) {
      const dist = Math.abs(enemyUnit.x - unit.x);
      if (dist <= unit.range) {
        if (unit.attackCooldown <= 0) {
          this.dealDamageToUnit(unit, enemyUnit, attackMultiplier);
          unit.attackCooldown += 1 / unit.attackSpeed;
        }
        return;
      }
    }

    const distanceToCastle = Math.abs(enemyCastleX - unit.x);
    if (distanceToCastle <= unit.range) {
      if (unit.attackCooldown <= 0) {
        this.dealDamageToCastle(unit, enemySide, attackMultiplier);
        unit.attackCooldown += 1 / unit.attackSpeed;
      }
      return;
    }

    const direction = unit.side === 'player' ? 1 : -1;
    const moveDistance = unit.moveSpeed * moveMultiplier * deltaTime;
    let newX = unit.x + direction * moveDistance;

    if (unit.side === 'player') {
      if (newX > aiCastleX) newX = aiCastleX;
    } else {
      if (newX < playerCastleX) newX = playerCastleX;
    }

    unit.x = newX;
  }

  private findNearestEnemyUnit(unit: Unit): Unit | null {
    let nearest: Unit | null = null;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (const other of this.state.units) {
      if (other.side === unit.side) continue;
      if (other.isDead) continue;

      const dist = Math.abs(other.x - unit.x);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = other;
      }
    }

    return nearest;
  }

  private dealDamageToUnit(
    attacker: Unit,
    target: Unit,
    attackMultiplier: number
  ): void {
    const damage = attacker.attack * attackMultiplier;
    target.hp -= damage;

    if (target.hp <= 0 && !target.isDead) {
      target.isDead = true;
      this.state.gold[attacker.side] += this.gameConfig.killGoldReward;
    }
  }

  private dealDamageToCastle(
    attacker: Unit,
    enemySide: Side,
    attackMultiplier: number
  ): void {
    const damage = attacker.attack * attackMultiplier;
    const castle = this.state.castles[enemySide];

    castle.hp -= damage;
    if (castle.hp < 0) {
      castle.hp = 0;
    }
  }

  private cleanupDeadUnits(): void {
    this.state.units = this.state.units.filter((u) => !u.isDead);
  }

  private checkGameOver(): void {
    const playerCastle = this.state.castles.player;
    const aiCastle = this.state.castles.ai;

    if (playerCastle.hp <= 0 || aiCastle.hp <= 0) {
      this.isGameOver = true;

      if (playerCastle.hp <= 0 && aiCastle.hp <= 0) {
        this.winner = 'draw';
      } else if (playerCastle.hp <= 0) {
        this.winner = 'ai';
      } else {
        this.winner = 'player';
      }
    }
  }
}

export default GameCore;
