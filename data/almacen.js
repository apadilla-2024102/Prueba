// Dónde se guarda el catálogo que se edita desde el panel /admin.
//
// En Vercel los archivos del proyecto no se pueden modificar, así que el catálogo
// y las fotos nuevas se guardan en Vercel Blob (Storage > Blob, con acceso público).
// Al conectar el Blob al proyecto, Vercel crea la variable BLOB_READ_WRITE_TOKEN.
//
// Sin esa variable (en tu computadora) se guarda en data/catalogo.json y public/img/subidas/.
//
// La primera vez se parte del catálogo escrito en data/productos.js.
//
// Ojo: un archivo público que se sobrescribe en Blob puede seguir leyéndose viejo
// hasta 60 segundos (useCache: false solo sirve para archivos privados). Por eso cada
// cambio se guarda como una versión nueva con nombre propio (catalogo/v-....json),
// que nunca está vieja, y tanto el panel como la tienda leen la más reciente.
// Se conservan las últimas versiones como respaldo.
// catalogo.json se sobrescribe también, solo como respaldo si no se pueden listar las versiones.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const inicial = require("./productos");

const USA_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const blob = USA_BLOB ? require("@vercel/blob") : null;

const ARCHIVO_BLOB = "catalogo.json";
const CARPETA_VERSIONES = "catalogo/";
const VERSIONES_GUARDADAS = 30;
const ARCHIVO_LOCAL = path.join(__dirname, "catalogo.json");
const CARPETA_LOCAL = path.join(__dirname, "..", "public", "img", "subidas");

// El sitio público lee el catálogo muchas veces: se guarda en memoria unos segundos.
const VIGENCIA_MS = 5 * 1000;
let enMemoria = null;

function copiaInicial() {
    return JSON.parse(JSON.stringify({
        actualizado: inicial.actualizado,
        categorias: inicial.categorias,
        productos: inicial.productos
    }));
}

async function leerBlob(direccion) {
    const r = await blob.get(direccion, { access: "public", useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
}

// Versiones guardadas, de la más nueva a la más vieja
async function listarVersiones() {
    const versiones = [];
    let cursor;
    do {
        const r = await blob.list({ prefix: CARPETA_VERSIONES, cursor });
        versiones.push(...r.blobs);
        cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return versiones.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

// El catálogo más reciente, sin cachés: para el panel y antes de guardar un cambio
async function leerActual() {
    if (USA_BLOB) {
        const [ultima] = await listarVersiones();
        if (ultima) return leerBlob(ultima.url);
        // Antes de las versiones solo existía catalogo.json
        return (await leerBlob(ARCHIVO_BLOB)) || copiaInicial();
    }
    if (!fs.existsSync(ARCHIVO_LOCAL)) return copiaInicial();
    return JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, "utf8"));
}

// Para la tienda: la versión más reciente, guardada en memoria unos segundos
async function leer() {
    if (enMemoria && Date.now() - enMemoria.hora < VIGENCIA_MS) return enMemoria.catalogo;
    let catalogo;
    try {
        catalogo = await leerActual();
    } catch (e) {
        // Si Blob falla, mejor mostrar lo último que se tenga que dejar la tienda vacía
        console.error("No se pudo leer la versión más reciente del catálogo", e.message);
        if (enMemoria) return enMemoria.catalogo;
        catalogo = (USA_BLOB && (await leerBlob(ARCHIVO_BLOB).catch(() => null))) || copiaInicial();
    }
    enMemoria = { catalogo, hora: Date.now() };
    return catalogo;
}

async function guardar(catalogo) {
    catalogo.actualizado = new Date().toISOString().slice(0, 10);
    const texto = JSON.stringify(catalogo, null, 2);
    if (USA_BLOB) {
        // El nombre empieza con la hora, así el orden alfabético es el orden en que se guardaron
        const version = CARPETA_VERSIONES + "v-" + String(Date.now()).padStart(15, "0") + "-" + crypto.randomBytes(3).toString("hex") + ".json";
        await blob.put(version, texto, { access: "public", contentType: "application/json", addRandomSuffix: false });
        await blob.put(ARCHIVO_BLOB, texto, {
            access: "public",
            contentType: "application/json",
            addRandomSuffix: false,
            cacheControlMaxAge: 60,
            allowOverwrite: true
        });
        await borrarVersionesViejas();
    } else {
        fs.writeFileSync(ARCHIVO_LOCAL, texto);
    }
    enMemoria = { catalogo, hora: Date.now() };
}

async function borrarVersionesViejas() {
    try {
        const viejas = (await listarVersiones()).slice(VERSIONES_GUARDADAS);
        if (viejas.length) await blob.del(viejas.map((v) => v.url));
    } catch (e) {
        console.error("No se pudieron borrar versiones viejas del catálogo", e.message);
    }
}

// Lee el catálogo más reciente, aplica el cambio y lo guarda
async function modificar(cambio) {
    const catalogo = await leerActual();
    const resultado = cambio(catalogo);
    await guardar(catalogo);
    return resultado;
}

// Guarda una foto (JPEG ya reducida en el navegador) y devuelve su dirección.
async function guardarImagen(buffer) {
    const nombre = Date.now().toString(36) + "-" + crypto.randomBytes(4).toString("hex") + ".jpg";
    if (USA_BLOB) {
        const r = await blob.put("productos/" + nombre, buffer, {
            access: "public",
            contentType: "image/jpeg",
            addRandomSuffix: false
        });
        return r.url;
    }
    fs.mkdirSync(CARPETA_LOCAL, { recursive: true });
    fs.writeFileSync(path.join(CARPETA_LOCAL, nombre), buffer);
    return "/img/subidas/" + nombre;
}

module.exports = { leer, leerActual, modificar, guardarImagen, USA_BLOB };
