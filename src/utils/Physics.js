export class Physics {
    static normalizeVector(vector) {
        const magnitude = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        return magnitude === 0 ? [0, 0] : [vector[0] / magnitude, vector[1] / magnitude];
    }

    static calculateMouseDirection(scene, sprite) {
        const mouseX = scene.input.activePointer.worldX;
        const mouseY = scene.input.activePointer.worldY;
        return [mouseX - sprite.x, mouseY - sprite.y];
    }

    static applyForce(sprite, vector, force) {
        const normalizedVector = this.normalizeVector(vector);
        sprite.setVelocityX(sprite.body.velocity.x + normalizedVector[0] * force);
        sprite.setVelocityY(sprite.body.velocity.y + normalizedVector[1] * force);
    }
}