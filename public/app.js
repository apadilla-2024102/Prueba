const estado = { categoria: "todos", categorias: [], productos: [] };

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Categorías y filtros ----------
function pintarCategorias() {
    document.getElementById("categorias").innerHTML = estado.categorias.map((c) =>
        '<li><button class="categoria" data-categoria="' + c.id + '" aria-pressed="false">' +
            '<span class="categoria-foto"><img src="' + c.imagen + '" alt="" loading="lazy" width="300" height="400"></span>' +
            escapar(c.nombre) +
        '</button></li>'
    ).join("");

    const contar = (id) => estado.productos.filter((p) => p.categoria === id).length;
    const filtros = [{ id: "todos", nombre: "Todos", total: estado.productos.length }]
        .concat(estado.categorias.map((c) => ({ id: c.id, nombre: c.nombre, total: contar(c.id) })));

    document.getElementById("filtros").innerHTML = filtros.map((f) =>
        '<button class="filtro" data-categoria="' + f.id + '" aria-pressed="false">' +
            escapar(f.nombre) + '<span>' + f.total + '</span>' +
        '</button>'
    ).join("");

    document.querySelectorAll("[data-categoria]").forEach((boton) => {
        boton.addEventListener("click", () => {
            const id = boton.dataset.categoria;
            // Tocar una categoría ya activa en la fila de fotos vuelve a "Todos"
            const elegida = boton.classList.contains("categoria") && estado.categoria === id ? "todos" : id;
            filtrar(elegida);
            if (boton.classList.contains("categoria")) {
                document.getElementById("productos").scrollIntoView();
            }
        });
    });
}

function filtrar(id) {
    estado.categoria = id;
    document.querySelectorAll("[data-categoria]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.categoria === id));
    });
    pintarProductos();
}

// ---------- Productos ----------
function pintarProductos() {
    const lista = estado.categoria === "todos"
        ? estado.productos
        : estado.productos.filter((p) => p.categoria === estado.categoria);

    const categoria = estado.categorias.find((c) => c.id === estado.categoria);
    document.getElementById("contador").textContent =
        lista.length + (lista.length === 1 ? " producto" : " productos") +
        (categoria ? " en " + categoria.nombre.toLowerCase() : "");

    document.getElementById("rejilla").innerHTML = lista.map((p) =>
        '<article class="producto">' +
            '<button class="producto-foto" data-detalle="' + p.id + '" aria-label="Ver detalles de ' + escapar(p.nombre) + '">' +
                '<img src="' + p.imagenes[0] + '" alt="' + escapar(p.nombre) + '" loading="lazy" width="500" height="500">' +
                (p.destacado ? '<span class="producto-sello">Favorito</span>' : '') +
            '</button>' +
            '<p class="producto-marca">' + escapar(p.marca || "") + '</p>' +
            '<h3>' + escapar(p.nombre) + '</h3>' +
            '<p class="producto-desc">' + escapar(p.desc) + '</p>' +
            '<div class="producto-pie">' +
                '<p class="precio">' + p.precioUSD + '<small>USD</small></p>' +
                '<a class="boton boton-principal" href="' + p.whatsapp + '" target="_blank" rel="noopener">Pedir por WhatsApp</a>' +
            '</div>' +
        '</article>'
    ).join("");

    document.querySelectorAll("[data-detalle]").forEach((b) => {
        b.addEventListener("click", () => abrirDetalle(Number(b.dataset.detalle)));
    });
}

// ---------- Detalle del producto ----------
const detalle = document.getElementById("detalle");

function abrirDetalle(id) {
    const p = estado.productos.find((x) => x.id === id);
    if (!p) return;

    const imagen = document.getElementById("detalle-imagen");
    const verImagen = (i) => {
        imagen.src = p.imagenes[i];
        imagen.alt = p.nombre;
        document.querySelectorAll("#detalle-miniaturas button").forEach((b, j) => {
            b.setAttribute("aria-current", String(i === j));
        });
    };

    const miniaturas = document.getElementById("detalle-miniaturas");
    miniaturas.innerHTML = p.imagenes.length > 1
        ? p.imagenes.map((src, i) =>
            '<button aria-label="Foto ' + (i + 1) + ' de ' + p.imagenes.length + '"><img src="' + src + '" alt=""></button>'
        ).join("")
        : "";
    miniaturas.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => verImagen(i)));

    document.getElementById("detalle-marca").textContent = p.marca || "";
    document.getElementById("detalle-nombre").textContent = p.nombre;
    document.getElementById("detalle-desc").textContent = p.desc;
    document.getElementById("detalle-precio").innerHTML = p.precioUSD + "<small>USD</small>";
    document.getElementById("detalle-pedir").href = p.whatsapp;
    verImagen(0);

    if (bienvenida.open) bienvenida.close();
    detalle.showModal();
}

// ---------- Ventanas: cerrar con el botón, Escape o tocando afuera ----------
document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
        if (e.target === d || e.target.closest("[data-cerrar]")) d.close();
    });
});

// ---------- Bienvenida con mensaje de interés (una vez por visita) ----------
const bienvenida = document.getElementById("bienvenida");

function yaSeMostro() {
    try { return sessionStorage.getItem("bienvenida") === "1"; } catch (e) { return false; }
}

setTimeout(() => {
    if (yaSeMostro() || detalle.open) return;
    bienvenida.showModal();
    try { sessionStorage.setItem("bienvenida", "1"); } catch (e) { /* sin almacenamiento */ }
}, 1500);

// ---------- Cargar datos del servidor ----------
Promise.all([
    fetch("/api/categorias").then((r) => r.json()),
    fetch("/api/productos").then((r) => r.json()),
    fetch("/api/contacto").then((r) => r.json())
]).then(([categorias, productos, contactos]) => {
    estado.categorias = categorias;
    estado.productos = productos;
    pintarCategorias();
    filtrar("todos");

    document.querySelectorAll("[data-numero]").forEach((a) => {
        const c = contactos.find((x) => x.numero === a.dataset.numero);
        if (!c) return;
        a.href = c.whatsapp;
        a.target = "_blank";
        a.rel = "noopener";
    });
}).catch(() => {
    document.getElementById("contador").textContent =
        "No se pudo cargar el catálogo. Recarga la página o escríbenos por WhatsApp.";
});

document.getElementById("anio").textContent = new Date().getFullYear();
