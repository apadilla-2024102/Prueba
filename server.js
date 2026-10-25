const express = require("express");
const fs = require("fs");
const path = require("path");
const almacen = require("./data/almacen");
const admin = require("./admin");
const plantillas = require("./public/plantillas");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Google Search Console ----------
// SITE_URL: la dirección pública de la página, sin "/" al final.
//   Por defecto https://dreasparkle.vercel.app; cámbiala si usas otro dominio.
// GOOGLE_SITE_VERIFICATION: el código que da Search Console en
//   "Etiqueta HTML" (solo lo que va dentro de content="...").
// Las dos se configuran en Vercel: Settings > Environment Variables.
const SITE_URL = (process.env.SITE_URL || "https://dreasparkle.vercel.app").replace(/\/$/, "");
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";
// GOOGLE_BUSINESS_URL: el enlace de la ficha de Google (Perfil de Empresa).
//   En business.google.com > tu negocio > "Compartir perfil", copia el enlace.
//   Se usa en el pie de página y en los datos estructurados (sameAs).
const GOOGLE_BUSINESS_URL = process.env.GOOGLE_BUSINESS_URL || "";
const NOMBRE_TIENDA = "Drea Sparkle";

// Vercel atiende detrás de un proxy: así req.protocol es "https"
app.set("trust proxy", true);
app.disable("x-powered-by");

// Números de WhatsApp. Código de país 502 (Guatemala): cámbialo si es otro país.
const CODIGO_PAIS = "502";
const NUMEROS = ["41408342", "51981445"];
const MENSAJE_GENERAL = "¡Hola! Vi la página de Drea Sparkle y me interesa comprar. ¿Me pueden dar más información?";

// Los precios del catálogo están en quetzales. El precio en dólares se calcula
// con esta tasa y se muestra como aproximado: actualízala cuando cambie.
const TASA_CAMBIO = 7.70;

const formatoUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatoQ(valor) {
    return "Q" + (Number.isInteger(valor) ? valor : valor.toFixed(2));
}

function enlaceWhatsApp(numero, mensaje) {
    return "https://wa.me/" + CODIGO_PAIS + numero + "?text=" + encodeURIComponent(mensaje);
}

// ---------- Forzar HTTPS ----------
// Redirige http:// a https:// (menos en tu computadora) y le pide al navegador
// que siempre use https (HSTS). Vercel ya redirige, esto cubre cualquier otro hosting.
const ES_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
app.use((req, res, next) => {
    if (ES_LOCAL.test(req.get("host") || "")) return next();
    if (!req.secure) return res.redirect(308, "https://" + req.get("host") + req.originalUrl);
    res.set("Strict-Transport-Security", "max-age=63072000");
    next();
});

// Cabeceras de seguridad básicas
app.use((req, res, next) => {
    res.set({
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "SAMEORIGIN"
    });
    next();
});

// ---------- Velocidad de carga ----------
// Las fotos casi no cambian: el navegador las guarda una semana.
// CSS y JS se guardan un día y se revisan si cambiaron (ETag).
app.use(express.static(path.join(__dirname, "public"), {
    index: false,
    redirect: false,
    setHeaders(res, ruta) {
        if (/\.(jpe?g|png|webp|svg)$/i.test(ruta)) {
            res.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
        } else if (/\.(css|js)$/i.test(ruta)) {
            res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
        }
    }
}));

// Panel de administración oculto (/admin)
app.use("/admin", admin);

app.get("/api/categorias", async (req, res) => {
    res.json((await almacen.leer()).categorias);
});

// Catálogo con precio en quetzales, aproximado en dólares y enlace de WhatsApp ya armado.
// Se alternan los dos números para repartir los mensajes.
async function productosParaMostrar() {
    const { productos } = await almacen.leer();
    return productos.map((p, i) => {
        const numero = NUMEROS[i % NUMEROS.length];
        const nombre = p.marca ? p.nombre + " (" + p.marca + ")" : p.nombre;
        const tienePrecio = typeof p.precio === "number";
        const precioQ = tienePrecio ? formatoQ(p.precio) : null;
        const mensaje = tienePrecio
            ? "¡Hola, Drea Sparkle! Me interesa: " + nombre + " de " + precioQ + ". ¿Está disponible?"
            : "¡Hola, Drea Sparkle! Me interesa: " + nombre + ". ¿Qué precio tiene y está disponible?";
        return {
            ...p,
            precioQ,
            precioUSD: tienePrecio ? formatoUSD.format(p.precio / TASA_CAMBIO) : null,
            whatsapp: enlaceWhatsApp(numero, mensaje)
        };
    });
}

app.get("/api/productos", async (req, res) => {
    res.json(await productosParaMostrar());
});

// Números de contacto con el mensaje de interés general.
app.get("/api/contacto", (req, res) => {
    res.json(NUMEROS.map((numero) => ({
        numero,
        texto: numero.slice(0, 4) + "-" + numero.slice(4),
        whatsapp: enlaceWhatsApp(numero, MENSAJE_GENERAL)
    })));
});

// ---------- Página principal con los productos ya escritos (para Google) ----------
const PLANTILLA = fs.readFileSync(path.join(__dirname, "views", "index.html"), "utf8");

function urlBase(req) {
    return SITE_URL || req.protocol + "://" + req.get("host");
}

// Las fotos subidas desde el panel ya traen su dirección completa (Vercel Blob)
function urlAbsoluta(base, img) {
    return /^https?:\/\//.test(img) ? img : base + img;
}

// Datos estructurados (schema.org) que Google usa para entender la tienda y los productos.
// Solo se listan como Product los que tienen precio: Google marca error si falta.
function datosEstructurados(base, lista) {
    const conPrecio = lista.filter((p) => typeof p.precio === "number" && p.imagenes.length);
    const precios = conPrecio.map((p) => p.precio);
    return [
        {
            "@context": "https://schema.org",
            "@type": "Store",
            name: NOMBRE_TIENDA,
            url: base + "/",
            image: base + "/img/og-drea-sparkle.jpg",
            description: "Fragancias, cuidado facial, maquillaje y joyería en Guatemala con pedidos por WhatsApp.",
            telephone: NUMEROS.map((n) => "+" + CODIGO_PAIS + n),
            currenciesAccepted: "GTQ",
            priceRange: "Q" + Math.min(...precios) + " - Q" + Math.max(...precios),
            address: { "@type": "PostalAddress", addressCountry: "GT" },
            ...(GOOGLE_BUSINESS_URL ? { sameAs: [GOOGLE_BUSINESS_URL], hasMap: GOOGLE_BUSINESS_URL } : {})
        },
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Productos de " + NOMBRE_TIENDA,
            itemListElement: conPrecio.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "Product",
                    name: p.nombre,
                    sku: "DS-" + p.id,
                    description: p.desc,
                    image: p.imagenes.map((img) => urlAbsoluta(base, img)),
                    ...(p.marca ? { brand: { "@type": "Brand", name: p.marca } } : {}),
                    offers: {
                        "@type": "Offer",
                        price: p.precio.toFixed(2),
                        priceCurrency: "GTQ",
                        availability: p.cantidad > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        url: base + "/#productos",
                        seller: { "@type": "Organization", name: NOMBRE_TIENDA }
                    }
                }
            }))
        }
    ];
}

// Meta títulos y descripciones para redes sociales y buscadores.
// ruta: la dirección de la página ("/", "/privacidad"); null para páginas que no se indexan.
function etiquetasSEO(base, { titulo, descripcion, ruta, datos }) {
    const e = plantillas.escapar;
    const url = ruta ? base + ruta : null;
    return [
        url ? '<link rel="canonical" href="' + url + '">' : "",
        '<meta name="robots" content="' + (url ? "index, follow, max-image-preview:large" : "noindex, follow") + '">',
        GOOGLE_SITE_VERIFICATION ? '<meta name="google-site-verification" content="' + e(GOOGLE_SITE_VERIFICATION) + '">' : "",
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="es_GT">',
        '<meta property="og:site_name" content="' + NOMBRE_TIENDA + '">',
        '<meta property="og:title" content="' + e(titulo) + '">',
        '<meta property="og:description" content="' + e(descripcion) + '">',
        url ? '<meta property="og:url" content="' + url + '">' : "",
        '<meta property="og:image" content="' + base + '/img/og-drea-sparkle.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="Productos de Drea Sparkle">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="' + e(titulo) + '">',
        '<meta name="twitter:description" content="' + e(descripcion) + '">',
        datos ? '<script type="application/ld+json">' + JSON.stringify(datos).replace(/</g, "\\u003c") + '</script>' : ""
    ].filter(Boolean).join("\n    ");
}

// Enlaces del pie: política de privacidad y ficha de Google (si está configurada).
function enlacesPie() {
    return '<nav class="pie-enlaces" aria-label="Información">' +
        '<a href="/privacidad">Política de privacidad</a>' +
        (GOOGLE_BUSINESS_URL
            ? '<a href="' + plantillas.escapar(GOOGLE_BUSINESS_URL) + '" target="_blank" rel="noopener">Encuéntranos en Google</a>'
            : "") +
    '</nav>';
}

// Páginas secundarias (privacidad, 404) con la misma barra y pie que la tienda.
const PAGINA = fs.readFileSync(path.join(__dirname, "views", "pagina.html"), "utf8");
const PRIVACIDAD = fs.readFileSync(path.join(__dirname, "views", "privacidad.html"), "utf8");
const NO_ENCONTRADA = fs.readFileSync(path.join(__dirname, "views", "404.html"), "utf8");

function paginaHTML(base, { titulo, descripcion, ruta, contenido }) {
    const e = plantillas.escapar;
    return PAGINA
        .replace("<!--TITULO-->", e(titulo))
        .replace("<!--DESCRIPCION-->", e(descripcion))
        .replace("<!--SEO-->", etiquetasSEO(base, { titulo, descripcion, ruta }))
        .replace("<!--CONTENIDO-->", contenido)
        .replace("<!--ENLACES-PIE-->", enlacesPie())
        .replace("<!--ANIO-->", String(new Date().getFullYear()));
}

app.get("/", async (req, res) => {
    const base = urlBase(req);
    const { categorias } = await almacen.leer();
    const lista = await productosParaMostrar();
    const html = PLANTILLA
        .replace("<!--SEO-->", etiquetasSEO(base, {
            titulo: "Drea Sparkle | Fragancias, skincare y joyería en Guatemala",
            descripcion: "Fragancias Victoria's Secret y Sol de Janeiro, cuidado facial, maquillaje y joyería. Precios en quetzales y pedidos por WhatsApp.",
            ruta: "/",
            datos: datosEstructurados(base, lista)
        }))
        .replace("<!--ENLACES-PIE-->", enlacesPie())
        .replace("<!--CATEGORIAS-->", categorias.map(plantillas.categoriaHTML).join(""))
        .replace("<!--CONTADOR-->", plantillas.contadorTexto(lista.length))
        .replace("<!--PRODUCTOS-->", plantillas.ordenar(lista).map(plantillas.tarjetaHTML).join(""))
        // Enlaces de WhatsApp listos aunque el navegador no ejecute JavaScript
        .replace(/href="#"( class="[^"]*")? data-numero="(\d+)"/g, (todo, clase, numero) =>
            'href="' + enlaceWhatsApp(numero, MENSAJE_GENERAL) + '"' + (clase || "") + ' data-numero="' + numero + '"');
    res.type("html").send(html);
});

// ---------- Política de privacidad ----------
// Fecha de la última vez que se cambió el texto de views/privacidad.html.
const PRIVACIDAD_ACTUALIZADA = "2026-10-23";

app.get("/privacidad", (req, res) => {
    const [anio, mes, dia] = PRIVACIDAD_ACTUALIZADA.split("-").map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia))
        .toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const numeros = NUMEROS.map((n) => n.slice(0, 4) + "-" + n.slice(4)).join(" o al ");
    res.type("html").send(paginaHTML(urlBase(req), {
        titulo: "Política de privacidad | Drea Sparkle",
        descripcion: "Qué datos usa Drea Sparkle cuando visitas la tienda o haces un pedido por WhatsApp, y cómo pedir que los corrijamos o borremos.",
        ruta: "/privacidad",
        contenido: PRIVACIDAD.replace("<!--FECHA-->", fecha).replace("<!--NUMEROS-->", numeros)
    }));
});

// ---------- robots.txt y sitemap.xml ----------
app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(
        "User-agent: *\n" +
        "Allow: /\n" +
        "Disallow: /api/\n\n" +
        "Sitemap: " + urlBase(req) + "/sitemap.xml\n"
    );
});

app.get("/sitemap.xml", async (req, res) => {
    const { productos, actualizado } = await almacen.leer();
    const base = urlBase(req);
    const xml = (t) => plantillas.escapar(t);
    // Una sola página, con las fotos de los productos para Google Imágenes
    const imagenes = [...new Set(productos.flatMap((p) => p.imagenes.slice(0, 1)))];
    res.type("application/xml").send(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
        "  <url>\n" +
        "    <loc>" + xml(base + "/") + "</loc>\n" +
        "    <lastmod>" + actualizado + "</lastmod>\n" +
        imagenes.map((img) => "    <image:image><image:loc>" + xml(urlAbsoluta(base, img)) + "</image:loc></image:image>\n").join("") +
        "  </url>\n" +
        "  <url>\n" +
        "    <loc>" + xml(base + "/privacidad") + "</loc>\n" +
        "    <lastmod>" + PRIVACIDAD_ACTUALIZADA + "</lastmod>\n" +
        "  </url>\n" +
        "</urlset>\n"
    );
});

// ---------- Página no encontrada (404 personalizada) ----------
app.use(async (req, res) => {
    const { categorias } = await almacen.leer();
    const categoriasHTML = categorias.map((c) =>
        '<li><a href="/#productos"><img src="' + c.imagen + '" alt="" loading="lazy" width="300" height="400">' +
        plantillas.escapar(c.nombre) + '</a></li>'
    ).join("");
    res.status(404).type("html").send(paginaHTML(urlBase(req), {
        titulo: "Página no encontrada | Drea Sparkle",
        descripcion: "Esta página no existe. Mira el catálogo de Drea Sparkle o escríbenos por WhatsApp.",
        ruta: null,
        contenido: NO_ENCONTRADA
            .replace("<!--WHATSAPP-->", enlaceWhatsApp(NUMEROS[0], MENSAJE_GENERAL))
            .replace("<!--CATEGORIAS-->", categoriasHTML)
    }));
});

// En Vercel se usa la app exportada; en tu computadora se levanta con npm start.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("Tienda corriendo en http://localhost:" + PORT);
    });
}

module.exports = app;
