// Aviso de cookies: se muestra hasta que la persona lo acepta.
// La página no usa cookies de seguimiento; el aviso explica qué se guarda.
(function () {
    const CLAVE = "aviso-cookies";

    function aceptado() {
        try { return localStorage.getItem(CLAVE) === "1"; } catch (e) { return false; }
    }

    if (aceptado()) return;

    const aviso = document.createElement("section");
    aviso.className = "aviso-cookies";
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML =
        '<p>Usamos solo almacenamiento básico del navegador para que la página funcione. ' +
        'No usamos cookies de publicidad ni de seguimiento. ' +
        '<a href="/privacidad">Política de privacidad</a></p>' +
        '<button class="boton boton-principal" type="button">Entendido</button>';

    aviso.querySelector("button").addEventListener("click", () => {
        try { localStorage.setItem(CLAVE, "1"); } catch (e) { /* sin almacenamiento */ }
        aviso.remove();
    });

    document.body.appendChild(aviso);
})();
