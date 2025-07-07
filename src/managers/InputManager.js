import { Physics } from '../utils/Physics.js';

export class InputManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.initKeyboardInput();
        this.initMouseInput();
    }

    initKeyboardInput() {
        this.cursors = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
    }

    initMouseInput() {
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && !this.player.isClicking) {
                this.player.isClicking = true;
                this.player.force.clickTime = 0;
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased() && this.player.isClicking) {
                this.player.isClicking = false;
                
                const force = Math.min(
                    Math.max(this.player.force.clickTime * this.player.force.clickSpeed, this.player.force.min),
                    Math.min(this.player.force.max, this.player.stamina.current)
                );
                
                const direction = Physics.calculateMouseDirection(this.scene, this.player.sprite);
                this.player.applyForce(direction, force);
                
                this.player.stamina.current -= force;
                this.player.force.clickTime = 0;
            }
        });
    }

    update() {
        if (!this.player.canMove) return;

        // Moviment horitzontal
        if (this.cursors.left.isDown) {
            if (this.player.sprite.body.velocity.x > -this.player.movement.maxSpeed) {
                this.player.applyForce([-1, 0], this.player.movement.speed);
            }
        } else if (this.cursors.right.isDown) {
            if (this.player.sprite.body.velocity.x < this.player.movement.maxSpeed) {
                this.player.applyForce([1, 0], this.player.movement.speed);
            }
        } else if (this.player.sprite.body.touching.down) {
            this.player.sprite.setVelocityX(this.player.sprite.body.velocity.x * this.player.movement.friction);
        }

        // Fricció diferent en aire/terra
        if (!this.player.sprite.body.touching.down) {
            this.player.sprite.setDrag(20, 0);
        } else {
            this.player.sprite.setDrag(100, 0);
        }
    }
}