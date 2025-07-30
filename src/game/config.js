export const GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false,
            fps: 60,
        }
        
    },
    scene: [],
    pixelArt: true,
    roundPixels: true
};