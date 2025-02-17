let personatge = document.getElementById("personatge");
let posicioX = window.innerWidth / 2;
const velocitat = 10;

document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") {
        posicioX -= velocitat;
    } else if (event.key === "d" || event.key === "D") {
        posicioX += velocitat;
    }
    personatge.style.left = posicioX + "px";
});