//efecto de animacion de cortina 
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
//Efecto de click en los botones del menú
let entities = [];

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
    const overlay = document.querySelector('.transition-overlay');

    // Activar la animación de la cortina
    if (overlay) {
      overlay.classList.add('active');
      // Esperar la animación antes de redirigir
      setTimeout(() => {
        window.location.href = `level_${level}/level${level}.html`;
      }, 800); // Tiempo sincronizado con la duración de la animación
    } else {
      // Si no hay overlay, redirigir inmediatamente
      window.location.href = `level_${level}/level${level}.html`;
    }
  }, { once: true });
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

function mostrarMenu() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
  document.getElementById('titulo').style.display = 'block';
  document.getElementById('subtitulo').style.display = 'block';
}

function volverAlMenuPrincipal() {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'block';
}

function mostrarControles() {
  // Muestra una imagen de controles en un overlay o div
  let overlay = document.getElementById('controles-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'controles-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    // Marco contenedor
    const marco = document.createElement('div');
    marco.style.background = 'rgba(255,255,255,0.95)';
    marco.style.border = '8px solid #2E5984';
    marco.style.boxShadow = '0 0 30px #000, 0 0 0 4px #4A90E2 inset';
    marco.style.borderRadius = '18px';
    marco.style.padding = '18px 18px 12px 18px';
    marco.style.display = 'flex';
    marco.style.flexDirection = 'column';
    marco.style.alignItems = 'center';
    marco.style.position = 'relative';
    marco.style.imageRendering = 'pixelated';

    const img = document.createElement('img');
    img.src = 'assets/entities/controles.png'; 
    img.alt = 'Controles del juego'; // Texto descriptivo para accesibilidad
    img.style.maxWidth = '70vw';
    img.style.maxHeight = '60vh';
    img.style.boxShadow = '0 0 20px #357ABD';
    img.style.borderRadius = '10px';
    img.style.imageRendering = 'pixelated';

    // Botón de cerrar
    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.style.marginTop = '16px';
    btnCerrar.style.padding = '6px 18px';
    btnCerrar.style.fontFamily = "'Press Start 2P', 'VT323', 'Courier New', monospace";
    btnCerrar.style.fontSize = '1em';
    btnCerrar.style.background = '#2E5984';
    btnCerrar.style.color = '#fff';
    btnCerrar.style.border = '2px solid #357ABD';
    btnCerrar.style.borderRadius = '6px';
    btnCerrar.style.cursor = 'pointer';
    btnCerrar.style.boxShadow = '0 2px 8px #357ABD';
    btnCerrar.style.letterSpacing = '1px';
    btnCerrar.style.imageRendering = 'pixelated';

    btnCerrar.addEventListener('click', function() {
      overlay.remove();
    });

    // Cerrar al hacer click fuera del marco
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    marco.appendChild(img);
    marco.appendChild(btnCerrar);
    overlay.appendChild(marco);
    document.body.appendChild(overlay);
  }
}

    function mostrarCreadores() {
      let overlay = document.getElementById('creadores-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'creadores-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        // Marco contenedor para la imagen
        const marcoImg = document.createElement('div');
        marcoImg.style.position = 'absolute';
        marcoImg.style.top = '50%';
        marcoImg.style.left = '50%';
        marcoImg.style.transform = 'translate(-50%, -50%)';
        marcoImg.style.padding = '2vw 1vw';
        marcoImg.style.background = 'rgba(255,255,255,0.95)';
        marcoImg.style.border = 'min(8px, 2vw) solid #2E5984';
        marcoImg.style.boxShadow = '0 0 30px #000, 0 0 0 4px #4A90E2 inset';
        marcoImg.style.borderRadius = '2vw';
        marcoImg.style.display = 'flex';
        marcoImg.style.justifyContent = 'center';
        marcoImg.style.alignItems = 'center';
        marcoImg.style.imageRendering = 'pixelated';
        marcoImg.style.zIndex = '1';
        marcoImg.style.maxWidth = '96vw';
        marcoImg.style.maxHeight = '85vh';
        marcoImg.style.boxSizing = 'border-box';

        const img = document.createElement('img');
        img.src = 'assets/entities/creadores.png';
        img.alt = 'Creadores';
        img.style.maxWidth = '92vw';
        img.style.maxHeight = '80vh';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.boxShadow = '0 0 20px #000';
        img.style.borderRadius = '1vw';
        img.style.imageRendering = 'pixelated';
        img.style.display = 'block';

        img.addEventListener('click', function() {
          overlay.remove();
        });

        marcoImg.appendChild(img);

        const modal = document.createElement('div');
        modal.style.background = 'rgba(255,255,255,0.92)';
        modal.style.padding = '1vw 1vw';
        modal.style.borderRadius = '1vw';
        modal.style.boxShadow = '0 0 10px #000';
        modal.style.textAlign = 'center';
        modal.style.fontFamily = "'Press Start 2P', 'VT323', 'Courier New', monospace";
        modal.style.fontSize = 'min(0.8em, 2vw)';
        modal.style.letterSpacing = '1px';
        modal.style.border = '2px solid #222';
        modal.style.imageRendering = 'pixelated';
        modal.style.maxWidth = '60vw';
        modal.style.position = 'absolute';
        modal.style.left = '50%';
        modal.style.bottom = 'max(1vw, 10px)';
        modal.style.transform = 'translateX(-50%)';
        modal.style.zIndex = '2';
        modal.style.boxSizing = 'border-box';

        modal.innerHTML = `
          <h2 style="
            margin-bottom:1vw;
            font-size:min(1em, 3vw);
            color:#2E5984;
            text-shadow:1px 1px 0 #fff, 2px 2px 0 #357ABD;
            font-family:'Press Start 2P','VT323','Courier New',monospace;
            letter-spacing:2px;
            image-rendering:pixelated;
          ">Creadores</h2>
          <div style="
            margin-bottom:1vw;
            font-size:min(0.8em, 2vw);
            color:#444;
            font-family:'Press Start 2P','VT323','Courier New',monospace;
            text-shadow:1px 1px 0 #fff, 1px 1px 0 #4A90E2;
            image-rendering:pixelated;
          ">
            Alumnos de Ing. Informática 4to año
          </div>
          <ul style="
            list-style:none;
            padding:0;
            margin:0;
            font-size:min(0.9em, 2vw);
            color:#222;
            text-shadow:1px 1px 0 #fff, 1px 1px 0 #4A90E2;
            font-family:'Press Start 2P','VT323','Courier New',monospace;
            image-rendering:pixelated;
            text-align:left;
            display:inline-block;
          ">
            <li style="margin-bottom:2px;"><span style="margin-right:4px;">&#9794;</span> Fernando Ayala</li>
            <li style="margin-bottom:2px;"><span style="margin-right:4px;">&#9794;</span> Ricardo Montiel</li>
            <li style="margin-bottom:2px;"><span style="margin-right:4px;">&#9794;</span> Wilson Rojas</li>
            <li><span style="margin-right:2px;">&#9794;</span> Ulises Villalva</li>
          </ul>
        `;
        modal.addEventListener('click', function() {
          overlay.remove();
        });

        overlay.appendChild(marcoImg);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Extra: cerrar con ESC
        window.addEventListener('keydown', function escClose(e) {
          if (e.key === 'Escape') {
            overlay.remove();
            window.removeEventListener('keydown', escClose);
          }
        });
        // Cerrar al hacer click fuera del marco
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
            overlay.remove();
          }
        });
      }
    }
