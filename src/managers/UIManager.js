export class UIManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.initStaminaBar();
        this.initDebugText();
        this.initLootBox();
        this.initNameInput();
    }

    initStaminaBar() {
        const width = 300;
        const height = 30;
        const x = this.player.sprite.x - width / 2;
        const y = this.player.sprite.y - this.player.sprite.height - 30;

        this.staminaBarBg = this.scene.add.rectangle(x, y, width, height, 0x444444)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(1000);

        this.staminaBar = this.scene.add.rectangle(x, y, width, height, 0x00ff00)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(1001);

        this.staminaBarPreview = this.scene.add.rectangle(x, y, 0, height, 0xff9999)
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(1002)
            .setVisible(false);
    }

    initDebugText() {
        this.debugText = this.scene.add.text(0, 0, 'Debug Info', {
            fontSize: '40px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0)
          .setDepth(100)
          .setVisible(false);

        this.scene.input.keyboard.on('keydown-P', () => {
            this.debugText.setVisible(!this.debugText.visible);
        });
    }

    initLootBox() {
        const x = -1000;
        const y = -500;
        const width = 1000;
        const height = 1500;
        const padding = 300;
        const alpha = 0.6;

        this.lootBoxes = [
            this.createLootBox(x, y, width, height, alpha),
            this.createLootBox(x + width + padding, y, width, height, alpha),
            this.createLootBox(x + 2 * width + 2 * padding, y, width, height, alpha)
        ];
    }

    createLootBox(x, y, width, height, alpha) {
        return this.scene.add.rectangle(x, y, width, height, 0x444444)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setVisible(false)
            .setDepth(1000)
            .setAlpha(alpha);
    }

    initNameInput() {
        document.getElementById("botoComençar").onclick = () => {
            const name = document.getElementById("nomJugador").value.trim();
            if (name.length === 0) return;
            
            document.getElementById("menu-nom").style.display = "none";
            this.player.name = name;
            this.createNameLabel(name);
            
            if (this.scene.networkManager) {
                this.scene.networkManager.socket.emit("nomJugador", name);
            }
        };
    }

    createNameLabel(name) {
        this.nameLabel = this.scene.add.text(
            this.player.sprite.x, 
            this.player.sprite.y - 60, 
            name, 
            {
                fontSize: '40px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0.5)
         .setDepth(1000);
    }

    update() {
        this.updateStaminaBar();
        this.updateDebugText();
        this.updateNameLabel();
    }

    updateStaminaBar() {
        const x = this.player.sprite.x - this.staminaBarBg.width / 2;
        const y = this.player.sprite.y - this.player.sprite.height - 30;
        
        this.staminaBarBg.setPosition(x, y);
        this.staminaBar.setPosition(x, y);

        const staminaPercent = this.player.stamina.current / this.player.stamina.max;
        const newWidth = this.staminaBarBg.width * staminaPercent;
        this.staminaBar.width = newWidth;

        if (this.player.isClicking) {
            const previewForce = Math.min(
                Math.max(this.player.force.clickTime * this.player.force.clickSpeed, this.player.force.min),
                Math.min(this.player.force.max, this.player.stamina.current)
            );
            const previewPercent = previewForce / this.player.stamina.max;
            const previewWidth = this.staminaBarBg.width * previewPercent;
            
            this.staminaBarPreview.width = previewWidth;
            this.staminaBarPreview.setPosition(x + newWidth - previewWidth, y);
            this.staminaBarPreview.setVisible(true);
        } else {
            this.staminaBarPreview.setVisible(false);
        }

        // Canviar color segons stamina
        if (staminaPercent > 0.5) {
            this.staminaBar.fillColor = 0x00ff00;
        } else if (staminaPercent > 0.25) {
            this.staminaBar.fillColor = 0xffff00;
        } else {
            this.staminaBar.fillColor = 0xff0000;
        }

        const visible = this.player.isClicking || this.player.stamina.current < this.player.stamina.max;
        this.staminaBar.setVisible(visible);
        this.staminaBarBg.setVisible(visible);
    }

    updateDebugText() {
        if (this.debugText.visible) {
            this.debugText.setText(
                `VelX: ${this.player.sprite.body.velocity.x.toFixed(2)}\n` +
                `VelY: ${this.player.sprite.body.velocity.y.toFixed(2)}\n` +
                `Temps Click: ${this.player.force.clickTime.toFixed(2)} ms\n` +
                `resMax: ${this.player.stamina.max}\n` +
                `resActual: ${this.player.stamina.current}`
            );
        }
    }

    updateNameLabel() {
        if (this.nameLabel) {
            this.nameLabel.setPosition(
                this.player.sprite.x, 
                this.player.sprite.y - this.player.sprite.height - 80
            );
        }
    }
}