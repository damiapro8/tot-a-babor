import { LootboxOption } from './LootBoxOption.js';

export class Lootbox {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.options = [];
        this.isActive = false;
        this.selectedOption = null;
    }
    
    show(optionsData) {
        if (this.isActive) return;
        this.isActive = true;

        // Obtenir la mida real de la pantalla (canvas) per assegurar-se que el background cobreix tot
        const screenWidth = this.scene.sys.game.scale.width;
        const screenHeight = this.scene.sys.game.scale.height;
        // Fons semi-transparent que ocupa tota la pantalla
        this.background = this.scene.add.rectangle(
            screenWidth / 2, screenHeight / 2,
            screenWidth * 2,
            screenHeight * 2,
            0x000000, 0.7
        )
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(1005)
        .setInteractive();
        
        // Configuració de la lootbox (80% de l'amplada de pantalla)
        const lootboxWidth = screenWidth * 1.3;
        const optionWidth = (lootboxWidth - 100) / 3; // 3 opcions amb espai
        const optionHeight = screenHeight;
        
        // Posició inicial (centrat)
        const startX = (screenWidth - lootboxWidth) / 2 + optionWidth/2;
        const startY = screenHeight * 0.15;
        
        // Crear 3 opcions
        for (let i = 0; i < 3; i++) {
            const x = startX + i * (optionWidth + 50);
            const option = new LootboxOption(
                this.scene,
                x,
                startY,
                optionWidth,
                optionHeight,
                optionsData[i]
            );
            option.background.setScrollFactor(0).setDepth(1009);
            option.title.setScrollFactor(0).setDepth(1010);
            option.description.setScrollFactor(0).setDepth(1010);
            option.icon.setScrollFactor(0).setDepth(1010);
            option.rarityText.setScrollFactor(0).setDepth(1010);
            this.options.push(option);
        }
        
        // Botó de confirmació gran
        this.createSelectButton(screenWidth/2, startY + optionHeight + 50);
        
        // Pausar el joc
        this.scene.physics.pause();
        //this.scene.time.pause();
    }
    
    createSelectButton(x, y) {
        this.selectButton = this.scene.add.text(x, y, 'CONFIRMAR SELECCIÓ', {
            fontSize: '36px',
            fill: '#FFFFFF',
            backgroundColor: '#4a4a8f',
            padding: { x: 40, y: 20 },
            fontFamily: 'Arial',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1010)
        .setInteractive()
        .on('pointerover', () => this.selectButton.setBackgroundColor('#5a5a9f'))
        .on('pointerout', () => this.selectButton.setBackgroundColor('#4a4a8f'))
        .on('pointerdown', () => {
            if (this.selectedOption) {
                this.hide();
            }
        });
    }
    
    hide() {
        if (!this.isActive) return;
        
        // Aplicar l'efecte de l'opció seleccionada
        if (this.selectedOption) {
            this.selectedOption.applyEffect();
        }
        
        // Netejar
        this.options.forEach(option => option.destroy());
        this.options = [];
        this.background.destroy();
        this.selectButton.destroy();
        this.selectedOption = null;
        this.isActive = false;
        
        // Reprendre el joc
        this.scene.physics.resume();
        //this.scene.time.resume();
    }
    
    getRandomUpgrades() {
        const possibleUpgrades = [
            {
                title: "MILLOR MANIOBRABILITAT",
                description: "més facil girar el vaixell",
                effects: [{ type: 'increaseSpeed', value: 1.25 }],
                icon: '🚤',
                rarity: 'comú'
            },
            {
                title: "MILLOR RESISTÈNCIA",
                description: "Augmenta la teva resistència màxima",
                effects: [{ type: 'increaseStamina', value: 1.25 }],
                icon: '❤️',
                rarity: 'comú'
            },
            {
                title: "MILLOR CONCENTRACIÓ",
                description: "Vas més ràpid en arrivar a maxima força",
                effects: [{ type: 'reduceClickCooldown', value: 1.2 }],
                icon: '⏱️💪',
                rarity: 'inusual'
            },
            {
                title: "RECUPERACIÓ D'AIGUA",
                description: "Augmenta la recuperació de resistencia en aigua",
                effects: [{ type: 'increaseWaterRecovery', value: 1.30 }],
                icon: '⏱️💧',
                rarity: 'comú'
            },
            {
                title: "RECUPERACIÓ D'AIRE",
                description: "Augmenta la recuperació de resistencia en aire",
                effects: [{ type: 'increaseAirRecovery', value: 1.30 }],
                icon: '⏱️🌬️',
                rarity: 'inusual'
            },
            {
                title: "FORÇA MILLORADA",
                description: "Augmenta la força màxima",
                effects: [{ type: 'increaseForce', value: 1.2 }],
                icon: '💪',
                rarity: 'inusual'
            },
            {
                title: "MÉS PETIT MES HABIL",
                description: "Més petit\n millors maniobres\n més lleuger \n lleugerament més fluix\n lleugerament menys resistent",
                effects: [{ type: 'scalePlayer', value: 0.8 },
                        { type: 'increaseSpeed', value: 1.2 },
                        { type: 'increasePlayerWheight', value: 0.9 },
                        { type: 'increaseForce', value: 0.9 },
                        { type: 'increaseStamina', value: 0.9 }
                ],
                icon: '🤏',
                rarity: 'rar'
            },
            {
                title: "MÉS GRAN MES FORT",
                description: "Més gran\n Més fort \n Més resistent\n Més pesat\n lleugerament menys agil",
                effects: [
                    { type: 'increaseForce', value: 1.2 },
                    { type: 'increaseStamina', value: 1.2 },
                    { type: 'scalePlayer', value: 1.2 },
                    { type: 'increasePlayerWheight', value: 1.1 },
                    { type: 'increasePlayerSpeed', value: 0.9 }
                ],
                icon: '🦍',
                rarity: 'rar'
            },
            {
                title: "ENTRENAMENT DE AIRE",
                description: "millor recuperacio en aire\n Lleuger com l'aire\n Menys força maxima",
                effects: [{ type: 'increaseAirRecovery', value: 1.2 },
                        { type: 'increasePlayerWheight', value: 0.9 },
                        { type: 'increaseForce', value: 0.9 }
                ],
                icon: '🌬️',
                rarity: 'èpic'
            },
            {
                title: "ENTRENAMENT DE AIGUA",
                description: "millor recuperacio en aigua\n Fluid com un riu",
                effects: [{ type: 'increaseWaterRecovery', value: 1.2 },
                        { type: 'increasePlayerSpeed', value: 1.2}
                ],
                icon: '💧',
                rarity: 'èpic'
            },
            {
                title: "ETRENAMENT DE TERRA",
                description: "Mes fort\n Mes resistent\n Mes pesat\n pitjor recuperació",
                effects: [{ type: 'increaseForce', value: 1.2 },
                        { type: 'increaseStamina', value: 1.2 },
                        { type: 'increasePlayerWheight', value: 1.2 },
                        { type: 'increaseWaterRecovery', value: 0.8 },
                        { type: 'increaseAirRecovery', value: 0.8 }
                ],
                icon: '🌍',
                rarity: 'èpic'
            },
            {
                title: "ENTRENAMENT DE FOC",
                description: "més rapid\n més concentrat\n pitjor recuperació",
                effects: [
                    { type: 'increaseSpeed', value: 1.2 },
                    { type: 'reduceClickCooldown', value: 1.2 },
                    { type: 'increaseWaterRecovery', value: 0.8 },
                    { type: 'increaseAirRecovery', value: 0.8 }
                ],
                icon: '🔥',
                rarity: 'èpic'
            }
        ];
        
        return Phaser.Utils.Array.Shuffle([...possibleUpgrades]).slice(0, 3);
    }
}