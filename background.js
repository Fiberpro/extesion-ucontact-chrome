// Service worker: descarga las plantillas desde Google Apps Script.
// Se hace aquí (origen de la extensión) para no depender de CORS/CSP de la página.

const TIMEOUT_MS = 25000;
const REINTENTOS = 2;

async function descargarPlantillas(url) {
  let ultimoError;

  for (let intento = 1; intento <= REINTENTOS; intento++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const urlFinal = `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
      const response = await fetch(urlFinal, {
        cache: "no-store",
        redirect: "follow",
        // Sin cookies de Google: con sesión iniciada (o varias cuentas) Apps Script
        // redirige a /u/N/... y responde 404.
        credentials: "omit",
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("La respuesta no es una lista de plantillas");
      }

      await chrome.storage.local.set({
        plantillasCache: data,
        plantillasCacheFecha: Date.now()
      });

      return data;
    } catch (error) {
      ultimoError = error;
      console.warn(`[Quick Replies] Intento ${intento} falló:`, error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw ultimoError;
}

chrome.runtime.onMessage.addListener((mensaje, _sender, sendResponse) => {
  if (mensaje?.tipo !== "cargarPlantillas") {
    return false;
  }

  descargarPlantillas(mensaje.url)
    .then(data => sendResponse({ ok: true, data }))
    .catch(error => sendResponse({
      ok: false,
      timeout: error?.name === "AbortError",
      error: String(error?.message || error)
    }));

  return true; // respuesta asíncrona
});
