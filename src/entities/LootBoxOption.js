export class LootboxOption {
    constructor(scene, x, y, width, height, optionData) {
        this.scene = scene;
        this.optionData = optionData;
        this.isSelected = false;
        
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
        this.rarityText = scene.add.text(x, y + 10, optionData.rarity.toUpperCase(), {
            fontSize: '40px',
            fill: '#fffb00ff',
            fontFamily: 'Arial',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0);

        // Icona representativa
        this.icon = scene.add.text(x, y + 60, optionData.icon, {
            fontSize: '120px',
        }).setOrigin(0.5, 0);
        
        // Títol
        this.title = scene.add.text(x, y + 190, optionData.title, {
            fontSize: '50px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0);
        
        // Descripció
        this.description = scene.add.text(x, y + 270, optionData.description, {
            fontSize: '40px',
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
                    this.scene.player.stamina.current = Math.min(
                        this.scene.player.stamina.current, 
                        this.scene.player.stamina.max
                    );
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
                    this.scene.player.force.clickSpeed = this.scene.player.force.max / 2000;
                    break;
                case 'scalePlayer':
                    this.scene.player.sprite.width *= effect.value;
                    this.scene.player.sprite.height *= effect.value;
                    this.scene.player.sprite.setScale(this.scene.player.sprite.scaleX * effect.value);
                    break;
                case 'increasePlayerWheight':
                    this.scene.physics.world.gravity.y *= effect.value; // Ajusta la gravetat global
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