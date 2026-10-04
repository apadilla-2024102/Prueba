// Dibuja una pulsera con cuentas de colores
function dibujarPulsera(colores) {
    const cuentas = 14;
    let html = '<div class="pulsera">';
    for (let i = 0; i < cuentas; i++) {
        const angulo = (360 / cuentas) * i;
        html += '<i style="background:' + colores[i % colores.length] + ';transform:rotate(' + angulo + 'deg) translate(55px)"></i>';
    }
    return html + '</div>';
}

// Llenar el catálogo con los productos que manda el servidor
fetch("/api/productos")
    .then((r) => r.json())
    .then((productos) => {
        const contenedor = document.getElementById("productos");
        productos.forEach((p) => {
            contenedor.insertAdjacentHTML("beforeend",
                '<article class="card">' +
                    '<div class="card-img" style="background:' + p.fondo + '">' +
                        (p.etiqueta ? '<span class="etiqueta">' + p.etiqueta + '</span>' : '') +
                        dibujarPulsera(p.colores) +
                    '</div>' +
                    '<div class="card-body">' +
                        '<h3>' + p.nombre + '</h3>' +
                        '<p>' + p.desc + '</p>' +
                        '<div class="precio">' + p.precioUSD + ' <small>USD</small></div>' +
                        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + p.whatsapp + '">Me interesa</a>' +
                    '</div>' +
                '</article>'
            );
        });
    });

// Botones generales de contacto con mensaje de interés
fetch("/api/contacto")
    .then((r) => r.json())
    .then((contactos) => {
        document.querySelectorAll("[data-numero]").forEach((a) => {
            const c = contactos.find((c) => c.numero === a.dataset.numero);
            if (!c) return;
            a.href = c.whatsapp;
            a.target = "_blank";
            a.rel = "noopener";
        });
    });

// Mostrar la ventana de bienvenida al entrar
const modal = document.getElementById("bienvenida");
function cerrarModal() { modal.classList.remove("abierto"); }
setTimeout(() => modal.classList.add("abierto"), 1200);
document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });

document.getElementById("anio").textContent = new Date().getFullYear();
