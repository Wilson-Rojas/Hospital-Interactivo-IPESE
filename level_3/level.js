
window.addEventListener("load", () => {
  const cortina = document.getElementById("cortina");
  cortina.style.background = "black";
  cortina.style.transform = "translateY(0)"; // Empieza cubriendo todo (negro)
  setTimeout(() => {
    cortina.style.transform = "translateY(-100%)"; // Sube la cortina después de 800ms
    setTimeout(() => {
      cortina.style.display = "none";
    }, 800); // Espera a que termine la animación de subida
  }, 800);
});

function IniciarNivel(level) {
  // Simulación de sonido retro y efecto de animación
  console.log("Iniciando Nivel", level);
  const button = event.target;
  button.style.animation = 'none';
  button.offsetHeight; // trigger reflow
  button.style.animation = 'blink 0.5s ease-in-out 3';

  // Esperar a que termine la animación antes de iniciar el juego
  
  button.addEventListener('animationend', function handler() {
    button.removeEventListener('animationend', handler);

    // Iniciar el juego
    document.getElementById("menu").style.display = "none";
    const canvas = document.getElementById("game-canvas");
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    
    // Configurar canvas para pixel art nítido
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    entities = [
      { type: "bed", x: 2, y: 1, patient: true },
      { type: "bed", x: 4, y: 2, patient: false },
      { type: "bed", x: 1, y: 3, patient: true },
      { type: "machine", x: 3, y: 1, machineType: "xray" },
      { type: "machine", x: 5, y: 3, machineType: "monitor" }
    ];

    drawScene(ctx);
  }, { once: true });
}
