import { Physics } from '../utils/Physics.js';

export class InputManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.inputEnabled = false; // Desactivat per defecte
        this.initKeyboardInput();
        this.initMouseInput();
    }

    initKeyboardInput() {
        this.cursors = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        
        // Desactivar l'escolta d'events del teclat global
        this.scene.input.keyboard.enabled = false;
    }

    initMouseInput() {
        this.scene.input.mouse.disableContextMenu();
        
        this.pointerDownHandler = (pointer) => {
            if (!this.inputEnabled) return;
            
            if (pointer.leftButtonDown() && !this.player.isClicking) {
                this.player.isClicking = true;
                this.player.force.clickTime = 0;
            }
        };
        
        this.pointerUpHandler = (pointer) => {
            if (!this.inputEnabled) return;
            
            if (pointer.leftButtonReleased() && this.player.isClicking) {
                this.player.isClicking = false;

                
                
                let force = Math.min(
                    Math.max(this.player.force.clickTime * this.player.force.clickSpeed, this.player.force.min),
                    Math.min(this.player.force.max, this.player.stamina.current)
                );
                
                const direction = Physics.calculateMouseDirection(this.scene, this.player.sprite);

                //miro si l'angle és cap avall
                const angle = Physics.calculateMouseAngle(this.scene, this.player.sprite);

                this.player.stamina.current -= force;
                

                if (this.player.esAngleAvall(angle)) {
                    force *= this.player.force.downHandicap;
                }

                this.player.applyForce(direction, force);
                
                this.player.force.clickTime = 0;
            }
        };
        
        this.scene.input.on('pointerdown', this.pointerDownHandler);
        this.scene.input.on('pointerup', this.pointerUpHandler);
    }

    update() {
        if (!this.player.canMove || !this.inputEnabled) return;

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

    enableInput() {
        this.inputEnabled = true;
        this.scene.input.keyboard.enabled = true;
    }

    disableInput() {
        this.inputEnabled = false;
        this.scene.input.keyboard.enabled = false;
    }
    
    destroy() {
        this.scene.input.off('pointerdown', this.pointerDownHandler);
        this.scene.input.off('pointerup', this.pointerUpHandler);
    }
}