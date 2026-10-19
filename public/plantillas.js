// Plantillas HTML compartidas: las usa el navegador (app.js) y el servidor
// (server.js) para que Google reciba la página con los productos ya escritos.
(function (exportar) {
    function escapar(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function precioHTML(p) {
        if (!p.precioQ) return '<span class="precio-consultar">Consultar precio</span>';
        return p.precioQ + '<small>aprox. ' + p.precioUSD + ' USD</small>';
    }

    function sinFotoHTML() {
        return '<span class="sin-foto"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z"/></svg>Foto pronto</span>';
    }

    function selloHTML(p) {
        if (p.cantidad === 1) return '<span class="producto-sello">Última pieza</span>';
        if (p.destacado) return '<span class="producto-sello">Favorito</span>';
        return "";
    }

    function textoBoton(p) {
        return p.precioQ ? "Pedir por WhatsApp" : "Preguntar precio";
    }

    // Los productos con foto van primero; sort es estable y respeta el orden del catálogo.
    function ordenar(lista) {
        return lista.slice().sort((a, b) => (b.imagenes.length > 0) - (a.imagenes.length > 0));
    }

    function altFoto(p) {
        return p.marca ? p.nombre + " de " + p.marca : p.nombre;
    }

    function tarjetaHTML(p) {
        return '<article class="producto">' +
            '<button class="producto-foto" data-detalle="' + p.id + '" aria-label="Ver detalles de ' + escapar(p.nombre) + '">' +
                (p.imagenes.length
                    ? '<img src="' + p.imagenes[0] + '" alt="' + escapar(altFoto(p)) + '" loading="lazy" width="500" height="500">'
                    : sinFotoHTML()) +
                selloHTML(p) +
                (p.imagenes.length > 1 ? '<span class="producto-fotos">' + p.imagenes.length + ' fotos</span>' : '') +
            '</button>' +
            '<p class="producto-marca">' + escapar(p.marca || "") + '</p>' +
            '<h3><button class="producto-nombre" data-detalle="' + p.id + '">' + escapar(p.nombre) + '</button></h3>' +
            '<p class="producto-desc">' + escapar(p.desc) + '</p>' +
            '<div class="producto-pie">' +
                '<p class="precio">' + precioHTML(p) + '</p>' +
                '<a class="boton boton-principal" href="' + p.whatsapp + '" target="_blank" rel="noopener">' + textoBoton(p) + '</a>' +
                '<button class="boton boton-detalle" data-detalle="' + p.id + '">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5.5-5.5L8 18"/></svg>' +
                    '<span class="detalle-largo">Ver fotos y especificaciones</span><span class="detalle-corto">Fotos y detalles</span>' +
                '</button>' +
            '</div>' +
        '</article>';
    }

    function categoriaHTML(c) {
        return '<li><button class="categoria" data-categoria="' + c.id + '" aria-pressed="false">' +
            '<span class="categoria-foto"><img src="' + c.imagen + '" alt="" loading="lazy" width="300" height="400"></span>' +
            escapar(c.nombre) +
        '</button></li>';
    }

    function contadorTexto(total, categoria) {
        return total + (total === 1 ? " producto" : " productos") +
            (categoria ? " en " + categoria.nombre.toLowerCase() : "");
    }

    Object.assign(exportar, { escapar, precioHTML, sinFotoHTML, selloHTML, textoBoton, ordenar, tarjetaHTML, categoriaHTML, contadorTexto });
})(typeof module !== "undefined" ? module.exports : (window.Plantillas = {}));
