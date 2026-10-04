const express = require("express");
const path = require("path");
const productos = require("./data/productos");

const app = express();
const PORT = process.env.PORT || 3000;

// Números de WhatsApp. Código de país 502 (Guatemala): cámbialo si es otro país.
const CODIGO_PAIS = "502";
const NUMEROS = ["41408342", "51981445"];
const MENSAJE_GENERAL = "¡Hola! Vi su página de Pulseras Brillo y me interesa comprar una pulsera. ¿Me pueden dar más información?";

const formatoUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function enlaceWhatsApp(numero, mensaje) {
    return "https://wa.me/" + CODIGO_PAIS + numero + "?text=" + encodeURIComponent(mensaje);
}

app.use(express.static(path.join(__dirname, "public")));

// Catálogo con precio en USD y enlace de WhatsApp ya armado.
// Se alternan los dos números para repartir los mensajes.
app.get("/api/productos", (req, res) => {
    res.json(productos.map((p, i) => {
        const numero = NUMEROS[i % NUMEROS.length];
        const precioUSD = formatoUSD.format(p.precio);
        return {
            ...p,
            precioUSD,
            whatsapp: enlaceWhatsApp(numero, "¡Hola! Me interesa la pulsera \"" + p.nombre + "\" de " + precioUSD + " USD. ¿Está disponible?")
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
        console.log("Pulseras Brillo corriendo en http://localhost:" + PORT);
    });
}

module.exports = app;
