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
      </div>
      <div class="variable-modal-actions">
        <button id="variable-modal-cancel" class="btn btn-secondary" type="button">Cerrar</button>
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

  function obtenerIconoEmojiVisible() {
    return [...document.querySelectorAll(".emoji-picker-icon.emoji-picker.fa.fa-smile-o, .emoji-picker-icon")]
      .filter(elemento => !button.contains(elemento) && !panel.contains(elemento))
      .filter(elemento => {
        const rect = elemento.getBoundingClientRect();
        const estilos = window.getComputedStyle(elemento);

        return rect.width > 0 &&
          rect.height > 0 &&
          estilos.display !== "none" &&
          estilos.visibility !== "hidden";
      })
      .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] || null;
  }

  function posicionarBoton() {
    const emoji = obtenerIconoEmojiVisible();

    if (!emoji) {
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

    const rect = emoji.getBoundingClientRect();
    const buttonSize = button.offsetWidth || 28;

    const inputChat = 
      document.querySelector('.chat-message-input') || 
      document.querySelector('[contenteditable="true"]') || 
      document.querySelector('textarea[placeholder*="mensaje"]') || 
      document.querySelector('input[placeholder*="mensaje"]') || 
      document.getElementById('txtMessage') ||
      document.querySelector('.write-message');

    if (inputChat) {
      if (inputChat !== ultimoInputChat) {
        ultimoInputChat = inputChat;
        alturaInicialInput = inputChat.offsetHeight > 0 ? inputChat.offsetHeight : 0;
      } else if (alturaInicialInput === 0 && inputChat.offsetHeight > 0) {
        alturaInicialInput = inputChat.offsetHeight;
      }
    } else {
      ultimoInputChat = null;
      alturaInicialInput = 0;
    }

    const isMultiLine = inputChat && alturaInicialInput > 0 && inputChat.offsetHeight > (alturaInicialInput + 10);

    let left, top;
    if (isMultiLine) {
      const gap = 8;
      left = Math.max(8, rect.left + (rect.width / 2) - (buttonSize / 2));
      top = Math.max(8, rect.bottom + gap);
    } else {
      const gap = 4;
      left = Math.max(8, rect.left - buttonSize - gap);
      top = Math.max(8, rect.top + (rect.height / 2) - (buttonSize / 2));
    }
    const panelWidth = 320;
    const panelRect = panel.getBoundingClientRect();
    const panelHeight = Math.min(
      panel.classList.contains("show") && panelRect.height > 0 ? panelRect.height : 360,
      500,
      window.innerHeight - 16
    );
    const panelLeft = Math.min(Math.max(8, left - panelWidth + buttonSize), window.innerWidth - panelWidth - 8);
    const panelTop = Math.min(
      Math.max(8, rect.top - panelHeight - 8),
      window.innerHeight - panelHeight - 8
    );

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

  button.addEventListener("click", event => {
    event.stopPropagation();
    panel.classList.toggle("show");
    actualizarEstadoBoton();
    requestAnimationFrame(posicionarBoton);
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
  const reloadTemplatesButton = panel.querySelector("#reload-templates");
  const variablePreview = modal.querySelector("#variable-preview");
  const variableFields = modal.querySelector("#variable-fields");
  const variableModalClose = modal.querySelector("#variable-modal-close");
  const variableModalCancel = modal.querySelector("#variable-modal-cancel");
  const variableModalSend = modal.querySelector("#variable-modal-send");
  const variableModalTitle = modal.querySelector(".variable-modal-title");
  let plantillaModalActual = null;
  let plantillasActuales = [];
  let areaUsuarioActual = null;
  let ultimoInputChat = null;
  let alturaInicialInput = 0;

  // =========================
  // LÓGICA DE INYECCIÓN EN CHAT
  // =========================
  function insertarEnChat(texto) {
    const inputChat = 
      document.querySelector('.chat-message-input') || 
      document.querySelector('[contenteditable="true"]') || 
      document.querySelector('textarea[placeholder*="mensaje"]') || 
      document.querySelector('input[placeholder*="mensaje"]') || 
      document.getElementById('txtMessage') ||
      document.querySelector('.write-message');

    if (inputChat) {
      if (inputChat.tagName !== 'INPUT' && inputChat.tagName !== 'TEXTAREA') {
        inputChat.innerText = texto;
      } else {
        inputChat.value = texto;
      }

      // Disparar eventos para que el sistema detecte los cambios de texto
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

  function elementoVisible(elemento) {
    const rect = elemento.getBoundingClientRect();
    const estilos = window.getComputedStyle(elemento);

    return rect.width > 0 &&
      rect.height > 0 &&
      estilos.visibility !== "hidden" &&
      estilos.display !== "none";
  }

  function enviarMensajeChat(inputChat) {
    const selectoresEnviar = [
      ".send-message",
      ".btn-send",
      ".chat-send",
      "[data-action='send']",
      "[title*='Enviar']",
      "[aria-label*='Enviar']",
      "button[class*='send']",
      "i[class*='send']",
      "i.fa-send",
      "i.fa-paper-plane"
    ].join(", ");

    const botonEnviar = [...document.querySelectorAll(selectoresEnviar)]
      .filter(elemento => !panel.contains(elemento) && !modal.contains(elemento))
      .filter(elementoVisible)
      .find(Boolean);

    if (botonEnviar) {
      const clickable = botonEnviar.closest("button, a, div") || botonEnviar;
      clickable.click();
      return true;
    }

    if (!inputChat) {
      return false;
    }

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

  function insertarYEnviarEnChat(texto) {
    const inputChat = insertarEnChat(texto);

    if (!inputChat) {
      return;
    }

    setTimeout(() => {
      const enviado = enviarMensajeChat(inputChat);

      if (!enviado) {
        console.warn("[Quick Replies] No se pudo encontrar el control de envío del chat.");
      }
    }, 80);
  }

  // =========================
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
      return valores[clave] ?? "";
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
    variableModalSend.disabled = false;
  }

  function abrirModalVariables(plantilla, variables) {
    plantillaModalActual = plantilla;
    variableModalTitle.innerText = plantilla.titulo;
    cerrarPanel();
    variableFields.innerHTML = "";

    variables.forEach((variable, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "variable-group";

      const label = document.createElement("label");
      label.className = "variable-label";
      label.innerText = /^\d+$/.test(variable) ? `Variable ${variable}` : variable;
      label.htmlFor = `variable-input-${index}`;

      const input = document.createElement("input");
      input.id = `variable-input-${index}`;
      input.className = "variable-input";
      input.dataset.variable = variable;
      input.type = "text";
      input.placeholder = `Valor para {{${variable}}}`;
      input.required = true;
      input.addEventListener("input", actualizarFormularioVariables);

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      variableFields.appendChild(wrapper);
    });

    actualizarFormularioVariables();
    modal.classList.add("show");

    const primerInput = variableFields.querySelector(".variable-input");

    if (primerInput) {
      primerInput.focus();
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

    if (!variables.length) {
      insertarEnChat(plantilla.descripcion);
      return;
    }

    abrirModalVariables(plantilla, variables);
  }

  variableModalClose.addEventListener("click", cerrarModalVariables);
  variableModalCancel.addEventListener("click", cerrarModalVariables);
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      cerrarModalVariables();
    }
  });
  variableModalSend.addEventListener("click", () => {
    if (!plantillaModalActual) {
      return;
    }

    if (!validarVariablesModal()) {
      return;
    }

    insertarYEnviarEnChat(variablePreview.value);
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
    badge.innerText = areaUsuario.codigo
      ? `Área detectada: ${areaUsuario.codigo} - ${areaUsuario.nombre}`
      : "Área no detectada: mostrando solo plantillas generales";

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
    const plantillasPorArea = areaUsuario.codigo
      ? plantillas.filter(plantilla => plantilla.esGeneral || plantilla.areaCodigo === areaUsuario.codigo)
      : plantillas.filter(plantilla => plantilla.esGeneral);

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
    console.log("[Quick Replies] área detectada:", areaUsuarioActual.codigo, areaUsuarioActual.nombre);
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
