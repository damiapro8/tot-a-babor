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
var jumpSpeed = -300;  // Velocitat del salt
var moveSpeed = 160;   // Velocitat de moviment

function preload() {
    // Assegurem-nos que la imatge del personatge es carrega correctament
    this.load.image('player', 'imatge.png');
}

function create() {
    // Comprovem si la imatge s'ha carregat
    if (!this.textures.exists('player')) {
        console.error("Imatge del personatge no trobada!");
    }

    // Crea el jugador amb les propietats inicials
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
    player.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    player.setBounce(0.1);  // Potència del rebote
    player.setDrag(500, 0);  // Fricció per evitar que el jugador es mogui massa ràpid

    // Configura les teclas de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Afegim terra per a que el jugador pugui col·lidir amb ell
    this.add.rectangle(0, window.innerHeight - 50, window.innerWidth, 50, 0x228B22).setOrigin(0, 0).setDepth(0);
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
        player.setVelocityX(player.body.velocity.x * 0.9);  // Apliqueu un factor de fricció
    }

    // Salt (només si el jugador està a terra)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpSpeed);  // Salt
    }
}

// Inicialitza el joc
var game = new Phaser.Game(config);
