import { GameConfig } from './config.js';
import { MainScene } from '../scenes/MainScene.js';

export class Game {
    constructor() {
        this.config = GameConfig;
        this.config.scene = [MainScene];
        this.game = new Phaser.Game(this.config);
    }
}