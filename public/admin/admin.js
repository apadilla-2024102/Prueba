// Panel de administración de Drea Sparkle
const estado = { categorias: [], productos: [], editando: null, fotos: [], hueco: 0 };
const $ = (id) => document.getElementById(id);

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function api(ruta, opciones = {}) {
    const r = await fetch("/admin/api" + ruta, {
        method: opciones.method || "GET",
        headers: opciones.datos ? { "Content-Type": "application/json" } : {},
        body: opciones.datos ? JSON.stringify(opciones.datos) : undefined,
        credentials: "same-origin"
    });
    const datos = await r.json().catch(() => ({}));
    if (r.status === 401 && ruta !== "/entrar") mostrarEntrar();
    if (!r.ok) throw new Error(datos.error || "Algo salió mal. Intenta de nuevo.");
    return datos;
}

let temporizadorAviso;
function avisar(texto) {
    const aviso = $("aviso");
    aviso.textContent = texto;
    aviso.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 3000);
}

// ---------- Entrar y salir ----------
function mostrarEntrar() {
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    $("pantalla-panel").hidden = true;
    $("pantalla-entrar").hidden = false;
    $("form-entrar").usuario.focus();
}

async function mostrarPanel(usuario) {
    $("nombre-usuario").textContent = usuario;
    $("pantalla-entrar").hidden = true;
    $("pantalla-panel").hidden = false;
    await cargarCatalogo();
}

$("form-entrar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const boton = form.querySelector("button");
    $("error-entrar").textContent = "";
    boton.disabled = true;
    try {
        const { usuario } = await api("/entrar", { method: "POST", datos: { usuario: form.usuario.value, clave: form.clave.value } });
        form.clave.value = "";
        await mostrarPanel(usuario);
    } catch (err) {
        $("error-entrar").textContent = err.message;
    } finally {
        boton.disabled = false;
    }
});

$("salir").addEventListener("click", async () => {
    await api("/salir", { method: "POST" }).catch(() => {});
    mostrarEntrar();
});

// ---------- Lista de productos ----------
async function cargarCatalogo() {
    const datos = await api("/catalogo");
    estado.categorias = datos.categorias;
    estado.productos = datos.productos;
    const esLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    $("aviso-almacen").hidden = datos.almacenamiento === "blob" || esLocal;

    const opciones = estado.categorias.map((c) => '<option value="' + c.id + '">' + escapar(c.nombre) + "</option>").join("");
    const filtro = $("filtro-categoria");
    const elegida = filtro.value;
    filtro.innerHTML = '<option value="">Todas las categorías</option>' + opciones;
    filtro.value = elegida;
    $("editor-categoria").innerHTML = opciones;
    pintarLista();
}

function nombreCategoria(id) {
    return (estado.categorias.find((c) => c.id === id) || {}).nombre || id;
}

function pintarLista() {
    const busqueda = $("buscar").value.trim().toLowerCase();
    const categoria = $("filtro-categoria").value;
    const lista = estado.productos.filter((p) =>
        (!categoria || p.categoria === categoria) &&
        (!busqueda || (p.nombre + " " + (p.marca || "")).toLowerCase().includes(busqueda))
    );

    $("resumen").textContent = estado.productos.length + " productos en total" +
        (lista.length !== estado.productos.length ? " · " + lista.length + " mostrados" : "");

    $("lista").innerHTML = lista.length ? lista.map((p) =>
        '<li class="fila">' +
            '<span class="fila-foto">' + (p.imagenes[0] ? '<img src="' + escapar(p.imagenes[0]) + '" alt="" loading="lazy">' : "Sin foto") + "</span>" +
            '<div class="fila-info">' +
                '<p class="fila-nombre">' + escapar(p.nombre) + (p.destacado ? ' <span class="etiqueta">Favorito</span>' : "") + "</p>" +
                '<p class="fila-datos">' + escapar([p.marca, nombreCategoria(p.categoria)].filter(Boolean).join(" · ")) + "</p>" +
                '<p class="fila-datos">' +
                    (typeof p.precio === "number" ? "Q" + p.precio : "Consultar precio") +
                    (p.cantidad !== undefined ? " · " + p.cantidad + (p.cantidad === 1 ? " pieza" : " piezas") : "") +
                    " · " + p.imagenes.length + (p.imagenes.length === 1 ? " foto" : " fotos") +
                "</p>" +
            "</div>" +
            '<div class="fila-acciones">' +
                '<button class="boton boton-borde boton-chico" data-editar="' + p.id + '">Editar</button>' +
                '<button class="boton boton-peligro-borde boton-chico" data-eliminar="' + p.id + '">Eliminar</button>' +
            "</div>" +
        "</li>"
    ).join("") : '<li class="lista-vacia">No hay productos con ese filtro.</li>';
}

$("buscar").addEventListener("input", pintarLista);
$("filtro-categoria").addEventListener("change", pintarLista);

$("lista").addEventListener("click", (e) => {
    const editar = e.target.closest("[data-editar]");
    const eliminar = e.target.closest("[data-eliminar]");
    if (editar) abrirEditor(estado.productos.find((p) => p.id === Number(editar.dataset.editar)));
    if (eliminar) pedirConfirmacion(estado.productos.find((p) => p.id === Number(eliminar.dataset.eliminar)));
});

$("agregar").addEventListener("click", () => abrirEditor(null));

// ---------- Editor ----------
const editor = $("editor");
const form = $("form-producto");

function abrirEditor(producto) {
    estado.editando = producto;
    $("editor-titulo").textContent = producto ? "Editar producto" : "Agregar producto";
    $("error-producto").textContent = "";
    form.reset();
    form.nombre.value = producto?.nombre || "";
    form.marca.value = producto?.marca || "";
    form.categoria.value = producto?.categoria || $("filtro-categoria").value || estado.categorias[0]?.id || "";
    form.desc.value = producto?.desc || "";
    form.precio.value = typeof producto?.precio === "number" ? producto.precio : "";
    form.cantidad.value = producto?.cantidad ?? "";
    form.destacado.checked = Boolean(producto?.destacado);
    estado.fotos = (producto?.imagenes || []).slice(0, 3);
    pintarFotos();
    $("specs").innerHTML = "";
    (producto?.specs || []).forEach(([n, v]) => agregarSpec(n, v));
    if (!producto) agregarSpec();
    editor.showModal();
    editor.querySelector(".editor-cuerpo").scrollTop = 0;
}

// Tres huecos de foto: cada uno se puede subir, cambiar, quitar o pasar a primera
function pintarFotos() {
    $("fotos").innerHTML = [0, 1, 2].map((i) => {
        const src = estado.fotos[i];
        if (src === "subiendo") {
            return '<div class="foto foto-subiendo"><span>Subiendo…</span></div>';
        }
        if (!src) {
            return '<button type="button" class="foto foto-vacia" data-subir="' + i + '">' +
                '<span aria-hidden="true">+</span>Subir foto ' + (i + 1) + "</button>";
        }
        return '<div class="foto">' +
            '<img src="' + escapar(src) + '" alt="Foto ' + (i + 1) + '">' +
            (i === 0 ? '<span class="foto-principal">Principal</span>' : "") +
            '<div class="foto-acciones">' +
                '<button type="button" data-subir="' + i + '">Cambiar</button>' +
                (i > 0 ? '<button type="button" data-primera="' + i + '">Hacer principal</button>' : "") +
                '<button type="button" data-quitar="' + i + '">Quitar</button>' +
            "</div>" +
        "</div>";
    }).join("");
}

$("fotos").addEventListener("click", (e) => {
    const subir = e.target.closest("[data-subir]");
    const quitar = e.target.closest("[data-quitar]");
    const primera = e.target.closest("[data-primera]");
    if (subir) {
        // Un hueco vacío se llena en el siguiente lugar libre para no dejar espacios
        const i = Number(subir.dataset.subir);
        estado.hueco = estado.fotos[i] ? i : Math.min(i, estado.fotos.length);
        $("elegir-foto").click();
    }
    if (quitar) {
        estado.fotos.splice(Number(quitar.dataset.quitar), 1);
        pintarFotos();
    }
    if (primera) {
        const [foto] = estado.fotos.splice(Number(primera.dataset.primera), 1);
        estado.fotos.unshift(foto);
        pintarFotos();
    }
});

// Achica la foto en el navegador antes de subirla (máximo 1600 px, JPEG)
function achicarFoto(archivo) {
    return new Promise((resolver, rechazar) => {
        const img = new Image();
        const url = URL.createObjectURL(archivo);
        img.onload = () => {
            const escala = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
            const lienzo = document.createElement("canvas");
            lienzo.width = Math.round(img.naturalWidth * escala);
            lienzo.height = Math.round(img.naturalHeight * escala);
            const ctx = lienzo.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, lienzo.width, lienzo.height);
            ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
            URL.revokeObjectURL(url);
            resolver(lienzo.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            rechazar(new Error("No se pudo leer esa foto. Prueba con otra en JPG o PNG."));
        };
        img.src = url;
    });
}

$("elegir-foto").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    e.target.value = "";
    if (!archivo) return;
    const i = estado.hueco;
    const anterior = estado.fotos[i];
    estado.fotos[i] = "subiendo";
    pintarFotos();
    $("error-producto").textContent = "";
    try {
        const datos = await achicarFoto(archivo);
        const { url } = await api("/imagenes", { method: "POST", datos: { datos } });
        estado.fotos[i] = url;
    } catch (err) {
        if (anterior) estado.fotos[i] = anterior; else estado.fotos.splice(i, 1);
        $("error-producto").textContent = err.message;
    }
    pintarFotos();
});

function agregarSpec(nombre = "", valor = "") {
    const fila = document.createElement("div");
    fila.className = "spec";
    fila.innerHTML =
        '<input aria-label="Nombre de la especificación" placeholder="Contenido" maxlength="40" value="' + escapar(nombre) + '">' +
        '<input aria-label="Valor" placeholder="75 ml" maxlength="200" value="' + escapar(valor) + '">' +
        '<button type="button" class="spec-quitar" aria-label="Quitar especificación">&times;</button>';
    fila.querySelector("button").addEventListener("click", () => fila.remove());
    $("specs").appendChild(fila);
}

$("agregar-spec").addEventListener("click", () => {
    agregarSpec();
    $("specs").lastElementChild.querySelector("input").focus();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (estado.fotos.includes("subiendo")) {
        $("error-producto").textContent = "Espera a que termine de subir la foto.";
        return;
    }
    if (!form.nombre.value.trim()) {
        $("error-producto").textContent = "Escribe el nombre del producto.";
        form.nombre.focus();
        return;
    }
    const datos = {
        nombre: form.nombre.value,
        marca: form.marca.value,
        categoria: form.categoria.value,
        desc: form.desc.value,
        precio: form.precio.value === "" ? null : form.precio.value,
        cantidad: form.cantidad.value === "" ? null : form.cantidad.value,
        destacado: form.destacado.checked,
        imagenes: estado.fotos,
        specs: [...$("specs").querySelectorAll(".spec")].map((f) => [...f.querySelectorAll("input")].map((i) => i.value))
    };
    const boton = $("guardar");
    boton.disabled = true;
    boton.textContent = "Guardando…";
    try {
        if (estado.editando) {
            await api("/productos/" + estado.editando.id, { method: "PUT", datos });
        } else {
            await api("/productos", { method: "POST", datos });
        }
        editor.close();
        avisar(estado.editando ? "Cambios guardados" : "Producto agregado");
        await cargarCatalogo();
    } catch (err) {
        $("error-producto").textContent = err.message;
    } finally {
        boton.disabled = false;
        boton.textContent = "Guardar";
    }
});

// ---------- Eliminar ----------
const confirmar = $("confirmar");
let porEliminar = null;

function pedirConfirmacion(producto) {
    porEliminar = producto;
    $("confirmar-texto").textContent = "“" + producto.nombre + "” se quitará de la tienda. Esto no se puede deshacer.";
    $("error-eliminar").textContent = "";
    confirmar.showModal();
}

$("confirmar-eliminar").addEventListener("click", async () => {
    const boton = $("confirmar-eliminar");
    boton.disabled = true;
    try {
        await api("/productos/" + porEliminar.id, { method: "DELETE" });
        confirmar.close();
        avisar("Producto eliminado");
        await cargarCatalogo();
    } catch (err) {
        $("error-eliminar").textContent = err.message;
    } finally {
        boton.disabled = false;
    }
});

// ---------- Ventanas ----------
document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
        if (e.target.closest("[data-cerrar]")) d.close();
    });
});

// ---------- Inicio ----------
api("/sesion")
    .then(({ usuario }) => mostrarPanel(usuario))
    .catch(() => mostrarEntrar());
