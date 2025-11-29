import type {
  Side,
  BuildingType,
  BuildingConfig,
  BarracksBuildingConfig,
  EconomyBuildingConfig
} from './types';

export class Building {
  id: number;
  side: Side;
  x: number;
  y: number;

  configId: string;
  type: BuildingType;

  maxHp: number;
  hp: number;

  // 兵营专用：刷兵计时器
  spawnTimer: number | null = null;

  constructor(id: number, side: Side, x: number, y: number, config: BuildingConfig) {
    this.id = id;
    this.side = side;
    this.x = x;
    this.y = y;

    this.configId = config.id;
    this.type = config.type;

    this.maxHp = config.hp;
    this.hp = config.hp;

    if (config.type === 'barracks') {
      this.spawnTimer = 0;
    }
  }

  isBarracks(config: BuildingConfig): config is BarracksBuildingConfig {
    return config.type === 'barracks';
  }

  isEconomy(config: BuildingConfig): config is EconomyBuildingConfig {
    return config.type === 'economy';
  }
}
