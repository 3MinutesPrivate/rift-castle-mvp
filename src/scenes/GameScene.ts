import Phaser from 'phaser';
import GameCore from '../core/GameCore';
import type { GameConfig, UnitConfig, BuildingConfig } from '../core/types';
import gameConfigData from '../config/gameConfig.json';

export default class GameScene extends Phaser.Scene {
  gameCore!: GameCore;
  gameConfig!: GameConfig;

  private difficulty: 'normal' | 'hard' = 'normal';

  private unitSprites: Map<number, Phaser.GameObjects.Sprite> = new Map();
  private buildingSprites: Map<number, Phaser.GameObjects.Sprite> = new Map();

  private playerCastleSprite!: Phaser.GameObjects.Sprite;
  private aiCastleSprite!: Phaser.GameObjects.Sprite;

  private isGameOverHandled = false;

  constructor() {
    super('GameScene');
  }

  init(data: { difficulty?: 'normal' | 'hard' }): void {
    this.difficulty = data.difficulty ?? 'normal';
  }

  create(): void {
    this.gameConfig = gameConfigData as GameConfig;
    this.gameCore = new GameCore(this.difficulty);

    const { laneY, playerCastleX, aiCastleX } = this.gameConfig;
    const width = this.scale.width;

    this.add.image(width / 2, laneY, 'lane').setDisplaySize(width - 160, 8);

    this.playerCastleSprite = this.add
      .sprite(playerCastleX, laneY, 'castle_player')
      .setOrigin(0.5, 0.5);

    this.aiCastleSprite = this.add
      .sprite(aiCastleX, laneY, 'castle_ai')
      .setOrigin(0.5, 0.5);

    this.scene.launch('UIScene', { gameScene: this });
  }

  update(_time: number, delta: number): void {
    const deltaSec = delta / 1000;

    this.gameCore.update(deltaSec);
    this.syncBuildings();
    this.syncUnits();
    this.updateCastlesVisual();

    if (this.gameCore.isGameOver && !this.isGameOverHandled) {
      this.handleGameOver();
      this.isGameOverHandled = true;
    }
  }

  private syncUnits(): void {
    const units = this.gameCore.state.units;
    const existingIds = new Set<number>();

    for (const unit of units) {
      existingIds.add(unit.id);

      let sprite = this.unitSprites.get(unit.id);
      const cfg = this.gameCore.getUnitConfig(unit.configId) as
        | UnitConfig
        | undefined;
      const key = cfg?.spriteKey ?? 'unit_melee';

      if (!sprite) {
        sprite = this.add.sprite(unit.x, unit.y, key);
        sprite.setOrigin(0.5, 0.5);
        if (unit.side === 'player') {
          sprite.setTint(0x66ccff);
        } else {
          sprite.setTint(0xff6666);
        }
        this.unitSprites.set(unit.id, sprite);
      }

      sprite.x = unit.x;
      sprite.y = unit.y;
    }

    for (const [id, sprite] of this.unitSprites.entries()) {
      if (!existingIds.has(id)) {
        sprite.destroy();
        this.unitSprites.delete(id);
      }
    }
  }

  private syncBuildings(): void {
    const buildings = this.gameCore.state.buildings;
    const existingIds = new Set<number>();

    for (const building of buildings) {
      existingIds.add(building.id);

      let sprite = this.buildingSprites.get(building.id);
      const cfg = this.gameCore.getBuildingConfig(building.configId) as
        | BuildingConfig
        | undefined;
      const key = cfg?.spriteKey ?? 'building_barracks_melee';

      if (!sprite) {
        sprite = this.add.sprite(building.x, building.y, key);
        sprite.setOrigin(0.5, 0.5);
        if (building.side === 'player') {
          sprite.setTint(0x66ccff);
        } else {
          sprite.setTint(0xff6666);
        }
        this.buildingSprites.set(building.id, sprite);
      }

      sprite.x = building.x;
      sprite.y = building.y;
    }

    for (const [id, sprite] of this.buildingSprites.entries()) {
      if (!existingIds.has(id)) {
        sprite.destroy();
        this.buildingSprites.delete(id);
      }
    }
  }

  private updateCastlesVisual(): void {
    const playerCastle = this.gameCore.state.castles.player;
    const aiCastle = this.gameCore.state.castles.ai;

    const playerRatio = playerCastle.hp / playerCastle.maxHp;
    const aiRatio = aiCastle.hp / aiCastle.maxHp;

    this.playerCastleSprite.setAlpha(0.5 + 0.5 * playerRatio);
    this.aiCastleSprite.setAlpha(0.5 + 0.5 * aiRatio);
  }

  private handleGameOver(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    let text = '平局';
    if (this.gameCore.winner === 'player') {
      text = '胜利！';
    } else if (this.gameCore.winner === 'ai') {
      text = '失败！';
    }

    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      120,
      0x000000,
      0.7
    );
    const label = this.add.text(width / 2, height / 2, text, {
      fontSize: '32px',
      color: '#ffffff'
    });
    label.setOrigin(0.5, 0.5);

    this.time.delayedCall(3000, () => {
      bg.destroy();
      label.destroy();
      this.scene.stop('UIScene');
      this.scene.start('MainMenuScene');
    });
  }
}
