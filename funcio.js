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

var jugador;
var cursors;

var velMoviment = 5;   // Velocitat de moviment
var velMaxMoviment = 300; // Velocitat maxima per moures amb A i D (no limita lo altre)
var friccio = 0.99;   // Factor de fricció per a l'efecte de relliscament
var ForçaMax = 800;     // Força màxima a aplicar
var ForçaMin = 200;      // Força mínima a aplicar
var isClicking = false;  // Si s'està mantenint el clic
var TempsFentClick = 0;   // Temps de durada del clic
var VelForçaClick = ForçaMax/ForçaMin/10; // mutiplicador de força per temps clickant (en 2s (ForçaMax/velForçaClick) s'arriba a max)
var ClickCooldown = 2000; // temps per poder tornar a mantenir
var tempsEntreCooldown = 5000;
var estaEnAigua = false;
var jugadorPotMoures = true;
var potFerHabilitat = false;

var textDebugar;

var capaAigua;
var capaTerra;
var mapa;



function preload() {
    this.load.image('jugador', './imatges/vaixell1.png');  // Carrega la imatge del personatge
    this.load.tilemapTiledJSON('mapa', './nivells/mapa_intent_3.json');

    this.load.image('caselles', './imatges/tileset_loco_2.png'); // Carrega la imatge del tileset
    
}

function create() {
    // Crea el jugador
    let gameWidth = this.scale.width;
    let gameHeight = this.scale.height;
    jugador = this.physics.add.sprite(300, 12000, 'jugador');
    jugador.setDepth(1);
    // jugador.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    jugador.setDrag(10, 0);  // Aplica fricció al moviment horitzontal per un efecte de relliscament
    jugador.setMaxVelocity(1000, 1000);
    this.cameras.main.startFollow(jugador, false, 0.1, 0.1, 0, 50);
    this.cameras.main.setBackgroundColor(0x87CEEB); // Blau cel

    // Configura les tecles de moviment
    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.SPACE
    });


    textDebugar = this.add.text(20, 20, 'Debug Info', {
        fontSize: '20px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    textDebugar.setDepth(100); // Assegura que el text estigui al davant de tot
    textDebugar.setVisible(false); // Oculta el text en iniciar
    debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P); // `'` en teclats espanyols


    

    // Quan es fa clic, guardar el temps d'inici del clic
    this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) { 
            if (potFerHabilitat) {
                isClicking = true;
                TempsFentClick = 0;
            }
        }
    });

    // Quan es deixa anar el clic, calcular la força proporcional i aplicar-la
    this.input.on('pointerup', (pointer) => {
        if (pointer.leftButtonReleased()) {
            if (potFerHabilitat) {
                isClicking = false;  // Reinicia el clic
                let força = Math.min(Math.max(TempsFentClick * VelForçaClick, ForçaMin), ForçaMax);  
                aplicaForça(calculavecJugadorRatoli(this), força);
                TempsFentClick = 0; // Reset del temps de clic
                potFerHabilitat = false;
                tempsEntreCooldown = 0;
            }
        }
    });

    mapa = this.make.tilemap({ key: 'mapa', tileWidth: 64, tileHeight: 64 });

    // Si el mapa s'ha creat bé, imprimiu les capes disponibles
    let tileset = mapa.addTilesetImage('Caselles_2', 'caselles');

    capaTerra = mapa.createLayer('terra', tileset, 0, 0);
    capaAigua = mapa.createLayer('aigua', tileset, 0, 0);
    
    // Aplica les propietats de col·lisió a la capa "terra" si els tiles tenen la propietat "collides" definida
    // capaTerra.setCollisionByProperty({ collides: true });
    
    // Afegir col·lisió amb el jugador (suposant que "jugador" ja s'ha creat)
    this.physics.add.collider(jugador, capaTerra);
    capaTerra.setCollisionBetween(3,6);
    capaTerra.setCollisionBetween(9,12);
    capaTerra.setCollisionBetween(15,18);
    capaTerra.setCollisionBetween(28,30);
    capaTerra.setCollisionBetween(34,36);

    // Per la capa "aigua", si vols detectar quan el jugador hi entra, utilitza un overlap
    // this.physics.add.overlap(jugador, capaAigua, dinsAigua, null, this);


    /*
    //Fons
    //this.add.rectangle(0, 0, 20000, 20000, 0x87CEEB).setOrigin(0, 0);
    // Crear el terra amb física
    let terra = this.physics.add.staticGroup();
    // let terraObj = terra.create(gameWidth / 2, gameHeight - 25, 'terra')
    //     .setDisplaySize(gameWidth, 50).setOrigin(0.5, 0).refreshBody();

    // Crear aigua amb imatge i física
    aigua = this.physics.add.staticGroup();
    // let aiguaObj = aigua.create(gameWidth / 2, gameHeight - 100, 'aigua')
    //     .setDisplaySize(gameWidth / 2, 50).setOrigin(0.5, 0).refreshBody();
    
    // Fer que el jugador col·lideixi amb el terra
    this.physics.add.collider(jugador, terra);

    // Detectar quan el jugador toca l’aigua
    this.physics.add.overlap(jugador, aigua, dinsAigua, null, this);
    */
    
}

function dinsAigua(tempsDelta) {
    let deltaSegons = tempsDelta / 1000; // Convertim a segons
    let forçaFlotabilitat = 700;  // Ajusta segons necessitat
    let resistènciaCaiguda = 2; // Més resistència quan cau
    let resistènciaPujada = 1; // Menys resistència quan puja

    // Si està caient (velY > 0), apliquem més resistència
    if (jugador.body.velocity.y > 0) {
        aplicaForça([0, -1], forçaFlotabilitat * deltaSegons);
        aplicaForça([0, -1], jugador.body.velocity.y * resistènciaCaiguda * deltaSegons);
    } else {
        // Si està pujant (velY < 0), apliquem menys resistència per evitar que surti disparat
        aplicaForça([0, -1], forçaFlotabilitat * deltaSegons);
        aplicaForça([0, -1], jugador.body.velocity.y * resistènciaPujada * deltaSegons);
    }
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

function calculavecJugadorRatoli(scene)
{
    let mouseX = scene.input.activePointer.worldX; // Coordenada X real del ratolí en el món del joc
    let mouseY = scene.input.activePointer.worldY; // Coordenada Y real del ratolí en el món del joc
    let deltaX = mouseX - jugador.x;
    let deltaY = mouseY - jugador.y;
    return [deltaX, deltaY];
}

function aplicaForça(vector, force) {
    let vectorNorm = normalitzarVector(vector);
    jugador.setVelocityX(jugador.body.velocity.x + vectorNorm[0] * force);
    jugador.setVelocityY(jugador.body.velocity.y + vectorNorm[1] * force);
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

function jugadorEstaEnAigua() {
    let hitboxJugador = new Phaser.Geom.Rectangle(jugador.x, jugador.y, jugador.width, jugador.height);
    let tilesAigua = capaAigua.getTilesWithinShape(hitboxJugador, { isNotEmpty: true });

    return tilesAigua.length > 0; // Si hi ha alguna tile d'aigua, retorna true
}


function update(time, delta) {
    // Si estem mantenint el clic, actualitza la durada del clic
    if (isClicking) {
        TempsFentClick += delta;
    }
    comprovaReduirCooldown(delta);

    estaEnAigua = jugadorEstaEnAigua();
    if (estaEnAigua)
    {
        dinsAigua(delta);
    }

    jugadorPotMoures = estaEnAigua;

    // Moviment cap a l'esquerra i dreta amb un efecte de relliscament
    if (cursors.left.isDown && jugadorPotMoures) {
        if (jugador.body.velocity.x > -velMaxMoviment) { 
            aplicaForça([-1, 0], velMoviment);
        }
    } else if (cursors.right.isDown && jugadorPotMoures) {
        if (jugador.body.velocity.x < velMaxMoviment) { 
            aplicaForça([1, 0], velMoviment);
        }
    } else if (jugador.body.touching.down) {
        // Si el jugador està a terra i no es prem cap tecla, aplica més fricció
        jugador.setVelocityX(jugador.body.velocity.x * friccio); // Fricció només quan estigui a terra
    }

    // Quan estigui en l'aire (no toqui el terra), no s'aplica fricció
    if (!jugador.body.touching.down) {
        // Desactivar fricció en l'aire
        jugador.setDrag(20, 0);  // Desactivar fricció horitzontal en l'aire
    } else {
        // Aplicar fricció només quan estigui a terra
        jugador.setDrag(100, 0); // Torna a aplicar fricció a terra
    }

    if (Phaser.Input.Keyboard.JustDown(debugKey)) {
        textDebugar.setVisible(!textDebugar.visible); // Alterna la visibilitat
    }
    textDebugar.setText(
        `VelX: ${jugador.body.velocity.x.toFixed(2)}\n` +
        `VelY: ${jugador.body.velocity.y.toFixed(2)}\n` +
        `Temps Click: ${TempsFentClick.toFixed(2)} ms\n` +
        `Pot fer habilitat: ${potFerHabilitat} \n` +
        `Cooldown: ${tempsEntreCooldown}`
    );
}

// Inicialitza el joc
var game = new Phaser.Game(config);
