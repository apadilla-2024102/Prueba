// Dónde se guarda el catálogo que se edita desde el panel /admin.
//
// En Vercel los archivos del proyecto no se pueden modificar, así que el catálogo
// y las fotos nuevas se guardan en Vercel Blob (Storage > Blob, con acceso público).
// Al conectar el Blob al proyecto, Vercel crea la variable BLOB_READ_WRITE_TOKEN.
//
// Sin esa variable (en tu computadora) se guarda en data/catalogo.json y public/img/subidas/.
//
// La primera vez se parte del catálogo escrito en data/productos.js.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const inicial = require("./productos");

const USA_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const blob = USA_BLOB ? require("@vercel/blob") : null;

const ARCHIVO_BLOB = "catalogo.json";
const ARCHIVO_LOCAL = path.join(__dirname, "catalogo.json");
const CARPETA_LOCAL = path.join(__dirname, "..", "public", "img", "subidas");

// El sitio público lee el catálogo muchas veces: se guarda en memoria unos segundos.
const VIGENCIA_MS = 15 * 1000;
let enMemoria = null;

function copiaInicial() {
    return JSON.parse(JSON.stringify({
        actualizado: inicial.actualizado,
        categorias: inicial.categorias,
        productos: inicial.productos
    }));
}

// Devuelve { catalogo, version }. version sirve para no pisar cambios de otra persona.
async function leerConVersion() {
    if (USA_BLOB) {
        const r = await blob.get(ARCHIVO_BLOB, { access: "public", useCache: false });
        if (!r || r.statusCode !== 200) return { catalogo: copiaInicial(), version: null };
        const texto = await new Response(r.stream).text();
        return { catalogo: JSON.parse(texto), version: r.blob.etag };
    }
    if (!fs.existsSync(ARCHIVO_LOCAL)) return { catalogo: copiaInicial(), version: null };
    return { catalogo: JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, "utf8")), version: null };
}

async function leer() {
    if (enMemoria && Date.now() - enMemoria.hora < VIGENCIA_MS) return enMemoria.catalogo;
    const { catalogo } = await leerConVersion();
    enMemoria = { catalogo, hora: Date.now() };
    return catalogo;
}

async function guardar(catalogo, version) {
    catalogo.actualizado = new Date().toISOString().slice(0, 10);
    const texto = JSON.stringify(catalogo, null, 2);
    if (USA_BLOB) {
        await blob.put(ARCHIVO_BLOB, texto, {
            access: "public",
            contentType: "application/json",
            addRandomSuffix: false,
            cacheControlMaxAge: 60,
            // Si alguien más guardó mientras tanto, falla en vez de borrar su cambio
            ...(version ? { ifMatch: version } : { allowOverwrite: true })
        });
    } else {
        fs.writeFileSync(ARCHIVO_LOCAL, texto);
    }
    enMemoria = { catalogo, hora: Date.now() };
}

// Lee el catálogo más reciente, aplica el cambio y lo guarda.
// Si dos personas guardan a la vez, reintenta con la versión nueva.
async function modificar(cambio) {
    for (let intento = 0; ; intento++) {
        const { catalogo, version } = await leerConVersion();
        const resultado = cambio(catalogo);
        try {
            await guardar(catalogo, version);
            return resultado;
        } catch (e) {
            if (!(blob && e instanceof blob.BlobPreconditionFailedError) || intento >= 2) throw e;
        }
    }
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

// Borra fotos subidas desde el panel que ya no usa ningún producto.
// Las fotos originales de /img/ del proyecto nunca se borran.
async function borrarImagenes(direcciones) {
    for (const dir of direcciones) {
        try {
            if (USA_BLOB && /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(dir)) {
                await blob.del(dir);
            } else if (!USA_BLOB && dir.startsWith("/img/subidas/")) {
                fs.rmSync(path.join(CARPETA_LOCAL, path.basename(dir)), { force: true });
            }
        } catch (e) {
            console.error("No se pudo borrar la foto", dir, e.message);
        }
    }
}

module.exports = { leer, modificar, guardarImagen, borrarImagenes, USA_BLOB };
