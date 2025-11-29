import type { Side, UnitConfig } from './types';

export class Unit {
  id: number;
  side: Side;
  x: number;
  y: number;

  configId: string;

  maxHp: number;
  hp: number;

  attack: number;
  attackSpeed: number; // attacks per second
  attackCooldown: number; // seconds until next attack

  moveSpeed: number; // pixels per second
  range: number; // pixels

  isDead = false;

  // Buff 相关（用于技能“全线鼓舞”）
  damageMultiplier = 1;
  moveSpeedMultiplier = 1;

  constructor(id: number, side: Side, x: number, y: number, config: UnitConfig) {
    this.id = id;
    this.side = side;
    this.x = x;
    this.y = y;

    this.configId = config.id;

    this.maxHp = config.hp;
    this.hp = config.hp;

    this.attack = config.attack;
    this.attackSpeed = config.attackSpeed;
    this.attackCooldown = 0;

    this.moveSpeed = config.moveSpeed;
    this.range = config.range;
  }
}
