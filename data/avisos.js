// Avisos por correo de los cambios hechos en el panel /admin.
//
// Usa Resend (resend.com). En Vercel: Settings > Environment Variables
//   RESEND_API_KEY: la clave de Resend (empieza con "re_"). Sin ella no se envía nada.
//   AVISOS_CORREO:  a quién le llegan los avisos (opcional).
// Sin dominio propio, Resend solo deja enviar al correo con el que se creó la cuenta,
// desde onboarding@resend.dev.
const CLAVE = process.env.RESEND_API_KEY || "";
const PARA = process.env.AVISOS_CORREO || "gahelpadilla10@gmail.com";
const DE = process.env.AVISOS_REMITENTE || "Drea Sparkle <onboarding@resend.dev>";
const SITE_URL = (process.env.SITE_URL || "https://dreasparkle.vercel.app").replace(/\/$/, "");

const ACCIONES = {
    agregar: { verbo: "agregó", etiqueta: "Producto agregado", color: "#1f7a45" },
    editar: { verbo: "editó", etiqueta: "Producto editado", color: "#9a7429" },
    eliminar: { verbo: "eliminó", etiqueta: "Producto eliminado", color: "#b3261e" }
};

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function urlFoto(img) {
    return /^https?:\/\//.test(img) ? img : SITE_URL + img;
}

function precio(p) {
    return typeof p.precio === "number" ? "Q" + p.precio : "Consultar precio";
}

// Los datos del producto que se comparan y muestran, ya como texto
function campos(p, categorias) {
    const categoria = (categorias.find((c) => c.id === p.categoria) || {}).nombre || p.categoria;
    return [
        ["Nombre", p.nombre],
        ["Marca", p.marca || "—"],
        ["Categoría", categoria],
        ["Descripción", p.desc || "—"],
        ["Precio", precio(p)],
        ["Piezas", p.cantidad ?? "—"],
        ["Favorito", p.destacado ? "Sí" : "No"],
        ["Fotos", (p.imagenes || []).length],
        ["Especificaciones", (p.specs || []).map(([n, v]) => n + ": " + v).join(" · ") || "—"]
    ].map(([n, v]) => [n, String(v)]);
}

function cambios(antes, despues, categorias) {
    const a = campos(antes, categorias);
    const lista = campos(despues, categorias)
        .map(([nombre, valor], i) => [nombre, a[i][1], valor])
        .filter(([, viejo, nuevo]) => viejo !== nuevo);
    // Mismo número de fotos pero otras fotos
    if (!lista.some(([n]) => n === "Fotos") && (antes.imagenes || []).join() !== (despues.imagenes || []).join()) {
        lista.push(["Fotos", "otras fotos", "fotos cambiadas o reordenadas"]);
    }
    return lista;
}

function fechaGuatemala() {
    return new Date().toLocaleString("es-GT", { timeZone: "America/Guatemala", dateStyle: "long", timeStyle: "short" });
}

function correoHTML({ usuario, accion, producto, filas, titulo }) {
    const { verbo, etiqueta, color } = ACCIONES[accion];
    const foto = producto.imagenes && producto.imagenes[0];
    const tabla = filas.map((f) =>
        '<tr>' +
            '<td style="padding:8px 12px 8px 0;color:#6b5670;vertical-align:top;white-space:nowrap">' + escapar(f[0]) + '</td>' +
            (f.length === 3
                ? '<td style="padding:8px 0"><span style="color:#b3261e;text-decoration:line-through">' + escapar(f[1]) + '</span><br><span style="color:#1f7a45;font-weight:600">' + escapar(f[2]) + '</span></td>'
                : '<td style="padding:8px 0;color:#2e1233">' + escapar(f[1]) + '</td>') +
        '</tr>'
    ).join("");

    return '<!DOCTYPE html><html lang="es"><body style="margin:0;background:#f7f3f8;font-family:Arial,Helvetica,sans-serif;color:#2e1233">' +
        '<div style="max-width:560px;margin:0 auto;padding:24px 16px">' +
            '<p style="margin:0 0 16px;font-family:Georgia,serif;font-style:italic;font-size:26px"><b>Drea</b> <span style="color:#c2205c">Sparkle</span></p>' +
            '<div style="background:#fff;border:1px solid #e6dcf0;border-radius:16px;padding:24px">' +
                '<p style="margin:0 0 6px;font-size:13px;color:' + color + ';font-weight:700;text-transform:uppercase;letter-spacing:.04em">' + etiqueta + '</p>' +
                '<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px">' + escapar(titulo) + '</h1>' +
                (foto ? '<img src="' + escapar(urlFoto(foto)) + '" alt="" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:cover;border-radius:12px;margin:0 0 16px">' : "") +
                '<p style="margin:0 0 16px;font-size:15px"><b>' + escapar(usuario) + '</b> ' + verbo + ' <b>' + escapar(producto.nombre) + '</b>' +
                    ' el ' + escapar(fechaGuatemala()) + '</p>' +
                (tabla ? '<table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #e6dcf0">' + tabla + '</table>' : "") +
                '<p style="margin:20px 0 0"><a href="' + SITE_URL + '/admin" style="display:inline-block;background:#c2205c;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600;font-size:14px">Abrir el panel</a></p>' +
            '</div>' +
            '<p style="margin:16px 0 0;font-size:12px;color:#6b5670">Aviso automático del panel de Drea Sparkle.</p>' +
        '</div></body></html>';
}

// accion: "agregar" | "editar" | "eliminar". Nunca lanza error: si el correo falla,
// el cambio del producto ya quedó guardado y solo se anota en los registros.
async function avisarCambio({ usuario, accion, antes, despues, categorias }) {
    if (!CLAVE) return;
    const producto = despues || antes;
    let filas;
    if (accion === "editar") {
        filas = cambios(antes, despues, categorias);
        if (!filas.length) return; // guardó sin cambiar nada
    } else {
        filas = campos(producto, categorias);
    }
    const asunto = usuario + " " + ACCIONES[accion].verbo + " “" + producto.nombre + "”";
    try {
        const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: "Bearer " + CLAVE, "Content-Type": "application/json" },
            body: JSON.stringify({ from: DE, to: [PARA], subject: asunto, html: correoHTML({ usuario, accion, producto, filas, titulo: asunto }) }),
            signal: AbortSignal.timeout(5000)
        });
        if (!r.ok) console.error("Resend no envió el aviso:", r.status, await r.text());
    } catch (e) {
        console.error("No se pudo enviar el aviso por correo:", e.message);
    }
}

module.exports = { avisarCambio, ACTIVO: Boolean(CLAVE) };
