var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
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
var jumpSpeed = -300;  // Velocitat del salt
var moveSpeed = 160;   // Velocitat de moviment
var friction = 0.85;   // Factor de fricció per a l'efecte de relliscament

function preload() {
    this.load.image('player', 'imatge.png');  // Carrega la imatge del personatge
}

function create() {
    // Crea el jugador
    let gameWidth = this.scale.width;
    let gameHeight = this.scale.height;
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'player');
    player.setDepth(1);
    player.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    player.setDrag(1000, 0);  // Aplica fricció al moviment horitzontal per un efecte de relliscament

    // Configura les teclas de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Fons i terra
    // Creem el terra amb física
    this.add.rectangle(0, 0, gameWidth, gameHeight, 0x87CEEB).setOrigin(0, 0);
    // Crear el terra amb física
    let terra = this.physics.add.staticGroup();
    terra.create(gameWidth / 2, gameHeight - 25, null).setDisplaySize(gameWidth, 50).setOrigin(0.5, 0).refreshBody();

    // Fer que el jugador col·lideixi amb el terra
    this.physics.add.collider(player, terra);

}

function update() {
    // Moviment cap a l'esquerra i dreta amb un efecte de relliscament
    if (cursors.left.isDown) {
        player.setVelocityX(-moveSpeed);  // Moviment cap a l'esquerra
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(moveSpeed);  // Moviment cap a la dreta
    }
    else {
        // Si no es prem cap tecla, aplica fricció per aturar el moviment
        player.setVelocityX(player.body.velocity.x * friction);
    }

    // Salt (només si el jugador està a terra)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpSpeed);  // Salt
    }
}

// Inicialitza el joc
var game = new Phaser.Game(config);
