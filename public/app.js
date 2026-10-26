const estado = { categoria: "todos", categorias: [], productos: [] };
const { escapar, precioHTML, sinFotoHTML, textoBoton, ordenar, tarjetaHTML, categoriaHTML, contadorTexto } = window.Plantillas;

// ---------- Aparecer al bajar ----------
// Solo se esconde lo que todavía está fuera de pantalla, así nada parpadea al cargar.
// Lo que entra junto aparece escalonado (50 ms entre cada uno).
const revelador = "IntersectionObserver" in window
    ? new IntersectionObserver((entradas) => {
        entradas.filter((e) => e.isIntersecting).forEach((e, i) => {
            e.target.style.setProperty("--orden", Math.min(i, 8));
            e.target.classList.add("visible");
            revelador.unobserve(e.target);
        });
    }, { threshold: 0.15 })
    : null;

function revelarAlBajar(elementos) {
    if (!revelador) return;
    elementos.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add("revelar");
        revelador.observe(el);
    });
}

// ---------- Detalles que evitan cambios bruscos ----------
const pocoMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

// Cambia un texto con un fundido y un leve desenfoque: el desenfoque une el texto viejo
// y el nuevo en uno solo, en vez de verse dos textos encimados
function cambiarTexto(el, texto) {
    if (el.textContent === texto) return;
    el.textContent = texto;
    if (pocoMovimiento.matches || !el.animate) return;
    el.animate(
        [{ opacity: 0.4, filter: "blur(3px)" }, { opacity: 1, filter: "blur(0)" }],
        { duration: 200, easing: "ease-out" }
    );
}

// Las fotos que todavía no terminan de bajar aparecen con un fundido al llegar
function aparecerAlCargar(imagenes) {
    imagenes.forEach((img) => {
        if (img.complete) return;
        img.classList.add("cargando");
        const listo = () => img.classList.remove("cargando");
        img.addEventListener("load", listo, { once: true });
        img.addEventListener("error", listo, { once: true });
    });
}

// ---------- Barra con sombra al bajar ----------
const barra = document.querySelector(".barra");
let barraPendiente = false;
window.addEventListener("scroll", () => {
    if (barraPendiente) return;
    barraPendiente = true;
    requestAnimationFrame(() => {
        barraPendiente = false;
        barra.classList.toggle("con-sombra", window.scrollY > 8);
    });
}, { passive: true });

// ---------- Portada: los arcos siguen el mouse con un resorte ----------
// Decorativo, solo con mouse. Sin resorte, seguir el puntero se ve mecánico;
// con resorte tiene inercia y se siente vivo (técnica de Emil Kowalski).
(function () {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || pocoMovimiento.matches) return;
    const portada = document.querySelector(".portada");
    const capas = [
        [".arco-grande", 10], [".arco-a", 22], [".arco-b", 16], [".arco-linea", 5]
    ].map(([selector, fuerza]) => ({ el: document.querySelector(selector), fuerza })).filter((c) => c.el);
    if (!portada || !capas.length) return;

    const resorte = { x: 0, y: 0, vx: 0, vy: 0, metaX: 0, metaY: 0 };
    const RIGIDEZ = 120, AMORTIGUACION = 16;
    let corriendo = false, antes = 0;

    function paso(ahora) {
        const dt = Math.min((ahora - antes) / 1000, 0.05);
        antes = ahora;
        resorte.vx += ((resorte.metaX - resorte.x) * RIGIDEZ - resorte.vx * AMORTIGUACION) * dt;
        resorte.vy += ((resorte.metaY - resorte.y) * RIGIDEZ - resorte.vy * AMORTIGUACION) * dt;
        resorte.x += resorte.vx * dt;
        resorte.y += resorte.vy * dt;
        // translate (no transform) para sumarse a la animación de entrada sin pisarla
        capas.forEach((c) => { c.el.style.translate = (resorte.x * c.fuerza).toFixed(2) + "px " + (resorte.y * c.fuerza).toFixed(2) + "px"; });
        const quieto = Math.abs(resorte.metaX - resorte.x) < 0.001 && Math.abs(resorte.metaY - resorte.y) < 0.001 &&
            Math.abs(resorte.vx) < 0.001 && Math.abs(resorte.vy) < 0.001;
        if (quieto) corriendo = false; else requestAnimationFrame(paso);
    }

    function mover(x, y) {
        resorte.metaX = x;
        resorte.metaY = y;
        if (!corriendo) {
            corriendo = true;
            antes = performance.now();
            requestAnimationFrame(paso);
        }
    }

    portada.addEventListener("pointermove", (e) => {
        const r = portada.getBoundingClientRect();
        mover((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    });
    portada.addEventListener("pointerleave", () => mover(0, 0));
})();

// ---------- Categorías y filtros ----------
function pintarCategorias() {
    document.getElementById("categorias").innerHTML = estado.categorias.map(categoriaHTML).join("");
    aparecerAlCargar(document.querySelectorAll("#categorias img"));

    const contar = (id) => estado.productos.filter((p) => p.categoria === id).length;
    const filtros = [{ id: "todos", nombre: "Todos", total: estado.productos.length }]
        .concat(estado.categorias.map((c) => ({ id: c.id, nombre: c.nombre, total: contar(c.id) })));

    const contenido = (f) => escapar(f.nombre) + '<span>' + f.total + '</span>';
    const fila = document.getElementById("filtros");
    fila.innerHTML = filtros.map((f) =>
        '<button class="filtro" data-categoria="' + f.id + '" aria-pressed="false">' + contenido(f) + '</button>'
    ).join("") +
        // Copia oscura de la fila; se recorta para mostrar solo el filtro activo
        '<div class="filtros-activo" aria-hidden="true">' +
            filtros.map((f) => '<span class="filtro">' + contenido(f) + '</span>').join("") +
        '</div>';
    fila.classList.add("con-indicador");

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
    moverIndicador();
    pintarProductos();
}

// Recorta la copia oscura justo sobre el filtro activo. La primera vez (y al cambiar
// el tamaño de la ventana) se coloca sin animación.
let indicadorListo = false;
function moverIndicador() {
    const copia = document.querySelector(".filtros-activo");
    const activo = document.querySelector('.filtro[aria-pressed="true"]');
    if (!copia || !activo) return;
    const arriba = activo.offsetTop;
    const izquierda = activo.offsetLeft;
    const derecha = copia.offsetWidth - izquierda - activo.offsetWidth;
    const abajo = copia.offsetHeight - arriba - activo.offsetHeight;
    if (!indicadorListo) copia.style.transition = "none";
    copia.style.clipPath = "inset(" + arriba + "px " + derecha + "px " + abajo + "px " + izquierda + "px round 999px)";
    if (!indicadorListo) {
        copia.offsetWidth; // aplica el recorte antes de devolver la transición
        copia.style.transition = "";
        indicadorListo = true;
    }
}

window.addEventListener("resize", () => {
    indicadorListo = false;
    moverIndicador();
});

// ---------- Productos ----------
// Las tarjetas aparecen al bajar solo la primera vez; al filtrar se muestran al instante
let primeraVez = true;

function pintarProductos() {
    const lista = ordenar(estado.categoria === "todos"
        ? estado.productos
        : estado.productos.filter((p) => p.categoria === estado.categoria));

    const categoria = estado.categorias.find((c) => c.id === estado.categoria);
    cambiarTexto(document.getElementById("contador"), contadorTexto(lista.length, categoria));
    document.getElementById("rejilla").innerHTML = lista.map(tarjetaHTML).join("");
    aparecerAlCargar(document.querySelectorAll("#rejilla img"));

    document.querySelectorAll("[data-detalle]").forEach((b) => {
        b.addEventListener("click", () => abrirDetalle(Number(b.dataset.detalle)));
    });

    if (primeraVez) {
        primeraVez = false;
        revelarAlBajar(document.querySelectorAll("#rejilla .producto"));
    }
}

// ---------- Detalle del producto ----------
const detalle = document.getElementById("detalle");
const galeria = { fotos: [], actual: 0, nombre: "" };

// animar: false con el teclado (se repite mucho y la animación lo haría sentir lento)
function verFoto(i, animar = true) {
    const total = galeria.fotos.length;
    if (!total) return;
    const anterior = galeria.actual;
    galeria.actual = (i + total) % total;
    const imagen = document.getElementById("detalle-imagen");
    if (animar && anterior !== galeria.actual && detalle.open) {
        imagen.classList.add("cambiando");
        imagen.addEventListener("load", () => requestAnimationFrame(() => imagen.classList.remove("cambiando")), { once: true });
        setTimeout(() => imagen.classList.remove("cambiando"), 400);
    }
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
    if (e.key === "ArrowLeft") verFoto(galeria.actual - 1, false);
    if (e.key === "ArrowRight") verFoto(galeria.actual + 1, false);
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

// ---------- Celular: bajar la hoja del detalle para cerrarla ----------
// Un movimiento rápido basta aunque sea corto (velocidad > 0.11 px/ms, como en Vaul/Sonner).
// Si no se suelta lo suficiente, vuelve a su lugar con la curva de cajón.
const esCelular = window.matchMedia("(max-width: 900px)");
const arrastre = { activo: false, decidido: false, x: 0, y: 0, hora: 0, distancia: 0 };

detalle.addEventListener("touchstart", (e) => {
    if (!esCelular.matches || detalle.scrollTop > 0 || e.touches.length > 1) return;
    Object.assign(arrastre, { activo: true, decidido: false, x: e.touches[0].clientX, y: e.touches[0].clientY, hora: Date.now(), distancia: 0 });
}, { passive: true });

detalle.addEventListener("touchmove", (e) => {
    if (!arrastre.activo) return;
    const dx = e.touches[0].clientX - arrastre.x;
    const dy = e.touches[0].clientY - arrastre.y;
    if (!arrastre.decidido) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        // Solo cuenta si va hacia abajo y más vertical que horizontal (lo horizontal es la galería)
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) { arrastre.activo = false; return; }
        arrastre.decidido = true;
        detalle.style.transition = "none";
    }
    e.preventDefault();
    arrastre.distancia = Math.max(0, dy);
    detalle.style.transform = "translateY(" + arrastre.distancia + "px)";
}, { passive: false });

detalle.addEventListener("touchend", () => {
    if (!arrastre.activo) return;
    arrastre.activo = false;
    if (!arrastre.decidido) return;
    const velocidad = arrastre.distancia / Math.max(1, Date.now() - arrastre.hora);
    if (arrastre.distancia > window.innerHeight * 0.25 || (velocidad > 0.11 && arrastre.distancia > 20)) {
        detalle.style.transition = "transform 240ms cubic-bezier(0.23, 1, 0.32, 1)";
        detalle.style.transform = "translateY(100%)";
        setTimeout(() => {
            detalle.style.transition = "none";
            detalle.close();
            requestAnimationFrame(() => { detalle.style.transform = ""; detalle.style.transition = ""; });
        }, 240);
    } else {
        detalle.style.transition = "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
        detalle.style.transform = "";
        setTimeout(() => { detalle.style.transition = ""; }, 300);
    }
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
    revelarAlBajar(document.querySelectorAll(
        ".categorias-lista li, .catalogo-encabezado, .pasos h2, .pasos-lista li, .contacto > *, .pie > *"
    ));

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
