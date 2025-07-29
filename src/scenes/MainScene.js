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
        this.load.tilemapTiledJSON('mapa', '../../nivells/mapa_chulo1.json');
        this.load.image('caselles', '../../imatges/tileset_boig.png');
        this.load.image('fons', '../../imatges/tileset_boig_fons.png');
        this.load.image('cofre', '../../imatges/cofre.png');
        this.load.image('casellesExtra', '../../imatges/tileset_boig2.png');
    }

    create() {
        // Inicialitzar el jugador
        this.spawnPoint = { x: 550, y: 22000 };
        this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
        
        // this.lootbox = new Lootbox(this, this.player);
        
        // // Configura la tecla per obrir la lootbox (per exemple, 'L')
        // this.input.keyboard.on('keydown-L', () => {
        //     const upgrades = this.lootbox.getRandomUpgrades();
        //     this.lootbox.show(upgrades);
        // });
        
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
        console.log('Creating map...');
        this.map = this.make.tilemap({ key: 'mapa', tileWidth: 64, tileHeight: 64 });
        let tileset1 = this.map.addTilesetImage('tileset_boig', 'caselles');
        let tileset2 = this.map.addTilesetImage('tileset_boig_fons', 'fons'); 
        let tileset3 = this.map.addTilesetImage('tileset_boig2', 'casellesExtra');
        
        let combinedTilesets = [tileset1, tileset2, tileset3];
        this.mainLayer = this.map.createLayer('Capa1', combinedTilesets, 0, 0);

        this.mainLayer.forEachTile(tile => {
            if (tile.properties.tipus === 'vidre') {
                const tileSprite = this.mainLayer.getTileAt(tile.x, tile.y);
                if (tileSprite) {
                    tileSprite.alpha = 0.2; // Set transparency to 50%
                }
            }
        });

        const cofres = this.physics.add.staticGroup();
        this.map.getObjectLayer('Cofres').objects.forEach(obj => {
            const cofre = cofres.create(obj.x, obj.y, 'cofre'); 
            cofre.setOrigin(0.5, 1); 
        });
        this.cofres = cofres;

        this.physics.add.collider(this.player.sprite, this.mainLayer);
        
        this.physics.add.overlap(this.player.sprite, this.cofres, 
            (playerSprite, cofre) => {
                if (!cofre.getData('obert')) {
                    this.agafaLootbox(cofre);
                }
            }, 
            null, this);
    

        this.map.setCollisionByProperty({ colisiona: true }); 
        this.mainLayer.setCollisionByProperty({ colisiona: true });
    }

    agafaLootbox(cofre) {
        this.inputManager.disableInput();
        cofre.setData('obert', true);
        this.lootbox = new Lootbox(this, this.player);
        const upgrades = this.lootbox.getRandomUpgrades();
        this.lootbox.show(upgrades);
        cofre.disableBody(true, true);
    }

    update(time, delta) {
        this.player.update(delta);
        this.uiManager.update();
        this.networkManager.update();
        this.inputManager.update();
    }
}