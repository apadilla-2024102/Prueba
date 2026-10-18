const estado = { categoria: "todos", categorias: [], productos: [] };
const { escapar, precioHTML, sinFotoHTML, textoBoton, ordenar, tarjetaHTML, categoriaHTML, contadorTexto } = window.Plantillas;

// ---------- Categorías y filtros ----------
function pintarCategorias() {
    document.getElementById("categorias").innerHTML = estado.categorias.map(categoriaHTML).join("");

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
    const lista = ordenar(estado.categoria === "todos"
        ? estado.productos
        : estado.productos.filter((p) => p.categoria === estado.categoria));

    const categoria = estado.categorias.find((c) => c.id === estado.categoria);
    document.getElementById("contador").textContent = contadorTexto(lista.length, categoria);
    document.getElementById("rejilla").innerHTML = lista.map(tarjetaHTML).join("");

    document.querySelectorAll("[data-detalle]").forEach((b) => {
        b.addEventListener("click", () => abrirDetalle(Number(b.dataset.detalle)));
    });
}

// ---------- Detalle del producto ----------
const detalle = document.getElementById("detalle");
const galeria = { fotos: [], actual: 0, nombre: "" };

function verFoto(i) {
    const total = galeria.fotos.length;
    if (!total) return;
    galeria.actual = (i + total) % total;
    const imagen = document.getElementById("detalle-imagen");
    imagen.src = galeria.fotos[galeria.actual];
    imagen.alt = galeria.nombre + ", foto " + (galeria.actual + 1) + " de " + total;
    document.getElementById("foto-contador").textContent = (galeria.actual + 1) + " / " + total;
    document.querySelectorAll("#detalle-miniaturas button").forEach((b, j) => {
        b.setAttribute("aria-current", String(galeria.actual === j));
    });
}

function abrirDetalle(id) {
    const p = estado.productos.find((x) => x.id === id);
    if (!p) return;

    galeria.fotos = p.imagenes;
    galeria.nombre = p.nombre;
    galeria.actual = 0;
    const hayFotos = p.imagenes.length > 0;
    const variasFotos = p.imagenes.length > 1;

    document.getElementById("detalle-imagen").hidden = !hayFotos;
    const sinFoto = document.getElementById("detalle-sin-foto");
    sinFoto.hidden = hayFotos;
    sinFoto.innerHTML = sinFotoHTML();
    ["foto-anterior", "foto-siguiente", "foto-contador"].forEach((id) => {
        document.getElementById(id).hidden = !variasFotos;
    });

    const miniaturas = document.getElementById("detalle-miniaturas");
    miniaturas.innerHTML = variasFotos
        ? p.imagenes.map((src, i) =>
            '<button aria-label="Ver foto ' + (i + 1) + ' de ' + p.imagenes.length + '"><img src="' + src + '" alt=""></button>'
        ).join("")
        : "";
    miniaturas.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => verFoto(i)));

    const categoria = estado.categorias.find((c) => c.id === p.categoria);
    const filas = []
        .concat(p.marca ? [["Marca", p.marca]] : [])
        .concat(p.specs || [])
        .concat(categoria ? [["Categoría", categoria.nombre]] : [])
        .concat(p.cantidad ? [["Disponibles", p.cantidad === 1 ? "1 pieza" : p.cantidad + " piezas"]] : []);
    document.getElementById("detalle-specs").innerHTML = filas.map(([nombre, valor]) =>
        '<div><dt>' + escapar(nombre) + '</dt><dd>' + escapar(valor) + '</dd></div>'
    ).join("");

    document.getElementById("detalle-marca").textContent = p.marca || "";
    document.getElementById("detalle-nombre").textContent = p.nombre;
    document.getElementById("detalle-desc").textContent = p.desc;
    document.getElementById("detalle-precio").innerHTML = precioHTML(p);
    document.getElementById("detalle-pedir").href = p.whatsapp;
    document.getElementById("detalle-pedir").textContent = textoBoton(p);
    document.getElementById("detalle-cantidad").textContent = p.cantidad === 1 ? "Última pieza disponible" : "";
    verFoto(0);

    if (bienvenida.open) bienvenida.close();
    detalle.showModal();
    detalle.scrollTop = 0;
}

document.getElementById("foto-anterior").addEventListener("click", () => verFoto(galeria.actual - 1));
document.getElementById("foto-siguiente").addEventListener("click", () => verFoto(galeria.actual + 1));

// Flechas del teclado y deslizar con el dedo para cambiar de foto
detalle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") verFoto(galeria.actual - 1);
    if (e.key === "ArrowRight") verFoto(galeria.actual + 1);
});

let toqueInicio = null;
const escenario = document.getElementById("detalle-escenario");
escenario.addEventListener("touchstart", (e) => { toqueInicio = e.touches[0].clientX; }, { passive: true });
escenario.addEventListener("touchend", (e) => {
    if (toqueInicio === null) return;
    const distancia = e.changedTouches[0].clientX - toqueInicio;
    if (Math.abs(distancia) > 40) verFoto(galeria.actual + (distancia < 0 ? 1 : -1));
    toqueInicio = null;
});

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
