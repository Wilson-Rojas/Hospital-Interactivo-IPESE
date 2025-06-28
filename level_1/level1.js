let entities = [];
let doctor = [];
const modal = new bootstrap.Modal(document.getElementById('modalGlobal'));
const contenedor = document.getElementById('pregunta-container');
const respuestaContainer = document.getElementById('respuesta-container');

let entradaHabilitada = true;
let respuestaCorrecta = "";

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

//movilidad del doctor 
window.addEventListener("keydown", (e) => {
  if (!entradaHabilitada) {
    return; // Desactiva teclas si está bloqueado
  }
  const prev = { x: doctor.x, y: doctor.y };
  
  let direction = "frente";

  switch (e.key) {
    case "ArrowUp":
      doctor.y -= 0.5;
      direction = "espalda";
      break;
    case "ArrowDown":
      doctor.y += 0.5;
      direction = "frente";
      break;
    case "ArrowLeft":
      doctor.x -= 0.5;
      direction = "izquierda";
      break;
    case "ArrowRight":
      doctor.x += 0.5;
      direction = "derecha";
      break;
    case 'e':
    case 'E':
      // Solo permitir si está cerca de una cama con paciente enfermo
      const cercaDeCama = entities.some(entity =>
        entity.type === "bed" &&
        entity.patient &&
        entity.patientStatus === "sick" &&
        (
          (Math.abs(doctor.x - entity.x) === 1 && doctor.y === entity.y) ||
          (Math.abs(doctor.y - entity.y) === 1 && doctor.x === entity.x)
        )
      );
      if (cercaDeCama) {
        intentarAtenderPaciente();
      }
      break;
  }

  const destinoX = doctor.x;
  const destinoY = doctor.y;

  // Evitar caminar sobre camas
  const hayCamaEnDestino = entities.some(e => 
    e.type === "bed" &&
    Math.abs(destinoX - e.x) < 1 &&
    Math.abs(destinoY - e.y) < 1.1
  );

  if (hayCamaEnDestino) {
    doctor.x = prev.x;
    doctor.y = prev.y;
    return;
  }

  // Limitar a límites del mapa
  doctor.x = Math.max(0, Math.min(15.5, doctor.x));
  doctor.y = Math.max(0, Math.min(10.5, doctor.y));

  // Cambiar imagen del doctor según dirección
  if (!drawDoctor.images) drawDoctor.images = {};
  const directionMap = {
    "frente": "../assets/entities/doctor/negra.png",
    "espalda": "../assets/entities/doctor/negraespalda.png",
    "izquierda": "../assets/entities/doctor/izquierda.png",
    "derecha": "../assets/entities/doctor/derecha.png"
  };
  if (directionMap[direction]) {
    if (!drawDoctor.images[direction]) {
      const img = new Image();
      img.src = directionMap[direction];
      img.loaded = false;
      img.onload = () => {
        img.loaded = true;
        drawScene(document.getElementById("game-canvas").getContext("2d"));
      };
      drawDoctor.images[direction] = img;
    }
    drawDoctor.image = drawDoctor.images[direction];
  }

  if (prev.x !== doctor.x || prev.y !== doctor.y) {
    drawScene(document.getElementById("game-canvas").getContext("2d"));
    mensaje_de_atencion();
  }
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
//Funcion de pausa 
function pausa() {
  // Detener entrada y temporizador
  entradaHabilitada = false;
  if (intervalo) clearInterval(intervalo);

  // Guardar referencia a la función original si no existe
  if (!pausa._originalActualizarTemporizador) {
    pausa._originalActualizarTemporizador = actualizarTemporizador;
  }
  // Congelar el temporizador completamente
  actualizarTemporizador = function() {};

  // Crear overlay de pausa si no existe
  let overlay = document.getElementById('pausaOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pausaOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = 1000;
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
  <div style="
    background: #111;
    border: 3px solid #00ffff;
    box-shadow: 0 0 20px #00ffff, 0 0 10px #00ffff inset;
    padding: 32px 40px;
    border-radius: 16px;
    text-align: center;
    min-width: 320px;
    max-width: 90vw;
  ">
    <span style="
    display: inline-block;
    background: #000;
    border: 3px solid #00ffff;
    box-shadow: 0 0 10px #00ffff, 0 0 5px #00ffff inset;
    padding: 20px 30px;
    font-size: 1.1rem;
    letter-spacing: 2px;
    text-shadow: 0 0 5px #00ffff, 0 0 2px #00ffff;
    color: #00ffff;
    ">
    <span style="font-size:1.3em;">⏸️ JUEGO EN PAUSA ⏸️</span><br>
    </span>
    <div style="margin-top:18px;">
    <button id="btnReanudar" class="btn-return">Empezar</button>
    <button id="btnReanudar" onclick="back()" class="btn-exit">Salir</button>
    </div>
  </div>
  `;
  overlay.style.display = 'flex';

  // Botón para reanudar
  const btnReanudar = document.getElementById('btnReanudar');

  btnReanudar.onclick = function () {
    overlay.style.opacity = 0;
    setTimeout(() => {
      overlay.remove();
      entradaHabilitada = true;
      // Restaurar la función original del temporizador si existe
      if (pausa._originalActualizarTemporizador) {
        actualizarTemporizador = pausa._originalActualizarTemporizador;
      }
      // Reanudar temporizador solo si el juego no terminó
      if (!juegoTerminadoPorTiempo && typeof actualizarTemporizador === "function") {
        intervalo = setInterval(actualizarTemporizador, 1000);
      }
    }, 1000);
  };
}

/* Permitir pausar con la tecla "p" o "P" y reanudar con "p" o "P" si está en pausa
window.addEventListener("keydown", (e) => {
  const overlay = document.getElementById('pausaOverlay');
  if ((e.key === "p" || e.key === "P")) {
    if (entradaHabilitada && !overlay) {
      pausa();
    } else if (!entradaHabilitada && overlay) {
      // Simula click en el botón de reanudar si está en pausa
      const btn = document.getElementById('btnReanudar');
      if (btn) btn.click();
    }
  }
});*/

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
  const numBeds = 4; // Número maximo de camas para el nivel
  const numMachines = 2; //numero de las mauinas para el nivel
  const cols = 17;
  const rows = 12;

  // Inicializar doctor y posiciones ocupadas
  doctor = {
    x: 0.5,
    y: 0.5
  };
  const occupiedPositions = new Set();
  occupiedPositions.add(`${doctor.x},${doctor.y}`);
// Posiciones directas de las camas 
  const bedPositions = [
    { x: 3, y: 1 },
  /*  { x: 7, y: 1 },
    { x: 11, y: 1 },
    { x: 15, y: 1},
    //camas bajas
    { x: 3, y: 8 },
    { x: 7, y: 8 },
    { x: 11, y: 8 },*/
    { x: 15, y: 8 }
  ]
  const machinePositions = [
    { x: 4, y: 1 },
    { x: 8, y: 1 },
    { x: 12, y: 1 },
    { x: 16, y: 1 },
    //maquinas bajas
    { x: 4, y: 8 },
    { x: 8, y: 8 },
    { x: 12, y: 8 },
    { x: 16
      , y: 8 }
  ]
  
  const beds = bedPositions.map((pos) => ({
    type: "bed",
    x: pos.x,
    y: pos.y,
    patient: true,
    patientStatus: "sick"
  }));

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
function getRandomPositions(count, cols, rows, occupied) {
  const positions = new Set();
  while (positions.size < count) {
    const x = Math.floor(Math.random() * (cols - 4)) + 2;
    const y = Math.floor(Math.random() * (rows - 4)) + 2;
    const key = `${x},${y}`;
    if (!positions.has(key) && !occupied.has(key)) {
      positions.add(key);
      occupied.add(key);
    }
  }
  return Array.from(positions).map(pos => {
    const [x, y] = pos.split(',').map(Number);
    return { x, y };
  });
}

function drawScene(ctx) {
  const tileSize = 33; // tamaño de tile cuadrado para vista top-down
  const cols = 17;
  const rows = 12;
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
  // Seleccionar color base aleatorio para variedad visual
  // Paleta de azules y grises claros/medios/oscuro
  const palettes = [
    { base: "#4A90E2", dark: "#357ABD", light: "#5BA3F5" }, // azul medio
    { base: "#6EC6FF", dark: "#3D7BC4", light: "#A7D8FF" }, // azul claro
    { base: "#2C3E50", dark: "#1A242F", light: "#3E5870" }, // azul oscuro
    { base: "#B0BEC5", dark: "#78909C", light: "#CFD8DC" }, // gris claro
    { base: "#90A4AE", dark: "#607D8B", light: "#B0BEC5" }, // gris medio
    { base: "#E3F2FD", dark: "#B3E5FC", light: "#FFFFFF" }  // casi blanco
  ];
  // Usar posición para que el patrón sea consistente (no cambie en cada frame)
  const idx = Math.abs(Math.floor(x / size) * 32 + Math.floor(y / size) * 19) % palettes.length;
  const palette = palettes[idx];

  // Suelo base
  ctx.fillStyle = palette.base;
  ctx.fillRect(x, y, size, size);

  // Bordes más oscuros para efecto 3D pixelado
  ctx.fillStyle = palette.dark;
  ctx.fillRect(x, y, size, 2); // borde superior
  ctx.fillRect(x, y, 2, size); // borde izquierdo

  // Bordes más claros
  ctx.fillStyle = palette.light;
  ctx.fillRect(x + size - 2, y, 2, size); // borde derecho
  ctx.fillRect(x, y + size - 2, size, 2); // borde inferior

  // Líneas de grid sutiles
  ctx.fillStyle = "#3D7BC4";
  ctx.fillRect(x + size - 1, y, 1, size);
  ctx.fillRect(x, y + size - 1, size, 1);
}


function drawPixelBed(ctx, x, y) {
  const tileSize = 25;
  const bedWidth = tileSize * 2.2;
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
  // Determinar el sprite según el estado y el género (aleatorio para cada paciente)
  let spritePath;
  // Si el paciente ya tiene asignado un género, úsalo; si no, asígnalo aleatoriamente
  if (!drawPixelPatient._genderMap) drawPixelPatient._genderMap = {};
  // Usar x,y como clave única para el paciente
  const patientKey = `${x},${y}`;
  if (!drawPixelPatient._genderMap[patientKey]) {
    drawPixelPatient._genderMap[patientKey] = Math.random() < 0.5 ? "masculino" : "femenina";
  }
  const genero = drawPixelPatient._genderMap[patientKey];

  if (genero === "femenina") {
    spritePath = status === "treated"
      ? "../assets/entities/femenina_trated.png"
      : "../assets/entities/patient_femenina.png";
  } else {
    spritePath = status === "treated"
      ? "../assets/entities/patient_treated.png"
      : "../assets/entities/patient.png";
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
  const width = tileSize * 2;
  const height = tileSize * 2;

  if (!drawDoctor.image) {
    drawDoctor.image = new Image();
    drawDoctor.image.src = "../assets/entities/doctor/negra.png";
    drawDoctor.image.loaded = false;
    drawDoctor.image.onload = () => {
      drawDoctor.image.loaded = true;
      drawScene(ctx);
    };
  }

  // Mostrar nube de diálogo al iniciar el juego con información sobre urgencias médicas
  if (typeof drawDoctor.dialogShown === "undefined") {
    drawDoctor.dialogShown = true;
    mensaje_inicial(ctx,x,y);
  }
  if (drawDoctor.image.loaded) {
    ctx.drawImage(drawDoctor.image, x, y, width, height);
  }
}

function mensaje_inicial(ctx,x,y){
    entradaHabilitada = false;
    // Ocultar el temporizador visualmente
    if (timerElement) timerElement.style.display = "none";
    // Detener el temporizador si está corriendo
    if (typeof intervalo !== "undefined") clearInterval(intervalo);

    setTimeout(() => {
      cabecera = `<span style="font-size:1em; color:#00ffff; font-weight:bold; display:block; margin-bottom:4px;">
        &#128657; Urgencias &#128657;
      </span>`;
      cuerpo_mensaje= `
      <span style="color:#fff;">
        <b>¿Sabías?</b> El área de <b style="color:#00ffff;">urgencias</b> es donde se atienden los casos más graves y que requieren atención inmediata.<br>
        <span style="color:#00ffea;">¡Actúa rápido y mantén la calma!</span>
      </span>
      <br>`;
      button = `<button class="btn btn-secondary mt-3" onclick="cerrarDialogo()" >Iniciar Nivel</button>`;
      View_Modal(cabecera,cuerpo_mensaje,button);
      
    }, 900); // Mostrar poco después de iniciar
}

function cerrarDialogo() {
  entradaHabilitada = true;
  // Reanudar el temporizador solo si no está corriendo
  if (typeof intervalo !== "undefined") clearInterval(intervalo);
  tiempoRestante = 180; // 3 minutos = 180 segundos
  actualizarTemporizador(); //Que inicialice el temporizador antes del div
  intervalo = setInterval(actualizarTemporizador, 1000);
  // Mostrar el temporizador nuevamente
  if (timerElement) timerElement.style.display = "";
  modal.hide();
}

function View_Modal(cabecera, cuerpo_mensaje, button) {
  entradaHabilitada = false; // Desactivar entrada mientras se atiende
  document.getElementById('modalMensaje').innerHTML = cabecera;
  contenedor.innerHTML = ""; // limpiar anterior
  respuestaContainer.innerHTML = cuerpo_mensaje +"<br>" + button;
  modal.show();
}

function drawPixelMachine(ctx, x, y, machineType) {
  let imgSrc, width, height;
  if (machineType === "xray") {
    imgSrc = "../assets/entities/machine_xray.png";
    width = 28;
    height = 28;
  } else if (machineType === "monitor") {
    imgSrc = "../assets/entities/machine_monitor.png";
    width = 24;
    height = 32;
  } else {
    return;
  }

  if (!drawPixelMachine.images) drawPixelMachine.images = {};
  if (!drawPixelMachine.images[machineType]) {
    const img = new Image();
    img.src = imgSrc;
    img.loaded = false;
    img.onload = () => {
      img.loaded = true;
      drawScene(ctx);
    };
    drawPixelMachine.images[machineType] = img;
  }
  const img = drawPixelMachine.images[machineType];
  if (img.loaded) {
    ctx.drawImage(img, x, y, width, height);
  }
}

// Mensaje de atender al paciente (al lado del doctor)
function mensaje_de_atencion() {
  const dialogo = document.getElementById("dialogo-contextual");
  let mensajeMostrado = false;
  for (const entity of entities) {
    if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
      const dx = Math.abs(doctor.x - entity.x);
      const dy = Math.abs(doctor.y - entity.y);
      // Mostrar mensaje si el doctor está al lado de la cama
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        const canvas = document.getElementById("game-canvas");
        const tileSize = 33;
        const offsetX = canvas.offsetLeft + doctor.x * tileSize + 30;
        const offsetY = canvas.offsetTop + doctor.y * tileSize + 10;
        dialogo.style.position = "absolute";
        dialogo.style.left = (offsetX + tileSize + 10) + "px";
        dialogo.style.top = (offsetY - tileSize / 2) + "px";
        dialogo.style.transform = "none";
        dialogo.innerText = "Presiona [E] para atender";
        dialogo.style.display = "block";
        dialogo.style.fontFamily = "Consolas, 'Courier New', monospace";
        mensajeMostrado = true;
        break;
      }
    }
  }
  if (!mensajeMostrado) {
    dialogo.style.display = "none";
  }
}

function intentarAtenderPaciente() {
  for (const entity of entities) {
    entradaHabilitada = false; // Desactivar entrada mientras se atiende
    if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
      const dx = Math.abs(doctor.x - entity.x);
      const dy = Math.abs(doctor.y - entity.y);
      if (dx + dy === 1) {
        mostrarModal("JUEGO DE PREGUNTAS");
      }else {
        // Si no está al lado de una cama, mostrar mensaje de error
        respuestaContainer.innerHTML = "";
      }
    }
  }
}

function mostrarModal(mensaje) {
  entradaHabilitada = false; // Desactivar entrada mientras se atiende
  document.getElementById('modalMensaje').innerText = mensaje;
  const preguntaID = Math.floor(Math.random() * 5) + 1;
  mostrarPregunta(preguntaID);

  modal.show();
}

function habilitar_Movimiento(){
  const contenedor = document.getElementById('respuesta-container');
  contenedor.innerHTML = ""; // Limpiar respuesta anterior
  entradaHabilitada = true; // Reactivar entrada
}

function mostrarPregunta(numero) {
  contenedor.innerHTML = ""; // limpiar anterior
  let pregunta = "";
  let opciones = [];
  switch (numero) {
    case 1:
      pregunta = "¿Cuál es la temperatura normal del cuerpo humano?";
      opciones = ["38-39°C", "36-37°C", "34-35°C"];
      respuestaCorrecta = "36-37°C";
      break;
    case 2:
      pregunta = "¿Cuál es el órgano principal del sistema circulatorio?";
      opciones = ["Pulmón", "Corazón", "Riñón"];
      respuestaCorrecta = "Corazón";
      break;
    case 3:
      pregunta = "¿Qué significa 'ICU'?";
      opciones = ["Unidad Clínica Única", "Unidad de Cuidados Intensivos", "Inyección Cardiaca Urgente"];
      respuestaCorrecta = "Unidad de Cuidados Intensivos";
      break;
    case 4:
      pregunta = "¿Cuál es el antiséptico más usado?";
      opciones = ["Azúcar", "Alcohol", "Aceite"];
      respuestaCorrecta = "Alcohol";
      break;
    case 5:
      pregunta = "¿Qué vitamina se obtiene principalmente del sol?";
      opciones = ["Vitamina D", "Vitamina C", "Vitamina A"];
      respuestaCorrecta = "Vitamina D";
      break;
    case 6:
      pregunta = "¿Cuál es el órgano encargado de filtrar la sangre?";
      opciones = ["Riñón", "Hígado", "Corazón"];
      respuestaCorrecta = "Riñón";
      break;
  }

  const htmlOpciones = opciones.map((op, i) => `
      <label style="display:inline-flex;align-items:center;margin-right:12px;">
        <input class="opciones_pregunta" type="radio" name="respuesta" value="${op}" id="opcion${i}" style="margin-right:4px; margin-top:4px;">
        ${op}
      </label>
  `).join("");

  contenedor.innerHTML = `
    <p><strong>${pregunta}</strong></p>
    ${htmlOpciones}
    <br>
    <button onclick="Responder()">Enviar</button>
  `;
}

function Responder() {
  try {
    const respuestaUsuario = document.querySelector('input[name="respuesta"]:checked')?.value;
    if (respuestaUsuario == undefined) {
      respuestaContainer.innerHTML = '<span style="color:orange;font-weight:bold;">Por favor selecciona una respuesta</span>';
      return
    }
    if (respuestaUsuario === respuestaCorrecta) {
      respuestaContainer.innerHTML = '<span style="color:green;font-weight:bold;">¡Respuesta correcta!</span>';
      contenedor.innerHTML = ""; // limpiar anterior
      for (const entity of entities) {
        if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
          const dx = Math.abs(doctor.x - entity.x);
          const dy = Math.abs(doctor.y - entity.y);
          if (dx + dy === 1) {
            entity.patientStatus = "treated";
            break;
          }
        }
      }
      drawScene(document.getElementById("game-canvas").getContext("2d"));
      setTimeout(() =>{
        habilitar_Movimiento();
        modal.hide()
      },2500);
    } else {
      respuestaContainer.innerHTML = '<span style="color:red;font-weight:bold;">Respuesta incorrecta.</span>';
    }
  } catch (error) {
    console.error("Error al procesar la respuesta:", error);
    alert("Ocurrió un error al enviar la respuesta.");
  }
}
//Temporizador estilo juego retro

let tiempoRestante = 22; // 200 segundos (3 minutos y 20 segundos)
const timerElement = document.getElementById('timerElement');
let intervalo = null;

function actualizarTemporizador() {
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  timerElement.textContent =
    `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  if (tiempoRestante > 0) {
    tiempoRestante--;
  } else {
    clearInterval(intervalo);
    mostrarModalTiempoAgotado();
  }
}
function stopTimer() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }
  // Además, evita que el temporizador vuelva a ejecutarse
  actualizarTemporizador = function() {};
}

    // Modal "Tiempo Agotado"
    function mostrarModalTiempoAgotado() {
      entradaHabilitada = false; // Desactivar entrada mientras se muestra el modal
      contenedor.innerHTML = ""; // limpiar anterior
      // Deshabilitar el temporizador visualmente y lógicamente
      if (timerElement) timerElement.style.display = "none";
      if (typeof intervalo !== "undefined") clearInterval(intervalo);
      // Desactivar la función de timer completamente
      actualizarTemporizador = function() {};
      // Ocultar cualquier modal de Bootstrap abierto
      if (typeof modal !== "undefined" && modal.hide) {
        modal.hide();
      }
      // Eliminar overlays de otros modals personalizados si existen
      const overlays = [
        document.getElementById('modalFinJuegoOverlay'),
        document.getElementById('modalTiempoOverlay')
      ];
      overlays.forEach(overlay => {
        if (overlay) overlay.remove();
      });
      let overlay = document.getElementById('modalTiempoOverlay');
      if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modalTiempoOverlay';
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.85)';
      overlay.style.zIndex = 9999;
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.transition = 'opacity 0.3s';
      document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
      <div style="
        background: #111;
        border: 3px solid #00ffff;
        box-shadow: 0 0 20px #00ffff, 0 0 10px #00ffff inset;
        padding: 32px 40px;
        border-radius: 16px;
        text-align: center;
        min-width: 320px;
        max-width: 90vw;
      ">
        <span class="texto-celeste" style="
        display: inline-block;
        background: #000;
        border: 3px solid #00ffff;
        box-shadow: 0 0 10px #00ffff, 0 0 5px #00ffff inset;
        padding: 20px 30px;
        font-size: 1.1rem;
        letter-spacing: 2px;
        text-shadow: 0 0 5px #00ffff, 0 0 2px #00ffff;
        ">
        <span style="font-size:1.3em;">&#9728; GAME OVER &#9728;</span><br>
        <span style="font-size:1em;">¡NDE TAVY!</span><br>
        </span>
        <div style="margin-top:18px;">
        <button id="btnReintentar" class="btn" style="margin-right:10px;">Reintentar</button>
        <button id="btnIrInicio" class="btn">Ir al inicio</button>
        </div>
      </div>
      `;
      overlay.style.display = 'flex';
    

      // Botones
      const btnReintentar = document.getElementById('btnReintentar');
      const btnIrInicio = document.getElementById('btnIrInicio');

      [btnReintentar, btnIrInicio].forEach(btn => {
      btn.style.background = '#00ffff';
      btn.style.color = '#000';
      btn.style.border = '2px solid #00ffff';
      btn.style.fontFamily = "'Press Start 2P', cursive";
      btn.style.boxShadow = '0 0 5px #00ffff';
      btn.onmouseover = function() {
        btn.style.background = '#000';
        btn.style.color = '#00ffff';
      };
      btn.onmouseout = function() {
        btn.style.background = '#00ffff';
        btn.style.color = '#000';
      };
      });

      btnReintentar.onclick = function () {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.remove();
        tiempoRestante = 30;
        if (typeof intervalo !== "undefined") clearInterval(intervalo);
        actualizarTemporizador();
        window.location.reload();
      }, 300);
      };

      btnIrInicio.onclick = function () {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.remove();
        window.location.href = '../index.html';
      }, 300);
      };
    }


    // Función para detener el temporizador y evitar que vuelva a ejecutarse
    function stopTimer() {
      if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
      }
      // Además, evita que el temporizador vuelva a ejecutarse
      actualizarTemporizador = function() {};
    }

    // Función para verificar si todos los pacientes han sido atendidos
    function verificarFinDeJuego() {
      const noquedanPacientes = entities.some(
        e => e.type === "bed" && e.patient && e.patientStatus === "sick"
      );
      if (!noquedanPacientes) {
        stopTimer();
        mostrarModalFinDeJuego();
      }
    }

    /* Modal de juego completado (nivel terminado).*/

    function mostrarModalFinDeJuego() {
      entradaHabilitada = false; // Desactivar controles del jugador

      // Crear overlay si no existe 
      let overlay = document.getElementById('modalFinJuegoOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modalFinJuegoOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.zIndex = 10000;
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.transition = 'opacity 0.3s';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div style="
          background: #111;
          border: 3px solid #00ffff;
          box-shadow: 0 0 20px #00ffff, 0 0 10px #00ffff inset;
          padding: 32px 40px;
          border-radius: 16px;
          text-align: center;
          min-width: 320px;
          max-width: 90vw;
        ">
          <span class="texto-celeste" style="
        display: inline-block;
        background: #000;
        border: 3px solid #00ffff;
        box-shadow: 0 0 10px #00ffff, 0 0 5px #00ffff inset;
        padding: 20px 30px;
        font-size: 1.1rem;
        letter-spacing: 2px;
        text-shadow: 0 0 5px #00ffff, 0 0 2px #00ffff;
          ">
        <span style="font-size:1.3em;">&#127881; ¡NIVEL COMPLETADO! &#127881;</span><br>
        <span style="font-size:1em;">¡Todos los pacientes han sido atendidos!</span><br>
          </span>
          <div style="margin-top:18px;">
        <button id="btnIrInicioFin" class="btn">Ir al inicio</button>
          </div>
        </div>
      `;
      overlay.style.display = 'flex';
      
      const btnIrInicioFin = document.getElementById('btnIrInicioFin');
      btnIrInicioFin.style.background = '#00ff00';
      btnIrInicioFin.style.color = '#000';
      btnIrInicioFin.style.border = '2px solid #00ffff';
      btnIrInicioFin.style.fontFamily = "'Press Start 2P', cursive";
      btnIrInicioFin.style.boxShadow = '0 0 5px #00ffff';
      btnIrInicioFin.onmouseover = function() {
        btnIrInicioFin.style.background = '#000';
        btnIrInicioFin.style.color = '#00ff00';
      };
      btnIrInicioFin.onmouseout = function() {
        btnIrInicioFin.style.background = '#00ff00';
        btnIrInicioFin.style.color = '#000';
      };

      btnIrInicioFin.onclick = function () {
        overlay.style.opacity = 0;
        setTimeout(() => {
          overlay.remove();
          window.location.href = '../index.html';
        }, 300);
      };
    }

    // Llama a verificarFinDeJuego después de atender un paciente correctamente
    // Modifica la función Responder para llamar a verificarFinDeJuego al final del bloque de respuesta correcta:
    const originalResponder = Responder;
    Responder = function() {
      try {
        const respuestaUsuario = document.querySelector('input[name="respuesta"]:checked')?.value;
        if (respuestaUsuario == undefined) {
          respuestaContainer.innerHTML = '<span style="color:orange;font-weight:bold;">Por favor selecciona una respuesta</span>';
          return
        }
        if (respuestaUsuario === respuestaCorrecta) {
          respuestaContainer.innerHTML = '<span style="color:green;font-weight:bold;">¡Respuesta correcta!</span>';
          contenedor.innerHTML = ""; // limpiar anterior
          for (const entity of entities) {
            if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
              const dx = Math.abs(doctor.x - entity.x);
              const dy = Math.abs(doctor.y - entity.y);
              if (dx + dy === 1) {
                entity.patientStatus = "treated";
                break;
              }
            }
          }
          drawScene(document.getElementById("game-canvas").getContext("2d"));
          setTimeout(() =>{
            habilitar_Movimiento();
            modal.hide();
            verificarFinDeJuego(); // Verifica si el juego terminó
          },2500);
        } else {
          respuestaContainer.innerHTML = '<span style="color:red;font-weight:bold;">Respuesta incorrecta.</span>';
        }
      } catch (error) {
        console.error("Error al procesar la respuesta:", error);
        alert("Ocurrió un error al enviar la respuesta.");
      }
    };
    
    //minijuego
    // aparece antes de responder la pregunta, y tras completarlo se puede responder

    let minijuegoEnCurso = false;
    let juegoTerminadoPorTiempo = false; // Para evitar sobrescribir el modal de tiempo agotado

    function minijuego(onFinish) {
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      var ballRadius = 10;
      var x = canvas.width/2;
      var y = canvas.height-30;
      var dx = 2;
      var dy = -2;
      var paddleHeight = 10;
      var paddleWidth = 75;
      var paddleX = (canvas.width-paddleWidth)/2;
      var rightPressed = false;
      var leftPressed = false;
      var brickRowCount = 5;
      var brickColumnCount = 3;
      var brickWidth = 75;
      var brickHeight = 20;
      var brickPadding = 10;
      var brickOffsetTop = 30;
      var brickOffsetLeft = 30;
      var score = 0;
      var lives = 3;
      var finished = false;

      var bricks = [];
      for(var c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(var r=0; r<brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }

      function cleanup() {
        document.removeEventListener("keydown", keyDownHandler, false);
        document.removeEventListener("keyup", keyUpHandler, false);
        document.removeEventListener("mousemove", mouseMoveHandler, false);
      }

      document.addEventListener("keydown", keyDownHandler, false);
      document.addEventListener("keyup", keyUpHandler, false);
      document.addEventListener("mousemove", mouseMoveHandler, false);

      function keyDownHandler(e) {
        if(e.code  == "ArrowRight") {
          rightPressed = true;
        }
        else if(e.code == 'ArrowLeft') {
          leftPressed = true;
        }
      }
      function keyUpHandler(e) {
        if(e.code == 'ArrowRight') {
          rightPressed = false;
        }
        else if(e.code == 'ArrowLeft') {
          leftPressed = false;
        }
      }
      function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.getBoundingClientRect().left;
        if(relativeX > 0 && relativeX < canvas.width) {
          paddleX = relativeX - paddleWidth/2;
        }
      }
      function collisionDetection() {
        for(var c=0; c<brickColumnCount; c++) {
          for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
              if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if(score == brickRowCount*brickColumnCount) {
                  finished = true;
                  cleanup();
                  setTimeout(() => {
                    if (typeof onFinish === "function") onFinish("win");
                  }, 500);
                }
              }
            }
          }
        }
      }

      function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
      function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
      function drawBricks() {
        for(var c=0; c<brickColumnCount; c++) {
          for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
              var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
              var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
              bricks[c][r].x = brickX;
              bricks[c][r].y = brickY;
              ctx.beginPath();
              ctx.rect(brickX, brickY, brickWidth, brickHeight);
              ctx.fillStyle = "#0095DD";
              ctx.fill();
              ctx.closePath();
            }
          }
        }
      }
      function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.fillText("Score: "+score, 8, 20);
      }
      function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.fillText("Lives: "+lives, canvas.width-65, 20);
      }

      function draw() {
        if (finished || juegoTerminadoPorTiempo) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
          dx = -dx;
        }
        if(y + dy < ballRadius) {
          dy = -dy;
        }
        else if(y + dy > canvas.height-ballRadius) {
          if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
          }
          else {
            lives--;
            if(!lives) {
              finished = true;
              cleanup();
              setTimeout(() => {
                if (juegoTerminadoPorTiempo) return;
                juegoTerminadoPorTiempo = true;
                mostrarModalTiempoAgotado(true);
                if (typeof onFinish === "function") onFinish("lose");
              }, 500);
            }
            else {
              x = canvas.width/2;
              y = canvas.height-30;
              dx = 2;
              dy = -2;
              paddleX = (canvas.width-paddleWidth)/2;
            }
          }
        }

        if(rightPressed && paddleX < canvas.width-paddleWidth) {
          paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
          paddleX -= 7;
        }

        x += dx;
        y += dy;
        requestAnimationFrame(draw);
      }

      draw();
    }

    // Galaga-style minigame with 3 attempts before losing, using virus and doctor sprites
    function galaga(onFinish) {
      let overlay = document.getElementById('galagaOverlay');
      if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'galagaOverlay';
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.95)';
      overlay.style.zIndex = 10001;
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
      <div style="background:#111;border:3px solid #00ffff;box-shadow:0 0 20px #00ffff;padding:24px 24px 8px 24px;border-radius:16px;text-align:center;">
        <h3 style="color:#00ffff;font-family:'Press Start 2P',cursive;margin-bottom:10px;">¡Elimina el virus!</h3>
        <canvas id="galagaCanvas" width="480" height="320" style="background:#222;display:block;margin:0 auto;border:2px solid #00ffff;"></canvas>
        <div id="galagaMsg" style="color:#00ffff;font-family:'Press Start 2P',cursive;margin-top:10px;"></div>
      </div>
      `;
      overlay.style.display = 'flex';

      const canvas = document.getElementById("galagaCanvas");
      const ctx = canvas.getContext("2d");

      // Load doctor sprite for player
      if (!galaga.doctorImg) {
      galaga.doctorImg = new Image();
      galaga.doctorImg.src = "../assets/entities/doctor/negra.png";
      }
      // Load virus sprite for enemies
      if (!galaga.virusImg) {
      galaga.virusImg = new Image();
      galaga.virusImg.src = "../assets/entities/virus.png";
      }

      const player = {
      x: canvas.width / 2 - 30,
      y: canvas.height - 50,
      width: 44,
      height: 48,
      color: 'white',
      speed: 2,
      bullets: []
      };

      const enemies = [];
      const enemySize = 34;
      const enemySpeed = 1;
      const rows = 4, cols = 8;
      let enemyDirection = 1;

      // Guardar posiciones iniciales de los enemigos
      const initialEnemyPositions = [];
      for (let r = 0; r < rows; r++) {
      for (let i = 0; i < cols; i++) {
        const pos = {
        x: i * (enemySize + 14) + 30,
        y: r * (enemySize + 14) + 30
        };
        initialEnemyPositions.push({ ...pos });
        enemies.push({
        ...pos,
        width: enemySize,
        height: enemySize,
        color: '#ff4444'
        });
      }
      }

      const keys = {};
      function keyDownHandler(e) {
      keys[e.key] = true;
      if (e.key === ' ') shootBullet();
      }
      function keyUpHandler(e) {
      keys[e.key] = false;
      }
      document.addEventListener('keydown', keyDownHandler);
      document.addEventListener('keyup', keyUpHandler);

      let canShoot = true;
      function shootBullet() {
      if (!canShoot) return;
      player.bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        color: '#ffff00',
        speed: 3
      });
      canShoot = false;
      setTimeout(() => { canShoot = true; }, 300); 
      }

      function movePlayer() {
      if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
      }

      function updateBullets() {
      for (let i = player.bullets.length - 1; i >= 0; i--) {
        player.bullets[i].y -= player.bullets[i].speed;
        if (player.bullets[i].y < 0) player.bullets.splice(i, 1);
      }
      }

      function moveEnemies() {
      let hitEdge = false;
      for (const enemy of enemies) {
        enemy.x += enemySpeed * enemyDirection;
        if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) hitEdge = true;
      }
      if (hitEdge) {
        enemyDirection *= -1;
        for (const enemy of enemies) {
        enemy.y += 10;
        }
      }
      }

      function detectCollisions() {
      for (let b = player.bullets.length - 1; b >= 0; b--) {
        for (let e = enemies.length - 1; e >= 0; e--) {
        const bullet = player.bullets[b];
        const enemy = enemies[e];
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          player.bullets.splice(b, 1);
          enemies.splice(e, 1);
          initialEnemyPositions.splice(e, 1); // Eliminar la posición inicial correspondiente
          break;
        }
        }
      }
      }

      function drawRect(obj) {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }

      function drawPlayer() {
      if (galaga.doctorImg && galaga.doctorImg.complete) {
        ctx.drawImage(galaga.doctorImg, player.x, player.y, player.width, player.height);
      } else {
        drawRect(player);
      }
      }

      function drawEnemy(enemy) {
      if (galaga.virusImg && galaga.virusImg.complete) {
        ctx.drawImage(galaga.virusImg, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        drawRect(enemy);
      }
      }

      function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      player.bullets.forEach(drawRect);
      enemies.forEach(drawEnemy);
      ctx.font = "16px 'Press Start 2P', cursive";
      ctx.fillStyle = "#fff";
      ctx.fillText("life: " + lives, 350, 30);
      }

      let finished = false;
      let lives = 3;
      let lose = false;

      function resetEnemiesToInitialPositions() {
      for (let i = 0; i < enemies.length; i++) {
        enemies[i].x = initialEnemyPositions[i].x;
        enemies[i].y = initialEnemyPositions[i].y;
      }
      enemyDirection = 1;
      }

      function gameLoop() {
      if (finished) return;
      movePlayer();
      updateBullets();
      moveEnemies();
      detectCollisions();
      draw();

      for (const enemy of enemies) {
        if (enemy.y + enemy.height >= player.y) {
        lives--;
        if (lives > 0) {
          resetEnemiesToInitialPositions();
          player.x = canvas.width / 2 - 15;
          player.bullets = [];
          break;
        } else {
          lose = true;
        }
        }
      }
      if (lose) {
        finished = true;
        if (typeof mostrarModalTiempoAgotado === "function") {
        juegoTerminadoPorTiempo = true;
        setTimeout(() => {
          mostrarModalTiempoAgotado(true);
        }, 700);
        }
        endGame("lose");
        return;
      }
      if (enemies.length === 0) {
        finished = true;
        endGame("win");
        return;
      }
      requestAnimationFrame(gameLoop);
      }

      function endGame(result) {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      setTimeout(() => {
        overlay.remove();
        if (typeof onFinish === "function") onFinish(result);
      }, 700);
      }

      gameLoop();
    }

    // Unificado: mostrar minijuego aleatorio antes de la pregunta
    function mostrarMinijuegoAntesDePregunta(callback) {
      minijuegoEnCurso = true;
      const juegos = [
      function(cb) {
        let overlay = document.getElementById('minijuegoOverlay');
        if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'minijuegoOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.zIndex = 10001;
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
        <div style="background:#111;border:3px solid #00ffff;box-shadow:0 0 20px #00ffff;padding:24px 24px 8px 24px;border-radius:16px;text-align:center;">
          <h3 style="color:#00ffff;font-family:'Press Start 2P',cursive;margin-bottom:10px;">¡Minijuego!</h3>
          <canvas id="myCanvas" width="480" height="320" style="background:#222;display:block;margin:0 auto;border:2px solid #00ffff;"></canvas>
          <div id="minijuegoMsg" style="color:#00ffff;font-family:'Press Start 2P',cursive;margin-top:10px;"></div>
        </div>
        `;
        overlay.style.display = 'flex';
        entradaHabilitada = false;
        minijuego(function(resultado) {
        minijuegoEnCurso = false;
        if (juegoTerminadoPorTiempo) {
          if (overlay) overlay.remove();
          return;
        }
        overlay.remove();
        if (typeof cb === "function") cb(resultado);
        });
      },
      function(cb) {
        galaga(function(resultado) {
        minijuegoEnCurso = false;
        if (juegoTerminadoPorTiempo) {
          let overlay = document.getElementById('galagaOverlay');
          if (overlay) overlay.remove();
          return;
        }
        if (typeof cb === "function") cb(resultado);
        });
      }
      ];
      const idx = Math.floor(Math.random() * juegos.length);
      juegos[idx](callback);
    }

    // Sobrescribe mostrarModal para lanzar minijuego antes de mostrar la pregunta
    const originalMostrarModal = mostrarModal;
    mostrarModal = function(mensaje) {
      if (juegoTerminadoPorTiempo) return;
      entradaHabilitada = false;
      mostrarMinijuegoAntesDePregunta((resultado) => {
      if (juegoTerminadoPorTiempo) return;
      if (resultado === "lose") return;
      document.getElementById('modalMensaje').innerText = mensaje;
      const preguntaID = Math.floor(Math.random() * 6) + 1;
      mostrarPregunta(preguntaID);
      modal.show();
      entradaHabilitada = true;
      });
    };

    // Sobrescribe mostrarModalTiempoAgotado para marcar el juego como terminado
    const originalMostrarModalTiempoAgotado = mostrarModalTiempoAgotado;
    mostrarModalTiempoAgotado = function(superponer) {
      juegoTerminadoPorTiempo = true;
      let minijuegoOverlay = document.getElementById('minijuegoOverlay');
      if (minijuegoOverlay) minijuegoOverlay.remove();
      let galagaOverlay = document.getElementById('galagaOverlay');
      if (galagaOverlay) galagaOverlay.remove();
      if (superponer) {
      setTimeout(() => {
        let overlay = document.getElementById('modalTiempoOverlay');
        if (overlay) overlay.style.zIndex = 10002;
      }, 10);
      }
      originalMostrarModalTiempoAgotado();
    };
