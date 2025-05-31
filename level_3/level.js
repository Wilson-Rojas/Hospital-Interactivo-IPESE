
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
  IniciarNivel(3);
});

function IniciarNivel(level) {
  // Simulación de sonido retro y efecto de animación
  console.log("Iniciando Nivel", level);

    // Iniciar el juego
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
}

function drawScene(ctx) {
  const tileSize = 32; // tamaño de tile cuadrado para vista top-down
  const cols = 12;
  const rows = 8;
  
  // Limpiar canvas con color de fondo del hospital
  ctx.fillStyle = "#2E5984"; // azul hospital oscuro
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Dibujar grid del suelo
  drawTopDownGrid(ctx, cols, rows, tileSize);

  // Dibujar entidades
  for (const entity of entities) {
    const screenX = entity.x * tileSize + 50;
    const screenY = entity.y * tileSize + 50;
    
    switch(entity.type) {
      case "bed":
        drawPixelBed(ctx, screenX, screenY);
        if (entity.patient) {
          drawPixelPatient(ctx, screenX, screenY);
        }
        break;
      case "machine":
        drawPixelMachine(ctx, screenX, screenY, entity.machineType);
        break;
    }
  }
}

function drawTopDownGrid(ctx, cols, rows, tileSize) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const screenX = x * tileSize + 50;
      const screenY = y * tileSize + 50;
      drawPixelFloorTile(ctx, screenX, screenY, tileSize);
    }
  }
}

function drawPixelFloorTile(ctx, x, y, size) {
  // Suelo base azul claro
  ctx.fillStyle = "#4A90E2";
  ctx.fillRect(x, y, size, size);
  
  // Bordes más oscuros para efecto 3D pixelado
  ctx.fillStyle = "#357ABD";
  ctx.fillRect(x, y, size, 2); // borde superior
  ctx.fillRect(x, y, 2, size); // borde izquierdo
  
  // Bordes más claros
  ctx.fillStyle = "#5BA3F5";
  ctx.fillRect(x + size - 2, y, 2, size); // borde derecho
  ctx.fillRect(x, y + size - 2, size, 2); // borde inferior
  
  // Líneas de grid sutiles
  ctx.fillStyle = "#3D7BC4";
  ctx.fillRect(x + size - 1, y, 1, size);
  ctx.fillRect(x, y + size - 1, size, 1);
}

function drawPixelBed(ctx, x, y) {
  const bedWidth = 24;
  const bedHeight = 32;
  
  // Sombra de la cama
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(x + 2, y + 2, bedWidth, bedHeight);
  
  // Base de la cama (marrón oscuro)
  ctx.fillStyle = "#4A2C17";
  ctx.fillRect(x, y, bedWidth, bedHeight);
  
  // Parte superior de la cama (marrón medio)
  ctx.fillStyle = "#6B3E21";
  ctx.fillRect(x, y, bedWidth, 4);
  ctx.fillRect(x, y, 4, bedHeight);
  
  // Colchón (blanco sucio)
  ctx.fillStyle = "#E8E8E8";
  ctx.fillRect(x + 4, y + 4, bedWidth - 8, bedHeight - 8);
  
  // Sombras del colchón
  ctx.fillStyle = "#D0D0D0";
  ctx.fillRect(x + bedWidth - 6, y + 4, 2, bedHeight - 8);
  ctx.fillRect(x + 4, y + bedHeight - 6, bedWidth - 8, 2);
  
  // Almohada
  ctx.fillStyle = "#F5F5F5";
  ctx.fillRect(x + 6, y + 6, bedWidth - 12, 8);
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(x + bedWidth - 8, y + 6, 2, 8);
}

function drawPixelPatient(ctx, x, y) {
  // Sombra del paciente
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(x + 9, y + 17, 8, 8);
  
  // Cuerpo del paciente (verde claro - enfermo)
  ctx.fillStyle = "#90EE90";
  ctx.fillRect(x + 8, y + 16, 8, 8);
  
  // Cabeza
  ctx.fillStyle = "#FFDBAC";
  ctx.fillRect(x + 10, y + 12, 4, 4);
  
  // Ojos (puntos rojos - enfermo)
  ctx.fillStyle = "#FF4444";
  ctx.fillRect(x + 11, y + 13, 1, 1);
  ctx.fillRect(x + 13, y + 13, 1, 1);
  
  // Brazos
  ctx.fillStyle = "#FFDBAC";
  ctx.fillRect(x + 7, y + 17, 2, 3);
  ctx.fillRect(x + 15, y + 17, 2, 3);
  
  // Símbolo de corazón roto (estado crítico)
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(x + 11, y + 8, 2, 1);
  ctx.fillRect(x + 10, y + 9, 1, 1);
  ctx.fillRect(x + 13, y + 9, 1, 1);
  ctx.fillRect(x + 11, y + 10, 2, 2);
}

function drawPixelMachine(ctx, x, y, machineType) {
  if (machineType === "xray") {
    // Máquina de rayos X
    // Sombra
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 2, y + 2, 28, 28);
    
    // Base de la máquina
    ctx.fillStyle = "#B0B0B0";
    ctx.fillRect(x, y, 28, 28);
    
    // Panel frontal
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(x + 2, y + 2, 24, 24);
    
    // Pantalla
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 4, y + 4, 12, 8);
    
    // Luces indicadoras
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(x + 18, y + 6, 2, 2);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 22, y + 6, 2, 2);
    
    // Botones
    ctx.fillStyle = "#808080";
    ctx.fillRect(x + 6, y + 16, 4, 4);
    ctx.fillRect(x + 12, y + 16, 4, 4);
    ctx.fillRect(x + 18, y + 16, 4, 4);
    
  } else if (machineType === "monitor") {
    // Monitor cardíaco
    // Sombra
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 2, y + 2, 24, 32);
    
    // Base del monitor
    ctx.fillStyle = "#696969";
    ctx.fillRect(x, y, 24, 32);
    
    // Pantalla principal
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 2, y + 2, 20, 16);
    
    // Línea de ECG (verde)
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(x + 4, y + 10, 2, 1);
    ctx.fillRect(x + 6, y + 8, 2, 1);
    ctx.fillRect(x + 8, y + 6, 2, 1);
    ctx.fillRect(x + 10, y + 8, 2, 1);
    ctx.fillRect(x + 12, y + 10, 2, 1);
    ctx.fillRect(x + 14, y + 12, 2, 1);
    ctx.fillRect(x + 16, y + 10, 2, 1);
    ctx.fillRect(x + 18, y + 10, 2, 1);
    
    // Números vitales
    ctx.fillStyle = "#FF6600";
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + 6, y + 4, 1, 1);
    ctx.fillRect(x + 8, y + 4, 1, 1);
    
    // Panel de controles
    ctx.fillStyle = "#A0A0A0";
    ctx.fillRect(x + 2, y + 20, 20, 10);
    
    // Botones del panel
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 4, y + 22, 3, 3);
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(x + 9, y + 22, 3, 3);
    ctx.fillStyle = "#0000FF";
    ctx.fillRect(x + 14, y + 22, 3, 3);
    
    // Pequeños LEDs
    ctx.fillStyle = "#FFFF00";
    ctx.fillRect(x + 6, y + 27, 1, 1);
    ctx.fillRect(x + 10, y + 27, 1, 1);
    ctx.fillStyle = "#FF00FF";
    ctx.fillRect(x + 14, y + 27, 1, 1);
  }
}