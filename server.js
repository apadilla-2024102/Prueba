const express = require("express");
const fs = require("fs");
const path = require("path");
const { categorias, productos } = require("./data/productos");
const plantillas = require("./public/plantillas");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Google Search Console ----------
// SITE_URL: la dirección pública de la página, sin "/" al final
//   (ej. https://dreasparkle.vercel.app). Si no se define, se usa la del navegador.
// GOOGLE_SITE_VERIFICATION: el código que da Search Console en
//   "Etiqueta HTML" (solo lo que va dentro de content="...").
// Las dos se configuran en Vercel: Settings > Environment Variables.
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";
const NOMBRE_TIENDA = "Drea Sparkle";
const ACTUALIZADO = fs.statSync(path.join(__dirname, "data", "productos.js")).mtime.toISOString().slice(0, 10);

// Vercel atiende detrás de un proxy: así req.protocol es "https"
app.set("trust proxy", true);

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

app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.get("/api/categorias", (req, res) => {
    res.json(categorias);
});

// Catálogo con precio en quetzales, aproximado en dólares y enlace de WhatsApp ya armado.
// Se alternan los dos números para repartir los mensajes.
function productosParaMostrar() {
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

app.get("/api/productos", (req, res) => {
    res.json(productosParaMostrar());
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
            address: { "@type": "PostalAddress", addressCountry: "GT" }
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
                    image: p.imagenes.map((img) => base + img),
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

function etiquetasSEO(base, lista) {
    const titulo = "Drea Sparkle | Fragancias, skincare y joyería en Guatemala";
    const descripcion = "Fragancias Victoria's Secret y Sol de Janeiro, cuidado facial, maquillaje y joyería. Precios en quetzales y pedidos por WhatsApp.";
    const json = JSON.stringify(datosEstructurados(base, lista)).replace(/</g, "\\u003c");
    return [
        '<link rel="canonical" href="' + base + '/">',
        '<meta name="robots" content="index, follow, max-image-preview:large">',
        GOOGLE_SITE_VERIFICATION ? '<meta name="google-site-verification" content="' + plantillas.escapar(GOOGLE_SITE_VERIFICATION) + '">' : "",
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="es_GT">',
        '<meta property="og:site_name" content="' + NOMBRE_TIENDA + '">',
        '<meta property="og:title" content="' + plantillas.escapar(titulo) + '">',
        '<meta property="og:description" content="' + plantillas.escapar(descripcion) + '">',
        '<meta property="og:url" content="' + base + '/">',
        '<meta property="og:image" content="' + base + '/img/og-drea-sparkle.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<script type="application/ld+json">' + json + '</script>'
    ].filter(Boolean).join("\n    ");
}

app.get("/", (req, res) => {
    const base = urlBase(req);
    const lista = productosParaMostrar();
    const html = PLANTILLA
        .replace("<!--SEO-->", etiquetasSEO(base, lista))
        .replace("<!--CATEGORIAS-->", categorias.map(plantillas.categoriaHTML).join(""))
        .replace("<!--CONTADOR-->", plantillas.contadorTexto(lista.length))
        .replace("<!--PRODUCTOS-->", plantillas.ordenar(lista).map(plantillas.tarjetaHTML).join(""))
        // Enlaces de WhatsApp listos aunque el navegador no ejecute JavaScript
        .replace(/href="#"( class="[^"]*")? data-numero="(\d+)"/g, (todo, clase, numero) =>
            'href="' + enlaceWhatsApp(numero, MENSAJE_GENERAL) + '"' + (clase || "") + ' data-numero="' + numero + '"');
    res.type("html").send(html);
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

app.get("/sitemap.xml", (req, res) => {
    const base = urlBase(req);
    const xml = (t) => plantillas.escapar(t);
    // Una sola página, con las fotos de los productos para Google Imágenes
    const imagenes = [...new Set(productos.flatMap((p) => p.imagenes.slice(0, 1)))];
    res.type("application/xml").send(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
        "  <url>\n" +
        "    <loc>" + xml(base + "/") + "</loc>\n" +
        "    <lastmod>" + ACTUALIZADO + "</lastmod>\n" +
        imagenes.map((img) => "    <image:image><image:loc>" + xml(base + img) + "</image:loc></image:image>\n").join("") +
        "  </url>\n" +
        "</urlset>\n"
    );
});

// ---------- Página no encontrada ----------
app.use((req, res) => {
    res.status(404).type("html").send(
        '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="robots" content="noindex"><title>Página no encontrada | Drea Sparkle</title>' +
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"></head>' +
        '<body><main class="no-encontrada"><h1>Esta página no existe</h1>' +
        '<p>Puede que el enlace esté mal escrito o que el producto ya no esté disponible.</p>' +
        '<a class="boton boton-principal" href="/">Ir a la tienda</a></main></body></html>'
    );
});

// En Vercel se usa la app exportada; en tu computadora se levanta con npm start.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("Tienda corriendo en http://localhost:" + PORT);
    });
}

module.exports = app;
