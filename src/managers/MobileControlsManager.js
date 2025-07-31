export class MobileControls {
    constructor(scene, inputManager) {
        this.scene = scene;
        this.inputManager = inputManager;
        this.createControls();
    }

    createControls() {
        // Crear contenidor
        // this.controlsContainer = this.scene.add.container(0, 0).setDepth(100);
        
        // Crear botons
        this.createButtons();
        
        // Configurar events
        this.setupButtonEvents();
    }

    createButtons() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        // Calcular mida dels botons basada en la mida de la pantalla
        const buttonSize = Math.min(width, height) * 0.9;
        const buttonY = height * 2.0; // Posició una mica més amunt
        // Crear fons semitransparent
        this.controlsContainer = this.scene.add.container(0, 0).setDepth(100);
        const fontSize = width * 0.6;

        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: `${fontSize}px`,
            color: '#000000',
            stroke: '#000000',
            strokeThickness: 4,
            fontWeight: 'bold',
        };

        // Botó esquerre (A)
        this.leftButton = this.scene.add.sprite(width * 0.0, buttonY, 'boto_mobil')
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(buttonSize, buttonSize)
            .setAlpha(0.7)
            .setScrollFactor(0);
        
        this.leftText = this.scene.add.text(width * 0.0, buttonY, '⮜', buttonStyle)
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Botó dret (D)
        this.rightButton = this.scene.add.sprite(width * 1.0, buttonY, 'boto_mobil')
            .setInteractive()
            .setDisplaySize(buttonSize, buttonSize)
            .setAlpha(0.7)
            .setScrollFactor(0);
        
        this.rightText = this.scene.add.text(width * 1.0, buttonY, '⮞', buttonStyle)
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Afegir al contenidor
        this.controlsContainer.add([this.leftButton, this.leftText, this.rightButton, this.rightText]);
    }

    setupButtonEvents() {
        // Botó esquerre
        this.leftButton.on('pointerdown', () => {
            this.inputManager.cursors.left.isDown = true;
            this.leftButton.setAlpha(1);
            this.inputManager.mobileInputDisabled = true;
        });

        this.leftButton.on('pointerup', () => {
            this.inputManager.cursors.left.isDown = false;
            this.leftButton.setAlpha(0.7);
            this.inputManager.mobileInputDisabled = false;
        });

        this.leftButton.on('pointerout', () => {
            this.inputManager.cursors.left.isDown = false;
            this.leftButton.setAlpha(0.7);
            this.inputManager.mobileInputDisabled = false;
        });

        // Botó dret
        this.rightButton.on('pointerdown', () => {
            this.inputManager.cursors.right.isDown = true;
            this.rightButton.setAlpha(1);
            this.inputManager.mobileInputDisabled = true;
        });

        this.rightButton.on('pointerup', () => {
            this.inputManager.cursors.right.isDown = false;
            this.rightButton.setAlpha(0.7);
            this.inputManager.mobileInputDisabled = false;
        });

        this.rightButton.on('pointerout', () => {
            this.inputManager.cursors.right.isDown = false;
            this.rightButton.setAlpha(0.7);
            this.inputManager.mobileInputDisabled = false;
        });
    }

    updatePosition() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        buttonY = height * 0.9;
        this.leftButton.setY(buttonY);
        this.rightButton.setY(buttonY);
        this.leftText.setY(buttonY);
        this.rightText.setY(buttonY);
        
        this.leftButton.setX(width * 0.2);
        this.rightButton.setX(width * 0.8);
    }
}