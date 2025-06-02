let entities = [];
let doctor = [];
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
  IniciarNivel(3);//Iniciar el juego
});

//Funcion de Volver 
function back(){
  const button = event.target;
  button.style.animation = 'none';
  button.offsetHeight; // trigger reflow
  button.style.animation = 'blink 0.5s ease-in-out 3'; 

  // Esperar a que termine la animación antes de iniciar el juego
  button.addEventListener('animationend', function handler() {
    button.removeEventListener('animationend', handler);
    const overlay = document.querySelector('.transition-overlay');

    // Activar la animación de la cortina
    if (overlay) {
      overlay.classList.add('active');
      // Esperar la animación antes de redirigir
      setTimeout(() => {
        window.location.href = `../index.html`;
      }, 800); // Tiempo sincronizado con la duración de la animación
    } else {
      // Si no hay overlay, redirigir inmediatamente
      window.location.href = `../index.html`;
    }
  }, { once: true });
}

function IniciarNivel(level) {
  // Simulación de sonido retro y efecto de animación
  console.log("Iniciando el Nivel", level);
  // Iniciar el juego
  const canvas = document.getElementById("game-canvas");
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");

  // Configurar canvas para pixel art nítido
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  // Generar entidades aleatorias para el nivel
  const numBeds = 3; // Número maximo de camas para el nivel
  const numMachines = 2; //numero de las mauinas para el nivel
  const cols = 17;
  const rows = 22;

  const bedPositions = getRandomPositions(numBeds, cols, rows);
  // Asegurar que al menos una cama tenga paciente
  let patientAssigned = false;
  const beds = bedPositions.map((pos, i) => {
    // Si es la última cama y aún no se ha asignado paciente, forzar que tenga paciente
    let patient = Math.random() < 0.6;
    if (i === bedPositions.length - 1 && !patientAssigned) {
      patient = true;
    }
    if (patient) patientAssigned = true;
    doctor = {
      x: 1,
      y: 1
    };
    return {
      type: "bed",
      x: pos.x,
      y: pos.y,
      patient,
      patientStatus: patient ? "sick" : null 
    };
  });

  const machinePositions = getRandomPositions(numMachines, cols, rows);

  entities = [
    ...beds,
    ...machinePositions.map((pos, i) => ({
      type: "machine",
      x: pos.x,
      y: pos.y,
      machineType: i % 2 === 0 ? "xray" : "monitor"
    }))
  ];
  drawScene(ctx);
}

//funcionalidad para obtener valores ramdons 
function getRandomPositions(count,cols, rows) {
  const positions = new Set();
  while (positions.size < count) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 2)) + 1;
    positions.add(`${x},${y}`);
  }
  return Array.from(positions).map(pos => {
    const [x, y] = pos.split(',').map(Number);
    return { x, y };
  });
}


function drawScene(ctx) {
  const tileSize = 33; // tamaño de tile cuadrado para vista top-down
  const cols = 17;
  const rows = 22;
  // Limpiar canvas con color de fondo del hospital
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Dibujar grid del suelo
  drawTopDownGrid(ctx, cols, rows, tileSize);
  // Dibujar entidades
  for (const entity of entities) {
    const screenX = entity.x * tileSize + 50;
    const screenY = entity.y * tileSize + 50;
    //Aca se dibujan los pacientes o las maquinas 
    switch(entity.type) {
      case "bed":
        drawPixelBed(ctx, screenX, screenY);
        if (entity.patient) {
          drawPixelPatient(ctx, screenX, screenY, entity.patientStatus);
        }
        break;
      case "machine":
        drawPixelMachine(ctx, screenX, screenY, entity.machineType);
        break;
    }
    drawDoctor(ctx, doctor.x * tileSize + 50, doctor.y * tileSize + 50);
  }
}

document.getElementById("game-canvas").addEventListener("click", (event) => {
  const rect = event.target.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const tileSize = 33;

  const clickedEntity = entities.find((entity) => {
    if (entity.type === "bed" && entity.patient) {
      const screenX = entity.x * tileSize + 50;
      const screenY = entity.y * tileSize + 50;
      return (
        mouseX >= screenX &&
        mouseX <= screenX + tileSize &&
        mouseY >= screenY &&
        mouseY <= screenY + tileSize * 2 // Altura del paciente sprite
      );
    }
    return false;
  });

  if (clickedEntity) {
    if (clickedEntity.patientStatus === "sick") {
      clickedEntity.patientStatus = "treated";
      alert("Paciente atendido 🎉");
    } else {
      alert("Este paciente ya fue tratado.");
    }
    drawScene(document.getElementById("game-canvas").getContext("2d"));
  }
});


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
  const tileSize = 25;
  const bedWidth = tileSize * 2;
  const bedHeight = tileSize * 3;
  if (!drawPixelBed.bedImage) {
    drawPixelBed.bedImage = new Image();
    drawPixelBed.bedImage.src = "../assets/entities/bed.png";
    drawPixelBed.bedImage.loaded = false;
    drawPixelBed.bedImage.onload = () => {
      drawPixelBed.bedImage.loaded = true;
      drawScene(ctx);
    };
  }
  if (drawPixelBed.bedImage.loaded) {
    ctx.drawImage(drawPixelBed.bedImage, x, y, bedWidth, bedHeight);
  }
}

function drawPixelPatient(ctx, x, y, status = "sick") {
  const tileSize = 25;
  const patientWidth = tileSize * 1.5;
  const patientHeight = tileSize * 2.2;

  let spritePath = "../assets/entities/patient.png";
  if (status === "treated") {
    spritePath = "../assets/entities/patient_treated.png";
  }

  if (!drawPixelPatient.images) drawPixelPatient.images = {};

  if (!drawPixelPatient.images[spritePath]) {
    const img = new Image();
    img.src = spritePath;
    img.loaded = false;
    img.onload = () => {
      img.loaded = true;
      drawScene(ctx);
    };
    drawPixelPatient.images[spritePath] = img;
  }

  const img = drawPixelPatient.images[spritePath];
  if (img.loaded) {
    ctx.drawImage(img, x, y, patientWidth, patientHeight);
  }
}


function drawDoctor(ctx, x, y) {
  const tileSize = 25;
  const width = tileSize * 1.5;
  const height = tileSize * 2;

  if (!drawDoctor.image) {
    drawDoctor.image = new Image();
    drawDoctor.image.src = "../assets/entities/doctor.png";
    drawDoctor.image.loaded = false;
    drawDoctor.image.onload = () => {
      drawDoctor.image.loaded = true;
      drawScene(ctx);
    };
  }

  if (drawDoctor.image.loaded) {
    ctx.drawImage(drawDoctor.image, x, y, width, height);
  }
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