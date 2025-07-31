export class LootboxOption {
    constructor(scene, x, y, width, height, optionData, esDispositiuMobil) {
        this.scene = scene;
        this.optionData = optionData;
        this.isSelected = false;
        this.fontSize = esDispositiuMobil ? width * 0.13 : width * 0.07;
        // Fons amb bordes i ombra
        this.background = scene.add.rectangle(x, y, width, height, this.getColorForRarity(optionData.rarity))
            .setOrigin(0.5, 0)
            .setStrokeStyle(3, 0x555555)
            .setInteractive()
            .on('pointerover', () => !this.isSelected && this.highlight())
            .on('pointerout', () => !this.isSelected && this.resetAppearance())
            .on('pointerdown', () => this.select());
        
        // Gradiant de selecció (invisible inicialment)
        this.selectionGlow = scene.add.rectangle(x, y, width-10, height-10, 0x4a6b8a)
            .setOrigin(0.5, 0)
            .setAlpha(0)
            .setDepth(-1);
        // text de raresa
        this.rarityText = scene.add.text(x, y + this.fontSize * 0.1, optionData.rarity.toUpperCase(), {
            fontSize: `${this.fontSize}px`,
            fill: '#fffb00ff',
            fontFamily: 'Arial',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0);

        // Icona representativa
        this.icon = scene.add.text(x, y + this.fontSize * 1.5, optionData.icon, {
            fontSize: `${this.fontSize * 1.5}px`,
        }).setOrigin(0.5, 0);
        
        // Títol
        this.title = scene.add.text(x, y + this.fontSize * 3, optionData.title, {
            fontSize: `${this.fontSize * 1.0}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            fontWeight: 'bold',
            wordWrap: { width: esDispositiuMobil ? width - 90: width - 40 },
        }).setOrigin(0.5, 0);
        
        // Descripció
        this.description = scene.add.text(x, y + this.fontSize * 6.5, optionData.description, {
            fontSize: `${this.fontSize * 0.8}px`,
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: width - 40 },
            lineSpacing: 10
        }).setOrigin(0.5, 0);
    }

    getColorForRarity() {
        switch(this.optionData.rarity) {
            case 'comú': return 0x525151;
            case 'inusual': return 0x1f6c1b;
            case 'rar': return 0x294c8d;
            case 'èpic': return 0x502a77;
            case 'llegendari': return 0x8f7f00;
            default: return 0xffffff;
        }
    }
    
    highlight() {
        this.background.setFillStyle(0x3a3a3a);
        this.selectionGlow.setAlpha(0.3);
    }
    
    resetAppearance() {
        this.background.setFillStyle(this.getColorForRarity(this.optionData.rarity));
        this.selectionGlow.setAlpha(0);
    }
    
    select() {
        // Desseleccionar altres opcions
        this.scene.lootbox.options.forEach(opt => {
            if (opt !== this) opt.deselect();
        });
        
        // Seleccionar aquesta
        this.isSelected = true;
        this.scene.lootbox.selectedOption = this;
        this.background.setFillStyle(0x3a5a7a);
        this.selectionGlow.setAlpha(0.5);
        
        // Efecte de so (opcional)
        // this.scene.sound.play('select-sound');
    }
    
    deselect() {
        this.isSelected = false;
        this.resetAppearance();
    }
    
    applyEffect() {
        if (!this.isSelected) return;
        
        // Aplicar efecte al jugador
        this.optionData.effects.forEach(effect => {
            switch(effect.type) {
                case 'increaseSpeed':
                    this.scene.player.movement.speed *= effect.value;
                    this.scene.player.movement.maxSpeed = Math.floor(this.scene.player.movement.maxSpeed * effect.value);
                    break;
                case 'increaseStamina':
                    this.scene.player.stamina.max = Math.floor(this.scene.player.stamina.max * effect.value);
                    break;
                case 'reduceClickCooldown':
                    this.scene.player.force.clickSpeed *= effect.value;
                    break;
                case 'increaseWaterRecovery':
                    this.scene.player.stamina.waterRecovery *= effect.value;
                    break;
                case 'increaseAirRecovery':
                    this.scene.player.stamina.airRecovery *= effect.value;
                    break;
                case 'increaseForce':
                    this.scene.player.force.max = Math.floor(this.scene.player.force.max * effect.value);
                    break;
                case 'scalePlayer':
                    this.scene.player.sprite.width *= effect.value;
                    this.scene.player.sprite.height *= effect.value;
                    this.scene.player.sprite.setScale(this.scene.player.sprite.scaleX * effect.value);
                    break;
                case 'increasePlayerWheight':
                    this.scene.physics.world.gravity.y *= effect.value; // Ajusta la gravetat global
                    break;
                case 'increasePlayerHealth':
                    this.scene.player.health.max = Math.floor(this.scene.player.health.max * effect.value);
                    break;
            }
        });
    }
    
    destroy() {
        this.background.destroy();
        this.selectionGlow.destroy();
        this.icon.destroy();
        this.title.destroy();
        this.description.destroy();
        this.rarityText.destroy();
    }
}