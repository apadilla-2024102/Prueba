const express = require("express");
const path = require("path");
const { categorias, productos } = require("./data/productos");

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/categorias", (req, res) => {
    res.json(categorias);
});

// Catálogo con precio en quetzales, aproximado en dólares y enlace de WhatsApp ya armado.
// Se alternan los dos números para repartir los mensajes.
app.get("/api/productos", (req, res) => {
    res.json(productos.map((p, i) => {
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
    }));
});

// Números de contacto con el mensaje de interés general.
app.get("/api/contacto", (req, res) => {
    res.json(NUMEROS.map((numero) => ({
        numero,
        texto: numero.slice(0, 4) + "-" + numero.slice(4),
        whatsapp: enlaceWhatsApp(numero, MENSAJE_GENERAL)
    })));
});

// En Vercel se usa la app exportada; en tu computadora se levanta con npm start.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("Tienda corriendo en http://localhost:" + PORT);
    });
}

module.exports = app;
