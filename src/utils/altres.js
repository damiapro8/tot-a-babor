export function esDispositiuMobil() {
    const esMobilUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const esTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const esPantallaPetita = window.innerWidth <= 768;
    
    return esMobilUA || (esTouch && esPantallaPetita);
}