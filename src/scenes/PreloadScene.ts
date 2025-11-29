import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    const text = this.add.text(width / 2, height / 2, '加载中...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    text.setOrigin(0.5, 0.5);
  }

  create(): void {
    const g = this.add.graphics();

    // 兵种占位贴图
    g.clear();
    g.fillStyle(0x2ecc71, 1);
    g.fillRect(0, 0, 24, 24);
    g.generateTexture('unit_melee', 24, 24);

    g.clear();
    g.fillStyle(0x3498db, 1);
    g.fillRect(0, 0, 24, 24);
    g.generateTexture('unit_archer', 24, 24);

    g.clear();
    g.fillStyle(0xe74c3c, 1);
    g.fillRect(0, 0, 24, 24);
    g.generateTexture('unit_bomber', 24, 24);

    // 建筑占位贴图
    g.clear();
    g.fillStyle(0x95a5a6, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('building_barracks_melee', 32, 32);

    g.clear();
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(2, 2, 28, 28);
    g.generateTexture('building_barracks_ranged', 32, 32);

    g.clear();
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('building_gold_mine', 32, 32);

    // 城堡占位贴图
    g.clear();
    g.fillStyle(0x2980b9, 1);
    g.fillRect(0, 0, 64, 80);
    g.generateTexture('castle_player', 64, 80);

    g.clear();
    g.fillStyle(0xc0392b, 1);
    g.fillRect(0, 0, 64, 80);
    g.generateTexture('castle_ai', 64, 80);

    // 兵线占位贴图
    g.clear();
    g.fillStyle(0x444444, 1);
    g.fillRect(0, 0, 800, 8);
    g.generateTexture('lane', 800, 8);

    g.destroy();

    this.scene.start('MainMenuScene');
  }
}
