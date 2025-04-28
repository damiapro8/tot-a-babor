// ############################ INICIALITZACIO PHASER #############################
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// ######################## OBJECTES PHASER #####################################
var jugador;
var cursors;

// #################### PARAMETRES MOVIMENT ######################
var velMoviment = 5;   // Velocitat de moviment
var velMaxMoviment = 300; // Velocitat maxima per moures amb A i D (no limita lo altre)
var friccio = 0.99;   // Factor de fricció per a l'efecte de relliscament
var ForçaMax = 800;     // Força màxima a aplicar
var ForçaMin = 0;      // Força mínima a aplicar
var faClick = false;  // Si s'està mantenint el clic
var TempsFentClick = 0;   // Temps de durada del clic
var VelForçaClick = ForçaMax/2000; // mutiplicador de força per temps clickant (en 2s (ForçaMax/velForçaClick) s'arriba a max)

// parametres resistencia
var resMax = 1400; // resistencia maxima
var resActual = 1400; // resistencia actual, puja fins a arribar a la maxima
var velRecAigua = 0.3; // velocitat de recuperacio de resistencia en aigua per segon
var velRecAire = 0.05; // velocitat de recuperacio de resistencia fora de aigua per segon

var estaEnAigua = false;
var jugadorPotMoures = true;

// ################################ UI ###########################
var textDebugar;
var fonsBarra;
var barraResistencia;
var barraResistenciaPrevista;
var ampladaBarra = 300;
var alçadaBarra = 30;

// ############################# Lootbox ##########################
var fonsOpcio1;
var posXLoot = 100;
var posYLoot = 100;
var ampladaLoot = 500;
var alçadaLoot = 3000;

// ############################# TILEMAP ###########################
var capaAigua;
var capaTerra;
var mapa;

// ############################# ONLINE ############################
var nomJugador = "";
var etiquetaNom;



function preload() {
    this.load.image('jugador', './imatges/vaixell1.png');  // Carrega la imatge del personatge
    this.load.tilemapTiledJSON('mapa', './nivells/mapa_intent_4.json');

    this.load.image('caselles', './imatges/tileset_loco_2.png'); // Carrega la imatge del tileset
    
}

function create() {
    // Crea el jugador
    let gameWidth = this.scale.width;
    let gameHeight = this.scale.height;
    jugador = this.physics.add.sprite(300, 12000, 'jugador');
    jugador.setDepth(1);
    // jugador.setCollideWorldBounds(true);  // Evita que el jugador surti de la pantalla
    jugador.setDrag(10, 0);
    jugador.setMaxVelocity(1000, 1000);
    this.cameras.main.startFollow(jugador, false, 0.1, 0.1, 0, 50);
    this.cameras.main.setBackgroundColor(0x87CEEB);
    this.cameras.main.setZoom(0.3);

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

    //UI
    textDebugar.setDepth(100);
    textDebugar.setVisible(false);
    debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    let posXBarra = jugador.x - ampladaBarra / 2;
    let posYBarra = jugador.y - jugador.height - 30;

    fonsBarra = this.add.rectangle(posXBarra, posYBarra, ampladaBarra, alçadaBarra, 0x444444);
    fonsBarra.setOrigin(0, 0);
    fonsBarra.setScrollFactor(1);

    barraResistencia = this.add.rectangle(posXBarra, posYBarra, ampladaBarra, alçadaBarra, 0x00ff00);
    barraResistencia.setOrigin(0, 0);
    barraResistencia.setScrollFactor(1);

    barraResistenciaPrevista = this.add.rectangle(posXBarra, posYBarra, 0, alçadaBarra, 0xff9999);
    barraResistenciaPrevista.setOrigin(0, 0);
    barraResistenciaPrevista.setScrollFactor(1);

    fonsBarra.setDepth(1000);
    barraResistencia.setDepth(1001);
    barraResistenciaPrevista.setDepth(1002);

    // UI lootbox
    fonsOpcio1 = this.add.rectangle(posXBarra, posYBarra, ampladaBarra, alçadaBarra, 0x444444);
    fonsOpcio1.setOrigin(0, 0);
    fonsOpcio1.setVisible(false);

    // Quan es fa clic, guardar el temps d'inici del clic
    this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) { 
            if (!faClick) {
                faClick = true;
                TempsFentClick = 0;
            }
        }
    });

    // Quan es deixa anar el clic, calcular la força proporcional i aplicar-la
    this.input.on('pointerup', (pointer) => {
        if (pointer.leftButtonReleased()) {
            if (faClick) {
                faClick = false;  // Reinicia el clic
                let força = Math.min(Math.max(TempsFentClick * VelForçaClick, ForçaMin), Math.min(ForçaMax, resActual));  
                aplicaForça(calculavecJugadorRatoli(this), força);
                TempsFentClick = 0; // Reset del temps de clic
                resActual -= força;
                potFerHabilitat = true;
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

    // Detectar quan el jugador toca l'aigua
    this.physics.add.overlap(jugador, aigua, dinsAigua, null, this);
    */

    document.getElementById("botoComençar").onclick = () => {
        nomJugador = document.getElementById("nomJugador").value.trim();
        if (nomJugador.length === 0) return;
    
        document.getElementById("menu-nom").style.display = "none";
    
        etiquetaNom = game.scene.scenes[0].add.text(jugador.x, jugador.y - 60, nomJugador, {
            fontSize: '40px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 8, y: 4 }
        });
        etiquetaNom.setOrigin(0.5);
        etiquetaNom.setDepth(1000);

        socket.emit("nomJugador", nomJugador);
    };

    socket = io(); // Connecta amb el servidor

    altresJugadors = {};

    socket.on("state", function(jugadors) {
        for (let id in jugadors) {
            if (id !== socket.id) {
                if (!altresJugadors[id]) {
                    let sprite = game.scene.scenes[0].physics.add.sprite(jugadors[id].x, jugadors[id].y, 'jugador');
                    sprite.body.allowGravity = false;
                    sprite.setAlpha(0.8);
                    sprite.setDepth(0);
                    sprite.setImmovable(true); // Opcional: fa que no es moguin si xoquen
                    game.scene.scenes[0].physics.add.collider(jugador, sprite);

    
                    let etiqueta = game.scene.scenes[0].add.text(jugadors[id].x, jugadors[id].y - 80, jugadors[id].nom || "Jugador", {
                        fontSize: '20px',
                        fill: '#ffffff',
                        fontFamily: 'Arial',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: { x: 6, y: 3 }
                    });
                    etiqueta.setOrigin(0.5);
                    etiqueta.setDepth(1000);
    
                    altresJugadors[id] = {
                        sprite: sprite,
                        etiqueta: etiqueta
                    };
                } else {
                    altresJugadors[id].sprite.setPosition(jugadors[id].x, jugadors[id].y);
                    altresJugadors[id].etiqueta.setPosition(jugadors[id].x, jugadors[id].y - 80);
                    altresJugadors[id].etiqueta.setText(jugadors[id].nom || "Jugador");
                }
            }
        }
    
        for (let id in altresJugadors) {
            if (!jugadors[id]) {
                altresJugadors[id].sprite.destroy();
                altresJugadors[id].etiqueta.destroy();
                delete altresJugadors[id];
            }
        }
    });
    
    

    
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
    
    let norma = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

    
    if (norma === 0) {
        return [0, 0];
    }

    
    return [vector[0] / norma, vector[1] / norma];
}

function calculavecJugadorRatoli(scene)
{
    let mouseX = scene.input.activePointer.worldX;
    let mouseY = scene.input.activePointer.worldY;
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
    if (estaEnAigua)
    {
        resActual += velRecAigua * delta;
    }
    else
    {
        resActual += velRecAire * delta;
    }

    if (resActual > resMax)
    {
        resActual = resMax;
    }

    let visible = faClick || resActual < resMax;
    barraResistencia.setVisible(visible);
    fonsBarra.setVisible(visible);
}


function jugadorEstaEnAigua() {
    let hitboxJugador = new Phaser.Geom.Rectangle(jugador.x, jugador.y, jugador.width, jugador.height);
    let tilesAigua = capaAigua.getTilesWithinShape(hitboxJugador, { isNotEmpty: true });

    return tilesAigua.length > 0;
}

function actualitzaBarraRes()
{
    let posXBarra = jugador.x - ampladaBarra / 2;
    let posYBarra = jugador.y - jugador.height - 30;
    fonsBarra.setPosition(posXBarra, posYBarra);
    barraResistencia.setPosition(posXBarra, posYBarra);

    // Actualitzar barra de resistència actual
    let percentatge = resActual / resMax;
    let novaAmplada = ampladaBarra * percentatge;
    barraResistencia.width = novaAmplada;

    // Actualitzar barra de resistència prevista
    if (faClick) {
        let forçaPrevista = Math.min(Math.max(TempsFentClick * VelForçaClick, ForçaMin), Math.min(ForçaMax, resActual));
        let percentatgePrevist = forçaPrevista / resMax;
        let ampladaPrevista = ampladaBarra * percentatgePrevist;
        
        barraResistenciaPrevista.width = ampladaPrevista;
        barraResistenciaPrevista.setPosition(posXBarra + novaAmplada - ampladaPrevista, posYBarra);

        barraResistenciaPrevista.setVisible(true);
    } else {
        barraResistenciaPrevista.setVisible(false);
    }
    // canviar el color de la barra
    if (percentatge > 0.5) {
        barraResistencia.fillColor = 0x00ff00; 
    } else if (percentatge > 0.25) {
        barraResistencia.fillColor = 0xffff00; 
    } else {
        barraResistencia.fillColor = 0xff0000; 
    }
}


function update(time, delta) {
    if (faClick) {
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
    actualitzaBarraRes();
    textDebugar.setText(
        `VelX: ${jugador.body.velocity.x.toFixed(2)}\n` +
        `VelY: ${jugador.body.velocity.y.toFixed(2)}\n` +
        `Temps Click: ${TempsFentClick.toFixed(2)} ms\n` +
        `resMax: ${resMax} \n` +
        `resActual: ${resActual}`
    );

    if (etiquetaNom) {
        etiquetaNom.setPosition(jugador.x, jugador.y - jugador.height - 80);
    }

    if (socket && socket.connected) {
        socket.emit("update", {
            x: jugador.x,
            y: jugador.y,
            nom: nomJugador
        });
    }    
}

// Inicialitza el joc
var game = new Phaser.Game(config);
