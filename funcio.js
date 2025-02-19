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
var jumpSpeed = -800;  // Velocitat del salt
var moveSpeed = 200;   // Velocitat de moviment
var friction = 0.99;   // Factor de fricció per a l'efecte de relliscament
var clickStartTime = 0;  // Temps de l'inici del clic
var maxForce = 800;     // Força màxima a aplicar
var minForce = 300;
var isClicking = false;  // Si s'està mantenint el clic

function preload() {
    this.load.image('player', './imatges/imatge.png');  // Carrega la imatge del personatge
}

function create() {
    // Crea el jugador
    let gameWidth = this.scale.width;
    let gameHeight = this.scale.height;
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'player');
    player.setDepth(1);
    player.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    player.setDrag(10, 0);  // Aplica fricció al moviment horitzontal per un efecte de relliscament
    player.setMaxVelocity(1000, 1000);

    // Configura les tecles de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Quan es fa clic, guardar el temps d'inici del clic
    this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) {
            isClicking = true;
            clickStartTime = this.time.now;  // Inici del temps de clic
        }
    });

    // Quan es deixa anar el clic, calcular la força proporcional i aplicar-la
    this.input.on('pointerup', (pointer) => {
        if (pointer.leftButtonReleased()) {
            let clickDuration = this.time.now - clickStartTime;  // Temps de durada del clic
            let force = Math.min(Math.max(clickDuration, minForce), maxForce);  // Força proporcional, amb mínim i màxim
            // Obtenim la posició del ratolí
            let mouseX = pointer.x;
            let mouseY = pointer.y;

            // Calcula el vector des del jugador fins al ratolí
            let deltaX = mouseX - player.x;
            let deltaY = mouseY - player.y;

            aplicaForça([deltaX, deltaY], force);  // Crida a la funció `aplicaForça` amb la força calculada
            isClicking = false;  // Reinicia el clic
        }
    });

    // Fons i terra
    this.add.rectangle(0, 0, gameWidth, gameHeight, 0x87CEEB).setOrigin(0, 0);
    // Crear el terra amb física
    let terra = this.physics.add.staticGroup();
    terra.create(gameWidth / 2, gameHeight - 25, null).setDisplaySize(gameWidth, 50).setOrigin(0.5, 0).refreshBody();

    // Fer que el jugador col·lideixi amb el terra
    this.physics.add.collider(player, terra);
}

function normalitzarVector(vector) {
    // Calcular la norma (mòdul) del vector
    let norma = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

    // Evitar la divisió per 0 en cas que el vector sigui el vector nul
    if (norma === 0) {
        return [0, 0];
    }

    // Normalitzar el vector dividint cada component per la norma
    return [vector[0] / norma, vector[1] / norma];
}

function aplicaForça(vector, força) {
    let vectorNorm = normalitzarVector(vector);
    player.setVelocityX(player.body.velocity.x + vectorNorm[0] * força);
    player.setVelocityY(player.body.velocity.y + vectorNorm[1] * força);
}

function update() {
    // Moviment cap a l'esquerra i dreta amb un efecte de relliscament
    if (cursors.left.isDown && player.body.touching.down) {
        player.setVelocityX(-moveSpeed);  // Moviment cap a l'esquerra
    } else if (cursors.right.isDown && player.body.touching.down) {
        player.setVelocityX(moveSpeed);  // Moviment cap a la dreta
    } else if (player.body.touching.down) {
        // Si el jugador està a terra i no es prem cap tecla, aplica més fricció
        player.setVelocityX(player.body.velocity.x * friction); // Fricció només quan estigui a terra
    }

    // Quan estigui en l'aire (no toqui el terra), no s'aplica fricció
    if (!player.body.touching.down) {
        // Desactivar fricció en l'aire
        player.setDrag(20, 0);  // Desactivar fricció horitzontal en l'aire
    } else {
        // Aplicar fricció només quan estigui a terra
        player.setDrag(100, 0); // Torna a aplicar fricció a terra
    }
}

// Inicialitza el joc
var game = new Phaser.Game(config);
