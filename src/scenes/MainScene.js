import { Player } from '../entities/Player.js';
import { UIManager } from '../managers/UIManager.js';
import { InputManager } from '../managers/InputManager.js';
import { NetworkManager } from '../managers/NetworkManager.js';
import { Lootbox } from '../entities/LootBox.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('jugador', '../../imatges/vaixell1.png');
        this.load.tilemapTiledJSON('mapa', '../../nivells/mapa_intent_4.json');
        this.load.image('caselles', '../../imatges/tileset_loco_2.png');
    }

    create() {
        // Inicialitzar el jugador
        this.player = new Player(this, 300, 12000);
        
        this.lootbox = new Lootbox(this, this.player);
        
        // Configura la tecla per obrir la lootbox (per exemple, 'L')
        this.input.keyboard.on('keydown-L', () => {
            const upgrades = this.lootbox.getRandomUpgrades();
            this.lootbox.show(upgrades);
        });
        
        // Configurar la càmera
        this.cameras.main.startFollow(this.player.sprite, false, 0.1, 0.1, 0, 50);
        this.cameras.main.setBackgroundColor(0x87CEEB);
        this.cameras.main.setZoom(0.3);

        // Inicialitzar managers
        this.uiManager = new UIManager(this, this.player);
        this.inputManager = new InputManager(this, this.player);
        this.networkManager = new NetworkManager(this, this.player);

        // Carregar el mapa
        this.createMap();

        
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'mapa', tileWidth: 64, tileHeight: 64 });
        let tileset = this.map.addTilesetImage('Caselles_2', 'caselles');

        this.groundLayer = this.map.createLayer('terra', tileset, 0, 0);
        this.waterLayer = this.map.createLayer('aigua', tileset, 0, 0);
        
        // Configurar col·lisions
        this.physics.add.collider(this.player.sprite, this.groundLayer);
        this.groundLayer.setCollisionBetween(3, 6);
        this.groundLayer.setCollisionBetween(9, 12);
        this.groundLayer.setCollisionBetween(15, 18);
        this.groundLayer.setCollisionBetween(28, 30);
        this.groundLayer.setCollisionBetween(34, 36);
    }

    update(time, delta) {
        this.player.update(delta);
        this.uiManager.update();
        this.networkManager.update();
        this.inputManager.update();
    }
}