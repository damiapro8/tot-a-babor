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
        .setDepth(999)
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
            option.background.setScrollFactor(0).setDepth(1000);
            option.title.setScrollFactor(0).setDepth(1001);
            option.description.setScrollFactor(0).setDepth(1001);
            option.icon.setScrollFactor(0).setDepth(1001);
            this.options.push(option);
        }
        
        // Botó de confirmació gran
        this.createSelectButton(screenWidth/2, startY + optionHeight + 50);
        
        // Pausar el joc
        this.scene.physics.pause();
        this.scene.time.pause();
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
        .setDepth(1001)
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
        this.scene.time.resume();
    }
    
    getRandomUpgrades() {
        const possibleUpgrades = [
            {
            title: "VELOCITAT MILLORADA",
            description: "Augmenta la velocitat de moviment amb A i D\nun 25%",
            effect: { type: 'increaseSpeed', value: 1.25 },
            icon: '🏃‍♂️'
            },
            {
            title: "RESISTÈNCIA MÀXIMA",
            description: "Augmenta la teva resistència\nmàxima en un 30%",
            effect: { type: 'increaseStamina', value: 1.3 },
            icon: '❤️'
            },
            {
            title: "RECUPERACIÓ RÀPIDA",
            description: "Vas un 20% més ràpid per\narrivar a maxima força",
            effect: { type: 'reduceClickCooldown', value: 1.2 },
            icon: '⏱️💪'
            },
            {
            title: "RECUPERACIÓ D'AIGUA",
            description: "Augmenta la recuperació de resistencia en aigua\nun 30%",
            effect: { type: 'increaseWaterRecovery', value: 1.3 },
            icon: '⏱️💧'
            },
            {
            title: "RECUPERACIÓ D'AIRE",
            description: "Augmenta la recuperació de resistencia en aire\nun 30%",
            effect: { type: 'increaseAirRecovery', value: 1.3 },
            icon: '⏱️🌬️'
            },
            {
            title: "FORÇA MILLORADA",
            description: "Augmenta la força màxima\nun 20%",
            effect: { type: 'increaseForce', value: 1.2 },
            icon: '💪'
            },
            {
            title: "JUGADOR MÉS PETIT",
            description: "Disminueix la mida del jugador\nun 20%",
            effect: { type: 'smallerPlayer', value: 0.8 },
            icon: '🤏'
            },

        ];
        
        return Phaser.Utils.Array.Shuffle([...possibleUpgrades]).slice(0, 3);
    }
}