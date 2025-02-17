let personatge = document.getElementById("personatge");
let posicioX = window.innerWidth / 2;
let posicioY = window.innerHeight / 2;
let velocitat = 10;
let velocitatY = 0;
let gravetat = 0.5;
let terra = window.innerHeight - personatge.offsetHeight;

function actualitzar() {
    velocitatY += gravetat;  // Simula la gravetat
    posicioY += velocitatY;

    // Impedir que el personatge passi per sota del terra
    if (posicioY > terra) {
        posicioY = terra;
        velocitatY = 0;
    }

    personatge.style.left = posicioX + "px";
    personatge.style.top = posicioY + "px";
    requestAnimationFrame(actualitzar);  // Recalcular cada fotograma
}

document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") {
        posicioX -= velocitat;
    } else if (event.key === "d" || event.key === "D") {
        posicioX += velocitat;
    } else if (event.key === " " && posicioY === terra) {  // Comprova si està al terra
        velocitatY = -15;  // Saltar amb una velocitat negativa
    }
});

requestAnimationFrame(actualitzar);  // Comença la simulació
