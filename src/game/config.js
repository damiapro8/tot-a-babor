import { esDispositiuMobil  } from '../utils/altres.js';

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
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    callbacks: {
        postBoot: function(game) {
            if (esDispositiuMobil()) {
                // screen.orientation?.lock('landscape')
                //     .catch(error => {
                //         console.log("No s'ha pogut bloquejar l'orientació:", error);
                //         const escenaPrincipal = game.scene.getScenes(true)[0];
                //         if (escenaPrincipal && escenaPrincipal.mostrarAvisOrientacio) {
                //             escenaPrincipal.mostrarAvisOrientacio();
                //         }
                //     });
                
                window.addEventListener('resize', () => {
                    game.scale.resize(window.innerWidth, window.innerHeight);
                });
            }
        }
    }
};

