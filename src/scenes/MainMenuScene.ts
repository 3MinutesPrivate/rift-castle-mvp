import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width / 2, height * 0.25, '裂隙城战 / Rift Castle', {
        fontSize: '26px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5);

    const startButton = this.add.rectangle(
      width / 2,
      height * 0.55,
      200,
      60,
      0x3498db
    );
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(width / 2, height * 0.55, '开始游戏', {
      fontSize: '22px',
      color: '#ffffff'
    });
    startText.setOrigin(0.5, 0.5);

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.add
      .text(width / 2, height * 0.8, 'V0 - 玩家 vs AI 原型', {
        fontSize: '14px',
        color: '#aaaaaa'
      })
      .setOrigin(0.5, 0.5);
  }
}
