// Panel de administración oculto: /admin
// No aparece en el menú ni en Google. Solo entran los usuarios de data/usuarios.js.
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const almacen = require("./data/almacen");
const usuarios = require("./data/usuarios");

const router = express.Router();

// ---------- Sesión ----------
// La sesión va en una cookie firmada. La clave de firma sale de ADMIN_SECRET o, si no
// existe, del token del Blob (los dos son secretos y no cambian entre servidores).
const SECRETO = process.env.ADMIN_SECRET
    || (process.env.BLOB_READ_WRITE_TOKEN && crypto.createHash("sha256").update("sesion:" + process.env.BLOB_READ_WRITE_TOKEN).digest("hex"))
    || crypto.randomBytes(32).toString("hex");
const COOKIE = "ds_admin";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

function buscarUsuario(nombre) {
    const n = String(nombre || "").trim().toLowerCase();
    return usuarios.find((u) => u.usuario.toLowerCase() === n);
}

// La firma incluye la huella de la contraseña: si se cambia, las sesiones viejas dejan de valer.
function firmar(u, expira) {
    return crypto.createHmac("sha256", SECRETO).update(u.usuario + "|" + expira + "|" + u.hash).digest("base64url");
}

function iguales(a, b) {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function claveCorrecta(u, clave) {
    const hash = crypto.scryptSync(String(clave || ""), u.sal, 64).toString("hex");
    return iguales(hash, u.hash);
}

function leerCookie(req) {
    const par = (req.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
    return par ? decodeURIComponent(par.slice(COOKIE.length + 1)) : "";
}

function usuarioDeSesion(req) {
    const [nombre, expira, firma] = leerCookie(req).split("|");
    const u = buscarUsuario(nombre);
    if (!u || !firma || Number(expira) < Date.now()) return null;
    return iguales(firma, firmar(u, expira)) ? u : null;
}

function opcionesCookie(req) {
    return { httpOnly: true, sameSite: "strict", secure: req.secure, path: "/admin" };
}

// ---------- Freno a los intentos fallidos ----------
// 5 intentos fallidos desde la misma conexión la bloquean 15 minutos.
const fallos = new Map();
const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

function bloqueado(ip) {
    const f = fallos.get(ip);
    if (!f) return false;
    if (Date.now() - f.desde > BLOQUEO_MS) { fallos.delete(ip); return false; }
    return f.veces >= MAX_FALLOS;
}

function anotarFallo(ip) {
    const f = fallos.get(ip) || { veces: 0, desde: Date.now() };
    f.veces++;
    fallos.set(ip, f);
}

// ---------- Rutas ----------
router.use((req, res, next) => {
    res.set({ "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" });
    next();
});

const PANEL = fs.readFileSync(path.join(__dirname, "views", "admin.html"), "utf8");
router.get("/", (req, res) => res.type("html").send(PANEL));

router.use("/api", express.json({ limit: "4mb" }));

router.post("/api/entrar", (req, res) => {
    if (bloqueado(req.ip)) {
        return res.status(429).json({ error: "Demasiados intentos. Espera 15 minutos y vuelve a probar." });
    }
    const u = buscarUsuario(req.body?.usuario);
    if (!u || !claveCorrecta(u, req.body?.clave)) {
        anotarFallo(req.ip);
        return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
    fallos.delete(req.ip);
    const expira = String(Date.now() + DURACION_MS);
    res.cookie(COOKIE, u.usuario + "|" + expira + "|" + firmar(u, expira), { ...opcionesCookie(req), maxAge: DURACION_MS });
    res.json({ usuario: u.usuario });
});

router.post("/api/salir", (req, res) => {
    res.clearCookie(COOKIE, opcionesCookie(req));
    res.json({ ok: true });
});

// Todo lo de abajo exige sesión
router.use("/api", (req, res, next) => {
    req.admin = usuarioDeSesion(req);
    if (!req.admin) return res.status(401).json({ error: "Tu sesión terminó. Vuelve a entrar." });
    next();
});

router.get("/api/sesion", (req, res) => res.json({ usuario: req.admin.usuario }));

router.get("/api/catalogo", async (req, res) => {
    const { categorias, productos } = await almacen.leerActual();
    res.json({ categorias, productos, almacenamiento: almacen.USA_BLOB ? "blob" : "local" });
});

// ---------- Validación de un producto ----------
// Errores en los datos que mandó el panel: se muestran tal cual a la persona.
class ErrorDeDatos extends Error {}

const FOTO_VALIDA = /^(\/img\/[\w\-./]+\.(jpe?g|png|webp)|https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/[\w\-./]+)$/i;

function texto(valor, max) {
    return String(valor ?? "").trim().slice(0, max);
}

function limpiarProducto(datos, categorias) {
    const nombre = texto(datos.nombre, 120);
    if (!nombre) throw new ErrorDeDatos("Escribe el nombre del producto.");
    const categoria = String(datos.categoria || "");
    if (!categorias.some((c) => c.id === categoria)) throw new ErrorDeDatos("Elige una categoría.");

    let precio = null;
    if (datos.precio !== null && datos.precio !== "" && datos.precio !== undefined) {
        precio = Math.round(Number(datos.precio) * 100) / 100;
        if (!Number.isFinite(precio) || precio < 0) throw new ErrorDeDatos("El precio debe ser un número mayor o igual a 0.");
    }

    let cantidad;
    if (datos.cantidad !== null && datos.cantidad !== "" && datos.cantidad !== undefined) {
        cantidad = Number(datos.cantidad);
        if (!Number.isInteger(cantidad) || cantidad < 0) throw new ErrorDeDatos("La cantidad debe ser un número entero.");
    }

    const imagenes = (Array.isArray(datos.imagenes) ? datos.imagenes : [])
        .map((i) => String(i)).filter(Boolean).slice(0, 3);
    if (imagenes.some((i) => !FOTO_VALIDA.test(i))) throw new ErrorDeDatos("Hay una foto con una dirección no válida.");

    const specs = (Array.isArray(datos.specs) ? datos.specs : [])
        .map((s) => [texto(s?.[0], 40), texto(s?.[1], 200)])
        .filter(([n, v]) => n && v)
        .slice(0, 20);

    const marca = texto(datos.marca, 60);
    return {
        categoria,
        nombre,
        ...(marca ? { marca } : {}),
        desc: texto(datos.desc, 600),
        precio,
        ...(cantidad !== undefined ? { cantidad } : {}),
        imagenes,
        ...(datos.destacado ? { destacado: true } : {}),
        specs
    };
}

function responderError(res, e) {
    const esDelUsuario = e instanceof ErrorDeDatos;
    if (!esDelUsuario) console.error(e);
    res.status(esDelUsuario ? 400 : 500).json({
        error: esDelUsuario ? e.message : "No se pudo guardar. Intenta de nuevo en un momento."
    });
}

router.post("/api/productos", async (req, res) => {
    try {
        const producto = await almacen.modificar((catalogo) => {
            const nuevo = { id: Math.max(0, ...catalogo.productos.map((p) => p.id)) + 1, ...limpiarProducto(req.body, catalogo.categorias) };
            catalogo.productos.push(nuevo);
            return nuevo;
        });
        res.status(201).json(producto);
    } catch (e) { responderError(res, e); }
});

router.put("/api/productos/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const producto = await almacen.modificar((catalogo) => {
            const i = catalogo.productos.findIndex((p) => p.id === id);
            if (i < 0) throw new ErrorDeDatos("Ese producto ya no existe.");
            catalogo.productos[i] = { id, ...limpiarProducto(req.body, catalogo.categorias) };
            return catalogo.productos[i];
        });
        res.json(producto);
    } catch (e) { responderError(res, e); }
});

router.delete("/api/productos/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        await almacen.modificar((catalogo) => {
            const i = catalogo.productos.findIndex((p) => p.id === id);
            if (i < 0) throw new ErrorDeDatos("Ese producto ya no existe.");
            catalogo.productos.splice(i, 1);
        });
        res.json({ ok: true });
    } catch (e) { responderError(res, e); }
});

// Recibe una foto en JPEG (el navegador ya la achicó) como data URL
router.post("/api/imagenes", async (req, res) => {
    const coincide = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.datos || ""));
    const buffer = coincide ? Buffer.from(coincide[1], "base64") : null;
    if (!buffer || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer.length > 3 * 1024 * 1024) {
        return res.status(400).json({ error: "La foto no es válida o pesa demasiado." });
    }
    try {
        res.status(201).json({ url: await almacen.guardarImagen(buffer) });
    } catch (e) { responderError(res, e); }
});

module.exports = router;
