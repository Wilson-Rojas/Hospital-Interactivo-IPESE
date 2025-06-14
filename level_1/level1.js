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
      intentarAtenderPaciente();
      break
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
    "frente": "../assets/entities/doctor/doctor_frente.png",
    "espalda": "../assets/entities/doctor/doctor_espalda.png",
    "izquierda": "../assets/entities/doctor/doctor_izquierda.png",
    "derecha": "../assets/entities/doctor/doctor_derecha.png"
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
    { x: 7, y: 1 },
    { x: 11, y: 1 },
    { x: 15, y: 1},
    //camas bajas
    { x: 3, y: 8 },
    { x: 7, y: 8 },
    { x: 11, y: 8 },
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
  const width = tileSize * 2;
  const height = tileSize * 2;

  if (!drawDoctor.image) {
    drawDoctor.image = new Image();
    drawDoctor.image.src = "../assets/entities/doctor/doctor_frente.png";
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

//Mensaje de atender al paciente 
function mensaje_de_atencion() {
  const tileSize = 33;
  const canvas = document.getElementById("game-canvas");
  const dialogo = document.getElementById("dialogo-contextual");

  for (const entity of entities) {
    if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
      const dx = Math.abs(doctor.x - entity.x);
      const dy = Math.abs(doctor.y - entity.y);
      if (dx + dy === 1) {
        // Mostrar mensaje
        const x = entity.x * tileSize + 50;
        const y = entity.y * tileSize + 30;

        dialogo.style.left = `${x}px`;
        dialogo.style.top = `${y}px`;
        dialogo.innerText = "Presiona [E] para atender";
        dialogo.style.display = "block";
        dialogo.style.fontFamily = "Consolas, 'Courier New', monospace";
        return;
      }
    }
  }

  dialogo.style.display = "none";
}

function intentarAtenderPaciente() {
  for (const entity of entities) {
    if (entity.type === "bed" && entity.patient && entity.patientStatus === "sick") {
      const dx = Math.abs(doctor.x - entity.x);
      const dy = Math.abs(doctor.y - entity.y);
      if (dx + dy === 1) {
        mostrarModal("JUEGO DE PREGUNTAS");
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

    let tiempoRestante = 200; // 200 segundos (3 minutos y 20 segundos)
    const timerElement = document.getElementById('timerElement');

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
    const intervalo = setInterval(actualizarTemporizador, 1000);

    // Modal "Tiempo Agotado"
    function mostrarModalTiempoAgotado() {
      contenedor.innerHTML = ""; // limpiar anterior

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
        <button id="btnReintentarTiempo" class="btn" style="margin-right:10px;">Reintentar</button>
        <button id="btnIrInicioTiempo" class="btn">Ir al inicio</button>
        </div>
      </div>
      `;
      overlay.style.display = 'flex';
      entradaHabilitada = false;

      // Botones
      const btnReintentar = document.getElementById('btnReintentarTiempo');
      const btnIrInicio = document.getElementById('btnIrInicioTiempo');

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


    // Función para verificar si todos los pacientes han sido atendidos
    function verificarFinDeJuego() {
      const quedanPacientes = entities.some(
        e => e.type === "bed" && e.patient && e.patientStatus === "sick"
      );
      if (!quedanPacientes) {
         clearInterval(intervalo);
        mostrarModalFinDeJuego();
        
      }
    }
    /* Modal de juego completado (nivel terminado).*/

    function mostrarModalFinDeJuego() {
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
      entradaHabilitada = false;

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