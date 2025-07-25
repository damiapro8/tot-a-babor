import { Game } from './game/Game.js';

// Variable global per accedir al joc
let gameInstance;

// Iniciar el joc quan la pàgina estigui carregada
window.onload = () => {
    gameInstance = new Game();
    
    // Configurar l'input del nom
    const nomInput = document.getElementById('nomJugador');
    const botoComençar = document.getElementById('botoComençar');
    
    // Desactivar controls del joc mentre s'escriu
    nomInput.addEventListener('focus', () => {
        if (gameInstance.game?.scene?.getScene('MainScene')?.inputManager) {
            gameInstance.game.scene.getScene('MainScene').inputManager.disableInput();
        }
    });
    
    // Reactivar controls quan es comenci el joc
    botoComençar.addEventListener('click', () => {
        const nomJugador = nomInput.value.trim();
        if (nomJugador !== '') {
            document.getElementById('menu-nom').style.display = 'none';
            
            if (gameInstance.game?.scene?.getScene('MainScene')?.inputManager) {
                gameInstance.game.scene.getScene('MainScene').inputManager.enableInput();
            }
            
            // Enviar nom al servidor si cal
            if (gameInstance.game?.scene?.getScene('MainScene')?.networkManager) {
                gameInstance.game.scene.getScene('MainScene').networkManager.enviarNomJugador(nomJugador);
            }
        }
    });
    
    // Permetre tecles A i D en l'input
    nomInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });
};