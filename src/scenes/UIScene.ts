import Phaser from 'phaser';
import type GameScene from './GameScene';
import type { Side } from '../core/types';

export default class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;

  private goldText!: Phaser.GameObjects.Text;
  private playerHpText!: Phaser.GameObjects.Text;
  private aiHpText!: Phaser.GameObjects.Text;
  private hpBarGraphics!: Phaser.GameObjects.Graphics;

  private skillButtonRect!: Phaser.GameObjects.Rectangle;
  private skillButtonText!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  init(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.hpBarGraphics = this.add.graphics();

    this.goldText = this.add.text(width / 2, 10, '金币: 0', {
      fontSize: '16px',
      color: '#ffeb3b'
    });
    this.goldText.setOrigin(0.5, 0);

    this.playerHpText = this.add.text(10, 10, '我方城堡: 0/0', {
      fontSize: '14px',
      color: '#ffffff'
    });

    this.aiHpText = this.add.text(width - 10, 10, '敌方城堡: 0/0', {
      fontSize: '14px',
      color: '#ffffff'
    });
    this.aiHpText.setOrigin(1, 0);

    const margin = 8;
    const buttonWidth = (width - margin * 5) / 4;
    const buttonHeight = 48;
    const y = height - buttonHeight / 2 - margin;

    const meleeButton = this.createButton(
      margin + buttonWidth / 2,
      y,
      buttonWidth,
      buttonHeight,
      '近战兵营\n50',
      () => this.tryBuild('barracks_melee')
    );

    const rangedButton = this.createButton(
      margin * 2 + buttonWidth * 1.5,
      y,
      buttonWidth,
      buttonHeight,
      '远程兵营\n60',
      () => this.tryBuild('barracks_ranged')
    );

    const mineButton = this.createButton(
      margin * 3 + buttonWidth * 2.5,
      y,
      buttonWidth,
      buttonHeight,
      '矿场\n80',
      () => this.tryBuild('gold_mine')
    );

    const skillButton = this.createButton(
      margin * 4 + buttonWidth * 3.5,
      y,
      buttonWidth,
      buttonHeight,
      '鼓舞',
      () => this.tryCastSkill('player', 'inspire')
    );

    this.skillButtonRect = skillButton.rect;
    this.skillButtonText = skillButton.text;

    meleeButton.rect.setStrokeStyle(2, 0x2ecc71, 1);
    rangedButton.rect.setStrokeStyle(2, 0x3498db, 1);
    mineButton.rect.setStrokeStyle(2, 0xf1c40f, 1);
    this.skillButtonRect.setStrokeStyle(2, 0xe67e22, 1);

    this.scene.bringToTop();
  }

  update(): void {
    if (!this.gameScene) return;

    const core = this.gameScene.gameCore;
    const state = core.state;
    const width = this.scale.width;

    const gold = Math.floor(core.getGold('player'));
    this.goldText.setText(`金币: ${gold}`);

    const playerCastle = state.castles.player;
    const aiCastle = state.castles.ai;

    this.playerHpText.setText(
      `我方城堡: ${Math.max(0, Math.floor(playerCastle.hp))}/${playerCastle.maxHp}`
    );
    this.aiHpText.setText(
      `敌方城堡: ${Math.max(0, Math.floor(aiCastle.hp))}/${aiCastle.maxHp}`
    );

    this.hpBarGraphics.clear();

    const barWidth = width * 0.3;
    const barHeight = 10;
    const marginTop = 32;

    const playerRatio = playerCastle.hp / playerCastle.maxHp;
    const aiRatio = aiCastle.hp / aiCastle.maxHp;

    this.hpBarGraphics.fillStyle(0x555555, 1);
    this.hpBarGraphics.fillRect(10, marginTop, barWidth, barHeight);
    this.hpBarGraphics.fillRect(
      width - 10 - barWidth,
      marginTop,
      barWidth,
      barHeight
    );

    this.hpBarGraphics.fillStyle(0x2ecc71, 1);
    this.hpBarGraphics.fillRect(
      10,
      marginTop,
      barWidth * Phaser.Math.Clamp(playerRatio, 0, 1),
      barHeight
    );

    this.hpBarGraphics.fillStyle(0xe74c3c, 1);
    this.hpBarGraphics.fillRect(
      width - 10 - barWidth,
      marginTop,
      barWidth * Phaser.Math.Clamp(aiRatio, 0, 1),
      barHeight
    );

    const cooldown = core.getSkillCooldownRemaining('player');
    if (cooldown > 0) {
      this.skillButtonRect.setFillStyle(0x555555, 1);
      const cdText = Math.ceil(cooldown);
      this.skillButtonText.setText(`鼓舞\n${cdText}s`);
    } else {
      const buffRemaining = core.getSkillBuffRemaining('player');
      if (buffRemaining > 0) {
        this.skillButtonRect.setFillStyle(0x27ae60, 1);
        const remainText = buffRemaining.toFixed(1);
        this.skillButtonText.setText(`鼓舞中\n${remainText}s`);
      } else {
        this.skillButtonRect.setFillStyle(0x16a085, 1);
        this.skillButtonText.setText('鼓舞');
      }
    }
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void
  ): { rect: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text } {
    const rect = this.add.rectangle(x, y, width, height, 0x333333);
    rect.setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    });
    text.setOrigin(0.5, 0.5);

    rect.on('pointerdown', () => {
      if (!this.gameScene || this.gameScene.gameCore.isGameOver) return;
      onClick();
    });

    return { rect, text };
  }

  private tryBuild(buildingId: string): void {
    if (!this.gameScene) return;
    this.gameScene.gameCore.buildBuilding('player', buildingId);
  }

  private tryCastSkill(side: Side, skillId: string): void {
    if (!this.gameScene) return;
    this.gameScene.gameCore.castSkill(side, skillId);
  }
}
