import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  private overlayContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width / 2, height * 0.2, '裂隙城战 / Rift Castle', {
        fontSize: '26px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5);

    const startButton = this.add.rectangle(
      width / 2,
      height * 0.4,
      220,
      60,
      0x3498db
    );
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(
      width / 2,
      height * 0.4,
      '开始游戏（普通）',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    startText.setOrigin(0.5, 0.5);

    startButton.on('pointerdown', () => {
      this.startGame('normal');
    });

    const difficultyLabel = this.add.text(
      width / 2,
      height * 0.52,
      '或选择难度：',
      {
        fontSize: '16px',
        color: '#dddddd'
      }
    );
    difficultyLabel.setOrigin(0.5, 0.5);

    const diffButtonWidth = 120;
    const diffButtonHeight = 44;
    const diffY = height * 0.6;
    const gap = 20;

    const normalButton = this.add.rectangle(
      width / 2 - diffButtonWidth / 2 - gap,
      diffY,
      diffButtonWidth,
      diffButtonHeight,
      0x2ecc71
    );
    normalButton.setInteractive({ useHandCursor: true });
    const normalText = this.add.text(
      normalButton.x,
      normalButton.y,
      '普通模式',
      {
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    normalText.setOrigin(0.5, 0.5);

    normalButton.on('pointerdown', () => {
      this.startGame('normal');
    });

    const hardButton = this.add.rectangle(
      width / 2 + diffButtonWidth / 2 + gap,
      diffY,
      diffButtonWidth,
      diffButtonHeight,
      0xe67e22
    );
    hardButton.setInteractive({ useHandCursor: true });
    const hardText = this.add.text(
      hardButton.x,
      hardButton.y,
      '困难模式',
      {
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    hardText.setOrigin(0.5, 0.5);

    hardButton.on('pointerdown', () => {
      this.startGame('hard');
    });

    const howToButton = this.add.rectangle(
      width / 2,
      height * 0.72,
      180,
      48,
      0x34495e
    );
    howToButton.setInteractive({ useHandCursor: true });
    const howToText = this.add.text(
      width / 2,
      height * 0.72,
      '如何游玩',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    howToText.setOrigin(0.5, 0.5);

    howToButton.on('pointerdown', () => {
      this.showHowToPlayOverlay();
    });

    this.add
      .text(width / 2, height * 0.86, 'V0.1 - 玩家 vs AI 原型', {
        fontSize: '14px',
        color: '#aaaaaa'
      })
      .setOrigin(0.5, 0.5);
  }

  private startGame(difficulty: 'normal' | 'hard'): void {
    this.scene.start('GameScene', { difficulty });
  }

  private showHowToPlayOverlay(): void {
    if (this.overlayContainer) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;

    const container = this.add.container(0, 0);

    const bg = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    const panelWidth = width * 0.85;
    const panelHeight = height * 0.7;
    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      panelWidth,
      panelHeight,
      0x222222,
      0.95
    );
    panel.setStrokeStyle(2, 0xffffff, 1);

    const content = [
      '【如何游玩（30秒看懂）】',
      '',
      '1. 建造兵营：近战兵营=前排，远程兵营=输出。',
      '2. 建造矿场：让金币越来越多，能造出更多兵营。',
      '3. 鼓舞技能：兵线很多的时候点一下，全线变强几秒。',
      '',
      '胜利条件：先摧毁敌方城堡。'
    ].join('\n');

    const text = this.add.text(
      width / 2,
      height / 2 - panelHeight / 2 + 40,
      content,
      {
        fontSize: '16px',
        color: '#ffffff',
        align: 'left',
        wordWrap: { width: panelWidth - 40 }
      }
    );
    text.setOrigin(0.5, 0);

    const closeButtonY = height / 2 + panelHeight / 2 - 40;
    const closeButton = this.add.rectangle(
      width / 2,
      closeButtonY,
      160,
      40,
      0x3498db
    );
    closeButton.setInteractive({ useHandCursor: true });

    const closeText = this.add.text(
      width / 2,
      closeButtonY,
      '我知道了',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    closeText.setOrigin(0.5, 0.5);

    closeButton.on('pointerdown', () => {
      container.destroy();
      this.overlayContainer = undefined;
    });

    container.add([bg, panel, text, closeButton, closeText]);

    this.overlayContainer = container;
  }
}
