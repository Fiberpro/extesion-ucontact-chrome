// Evitar duplicados
if (!document.getElementById("quick-button")) {

  // =========================
  // CONFIGURACIÓN
  // =========================
  const SHEET_URL = "https://script.google.com/macros/s/AKfycbwuUyiFdA7FcfmFtR96Nt56fL7Q08aot23K8mqifAE1XiOdR85V88zPSxDRG4QZdCVw/exec";


  // =========================
  // BOTÓN FLOTANTE
  // =========================
  const button = document.createElement("button");
  button.id = "quick-button";
  button.type = "button";
  button.title = "Abrir plantillas";
  button.innerHTML = `
    <svg class="quick-button-icon quick-button-message-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="quick-button-bubble" d="M18 16h28c6.6 0 12 5.1 12 11.4v10.2C58 43.9 52.6 49 46 49H30.1L17.4 57.3c-1.6 1.1-3.7-.5-3.1-2.3l2.3-7.2C10.3 45.6 6 40.2 6 33.9v-6.5C6 21.1 11.4 16 18 16Z" />
      <path class="quick-button-line" d="M22 29h20" />
      <path class="quick-button-line short" d="M22 38h13" />
      <circle class="quick-button-dot" cx="45.5" cy="37.5" r="4.5" />
    </svg>
    <svg class="quick-button-icon quick-button-close-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="quick-button-close-line" d="M21 21l22 22" />
      <path class="quick-button-close-line" d="M43 21L21 43" />
    </svg>
  `;

  // =========================
  // PANEL PRINCIPAL
  // =========================
  const panel = document.createElement("div");
  panel.id = "quick-panel";
  panel.innerHTML = `
    <div class="panel-sticky-header">
      <div class="panel-header">
        <div class="panel-title">Plantillas</div>
        <button id="reload-templates" type="button" title="Recargar plantillas">↻</button>
      </div>
      <div id="template-area-info"></div>
      <div class="template-search">
        <input id="template-search-input" type="search" placeholder="Buscar por título">
      </div>
    </div>
    <div id="templates-container"></div>
  `;

  const modal = document.createElement("div");
  modal.id = "template-variable-modal";
  modal.innerHTML = `
    <div class="variable-modal-card">
      <div class="variable-modal-header">
        <h3 class="variable-modal-title">Completar plantilla</h3>
        <button id="variable-modal-close" type="button" aria-label="Cerrar">&times;</button>
      </div>
      <div class="variable-modal-body">
        <div class="variable-group">
          <label class="variable-label" for="variable-preview">Cuerpo del mensaje</label>
          <textarea id="variable-preview" readonly></textarea>
        </div>
        <div id="variable-fields"></div>
        <div class="variable-group variable-attachment-group">
          <label class="variable-label" id="variable-attachment-label">Adjuntar archivo (opcional)</label>
          <div id="variable-attachment-dropzone" class="variable-attachment-card">
            <input type="file" id="variable-file-input" style="display: none;">
            <div id="variable-file-empty" class="variable-file-empty">
              <div class="variable-file-icon-wrap">
                <svg viewBox="0 0 24 24" class="variable-clip-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </div>
              <div class="variable-file-text-content">
                <button type="button" id="variable-file-browse-btn" class="variable-file-browse-btn">
                  Adjuntar un solo archivo
                </button>
                <span class="variable-file-hint" id="variable-file-hint">o arrastra y suelta aquí (un solo archivo)</span>
              </div>
            </div>
            <div id="variable-file-selected" class="variable-file-selected" style="display: none;">
              <div id="variable-files-list" class="variable-files-list"></div>
              <div class="variable-files-summary-bar">
                <span id="variable-files-total-info" class="variable-files-total-info"></span>
                <div class="variable-files-summary-actions">
                  <button type="button" id="variable-file-add-more-btn" class="variable-file-btn-add-more" title="Agregar más archivos">
                    + Agregar más
                  </button>
                  <button type="button" id="variable-file-clear-all-btn" class="variable-file-btn-clear-all" title="Quitar archivo">
                    Quitar archivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="variable-modal-actions">
        <button id="variable-modal-cancel" class="btn btn-secondary" type="button">Cancelar</button>
        <button id="variable-modal-send" class="btn btn-primary" type="button">Enviar mensaje</button>
      </div>
    </div>
  `;

  // =========================
  // ABRIR / CERRAR PANEL
  // =========================
  function actualizarEstadoBoton() {
    const panelAbierto = panel.classList.contains("show");
    button.classList.toggle("is-open", panelAbierto);
    button.title = panelAbierto ? "Cerrar plantillas" : "Abrir plantillas";
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-expanded", String(panelAbierto));
  }

  function cerrarPanel() {
    panel.classList.remove("show");
    actualizarEstadoBoton();
  }

  function elementoVisible(elemento) {
    if (!elemento) return false;
    const rect = elemento.getBoundingClientRect();
    const estilos = window.getComputedStyle(elemento);

    return rect.width > 0 &&
      rect.height > 0 &&
      estilos.visibility !== "hidden" &&
      estilos.display !== "none";
  }

  function obtenerInputChat() {
    const selectores = [
      '.chat-message-input',
      '[contenteditable="true"]',
      'textarea[placeholder*="mensaje" i]',
      'input[placeholder*="mensaje" i]',
      '#txtMessage',
      '.write-message'
    ];

    const elementos = [...document.querySelectorAll(selectores.join(', '))]
      .filter(elemento => !panel.contains(elemento) && !modal.contains(elemento))
      .filter(elemento => !elemento.closest('.modal, .modal-dialog, .modal-content, [role="dialog"]'))
      .filter(elementoVisible);

    return elementos[0] || null;
  }

  function obtenerIconoEmojiVisible() {
    // 1. Buscar dentro de contenedores de chat activos (excluyendo modales y barras de navegación)
    const contenedoresChat = [...document.querySelectorAll('.chat-message-input, .chat-footer, .chat-box, .write-message, .message-input, .chat-container, .chat')]
      .filter(elemento => !elemento.closest('#sidebar, .sidebar, .nav, .menu, nav, header, .topbar, #left-panel, .modal, .modal-dialog, [role="dialog"]'))
      .filter(elementoVisible);

    for (const contenedor of contenedoresChat) {
      const iconoChat = [...contenedor.querySelectorAll('.emoji-picker-icon, .fa-smile-o, .fa-comment, .fa-comments')]
        .filter(elemento => !button.contains(elemento) && !panel.contains(elemento))
        .filter(elementoVisible)[0];

      if (iconoChat) {
        return { elemento: iconoChat, esIcono: true };
      }
    }

    // 2. Búsqueda global del icono de emojis oficial de uContact en el chat activo
    const iconoGlobal = [...document.querySelectorAll(".emoji-picker-icon.emoji-picker.fa.fa-smile-o, .emoji-picker-icon")]
      .filter(elemento => !button.contains(elemento) && !panel.contains(elemento))
      .filter(elemento => !elemento.closest('#sidebar, .sidebar, .nav, .menu, nav, header, .topbar, #left-panel, .modal, .modal-dialog, [role="dialog"]'))
      .filter(elementoVisible)
      .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] || null;

    if (iconoGlobal) {
      return { elemento: iconoGlobal, esIcono: true };
    }

    // 3. Fallback: caja de texto activa del chat principal
    const inputChat = obtenerInputChat();
    if (inputChat) {
      return { elemento: inputChat, esIcono: false };
    }

    return null;
  }

  function posicionarBoton() {
    const inputChat = obtenerInputChat();

    if (inputChat && inputChat.tagName === "TEXTAREA") {
      inputChat.style.setProperty("padding-right", "44px", "important");
    }

    const anchorInfo = obtenerIconoEmojiVisible();

    if (!anchorInfo) {
      cerrarPanel();
      button.classList.remove("is-ready");
      button.style.setProperty("left", "auto", "important");
      button.style.setProperty("top", "auto", "important");
      button.style.setProperty("right", "28px", "important");
      button.style.setProperty("bottom", "96px", "important");
      panel.style.setProperty("right", "28px", "important");
      panel.style.setProperty("bottom", "168px", "important");
      panel.style.removeProperty("top");
      panel.style.removeProperty("left");
      return;
    }

    const anchor = anchorInfo.elemento;
    const rect = anchor.getBoundingClientRect();
    const buttonSize = button.offsetWidth || 34;
    const gap = 8;

    let left, top;
    if (anchorInfo.esIcono) {
      left = Math.max(8, rect.left - buttonSize - gap);
      top = Math.max(8, rect.top + (rect.height / 2) - (buttonSize / 2));
    } else {
      left = Math.max(8, rect.right - buttonSize - 8);
      top = Math.max(8, rect.bottom - buttonSize - 8);
    }

    const panelWidth = 320;
    const panelRect = panel.getBoundingClientRect();
    const panelHeight = Math.min(
      panel.classList.contains("show") && panelRect.height > 0 ? panelRect.height : 360,
      500,
      window.innerHeight - 16
    );

    let panelLeft = left - panelWidth - 10;
    if (panelLeft < 8) {
      panelLeft = Math.min(window.innerWidth - panelWidth - 8, left + buttonSize + 10);
    }

    let panelTop = top - (panelHeight / 2) + (buttonSize / 2);
    panelTop = Math.min(Math.max(8, panelTop), window.innerHeight - panelHeight - 8);

    button.style.setProperty("left", `${left}px`, "important");
    button.style.setProperty("top", `${top}px`, "important");
    button.style.setProperty("right", "auto", "important");
    button.style.setProperty("bottom", "auto", "important");
    button.classList.add("is-ready");

    panel.style.setProperty("left", `${panelLeft}px`, "important");
    panel.style.setProperty("top", `${panelTop}px`, "important");
    panel.style.setProperty("right", "auto", "important");
    panel.style.setProperty("bottom", "auto", "important");
  }

  // Prevenir que modales externos secuestren el foco en el panel y modal de variables
  ["focusin", "focus", "mousedown", "pointerdown", "touchstart"].forEach(tipoEvento => {
    panel.addEventListener(tipoEvento, event => {
      event.stopPropagation();
    }, true);

    modal.addEventListener(tipoEvento, event => {
      event.stopPropagation();
    }, true);
  });

  button.addEventListener("click", event => {
    event.stopPropagation();
    panel.classList.toggle("show");
    actualizarEstadoBoton();
    requestAnimationFrame(() => {
      posicionarBoton();
      if (panel.classList.contains("show") && searchInput) {
        setTimeout(() => searchInput.focus(), 60);
      }
    });
  });
  panel.addEventListener("click", event => {
    event.stopPropagation();
  });
  document.addEventListener("click", event => {
    if (!panel.classList.contains("show")) {
      return;
    }

    if (button.contains(event.target) || panel.contains(event.target)) {
      return;
    }

    cerrarPanel();
  });
  actualizarEstadoBoton();

  const extensionRoot = document.documentElement || document.body;
  extensionRoot.appendChild(button);
  extensionRoot.appendChild(panel);
  extensionRoot.appendChild(modal);
  posicionarBoton();
  window.addEventListener("resize", posicionarBoton);
  window.addEventListener("scroll", posicionarBoton, true);
  setInterval(posicionarBoton, 1200);

  const container = panel.querySelector("#templates-container");
  const areaInfo = panel.querySelector("#template-area-info");
  const searchInput = panel.querySelector("#template-search-input");

  if (searchInput) {
    ["mousedown", "pointerdown", "click", "focus"].forEach(tipoEvento => {
      searchInput.addEventListener(tipoEvento, event => {
        event.stopPropagation();
      }, true);
    });

    searchInput.addEventListener("click", () => {
      searchInput.focus();
    });
  }
  const reloadTemplatesButton = panel.querySelector("#reload-templates");
  const variablePreview = modal.querySelector("#variable-preview");
  const variableFields = modal.querySelector("#variable-fields");
  const variableModalClose = modal.querySelector("#variable-modal-close");
  const variableModalCancel = modal.querySelector("#variable-modal-cancel");
  const variableModalSend = modal.querySelector("#variable-modal-send");
  const variableModalTitle = modal.querySelector(".variable-modal-title");

  // Elementos para adjuntar archivos
  const variableFileInput = modal.querySelector("#variable-file-input");
  const variableAttachmentDropzone = modal.querySelector("#variable-attachment-dropzone");
  const variableAttachmentLabel = modal.querySelector("#variable-attachment-label");
  const variableFileEmpty = modal.querySelector("#variable-file-empty");
  const variableFileSelected = modal.querySelector("#variable-file-selected");
  const variableFilesList = modal.querySelector("#variable-files-list");
  const variableFilesTotalInfo = modal.querySelector("#variable-files-total-info");
  const variableFileBrowseBtn = modal.querySelector("#variable-file-browse-btn");
  const variableFileHint = modal.querySelector("#variable-file-hint");
  const variableFileAddMoreBtn = modal.querySelector("#variable-file-add-more-btn");
  const variableFileClearAllBtn = modal.querySelector("#variable-file-clear-all-btn");

  let archivosAdjuntosActuales = [];
  let plantillaModalActual = null;
  let plantillasActuales = [];
  let areaUsuarioActual = null;

  // =========================
  // LÓGICA DE INYECCIÓN EN CHAT PRINCIPAL
  // =========================
  function insertarEnChat(texto) {
    const inputChat = obtenerInputChat();

    if (inputChat) {
      inputChat.focus();

      if (inputChat.tagName !== 'INPUT' && inputChat.tagName !== 'TEXTAREA') {
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, texto);
        } else {
          inputChat.innerText = texto;
        }
      } else {
        inputChat.value = texto;
      }

      // Sincronizar con el modelo de datos de uContact (AngularJS / jQuery)
      try {
        if (window.jQuery || window.$) {
          const $elem = (window.jQuery || window.$)(inputChat);
          $elem.val(texto).trigger('input').trigger('change');
        }

        if (window.angular) {
          const ngElem = window.angular.element(inputChat);
          const scope = ngElem.scope();
          if (scope) {
            const ngModel = inputChat.getAttribute('ng-model');
            if (ngModel) {
              const keys = ngModel.split('.');
              let target = scope;
              for (let i = 0; i < keys.length - 1; i++) {
                if (target[keys[i]]) target = target[keys[i]];
              }
              target[keys[keys.length - 1]] = texto;
            }
            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$apply();
            }
          }
        }
      } catch (err) {
        console.warn("[Quick Replies] Error al sincronizar estado de uContact:", err);
      }

      // Disparar eventos nativos del navegador
      inputChat.dispatchEvent(new Event('input', { bubbles: true }));
      inputChat.dispatchEvent(new Event('change', { bubbles: true }));
      inputChat.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
      inputChat.focus();
      return inputChat;
    } else {
      console.error("No se encontró la caja de texto en uContact.");
      alert(texto);
      return null;
    }
  }

  function simularClick(elemento) {
    if (!elemento) return;
    try {
      elemento.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
      elemento.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    } catch (e) { }
    elemento.click();
  }

  function enviarMensajeChat(inputChat) {
    const selectoresEnviar = [
      ".send-message",
      ".btn-send",
      ".chat-send",
      "[data-action='send']",
      "[title*='Enviar' i]",
      "[aria-label*='Enviar' i]",
      "button[class*='send']",
      "i[class*='send']",
      "i.fa-send",
      "i.fa-paper-plane"
    ].join(", ");

    let botonEnviar = [...document.querySelectorAll(selectoresEnviar)]
      .filter(elemento => !panel.contains(elemento) && !modal.contains(elemento))
      .filter(elemento => !elemento.closest('.modal, .modal-dialog, [role="dialog"]'))
      .filter(elementoVisible)
      .find(Boolean);

    let enviadoPorBoton = false;

    if (botonEnviar) {
      const clickable = botonEnviar.closest("button, a, [role='button'], [ng-click], .btn, .btn-send") || botonEnviar;
      clickable.click();
      return true;
    }

    if (inputChat) {
      inputChat.focus();
      ["keydown", "keypress", "keyup"].forEach(tipoEvento => {
        inputChat.dispatchEvent(new KeyboardEvent(tipoEvento, {
          bubbles: true,
          cancelable: true,
          key: "Enter",
          code: "Enter",
          which: 13,
          keyCode: 13
        }));
      });
      return true;
    }

    return false;
  }

  function hayAdjuntoDetectadoEnUContact() {
    // 1. Modal activo de subida en uContact
    const modalAbierto = [...document.querySelectorAll(".modal.in, .modal-dialog, [role='dialog']")]
      .some(el => !modal.contains(el) && !panel.contains(el) && elementoVisible(el));
    if (modalAbierto) return true;

    // 2. Buscar únicamente dentro de la barra de entrada/footer del chat (NO en el historial de mensajes)
    const contenedoresFooter = [...document.querySelectorAll('.chat-footer, .chat-message-input, .write-message, .chat-box, #chat-container')];
    if (contenedoresFooter.length === 0) return false;

    // Archivos en input file nativo del footer
    const fileInputs = contenedoresFooter.flatMap(c => [...c.querySelectorAll('input[type="file"]')]);
    if (fileInputs.some(fi => fi.files && fi.files.length > 0)) return true;

    // Miniaturas o previews de adjuntos en preparación (dentro del footer)
    const selectoresMiniaturas = [
      "[class*='file-preview']",
      "[class*='attachment-preview']",
      "[class*='chat-attachment']",
      "[class*='preview']",
      "[class*='thumbnail']",
      "[class*='attached']"
    ];
    return contenedoresFooter.some(c =>
      [...c.querySelectorAll(selectoresMiniaturas.join(", "))].some(el => elementoVisible(el))
    );
  }

  function limpiarAdjuntosEnUContact() {
    try {
      const fileInputs = [...document.querySelectorAll('input[type="file"]')].filter(el => !modal.contains(el));
      fileInputs.forEach(fi => {
        try {
          fi.value = "";
          fi.files = new DataTransfer().files;
          fi.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) { }
        if (window.angular) {
          try {
            const ngElem = window.angular.element(fi);
            const scope = ngElem.scope();
            const ngModel = fi.getAttribute("ng-model");
            if (scope && ngModel) {
              const keys = ngModel.split(".");
              let target = scope;
              for (let i = 0; i < keys.length - 1; i++) {
                if (target[keys[i]]) target = target[keys[i]];
              }
              target[keys[keys.length - 1]] = null;
              if (!scope.$$phase && !scope.$root.$$phase) {
                scope.$apply();
              }
            }
          } catch (e) { }
        }
      });

      // También clickear cualquier botón de "eliminar adjunto" o "x" en el footer si existiera
      const contenedoresFooter = [...document.querySelectorAll('.chat-footer, .chat-message-input, .write-message, .chat-box, #chat-container')];
      contenedoresFooter.forEach(c => {
        const botonesBorrar = [...c.querySelectorAll("[class*='remove'], [class*='delete'], [class*='cancel'], [class*='close'], .fa-times, .fa-trash")]
          .filter(el => elementoVisible(el) && !modal.contains(el) && !panel.contains(el));
        botonesBorrar.forEach(b => {
          try { b.click(); } catch (e) { }
        });
      });
    } catch (err) {
      console.warn("[Quick Replies] Error al limpiar input file en uContact:", err);
    }
  }

  function enviarAdjuntoChat(inputChat) {
    // 1. Si uContact abrió un modal o diálogo para confirmar la subida del archivo
    const selectoresBotonSubir = [
      ".modal.in button[class*='send']",
      ".modal.in button[class*='upload']",
      ".modal.in .btn-primary",
      ".modal-dialog button[class*='send']",
      ".modal-dialog .btn-primary",
      "[role='dialog'] button[class*='send']",
      "[role='dialog'] .btn-primary",
      "button[ng-click*='upload']",
      "button[ng-click*='sendFile']",
      "button[ng-click*='sendAttachment']"
    ];

    const botonModal = [...document.querySelectorAll(selectoresBotonSubir.join(", "))]
      .filter(el => !modal.contains(el) && !panel.contains(el) && elementoVisible(el))[0];

    if (botonModal) {
      console.log("[Quick Replies] Confirmando subida de archivo en modal de uContact:", botonModal);
      botonModal.click();
      return true;
    }

    // 2. Si no hay modal emergente, enviar directamente en el chat
    console.log("[Quick Replies] Enviando mensaje conjunto (archivo + texto) en uContact...");
    return enviarMensajeChat(inputChat);
  }

  function esperarYEnviarAdjunto(inputChat, maxIntentos = 14) {
    let intentos = 0;
    const intervalo = 150; // cada 150ms

    const checkTimer = setInterval(() => {
      intentos++;
      const adjuntoListo = hayAdjuntoDetectadoEnUContact();

      if (adjuntoListo || intentos >= maxIntentos) {
        clearInterval(checkTimer);
        const tiempoTotal = intentos * intervalo;
        if (adjuntoListo) {
          console.log(`[Quick Replies] Archivo detectado listo en uContact (${tiempoTotal}ms). Enviando mensaje conjunto...`);
        } else {
          console.log(`[Quick Replies] Tiempo de espera alcanzado (${tiempoTotal}ms). Procediendo con el envío...`);
        }

        setTimeout(() => {
          enviarAdjuntoChat(inputChat);
        }, 250);
      }
    }, intervalo);
  }

  function insertarYEnviarTodo(texto, archivos) {
    const tieneArchivos = archivos && archivos.length > 0;
    const inputChat = insertarEnChat(texto);

    if (!inputChat) {
      return;
    }

    if (!tieneArchivos) {
      // Si solo es texto, enviar a los 200ms
      setTimeout(() => {
        enviarMensajeChat(inputChat);
      }, 200);
      return;
    }

    // =========================================================================
    // FLUJO CON ARCHIVOS (UN SOLO MENSAJE CONJUNTO EN UCONTACT):
    // 1. El texto ya fue insertado en la caja de texto como pie/cuerpo.
    // 2. Esperamos 300ms a que uContact asimile el texto en su modelo.
    // 3. Adjuntamos el archivo en uContact sin borrar el texto.
    // 4. Esperamos a que uContact procese el archivo y genere la miniatura.
    // 5. Enviamos UNA SOLA VEZ para que salgan el PDF y el texto juntos en una sola burbuja.
    // =========================================================================
    setTimeout(() => {
      adjuntarArchivosEnChat(archivos);
      esperarYEnviarAdjunto(inputChat);
    }, 300);
  }

  function insertarYEnviarEnChat(texto) {
    insertarYEnviarTodo(texto, []);
  }

  // =========================================================================
  // INTEGRACIÓN DIRECTA CON CHAT Y ADJUNTOS DE UCONTACT (FLUJO 2)
  // (Pega el texto del contrato en el chat y transfiere el PDF a input[id$="-input"])
  // =========================================================================
  function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  function esPlantillaHSMMedia(plantilla, texto = "") {
    if (!plantilla && !texto) return false;
    const desc = String((plantilla && plantilla.descripcion) || texto || "").toLowerCase().trim();
    const titulo = normalizarTexto((plantilla && plantilla.titulo) || "");

    const esHSM = desc.startsWith("hsm;");
    const tieneMedia = desc.includes(";document") || desc.includes(";media") || desc.includes(";file");
    const esPaso2Luis = (titulo.includes("02 de 7") || titulo.includes("2 de 7")) && (titulo.includes("luis") || tieneMedia);
    const esPaso7 = titulo.includes("07 de 7") || titulo.includes("7 de 7");

    return (esHSM && (tieneMedia || esPaso7)) || esPaso2Luis;
  }

  async function enviarPlantillaHSMMedia(plantilla, archivos) {
    const listaArchivos = Array.isArray(archivos) ? archivos : (archivos ? [archivos] : []);
    if (listaArchivos.length === 0) {
      alert("Por favor selecciona los archivos a adjuntar antes de enviar.");
      return false;
    }

    console.log(`[Quick Replies] Flujo con archivos: Enviando ${listaArchivos.length} archivo(s) a uContact...`);

    // 1. Obtener el texto del mensaje a enviar
    let textoAEnviar = variablePreview.value || "";
    const tituloNorm = normalizarTexto((plantilla && plantilla.titulo) || "");

    // Si la descripción original es un comando HSM pero tenemos los textos limpios con variables
    if (!textoAEnviar || textoAEnviar.toLowerCase().startsWith("hsm;")) {
      if (tituloNorm.includes("02 de 7") || tituloNorm.includes("2 de 7")) {
        textoAEnviar = "*Contrato 2 de 7*\n\nEstimado (a), le solicitamos nos envíe:\n1. Fotos de su DOCUMENTO DE IDENTIDAD (Anverso y reverso).\n2. Correo electrónico.\n3. Dirección completa del domicilio.\n\nEn adjunto le enviamos el *CONTRATO TIPO* del plan que desea contratar. (No requiere ser llenado).";
      } else if (tituloNorm.includes("07 de 7") || tituloNorm.includes("7 de 7")) {
        // En uContact, para enviar las variables del cuerpo (Codigo y Correo), el comando DEBE usar ;text;
        // Si se usa ;document;, uContact no envia los parametros del cuerpo a Gupshup y Meta rechaza con: localizable_params (0)
        textoAEnviar = textoAEnviar.replace(";document;", ";text;").trim();
        // Asegurar que use el UUID oficial de la plantilla aprobada en Gupshup (contrato7de707)
        textoAEnviar = textoAEnviar.replace("37665f6d-2637-40eb-b57d-8ce4aef77b9a", "679dec4a-358a-48b9-96ba-c98ac9b5d856");
        textoAEnviar = textoAEnviar.replace("e36e4af9-901f-4998-bc31-de5acd70e3dd", "679dec4a-358a-48b9-96ba-c98ac9b5d856");
      }
    }

    const selectoresFileInput = [
      'input[id$="-input"]',
      '.chat-footer input[type="file"]',
      '.chat-message-input input[type="file"]',
      '.chat-box input[type="file"]',
      '.write-message input[type="file"]',
      '#chat-container input[type="file"]',
      'input[type="file"]'
    ];

    const selectoresEnviar = [
      "[id$='-send']",
      "button[id*='-send']",
      ".send-message",
      ".btn-send",
      ".chat-send",
      "[data-action='send']",
      "[title*='Enviar' i]",
      "[aria-label*='Enviar' i]",
      "button[class*='send']",
      "i.fa-send",
      "i.fa-paper-plane"
    ].join(", ");

    function buscarBotonEnviarUContact() {
      const candidatos = [...document.querySelectorAll(selectoresEnviar)]
        .filter(el => !panel.contains(el) && !modal.contains(el) && elementoVisible(el));
      if (candidatos.length === 0) return null;
      const el = candidatos[0];
      return el.closest("button, a, [role='button'], [ng-click], .btn, .btn-send, .inboxCommandButton") || el;
    }

    // Ordenar los archivos para que el CONTRATO vaya siempre primero y el FLUJO segundo
    let archivosProcesados = [...listaArchivos].sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      if (aName.includes("contrato") && !bName.includes("contrato")) return -1;
      if (!aName.includes("contrato") && bName.includes("contrato")) return 1;
      if (aName.includes("flujo") && !bName.includes("flujo")) return 1;
      if (!aName.includes("flujo") && bName.includes("flujo")) return -1;
      return 0;
    });

    // Paso 7: Se mantienen los archivos por separado (Contrato y Flujo) para enviarse
    // en mensajes individuales respetando las reglas de Meta / WhatsApp.

    const archivosOrdenados = archivosProcesados;
    const primerArchivo = archivosOrdenados[0];
    const archivosRestantes = archivosOrdenados.slice(1);

    function asignarArchivoAFileInput(archivo) {
      const fileInputs = [...document.querySelectorAll(selectoresFileInput.join(", "))]
        .filter(el => !modal.contains(el) && !el.classList.contains("wppTemplateFile"));

      if (fileInputs.length === 0) {
        console.warn("[Quick Replies] No se encontró input file nativo en uContact.");
        return false;
      }

      const fileInput = fileInputs[0];
      try {
        fileInput.multiple = false;
        fileInput.value = "";
      } catch (e) { }

      const dt = new DataTransfer();
      dt.items.add(archivo);
      fileInput.files = dt.files;

      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      fileInput.dispatchEvent(new Event("input", { bubbles: true }));

      if (window.angular) {
        try {
          const ngElem = window.angular.element(fileInput);
          const scope = ngElem.scope();
          if (scope) {
            const ngModel = fileInput.getAttribute("ng-model");
            if (ngModel) {
              const keys = ngModel.split(".");
              let target = scope;
              for (let i = 0; i < keys.length - 1; i++) {
                if (target[keys[i]]) target = target[keys[i]];
              }
              target[keys[keys.length - 1]] = dt.files;
            }
            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$apply();
            }
          }
        } catch (e) { }
      }
      return true;
    }

    const esComandoHSM = textoAEnviar.toLowerCase().startsWith("hsm;");

    // =========================================================================
    // CASO A: SI ES COMANDO HSM CON BOTÓN (PASO 7)
    // 1. Asegurar que uContact NO tenga archivos pendientes antes de enviar el HSM
    // 2. Enviar primero la plantilla HSM limpia (con sus variables y botón web)
    // 3. Esperar confirmación de despacho de uContact
    // 4. Enviar en secuencia los PDFs adjuntos (Contrato y Flujo) como archivos reales
    // =========================================================================
    if (esComandoHSM) {
      const totalPasos = 1 + archivosOrdenados.length;

      if (variableModalSend) {
        variableModalSend.innerText = `Enviando plantilla y botón (1/${totalPasos})...`;
      }

      // A.0 Limpiar cualquier adjunto previo en uContact para que el HSM salga como texto puro
      limpiarAdjuntosEnUContact();
      await esperar(200);

      // A.1 Insertar comando HSM en chat y enviar
      const inputChat = insertarEnChat(textoAEnviar);
      if (!inputChat) {
        console.warn("[Quick Replies] No se encontró la caja de chat de uContact.");
        return false;
      }
      await esperar(300);

      const botonEnviarHSM = buscarBotonEnviarUContact();
      if (botonEnviarHSM) {
        console.log("[Quick Replies] Enviando comando HSM con botón:", textoAEnviar);
        simularClick(botonEnviarHSM);
      } else {
        inputChat.focus();
        inputChat.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", keyCode: 13 }));
      }

      // A.2 Enviar los archivos adjuntos (Contrato y Flujo) en secuencia limpia por separado
      for (let idx = 0; idx < archivosOrdenados.length; idx++) {
        const arch = archivosOrdenados[idx];
        const numeroPaso = idx + 2;

        if (variableModalSend) {
          const archLower = arch.name.toLowerCase();
          const nombreLabel = archLower.includes("contrato")
            ? "Contrato PDF"
            : (archLower.includes("flujo") ? "Flujo PDF" : arch.name);
          variableModalSend.innerText = `Enviando ${nombreLabel} (${numeroPaso}/${totalPasos})...`;
        }

        console.log(`[Quick Replies] Esperando despacho previo para enviar archivo ${numeroPaso}/${totalPasos}: ${arch.name}...`);

        // Esperar a que uContact termine de despachar el mensaje anterior
        for (let i = 0; i < 30; i++) {
          await esperar(200);
          const clickable = buscarBotonEnviarUContact();
          const estaHabilitado = clickable && !clickable.disabled && !clickable.classList.contains("disabled") && clickable.getAttribute("disabled") === null;
          if (i >= 12 && estaHabilitado && !hayAdjuntoDetectadoEnUContact()) {
            console.log(`[Quick Replies] Mensaje anterior confirmado despachado a los ${(i + 1) * 200}ms.`);
            break;
          }
        }

        // Limpiar texto de chat para que el PDF salga limpio
        insertarEnChat("");
        await esperar(300);

        // Transferir archivo a uContact
        console.log(`[Quick Replies] Asignando archivo ${numeroPaso}/${totalPasos}:`, arch.name);
        asignarArchivoAFileInput(arch);

        // Esperar a que uContact procese el archivo
        for (let i = 0; i < 25; i++) {
          await esperar(150);
          const clickable = buscarBotonEnviarUContact();
          if (clickable) {
            const estaHabilitado = !clickable.disabled && !clickable.classList.contains("disabled") && clickable.getAttribute("disabled") === null;
            if (estaHabilitado && (hayAdjuntoDetectadoEnUContact() || i >= 8)) {
              break;
            }
          }
        }
        await esperar(300);

        // Confirmar modal si existiera o clickear enviar
        const selectoresBotonSubir = [
          ".modal.in button[class*='send']",
          ".modal.in button[class*='upload']",
          ".modal.in .btn-primary",
          ".modal-dialog button[class*='send']",
          ".modal-dialog .btn-primary",
          "[role='dialog'] button[class*='send']",
          "[role='dialog'] .btn-primary",
          "button[ng-click*='upload']",
          "button[ng-click*='sendFile']",
          "button[ng-click*='sendAttachment']"
        ];
        const botonModal = [...document.querySelectorAll(selectoresBotonSubir.join(", "))]
          .filter(el => !modal.contains(el) && !panel.contains(el) && elementoVisible(el))[0];

        if (botonModal) {
          console.log(`[Quick Replies] Confirmando subida en modal uContact:`, botonModal);
          simularClick(botonModal);
        } else {
          const botonEnviarArch = buscarBotonEnviarUContact();
          if (botonEnviarArch) {
            console.log(`[Quick Replies] Clickeando enviar para archivo ${numeroPaso}/${totalPasos}:`, botonEnviarArch);
            simularClick(botonEnviarArch);
          }
          if (inputChat) {
            inputChat.focus();
            inputChat.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", keyCode: 13 }));
          }
        }

        // Si hay más archivos pendientes (ej. Contrato enviado, falta Flujo), dar tiempo a uContact y limpiar adjunto previo
        if (idx < archivosOrdenados.length - 1) {
          await esperar(1200);
          limpiarAdjuntosEnUContact();
        }
      }

      await esperar(800);
      limpiarAdjuntosEnUContact();
      return true;
    }

    // =========================================================================
    // CASO B: MENSAJES NORMALES CON ADJUNTO DIRECTO (PASO 2)
    // =========================================================================
    if (variableModalSend) {
      variableModalSend.innerText = archivosRestantes.length > 0 ? "Enviando contrato (1/2)..." : "Enviando...";
    }

    // B.1 Insertar texto en el chat
    const inputChat = insertarEnChat(textoAEnviar);
    if (!inputChat) {
      console.warn("[Quick Replies] No se encontró la caja de chat de uContact.");
      return false;
    }
    await esperar(300);

    // B.2 Transferir el Contrato al input de archivos
    console.log("[Quick Replies] Paso 1: Asignando primer archivo con texto:", primerArchivo.name);
    asignarArchivoAFileInput(primerArchivo);

    // B.3 Esperar a que uContact procese el archivo
    for (let i = 0; i < 25; i++) {
      await esperar(150);
      const clickable = buscarBotonEnviarUContact();
      if (clickable) {
        const estaHabilitado = !clickable.disabled && !clickable.classList.contains("disabled") && clickable.getAttribute("disabled") === null;
        if (estaHabilitado && (hayAdjuntoDetectadoEnUContact() || i >= 8)) {
          break;
        }
      }
    }
    await esperar(300);

    // B.4 Clickear botón de envío
    const botonEnviar1 = buscarBotonEnviarUContact();
    if (botonEnviar1) {
      console.log("[Quick Replies] Clickeando enviar Mensaje 1 (Contrato con texto):", botonEnviar1);
      simularClick(botonEnviar1);
    } else if (inputChat) {
      inputChat.focus();
      inputChat.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", keyCode: 13 }));
    }

    if (archivosRestantes.length === 0) {
      await esperar(600);
      return true;
    }

    for (let idx = 0; idx < archivosRestantes.length; idx++) {
      const arch = archivosRestantes[idx];
      const numeroPaso = idx + 2;
      const totalPasos = archivosOrdenados.length;

      if (variableModalSend) {
        variableModalSend.innerText = `Enviando anexo (${numeroPaso}/${totalPasos})...`;
      }

      for (let i = 0; i < 30; i++) {
        await esperar(200);
        const clickable = buscarBotonEnviarUContact();
        const estaHabilitado = clickable && !clickable.disabled && !clickable.classList.contains("disabled") && clickable.getAttribute("disabled") === null;
        if (i >= 15 && estaHabilitado && !hayAdjuntoDetectadoEnUContact()) {
          break;
        }
      }

      insertarEnChat("");
      await esperar(300);

      asignarArchivoAFileInput(arch);

      for (let i = 0; i < 25; i++) {
        await esperar(150);
        const clickable = buscarBotonEnviarUContact();
        if (clickable) {
          const estaHabilitado = !clickable.disabled && !clickable.classList.contains("disabled") && clickable.getAttribute("disabled") === null;
          if (estaHabilitado && (hayAdjuntoDetectadoEnUContact() || i >= 8)) {
            break;
          }
        }
      }
      await esperar(300);

      const botonEnviarRest = buscarBotonEnviarUContact();
      if (botonEnviarRest) {
        simularClick(botonEnviarRest);
      } else if (inputChat) {
        inputChat.focus();
        inputChat.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", keyCode: 13 }));
      }

      if (idx < archivosRestantes.length - 1) {
        await esperar(1200);
        limpiarAdjuntosEnUContact();
      }
    }

    await esperar(800);
    limpiarAdjuntosEnUContact();
    return true;
  }

  // VARIABLES EN PLANTILLAS
  // =========================
  function obtenerVariablesPlantilla(texto) {
    const variables = [...String(texto || "").matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)]
      .map(match => match[1].trim())
      .filter(Boolean);

    return [...new Set(variables)];
  }

  function reemplazarVariables(texto, valores) {
    return String(texto || "").replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, variable) => {
      const clave = variable.trim();
      const valorIngresado = valores[clave] ?? "";

      if (!valorIngresado) {
        return "";
      }

      const tieneAsteriscos = /^\*.*\*$/.test(clave);

      if (tieneAsteriscos && !/^\*.*\*$/.test(valorIngresado)) {
        return `*${valorIngresado}*`;
      }

      return valorIngresado;
    });
  }

  function obtenerValoresVariables() {
    return [...variableFields.querySelectorAll(".variable-input")].reduce((valores, input) => {
      valores[input.dataset.variable] = input.value.trim();
      return valores;
    }, {});
  }

  function actualizarPreviewVariables() {
    if (!plantillaModalActual) {
      return;
    }

    const raw = String(plantillaModalActual.descripcion || "");
    const titulo = normalizarTexto(plantillaModalActual.titulo || "");

    if (raw.toLowerCase().startsWith("hsm;")) {
      const tieneMedia = raw.toLowerCase().includes(";document") || raw.toLowerCase().includes(";media");
      const esPaso2Luis = (titulo.includes("02 de 7") || titulo.includes("2 de 7")) && (titulo.includes("luis") || tieneMedia);
      if (esPaso2Luis) {
        variablePreview.value = "*Contrato 2 de 7*\n\nEstimado (a), le solicitamos nos envíe:\n1. Fotos de su DOCUMENTO DE IDENTIDAD (Anverso y reverso).\n2. Correo electrónico.\n3. Dirección completa del domicilio.\n\nEn adjunto le enviamos el *CONTRATO TIPO* del plan que desea contratar. (No requiere ser llenado).";
        return;
      }
    }

    variablePreview.value = reemplazarVariables(plantillaModalActual.descripcion, obtenerValoresVariables());
  }

  function validarVariablesModal() {
    const inputs = [...variableFields.querySelectorAll(".variable-input")];
    const camposCompletos = inputs.every(input => input.value.trim());

    inputs.forEach(input => {
      const estaVacio = !input.value.trim();
      input.classList.toggle("is-empty", estaVacio);
      input.setAttribute("aria-invalid", String(estaVacio));
    });

    variableModalSend.disabled = !camposCompletos;
    return camposCompletos;
  }

  function actualizarFormularioVariables() {
    actualizarPreviewVariables();
    validarVariablesModal();
  }

  function cerrarModalVariables() {
    plantillaModalActual = null;
    variableModalTitle.innerText = "Completar plantilla";
    modal.classList.remove("show");
    variableFields.innerHTML = "";
    variablePreview.value = "";
    resetearArchivosModal();
    const attachmentGroup = modal.querySelector(".variable-attachment-group");
    if (attachmentGroup) attachmentGroup.style.display = "block";
    variableModalSend.disabled = false;
    variableModalSend.innerText = "Enviar mensaje";
  }

  function limpiarNombreLabel(nombre) {
    const limpio = String(nombre || "").replace(/^\*+|\*+$/g, "").trim();
    return /^\d+$/.test(limpio) ? `Variable ${limpio}` : limpio;
  }

  function parsearDetalleVariable(variableRaw) {
    const raw = String(variableRaw || "").trim();

    if (raw.includes("|")) {
      let nombre = raw;
      let opcionesTexto = "";

      if (raw.includes(":")) {
        const partes = raw.split(":");
        nombre = partes[0].trim();
        opcionesTexto = partes.slice(1).join(":");
      } else {
        const partes = raw.split("|");
        nombre = partes[0].trim();
        opcionesTexto = partes.slice(1).join("|");
      }

      const opciones = opcionesTexto
        .split("|")
        .map(opt => opt.trim())
        .filter(Boolean)
        .map(opt => {
          let texto = opt;
          let valor = opt;

          if (opt.includes("=>")) {
            const partes = opt.split("=>");
            texto = partes[0].trim();
            valor = partes.slice(1).join("=>").trim();
          } else if (opt.includes("=")) {
            const partes = opt.split("=");
            texto = partes[0].trim();
            valor = partes.slice(1).join("=").trim();
          }

          return { texto, valor };
        });

      if (opciones.length > 0) {
        return {
          raw,
          nombre,
          opciones
        };
      }
    }

    return {
      raw,
      nombre: raw,
      opciones: []
    };
  }

  function plantillaRequiereModal(plantilla, variables = null) {
    if (!plantilla) return false;

    const vars = variables !== null ? variables : obtenerVariablesPlantilla(plantilla.descripcion);
    if (vars && vars.length > 0) {
      return true;
    }

    const tituloNorm = normalizarTexto(plantilla.titulo || "");
    const descNorm = normalizarTexto(plantilla.descripcion || "");

    // 1. Caso solicitado: Contrato 02 de 7 luis (con PDF adjunto) o Contrato 07 de 7 (que adjunta 2 archivos)
    const tieneMedia = descNorm.includes(";document") || descNorm.includes(";media") || descNorm.includes(";file");
    if (
      (tituloNorm.includes("02 de 7") || tituloNorm.includes("2 de 7")) &&
      (tituloNorm.includes("luis") || tieneMedia)
    ) {
      return true;
    }


    // 2. Cualquier plantilla cuyo título o descripción mencione PDF o adjuntar archivos
    if (
      tituloNorm.includes("pdf") ||
      tituloNorm.includes("adjuntar") ||
      tituloNorm.includes("adjunto") ||
      tituloNorm.includes("anexo") ||
      descNorm.includes("pdf") ||
      descNorm.includes("adjunt")
    ) {
      return true;
    }

    return false;
  }

  function abrirModalVariables(plantilla, variables = []) {
    plantillaModalActual = plantilla;
    variableModalSend.disabled = false;
    variableModalSend.innerText = "Enviar mensaje";
    const esHSM = String(plantilla.descripcion || "").toLowerCase().trim().startsWith("hsm;");
    const esHSMBotones = esHSM && String(plantilla.descripcion || "").includes("=>");
    variableModalTitle.innerText = esHSMBotones
      ? `⚡ [HSM Botones] ${plantilla.titulo}`
      : (esHSM ? `⚡ [HSM] ${plantilla.titulo}` : plantilla.titulo);
    cerrarPanel();
    resetearArchivosModal();
    variableFields.innerHTML = "";

    const tituloNorm = normalizarTexto((plantilla && plantilla.titulo) || "");
    const descNorm = normalizarTexto((plantilla && plantilla.descripcion) || "");
    const tieneMedia = descNorm.includes(";document") || descNorm.includes(";media") || descNorm.includes(";file");
    const esPaso2 = (tituloNorm.includes("02 de 7") || tituloNorm.includes("2 de 7")) && (tituloNorm.includes("luis") || tieneMedia);
    const esPaso7 = tituloNorm.includes("07 de 7") || tituloNorm.includes("7 de 7");

    // Mostrar zona de adjuntos si admite archivos (como Contrato 02 de 7 o Contrato 07 de 7)
    const attachmentGroup = modal.querySelector(".variable-attachment-group");
    const admiteAdjunto = !esHSM || tieneMedia || esPaso2 || esPaso7;
    if (attachmentGroup) {
      attachmentGroup.style.display = admiteAdjunto ? "block" : "none";
    }

    const soloUnArchivo = esPaso2;
    variableFileInput.multiple = !soloUnArchivo;

    if (variableAttachmentLabel) {
      variableAttachmentLabel.innerText = soloUnArchivo
        ? "Adjuntar un solo archivo (opcional)"
        : (esPaso7 ? "Adjuntar archivos (PDF Contrato y Flujo de conversación)" : "Adjuntar archivos (opcional)");
    }
    if (variableFileBrowseBtn) {
      variableFileBrowseBtn.innerText = soloUnArchivo
        ? "Adjuntar un solo archivo"
        : (esPaso7 ? "Seleccionar archivos (PDFs)" : "Seleccionar archivos");
    }
    if (variableFileHint) {
      variableFileHint.innerText = soloUnArchivo
        ? "o arrastra y suelta aquí (un solo archivo)"
        : (esPaso7 ? "o arrastra y suelta aquí el Contrato y el Flujo" : "o arrastra y suelta tus archivos aquí");
    }

    const tieneVariables = Array.isArray(variables) && variables.length > 0;

    if (!tieneVariables) {
      const nota = document.createElement("div");
      nota.className = "variable-no-fields-note";
      nota.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 2px;">📄 Listo para adjuntar un solo archivo</div>
        <div>Esta plantilla no requiere variables de texto. Puedes adjuntar el archivo PDF a continuación antes de enviar (un solo archivo).</div>
      `;
      variableFields.appendChild(nota);
    } else {
      variables.forEach((variableRaw, index) => {
        const detalle = parsearDetalleVariable(variableRaw);
        const wrapper = document.createElement("div");
        wrapper.className = "variable-group";

        const labelNombre = limpiarNombreLabel(detalle.nombre);
        const label = document.createElement("label");
        label.className = "variable-label";
        label.innerText = labelNombre;
        label.htmlFor = `variable-input-${index}`;

        let input;

        if (detalle.opciones.length > 0) {
          input = document.createElement("select");
          input.id = `variable-input-${index}`;
          input.className = "variable-input variable-select";
          input.dataset.variable = variableRaw;
          input.required = true;

          const defaultOption = document.createElement("option");
          defaultOption.value = "";
          defaultOption.innerText = `Seleccione ${labelNombre}...`;
          defaultOption.disabled = true;
          defaultOption.selected = true;
          input.appendChild(defaultOption);

          detalle.opciones.forEach(opcion => {
            const opt = document.createElement("option");
            opt.value = opcion.valor;
            opt.innerText = opcion.texto;
            input.appendChild(opt);
          });

          input.addEventListener("change", actualizarFormularioVariables);
        } else {
          input = document.createElement("input");
          input.id = `variable-input-${index}`;
          input.className = "variable-input";
          input.dataset.variable = variableRaw;
          input.type = "text";
          input.placeholder = `Valor para {{${labelNombre}}}`;
          input.required = true;
          input.addEventListener("input", actualizarFormularioVariables);
        }

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        variableFields.appendChild(wrapper);
      });
    }

    actualizarFormularioVariables();
    modal.classList.add("show");

    const primerInput = variableFields.querySelector(".variable-input");

    if (primerInput) {
      primerInput.focus();
    } else if (variableFileBrowseBtn) {
      variableFileBrowseBtn.focus();
    }
  }

  function seleccionarPlantilla(plantilla) {
    if (!plantilla.descripcion) {
      alert("Esta plantilla no tiene descripción.");
      return;
    }

    searchInput.value = "";
    renderizarVistaActual();

    const variables = obtenerVariablesPlantilla(plantilla.descripcion);

    if (plantillaRequiereModal(plantilla, variables)) {
      abrirModalVariables(plantilla, variables);
      return;
    }

    cerrarPanel();
    insertarEnChat(plantilla.descripcion);
  }

  // =========================
  // GESTIÓN DE ARCHIVOS ADJUNTOS
  // =========================
  function formatearTamanoArchivo(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = 1;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function obtenerIconoSegunArchivo(nombreArchivo) {
    const ext = (nombreArchivo || "").split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📕";
    if (["doc", "docx", "odt", "rtf", "txt"].includes(ext)) return "📄";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "📦";
    return "📎";
  }

  function abrirExploradorArchivos() {
    variableFileInput.click();
  }

  function renderizarListaArchivos() {
    variableFilesList.innerHTML = "";
    const permiteMultiples = variableFileInput.multiple;

    if (archivosAdjuntosActuales.length === 0) {
      variableFileEmpty.style.display = "flex";
      variableFileSelected.style.display = "none";
      variableAttachmentDropzone.classList.remove("has-file");
      return;
    }

    variableFileEmpty.style.display = "none";
    variableFileSelected.style.display = "flex";
    variableAttachmentDropzone.classList.add("has-file");

    const totalBytes = archivosAdjuntosActuales.reduce((sum, f) => sum + (f.size || 0), 0);
    const count = archivosAdjuntosActuales.length;
    variableFilesTotalInfo.innerText = permiteMultiples
      ? `${count} ${count === 1 ? "archivo" : "archivos"} (${formatearTamanoArchivo(totalBytes)})`
      : `1 archivo seleccionado (${formatearTamanoArchivo(totalBytes)})`;

    if (variableFileAddMoreBtn) {
      if (permiteMultiples) {
        variableFileAddMoreBtn.style.display = "inline-flex";
        variableFileAddMoreBtn.innerText = "+ Agregar más";
        variableFileAddMoreBtn.title = "Agregar más archivos";
      } else {
        variableFileAddMoreBtn.style.display = "inline-flex";
        variableFileAddMoreBtn.innerText = "Cambiar archivo";
        variableFileAddMoreBtn.title = "Seleccionar otro archivo";
      }
    }

    if (variableFileClearAllBtn) {
      variableFileClearAllBtn.innerText = permiteMultiples ? "Quitar todos" : "Quitar archivo";
    }

    archivosAdjuntosActuales.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "variable-file-item";

      const left = document.createElement("div");
      left.className = "variable-file-item-left";

      const badge = document.createElement("span");
      badge.className = "variable-file-badge";
      badge.innerText = obtenerIconoSegunArchivo(file.name);

      const names = document.createElement("div");
      names.className = "variable-file-names";

      const name = document.createElement("span");
      name.className = "variable-file-name";
      name.innerText = file.name;
      name.title = file.name;

      const size = document.createElement("span");
      size.className = "variable-file-size";
      size.innerText = formatearTamanoArchivo(file.size);

      names.appendChild(name);
      names.appendChild(size);
      left.appendChild(badge);
      left.appendChild(names);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "variable-file-btn-remove";
      removeBtn.title = "Quitar este archivo";
      removeBtn.setAttribute("aria-label", "Quitar archivo");
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", event => {
        event.stopPropagation();
        quitarArchivo(index);
      });

      item.appendChild(left);
      item.appendChild(removeBtn);
      variableFilesList.appendChild(item);
    });
  }

  function agregarArchivos(nuevosArchivos) {
    if (!nuevosArchivos || !nuevosArchivos.length) return;

    const lista = Array.from(nuevosArchivos);
    const permiteMultiples = variableFileInput.multiple;

    if (!permiteMultiples) {
      // Modo archivo único (Paso 2): solo 1 archivo permitido, reemplaza el anterior
      archivosAdjuntosActuales = [lista[0]];
      renderizarListaArchivos();
      return;
    }

    for (const archivo of lista) {
      const yaExiste = archivosAdjuntosActuales.some(
        a => a.name === archivo.name && a.size === archivo.size && a.lastModified === archivo.lastModified
      );
      if (!yaExiste) {
        archivosAdjuntosActuales.push(archivo);
      }
    }

    renderizarListaArchivos();
  }

  function quitarArchivo(index) {
    if (index >= 0 && index < archivosAdjuntosActuales.length) {
      archivosAdjuntosActuales.splice(index, 1);
      renderizarListaArchivos();
    }
  }

  function resetearArchivosModal() {
    archivosAdjuntosActuales = [];
    variableFileInput.value = "";
    renderizarListaArchivos();
    variableModalSend.disabled = false;
    variableModalSend.innerText = "Enviar mensaje";
  }

  function adjuntarArchivosEnChat(archivos) {
    if (!archivos || !archivos.length) return false;

    try {
      // 1. Buscar inputs de tipo file nativos en uContact
      const selectoresFileInput = [
        '.chat-footer input[type="file"]',
        '.chat-message-input input[type="file"]',
        '.chat-box input[type="file"]',
        '.write-message input[type="file"]',
        '#chat-container input[type="file"]',
        'input[type="file"]'
      ];

      const fileInputs = [...document.querySelectorAll(selectoresFileInput.join(", "))]
        .filter(el => !modal.contains(el));

      if (fileInputs.length > 0) {
        const fileInput = fileInputs[0];
        const dataTransfer = new DataTransfer();
        for (const archivo of archivos) {
          dataTransfer.items.add(archivo);
        }
        fileInput.files = dataTransfer.files;

        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        fileInput.dispatchEvent(new Event("input", { bubbles: true }));

        // Sincronizar AngularJS si aplica
        if (window.angular) {
          const ngElem = window.angular.element(fileInput);
          const scope = ngElem.scope();
          if (scope) {
            const ngModel = fileInput.getAttribute("ng-model");
            if (ngModel) {
              const keys = ngModel.split(".");
              let target = scope;
              for (let i = 0; i < keys.length - 1; i++) {
                if (target[keys[i]]) target = target[keys[i]];
              }
              target[keys[keys.length - 1]] = dataTransfer.files;
            }
            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$apply();
            }
          }
        }
        console.log(`[Quick Replies] ${archivos.length} archivo(s) transferido(s) exitosamente a uContact`);
        return true;
      }

      // 2. Si uContact maneja el adjunto mediante botón de clip nativo
      const selectoresClip = [
        ".emoji-picker-icon ~ .fa-paperclip",
        ".chat-footer .fa-paperclip",
        ".chat-box .fa-paperclip",
        ".write-message .fa-paperclip",
        ".fa-paperclip",
        ".fa-clip",
        "[title*='adjuntar' i]",
        "[title*='attach' i]"
      ];

      const botonClip = [...document.querySelectorAll(selectoresClip.join(", "))]
        .filter(el => !modal.contains(el) && !panel.contains(el) && elementoVisible(el))[0];

      if (botonClip) {
        console.log("[Quick Replies] Botón de adjunto uContact detectado:", botonClip);
      }
    } catch (err) {
      console.warn("[Quick Replies] No se pudieron adjuntar archivos automáticamente:", err);
    }

    return false;
  }

  // Eventos de adjunto en modal
  variableFileBrowseBtn.addEventListener("click", event => {
    event.stopPropagation();
    abrirExploradorArchivos();
  });

  variableAttachmentDropzone.addEventListener("click", event => {
    if (event.target.closest(".variable-file-btn-remove") || event.target.closest("#variable-file-add-more-btn") || event.target.closest("#variable-file-clear-all-btn")) {
      return;
    }
    if (archivosAdjuntosActuales.length === 0) {
      abrirExploradorArchivos();
    }
  });

  if (variableFileAddMoreBtn) {
    variableFileAddMoreBtn.addEventListener("click", event => {
      event.stopPropagation();
      abrirExploradorArchivos();
    });
  }

  if (variableFileClearAllBtn) {
    variableFileClearAllBtn.addEventListener("click", event => {
      event.stopPropagation();
      resetearArchivosModal();
    });
  }

  variableFileInput.addEventListener("change", () => {
    if (variableFileInput.files && variableFileInput.files.length > 0) {
      agregarArchivos(variableFileInput.files);
      variableFileInput.value = "";
    }
  });

  // Drag and Drop
  variableAttachmentDropzone.addEventListener("dragover", event => {
    event.preventDefault();
    event.stopPropagation();
    variableAttachmentDropzone.classList.add("is-dragover");
  });

  variableAttachmentDropzone.addEventListener("dragleave", event => {
    event.preventDefault();
    event.stopPropagation();
    variableAttachmentDropzone.classList.remove("is-dragover");
  });

  variableAttachmentDropzone.addEventListener("drop", event => {
    event.preventDefault();
    event.stopPropagation();
    variableAttachmentDropzone.classList.remove("is-dragover");
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      agregarArchivos(event.dataTransfer.files);
    }
  });

  variableModalClose.addEventListener("click", cerrarModalVariables);
  variableModalCancel.addEventListener("click", cerrarModalVariables);
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      cerrarModalVariables();
    }
  });

  variableModalSend.addEventListener("click", async () => {
    if (!plantillaModalActual) {
      return;
    }

    if (!validarVariablesModal()) {
      return;
    }

    const archivosAAdjuntar = [...archivosAdjuntosActuales];
    const tieneArchivos = archivosAAdjuntar.length > 0;
    const esHSMMedia = esPlantillaHSMMedia(plantillaModalActual, variablePreview.value);

    // Si la plantilla es HSM Media o si el usuario adjuntó archivos en el modal (como en Paso 2 o Paso 7)
    if (esHSMMedia || tieneArchivos) {
      if (esHSMMedia && archivosAAdjuntar.length === 0) {
        alert("Por favor adjunta los archivos requeridos antes de enviar.");
        return;
      }

      variableModalSend.disabled = true;
      variableModalSend.innerText = "Transfiriendo a uContact...";

      try {
        const enviado = await enviarPlantillaHSMMedia(plantillaModalActual, archivosAAdjuntar);
        if (enviado) {
          cerrarModalVariables();
        } else {
          variableModalSend.disabled = false;
          variableModalSend.innerText = "Enviar mensaje";
        }
      } catch (err) {
        console.error("[Quick Replies] Error al enviar plantilla con archivos:", err);
        variableModalSend.disabled = false;
        variableModalSend.innerText = "Enviar mensaje";
      }
      return;
    }

    insertarYEnviarTodo(variablePreview.value, archivosAAdjuntar);
    cerrarModalVariables();
  });

  // =========================
  // PLANTILLAS POR ÁREA
  // =========================
  const AREAS = {
    RT: "Retenciones",
    CA: "Calidad",
    FC: "Facturación",
    ST: "soporte",
    OC: "Otras Consultas",
    VT: "Ventas"
  };

  const CODIGOS_AREA = Object.keys(AREAS);

  function obtenerValorCampo(item, nombresCampos) {
    const claveEncontrada = Object.keys(item).find(clave => {
      const claveNormalizada = clave.trim().toLowerCase();
      return nombresCampos.some(nombre => nombre.toLowerCase() === claveNormalizada);
    });

    return claveEncontrada ? String(item[claveEncontrada] || "").trim() : "";
  }

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function obtenerCodigoAreaDesdeTexto(texto) {
    const textoNormalizado = normalizarTexto(texto);
    const textoMayusculas = String(texto || "").toUpperCase();
    const codigosRegex = CODIGOS_AREA
      .sort((a, b) => b.length - a.length)
      .join("|");

    const codigoPorUsuario = textoMayusculas.match(new RegExp(`\\b(${codigosRegex})\\d+[A-Z0-9._-]*\\b`));

    if (codigoPorUsuario) {
      return codigoPorUsuario[1];
    }

    const codigoDirecto = textoMayusculas.match(new RegExp(`\\b(${codigosRegex})\\b`));

    if (codigoDirecto) {
      return codigoDirecto[1];
    }

    return CODIGOS_AREA.find(codigo => normalizarTexto(AREAS[codigo]) === textoNormalizado) || "";
  }

  function esAreaGeneral(texto) {
    return normalizarTexto(texto) === "general";
  }

  function obtenerOrdenPlantilla(valor) {
    const orden = Number.parseInt(String(valor || "").trim(), 10);
    return Number.isFinite(orden) && orden > 0 ? orden : null;
  }

  function crearIdPlantilla(areaCodigo, titulo, descripcion) {
    const texto = `${areaCodigo || "GENERAL"}|${normalizarTexto(titulo)}|${normalizarTexto(descripcion)}`;
    let hash = 0;

    for (let i = 0; i < texto.length; i++) {
      hash = ((hash << 5) - hash) + texto.charCodeAt(i);
      hash |= 0;
    }

    return String(hash);
  }

  function obtenerUsuarioDesdeLocalStorage() {
    try {
      const lastUser = localStorage.getItem("last_user");

      if (!lastUser) {
        return "";
      }

      const data = JSON.parse(lastUser);
      return String(data.user || "").trim();
    } catch (error) {
      console.warn("[Quick Replies] No se pudo leer localStorage.last_user:", error);
      return "";
    }
  }

  function obtenerUsuarioDesdeEtiqueta() {
    const username = document.querySelector("strong#username");
    return username ? (username.innerText || username.textContent || "").trim() : "";
  }

  function obtenerUsuarioLogueado() {
    return obtenerUsuarioDesdeLocalStorage() || obtenerUsuarioDesdeEtiqueta();
  }

  function obtenerAreaUsuario() {
    const usuarioLogueado = obtenerUsuarioLogueado();
    const codigo = obtenerCodigoAreaDesdeTexto(usuarioLogueado);

    return {
      codigo,
      nombre: codigo ? AREAS[codigo] : "",
      usuario: usuarioLogueado
    };
  }

  function obtenerClaveAnclados(areaUsuario) {
    const usuario = normalizarTexto(areaUsuario?.usuario || "sin usuario") || "sin usuario";
    return `quick-replies:pinned:${usuario}`;
  }

  function obtenerPlantillasAncladas(areaUsuario) {
    try {
      const data = localStorage.getItem(obtenerClaveAnclados(areaUsuario));
      return new Set(JSON.parse(data || "[]"));
    } catch (error) {
      console.warn("[Quick Replies] No se pudieron leer las plantillas ancladas:", error);
      return new Set();
    }
  }

  function guardarPlantillasAncladas(areaUsuario, ancladas) {
    try {
      localStorage.setItem(obtenerClaveAnclados(areaUsuario), JSON.stringify([...ancladas]));
    } catch (error) {
      console.warn("[Quick Replies] No se pudieron guardar las plantillas ancladas:", error);
    }
  }

  function alternarPlantillaAnclada(plantilla) {
    const areaUsuario = areaUsuarioActual || obtenerAreaUsuario();
    const ancladas = obtenerPlantillasAncladas(areaUsuario);

    if (ancladas.has(plantilla.id)) {
      ancladas.delete(plantilla.id);
    } else {
      ancladas.add(plantilla.id);
    }

    guardarPlantillasAncladas(areaUsuario, ancladas);
    renderizarVistaActual();
  }

  function normalizarPlantilla(item) {
    const valorArea = obtenerValorCampo(item, [
      "area",
      "área",
      "codigo",
      "código",
      "codigo area",
      "código área",
      "cod_area",
      "grupo",
      "departamento"
    ]);
    const esGeneral = esAreaGeneral(valorArea);
    const codigoArea = esGeneral ? "" : obtenerCodigoAreaDesdeTexto(valorArea);
    const valorOrden = obtenerValorCampo(item, [
      "orden",
      "order",
      "prioridad",
      "posición",
      "posicion"
    ]);

    const titulo = obtenerValorCampo(item, ["titulo", "título", "title", "nombre"]) || "Sin título";
    const descripcion = obtenerValorCampo(item, ["descripcion", "descripción", "respuesta", "mensaje", "texto"]) || "";

    return {
      id: crearIdPlantilla(codigoArea, titulo, descripcion),
      titulo,
      descripcion,
      areaCodigo: codigoArea,
      areaNombre: esGeneral ? "General" : (codigoArea ? AREAS[codigoArea] : "Sin área"),
      esGeneral,
      orden: obtenerOrdenPlantilla(valorOrden)
    };
  }

  function renderizarAreaDetectada(areaUsuario) {
    areaInfo.innerHTML = "";

    const badge = document.createElement("div");
    badge.className = areaUsuario.codigo ? "area-badge" : "area-badge warning";
    const esOcOCa = areaUsuario.codigo === "OC" || areaUsuario.codigo === "CA";

    if (areaUsuario.codigo) {
      badge.innerText = esOcOCa
        ? "Área detectada: OC - Otras Consultas"
        : `Área detectada: ${areaUsuario.codigo} - ${areaUsuario.nombre}`;
    } else {
      badge.innerText = "Área no detectada: mostrando solo plantillas generales";
    }

    areaInfo.appendChild(badge);
  }

  function renderizarResumenPlantillas(totalFiltradas, totalPlantillas, busqueda) {
    const resumenExistente = areaInfo.querySelector(".templates-count");

    if (resumenExistente) {
      resumenExistente.remove();
    }

    const resumen = document.createElement("div");
    resumen.className = "templates-count";
    resumen.innerText = busqueda
      ? `${totalFiltradas} resultado(s) de ${totalPlantillas} plantilla(s)`
      : `${totalFiltradas} plantilla(s) visible(s)`;
    areaInfo.appendChild(resumen);
  }

  function filtrarPlantillas(plantillas, areaUsuario, busqueda) {
    const textoBusqueda = normalizarTexto(busqueda);
    const esOcOCa = areaUsuario.codigo === "OC" || areaUsuario.codigo === "CA";

    const plantillasPorArea = esOcOCa
      ? plantillas.filter(plantilla => plantilla.esGeneral || plantilla.areaCodigo === "OC" || plantilla.areaCodigo === "CA")
      : (areaUsuario.codigo
        ? plantillas.filter(plantilla => plantilla.esGeneral || plantilla.areaCodigo === areaUsuario.codigo)
        : plantillas.filter(plantilla => plantilla.esGeneral));

    if (!textoBusqueda) {
      return {
        visibles: plantillasPorArea,
        totalArea: plantillasPorArea.length
      };
    }

    return {
      visibles: plantillasPorArea.filter(plantilla => normalizarTexto(plantilla.titulo).includes(textoBusqueda)),
      totalArea: plantillasPorArea.length
    };
  }

  function ordenarPlantillas(plantillas, ancladas) {
    return [...plantillas].sort((a, b) => {
      const ancladaA = ancladas.has(a.id);
      const ancladaB = ancladas.has(b.id);

      if (ancladaA !== ancladaB) {
        return Number(ancladaB) - Number(ancladaA);
      }

      const ordenA = a.orden ?? Number.POSITIVE_INFINITY;
      const ordenB = b.orden ?? Number.POSITIVE_INFINITY;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return normalizarTexto(a.titulo).localeCompare(normalizarTexto(b.titulo));
    });
  }

  function renderizarPlantillas(plantillas, areaUsuario, busqueda = "") {
    const { visibles: plantillasFiltradas, totalArea } = filtrarPlantillas(plantillas, areaUsuario, busqueda);
    const ancladas = obtenerPlantillasAncladas(areaUsuario);
    const plantillasOrdenadas = ordenarPlantillas(plantillasFiltradas, ancladas);

    container.innerHTML = "";
    renderizarResumenPlantillas(plantillasOrdenadas.length, totalArea, busqueda);

    if (!plantillasOrdenadas.length) {
      const empty = document.createElement("div");
      empty.className = "templates-empty";
      empty.innerText = busqueda
        ? "No se encontraron plantillas con ese título."
        : `No hay plantillas para ${areaUsuario.codigo} - ${areaUsuario.nombre}.`;
      container.appendChild(empty);
      requestAnimationFrame(posicionarBoton);
      return;
    }

    plantillasOrdenadas.forEach(plantilla => {
      const div = document.createElement("div");
      const estaAnclada = ancladas.has(plantilla.id);
      div.className = estaAnclada ? "reply-item pinned" : "reply-item";

      const titulo = document.createElement("div");
      titulo.className = "reply-title";
      titulo.innerText = plantilla.titulo;

      const pinButton = document.createElement("button");
      pinButton.className = estaAnclada ? "pin-template active" : "pin-template";
      pinButton.type = "button";
      pinButton.title = estaAnclada ? "Desanclar plantilla" : "Anclar plantilla";
      pinButton.setAttribute("aria-label", pinButton.title);
      pinButton.innerText = estaAnclada ? "★" : "☆";
      pinButton.addEventListener("click", event => {
        event.stopPropagation();
        alternarPlantillaAnclada(plantilla);
      });

      div.appendChild(titulo);
      div.appendChild(pinButton);

      div.addEventListener("click", () => {
        seleccionarPlantilla(plantilla);
      });

      container.appendChild(div);
    });

    requestAnimationFrame(posicionarBoton);
  }

  function renderizarEstadoPlantillas(mensaje, tipo = "") {
    container.innerHTML = "";

    const estado = document.createElement("div");
    estado.className = `templates-empty ${tipo}`.trim();
    estado.innerText = mensaje;
    container.appendChild(estado);
    requestAnimationFrame(posicionarBoton);
  }

  function renderizarVistaActual() {
    if (!areaUsuarioActual) {
      areaUsuarioActual = obtenerAreaUsuario();
    }

    renderizarAreaDetectada(areaUsuarioActual);
    renderizarPlantillas(plantillasActuales, areaUsuarioActual, searchInput.value);
  }

  function procesarPlantillas(data) {
    plantillasActuales = data
      .map(normalizarPlantilla)
      .filter(plantilla => plantilla.titulo !== "Sin título" || plantilla.descripcion);

    areaUsuarioActual = obtenerAreaUsuario();

    console.log("[Quick Replies] usuario detectado:", areaUsuarioActual.usuario);
    console.log("[Quick Replies] :", areaUsuarioActual.codigo, areaUsuarioActual.nombre);
    console.log("[Quick Replies] plantillas cargadas:", plantillasActuales.length);

    renderizarVistaActual();
  }

  async function cargarPlantillas() {
    reloadTemplatesButton.disabled = true;
    reloadTemplatesButton.classList.add("loading");
    renderizarEstadoPlantillas("Cargando plantillas...");

    try {
      const url = `${SHEET_URL}${SHEET_URL.includes("?") ? "&" : "?"}_=${Date.now()}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      procesarPlantillas(data);
    } catch (error) {
      console.error("ERROR SHEET:", error);
      renderizarEstadoPlantillas("No se pudieron cargar las plantillas.", "error");
    } finally {
      reloadTemplatesButton.disabled = false;
      reloadTemplatesButton.classList.remove("loading");
    }
  }

  searchInput.addEventListener("input", renderizarVistaActual);
  reloadTemplatesButton.addEventListener("click", cargarPlantillas);

  // =========================
  // CARGAR DATOS GOOGLE SHEETS
  // =========================
  cargarPlantillas();
}
