import { Physics } from '../utils/Physics.js';

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'jugador');
        this.initPhysics();
        this.initProperties();
    }

    initPhysics() {
        this.sprite.setDepth(1);
        this.sprite.setDrag(10, 0);
        this.sprite.setMaxVelocity(1000, 1000);
    }

    initProperties() {
        this.movement = {
            speed: 5,
            maxSpeed: 300,
            friction: 0.99
        };

        this.stamina = {
            current: 1400,
            max: 1400,
            waterRecovery: 0.3,
            airRecovery: 0.05
        };

        this.force = {
            max: 800,
            min: 0,
            clickTime: 0,
            clickSpeed: 800 / 2000 
        };

        this.isClicking = false;
        this.isInWater = false; 
        this.canMove = true;
    }

    applyForce(vector, force) {
        Physics.applyForce(this.sprite, vector, force);
    }

    checkIfInWater() {
        const hitbox = new Phaser.Geom.Rectangle(
            this.sprite.x, 
            this.sprite.y, 
            this.sprite.width, 
            this.sprite.height
        );
        const tiles = this.scene.mainLayer.getTilesWithinShape(hitbox, { isNotEmpty: true });
    
        return tiles.some(tile => tile.properties.tipus === "aigua");
    }

    handleWater(delta) {
        const deltaSeconds = delta / 1000;
        const buoyancyForce = 700;
        const fallResistance = 2;
        const riseResistance = 1;

        if (this.sprite.body.velocity.y > 0) {
            this.applyForce([0, -1], buoyancyForce * deltaSeconds);
            this.applyForce([0, -1], this.sprite.body.velocity.y * fallResistance * deltaSeconds);
        } else {
            this.applyForce([0, -1], buoyancyForce * deltaSeconds);
            this.applyForce([0, -1], this.sprite.body.velocity.y * riseResistance * deltaSeconds);
        }
    }

    updateStamina(delta) {
        this.isInWater = this.checkIfInWater();
        
        const recoveryRate = this.isInWater ? 
            this.stamina.waterRecovery : 
            this.stamina.airRecovery;
            
        this.stamina.current += recoveryRate * delta;
        this.stamina.current = Math.min(this.stamina.current, this.stamina.max);
    }

    update(delta) {
        this.updateStamina(delta);
        
        if (this.isClicking) {
            this.force.clickTime += delta;
        }

        if (this.isInWater) {
            this.handleWater(delta);
        }

        this.canMove = this.isInWater;
    }
}