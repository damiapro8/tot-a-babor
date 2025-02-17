var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },  // Gravetat
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var cursors;

function preload() {
    this.load.image('player', 'imatge.png');  // Carrega la imatge del personatge
}

function create() {
    // Crea el jugador
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
    player.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla

    // Configura les teclas de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Fons i terra
    this.add.rectangle(0, window.innerHeight - 50, window.innerWidth, 50, 0x228B22).setOrigin(0, 0);  // Terra
}

function update() {
    // Moviment cap a l'esquerra i dreta
    if (cursors.left.isDown) {
        player.setVelocityX(-160);  // Moviment cap a l'esquerra
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);  // Moviment cap a la dreta
    }
    else {
        player.setVelocityX(0);  // Aturar el moviment si no es prem cap tecla
    }

    // Salt (només si el jugador està a terra)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-300);  // Salt
    }
}

// Inicialitza el joc
var game = new Phaser.Game(config);
