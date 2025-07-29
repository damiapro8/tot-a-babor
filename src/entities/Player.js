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

        this.health = {
            current: 100,
            max: 100,
            restedRegen: 9,
            groundDamage: 10,
            lavaDamage: 40,
            regeneration: 3
        };

        this.force = {
            max: 800,
            min: 0,
            clickTime: 0,
            clickSpeed: 800 / 2000, // 800 units in 2 seconds
            downHandicap: 0.2,
            downangle: 45
        };

        this.isClicking = false;
        this.isInWater = false; 
        this.canMove = true;
    }

    esAngleAvall(angleGraus) {
        // Normalitzem l'angle a positiu (0-360)
        const anglePositiu = angleGraus < 0 ? angleGraus + 360 : angleGraus;
        // Marge de +/- downangle al voltant de 180º (cap avall)
        return Math.abs(anglePositiu - 90) < this.force.downangle;
    }

    applyForce(vector, force) {
        Physics.applyForce(this.sprite, vector, force);
    }

    checkIfInLava() {
        const hitbox = new Phaser.Geom.Rectangle(
            this.sprite.x,
            this.sprite.y,
            this.sprite.width,
            this.sprite.height
        );
        const tiles = this.scene.mainLayer.getTilesWithinShape(hitbox, { isNotEmpty: true });
        return tiles.some(tile => tile.properties.tipus === "lava");
    }

    handleLavaDamage(delta) {
        if (this.checkIfInLava()) {
            const damage = this.health.lavaDamage * delta / 1000;
            this.health.current -= damage;

            if (this.health.current <= 0) {
                this.sprite.setPosition(this.scene.spawnPoint.x, this.scene.spawnPoint.y);
                this.health.current = this.health.max;
                this.stamina.current = this.stamina.max;
            }
        }
    }

    checkIfInWater() {
        const hitbox = new Phaser.Geom.Rectangle(
            this.sprite.x, 
            this.sprite.y, 
            this.sprite.width, 
            this.sprite.height
        );
        const tiles = this.scene.mainLayer.getTilesWithinShape(hitbox, { isNotEmpty: true });
        return tiles.some(tile => tile.properties.tipus === "aigua" || tile.properties.tipus === "lava");
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
    // Recupera més ràpid si la stamina és al màxim
    recoverHealth(delta) {
        if (this.scene.inputManager.inputEnabled) {
            let recoveryRate;
            if (this.stamina.current >= this.stamina.max) {
                recoveryRate = this.health.restedRegen * delta / 1000;
            } else {
                recoveryRate = this.health.regeneration * delta / 1000;
            }
            this.health.current += recoveryRate;
            this.health.current = Math.min(this.health.current, this.health.max);
        }
    }

    checkGroundDamage(delta) {
        // Check if the sprite is touching down (colliding with ground)
        if (this.sprite.body.blocked.down && !this.isInWater) {
            if (this.scene.inputManager.inputEnabled) {
                const damage = this.health.groundDamage * delta / 1000;
                this.health.current -= damage;

                if (this.health.current <= 0) {
                    this.sprite.setPosition(this.scene.spawnPoint.x, this.scene.spawnPoint.y);
                    this.health.current = this.health.max;
                    this.stamina.current = this.stamina.max;
                }
            }
        }
    }

    update(delta) {
        this.updateStamina(delta);
        
        if (this.isClicking) {
            this.force.clickTime += delta;
        }

        this.handleLavaDamage(delta);
        if (this.isInWater) {
            this.handleWater(delta);
        }
        
        this.recoverHealth(delta);
        this.checkGroundDamage(delta);

        
        this.canMove = this.isInWater;
    }
}