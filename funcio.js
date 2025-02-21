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
var maxForce = 1000;     // Força màxima a aplicar
var minForce = 200;      // Força mínima a aplicar
var isClicking = false;  // Si s'està mantenint el clic
var clickDuration = 0;   // Temps de durada del clic
var maxClickTime = 1000; // Temps màxim per mantenir el clic (en mil·lisegons)
var VelForçaClick = 0.6;
var ClickCooldown = 5000;
var tempsEntreCooldown = 0;
var tempsIniciCooldown = 0;
var estaEnAigua = false;
var jugadorPotMoures = true;
var potFerHabilitat = false;
var aigua;
var terra;

function preload() {
    this.load.image('player', './imatges/vaixell1.png');  // Carrega la imatge del personatge
    this.load.image('terra', './imatges/sorreta.png');  // Imatge del terra
    this.load.image('aigua', './imatges/aguita.png'); // imatge de l'aigua
}

function create() {
    // Crea el jugador
    let gameWidth = this.scale.width;
    let gameHeight = this.scale.height;
    player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'player');
    player.setDepth(1);
    // player.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    player.setDrag(10, 0);  // Aplica fricció al moviment horitzontal per un efecte de relliscament
    player.setMaxVelocity(1000, 1000);
    this.cameras.main.startFollow(player, false, 0.1, 0.1);
    // Configura les tecles de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Quan es fa clic, guardar el temps d'inici del clic
    this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) { 
            if (potFerHabilitat) {
                isClicking = true;
                clickStartTime = this.time.now;  // Inici del temps de clic
            }
        }
    });

    // Quan es deixa anar el clic, calcular la força proporcional i aplicar-la
    this.input.on('pointerup', (pointer) => {
        if (pointer.leftButtonReleased()) {
            if (potFerHabilitat) {
                isClicking = false;  // Reinicia el clic
                let força = Math.min(Math.max(clickDuration * VelForçaClick, minForce), maxForce);  
                aplicaForça(calculavecJugadorRatoli(), força);
                clickDuration = 0; // Reset del temps de clic
                potFerHabilitat = false;
                tempsEntreCooldown = 0;
            }
        }
    });

    // Fons
    this.add.rectangle(0, 0, 20000, 20000, 0x87CEEB).setOrigin(0, 0);
    // Crear el terra amb física
    let terra = this.physics.add.staticGroup();
    let terraObj = terra.create(gameWidth / 2, gameHeight - 25, 'terra')
        .setDisplaySize(gameWidth, 50).setOrigin(0.5, 0).refreshBody();

    // Crear aigua amb imatge i física
    aigua = this.physics.add.staticGroup();
    let aiguaObj = aigua.create(gameWidth / 2, gameHeight - 100, 'aigua')
        .setDisplaySize(gameWidth / 2, 50).setOrigin(0.5, 0).refreshBody();

    // Fer que el jugador col·lideixi amb el terra
    this.physics.add.collider(player, terra);

    // Detectar quan el jugador toca l’aigua
    this.physics.add.overlap(player, aigua, dinsAigua, null, this);
}

function dinsAigua() {
    if (!estaEnAigua) { 
        estaEnAigua = true;
    }
    aplicaForça([0,-1],10);
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
function calculavecJugadorRatoli()
{
    let mouseX = game.input.activePointer.x;
    let mouseY = game.input.activePointer.y;
    let deltaX = mouseX - player.x;
    let deltaY = mouseY - player.y;
    return [deltaX, deltaY];
}

function aplicaForça(vector, force) {
    let vectorNorm = normalitzarVector(vector);
    player.setVelocityX(player.body.velocity.x + vectorNorm[0] * force);
    player.setVelocityY(player.body.velocity.y + vectorNorm[1] * force);
}

function comprovaReduirCooldown(delta)
{
    if (estaEnAigua && !potFerHabilitat)
    {
        tempsEntreCooldown += delta;
        if (tempsEntreCooldown >= ClickCooldown)
        {
            potFerHabilitat = true;
            tempsEntreCooldown = 0;
        }
    }
}

function update(time, delta) {
    // Si estem mantenint el clic, actualitza la durada del clic
    if (isClicking) {
        clickDuration += delta;
    }
    comprovaReduirCooldown(delta);

    estaEnAigua = this.physics.overlap(player, aigua);
    jugadorPotMoures = estaEnAigua;

    // Moviment cap a l'esquerra i dreta amb un efecte de relliscament
    if (cursors.left.isDown && jugadorPotMoures) {
        player.setVelocityX(-moveSpeed);  // Moviment cap a l'esquerra
    } else if (cursors.right.isDown && jugadorPotMoures) {
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
