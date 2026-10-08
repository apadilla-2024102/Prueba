// Catálogo de la tienda. Precios en dólares (USD).
// IMPORTANTE: los precios son de ejemplo. Cámbialos por tus precios reales.

const categorias = [
    { id: "fragancias", nombre: "Cremas y fragancias", imagen: "/img/vs-love-spell.jpg" },
    { id: "facial", nombre: "Cuidado facial", imagen: "/img/ordinary-hialuronico.jpg" },
    { id: "pulseras", nombre: "Pulseras", imagen: "/img/pulsera-dijes-dorada.jpg" },
    { id: "anillos", nombre: "Anillos", imagen: "/img/anillos-set-3.jpg" },
    { id: "aretes", nombre: "Aretes", imagen: "/img/aretes-xuping.jpg" },
    { id: "maquillaje", nombre: "Maquillaje", imagen: "/img/rhode-lip-treatment.jpg" }
];

const productos = [
    // Cremas y fragancias
    { id: 1, categoria: "fragancias", nombre: "Set Love Spell", marca: "Victoria's Secret", desc: "Body mist y loción perfumada con aroma a flor de cerezo y durazno.", precio: 28, imagenes: ["/img/vs-love-spell.jpg"], destacado: true },
    { id: 2, categoria: "fragancias", nombre: "Set Bare Vanilla", marca: "Victoria's Secret", desc: "Body mist y loción con vainilla suave y cachemira.", precio: 28, imagenes: ["/img/vs-bare-vanilla.jpg"] },
    { id: 3, categoria: "fragancias", nombre: "Set Fruit Crush", marca: "Victoria's Secret", desc: "Body mist y loción frutal, fresca y dulce.", precio: 28, imagenes: ["/img/vs-fruit-crush.jpg"] },
    { id: 4, categoria: "fragancias", nombre: "Trío de mini mists", marca: "Victoria's Secret", desc: "Temptation, Love Spell y Fruit Crush en tamaño de viaje (75 ml).", precio: 30, imagenes: ["/img/vs-trio-mini-mists.jpg"] },
    { id: 5, categoria: "fragancias", nombre: "Trío de mists con brillo", marca: "Victoria's Secret", desc: "Tres brumas shimmer que dejan un brillo ligero en la piel.", precio: 32, imagenes: ["/img/vs-trio-shimmer.jpg"] },
    { id: 6, categoria: "fragancias", nombre: "Set Velvet Petals", marca: "Victoria's Secret", desc: "Body mist de 250 ml y loción de 236 ml, floral y cremoso.", precio: 30, imagenes: ["/img/vs-velvet-petals.jpg"] },
    { id: 7, categoria: "fragancias", nombre: "Set Pure Seduction", marca: "Victoria's Secret", desc: "Body mist de 250 ml y loción de 236 ml con ciruela y fresia.", precio: 30, imagenes: ["/img/vs-pure-seduction.jpg"], destacado: true },
    { id: 8, categoria: "fragancias", nombre: "Set Rush", marca: "Victoria's Secret", desc: "Body mist de 250 ml y loción de 236 ml, aroma intenso y floral.", precio: 30, imagenes: ["/img/vs-rush.jpg"] },
    { id: 9, categoria: "fragancias", nombre: "Dúo Cheirosa 59 y Tan Lines", marca: "Sol de Janeiro", desc: "Dos brumas perfumadas para cuerpo y cabello.", precio: 45, imagenes: ["/img/sdj-59-tan-lines.jpg"], destacado: true },
    { id: 10, categoria: "fragancias", nombre: "Dúo Cheirosa 76 y 39", marca: "Sol de Janeiro", desc: "Dos brumas perfumadas para cuerpo y cabello.", precio: 45, imagenes: ["/img/sdj-76-39.jpg"] },

    // Cuidado facial
    { id: 11, categoria: "facial", nombre: "Vitamina C 23% + HA", marca: "The Ordinary", desc: "Crema con vitamina C para dar luz y unificar el tono. 30 ml.", precio: 12, imagenes: ["/img/ordinary-vitamina-c.jpg"] },
    { id: 12, categoria: "facial", nombre: "Peeling AHA 30% + BHA 2%", marca: "The Ordinary", desc: "Exfoliante de 10 minutos para textura y poros. 30 ml.", precio: 14, imagenes: ["/img/ordinary-aha-bha.jpg"] },
    { id: 13, categoria: "facial", nombre: "Ácido hialurónico 2% + B5", marca: "The Ordinary", desc: "Sérum hidratante para todo tipo de piel. 30 ml.", precio: 12, imagenes: ["/img/ordinary-hialuronico.jpg"], destacado: true },
    { id: 14, categoria: "facial", nombre: "Cafeína 5% + EGCG", marca: "The Ordinary", desc: "Sérum para ojeras e hinchazón del contorno de ojos. 30 ml.", precio: 11, imagenes: ["/img/ordinary-cafeina.jpg"] },

    // Pulseras
    { id: 15, categoria: "pulseras", nombre: "Pulsera de dijes dorada", desc: "Brazalete ajustable con dijes de Snoopy, corazón y cristales.", precio: 18, imagenes: ["/img/pulsera-dijes-dorada.jpg", "/img/pulsera-dijes-dorada-2.jpg"], destacado: true },
    { id: 16, categoria: "pulseras", nombre: "Pulsera de dijes plateada", desc: "Brazalete ajustable con dijes de Snoopy, hueso y cristales.", precio: 18, imagenes: ["/img/pulsera-dijes-plateada.jpg"] },
    { id: 17, categoria: "pulseras", nombre: "Pulseras de perlas", desc: "Set de 2 pulseras de perlas con detalles dorados.", precio: 14, imagenes: ["/img/pulseras-perlas.jpg"] },
    { id: 18, categoria: "pulseras", nombre: "Pulseras zirconia y ojo turco", desc: "Set de 2: una de zirconias en oro rosa y una de ojo turco.", precio: 15, imagenes: ["/img/pulseras-zirconia-ojo-turco.jpg"] },

    // Anillos
    { id: 19, categoria: "anillos", nombre: "Set de 3 anillos", desc: "Anillos dorados con ojo turco, zirconias y serpiente verde.", precio: 16, imagenes: ["/img/anillos-set-3.jpg"], destacado: true },

    // Aretes
    { id: 20, categoria: "aretes", nombre: "Aretes largos de zirconia", marca: "Xuping", desc: "Aretes de hilo con zirconias en zigzag. Ligeros y brillantes.", precio: 12, imagenes: ["/img/aretes-xuping.jpg"], destacado: true },

    // Maquillaje
    { id: 21, categoria: "maquillaje", nombre: "Peptide Lip Treatment", marca: "Rhode", desc: "Bálsamo de labios con péptidos. Pregunta por los tonos disponibles.", precio: 22, imagenes: ["/img/rhode-lip-treatment.jpg"], destacado: true },
    { id: 22, categoria: "maquillaje", nombre: "Esponjas para maquillaje", desc: "Esponjas suaves para base y corrector, en varios colores.", precio: 6, imagenes: ["/img/esponjas-maquillaje.jpg"] }
];

module.exports = { categorias, productos };
