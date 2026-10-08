// Catálogo de Drea Sparkle.
// precio: en quetzales (Q). Si un producto no tiene precio (null), la página
// muestra "Consultar precio" y el mensaje de WhatsApp pregunta por él.
// cantidad: piezas disponibles. Con 1 se muestra "Última pieza".
// imagenes: [] muestra un recuadro de "Foto pronto".

const categorias = [
    { id: "fragancias", nombre: "Cremas y fragancias", imagen: "/img/vs-love-spell.jpg" },
    { id: "facial", nombre: "Cuidado facial", imagen: "/img/ordinary-hialuronico.jpg" },
    { id: "pulseras", nombre: "Pulseras", imagen: "/img/pulsera-dijes-dorada.jpg" },
    { id: "anillos", nombre: "Anillos", imagen: "/img/anillos-set-3.jpg" },
    { id: "aretes", nombre: "Aretes", imagen: "/img/aretes-xuping.jpg" },
    { id: "maquillaje", nombre: "Maquillaje", imagen: "/img/rhode-lip-treatment.jpg" }
];

const productos = [
    // ---------- Cremas y fragancias (sin precio en la lista: "Consultar precio") ----------
    { id: 1, categoria: "fragancias", nombre: "Body mist Temptation", marca: "Victoria's Secret", desc: "Bruma perfumada para el cuerpo.", precio: null, imagenes: ["/img/vs-trio-mini-mists.jpg"] },
    { id: 2, categoria: "fragancias", nombre: "Body mist Love Spell", marca: "Victoria's Secret", desc: "Bruma perfumada con flor de cerezo y durazno.", precio: null, imagenes: ["/img/vs-trio-mini-mists.jpg"] },
    { id: 3, categoria: "fragancias", nombre: "Body mist Fruit Crush", marca: "Victoria's Secret", desc: "Bruma perfumada frutal, fresca y dulce.", precio: null, imagenes: ["/img/vs-trio-mini-mists.jpg"] },
    { id: 4, categoria: "fragancias", nombre: "Body mist Coconut Passion", marca: "Victoria's Secret", desc: "Bruma con brillo y aroma a coco.", precio: null, imagenes: ["/img/vs-trio-shimmer.jpg"] },
    { id: 5, categoria: "fragancias", nombre: "Body mist Aqua Kiss", marca: "Victoria's Secret", desc: "Bruma con brillo, fresca y ligera.", precio: null, imagenes: ["/img/vs-trio-shimmer.jpg"] },
    { id: 6, categoria: "fragancias", nombre: "Body mist Bombshell", marca: "Victoria's Secret", desc: "Bruma con brillo y aroma floral frutal.", precio: null, imagenes: ["/img/vs-trio-shimmer.jpg"] },
    { id: 7, categoria: "fragancias", nombre: "Dúo Velvet Petals", marca: "Victoria's Secret", desc: "Body mist y crema perfumada, floral y cremoso.", precio: null, imagenes: ["/img/vs-velvet-petals.jpg"] },
    { id: 8, categoria: "fragancias", nombre: "Dúo Rush", marca: "Victoria's Secret", desc: "Body mist y crema perfumada, aroma intenso.", precio: null, imagenes: ["/img/vs-rush.jpg"] },
    { id: 9, categoria: "fragancias", nombre: "Dúo Pure Seduction", marca: "Victoria's Secret", desc: "Body mist y crema perfumada con ciruela y fresia.", precio: null, imagenes: ["/img/vs-pure-seduction.jpg"], destacado: true },
    { id: 10, categoria: "fragancias", nombre: "Dúo pequeño Bare Vanilla", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño, vainilla suave.", precio: null, imagenes: ["/img/vs-bare-vanilla.jpg"] },
    { id: 11, categoria: "fragancias", nombre: "Dúo pequeño Love Spell", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño.", precio: null, imagenes: ["/img/vs-love-spell.jpg"] },
    { id: 12, categoria: "fragancias", nombre: "Dúo pequeño Fruit Crush", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño.", precio: null, imagenes: ["/img/vs-fruit-crush.jpg"] },
    { id: 13, categoria: "fragancias", nombre: "Cheirosa 59", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: ["/img/sdj-59-tan-lines.jpg"], destacado: true },
    { id: 14, categoria: "fragancias", nombre: "Cheirosa 76", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: ["/img/sdj-76-39.jpg"] },
    { id: 15, categoria: "fragancias", nombre: "Cheirosa 39", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: ["/img/sdj-76-39.jpg"] },
    { id: 16, categoria: "fragancias", nombre: "Tan Lines", marca: "Sol de Janeiro", desc: "Bruma perfumada con tuberosa y coco.", precio: null, imagenes: ["/img/sdj-59-tan-lines.jpg"] },

    // ---------- Cuidado facial ----------
    { id: 17, categoria: "facial", nombre: "Peeling AHA 30% + BHA 2%", marca: "The Ordinary", desc: "Exfoliante de 10 minutos para textura y poros. 30 ml.", precio: 50, cantidad: 3, imagenes: ["/img/ordinary-aha-bha.jpg"] },
    { id: 18, categoria: "facial", nombre: "Ácido hialurónico 2% + B5", marca: "The Ordinary", desc: "Sérum hidratante para todo tipo de piel. 30 ml.", precio: 50, cantidad: 3, imagenes: ["/img/ordinary-hialuronico.jpg"], destacado: true },
    { id: 19, categoria: "facial", nombre: "Cafeína 5% + EGCG", marca: "The Ordinary", desc: "Sérum para ojeras e hinchazón del contorno de ojos. 30 ml.", precio: 50, cantidad: 3, imagenes: ["/img/ordinary-cafeina.jpg"] },
    { id: 20, categoria: "facial", nombre: "Crema Vitamina C 23% + HA", marca: "The Ordinary", desc: "Crema con vitamina C para dar luz y unificar el tono. 30 ml.", precio: 50, cantidad: 3, imagenes: ["/img/ordinary-vitamina-c.jpg"] },
    { id: 21, categoria: "facial", nombre: "Acne Foaming Cream Cleanser", marca: "CeraVe", desc: "Limpiador en crema espumosa para piel con acné.", precio: 45, cantidad: 3, imagenes: [] },
    { id: 22, categoria: "facial", nombre: "Set de cuidado facial", marca: "Dr. Rashel", desc: "Set completo para tu rutina. También por caja a Q250.", precio: 65, cantidad: 2, imagenes: [] },

    // ---------- Maquillaje ----------
    { id: 23, categoria: "maquillaje", nombre: "Gloss Peptide Lip", marca: "Rhode", desc: "Brillo de labios con péptidos. Pregunta por los tonos disponibles.", precio: 25, cantidad: 22, imagenes: ["/img/rhode-lip-treatment.jpg"], destacado: true },
    { id: 24, categoria: "maquillaje", nombre: "Dúo de primer", marca: "e.l.f.", desc: "Dos primers para preparar la piel antes del maquillaje.", precio: 50, cantidad: 2, imagenes: [] },
    { id: 25, categoria: "maquillaje", nombre: "Blender", desc: "Esponja para aplicar base y difuminar.", precio: 15, cantidad: 5, imagenes: ["/img/esponjas-maquillaje.jpg"] },
    { id: 26, categoria: "maquillaje", nombre: "Mini blender", desc: "Esponja pequeña para corrector y detalles.", precio: 10, cantidad: 5, imagenes: ["/img/esponjas-maquillaje.jpg"] },

    // ---------- Pulseras ----------
    { id: 27, categoria: "pulseras", nombre: "Pulsera de dijes dorada", desc: "Brazalete ajustable con dijes de Snoopy, corazón y cristales.", precio: 140, cantidad: 2, imagenes: ["/img/pulsera-dijes-dorada.jpg", "/img/pulsera-dijes-dorada-2.jpg"], destacado: true },
    { id: 28, categoria: "pulseras", nombre: "Pulsera de dijes plateada", desc: "Brazalete ajustable con dijes de Snoopy, hueso y cristales.", precio: 120, cantidad: 2, imagenes: ["/img/pulsera-dijes-plateada.jpg"] },
    { id: 29, categoria: "pulseras", nombre: "Pulsera de dijes con flor", desc: "Brazalete de dijes con detalle de flor.", precio: 70, cantidad: 2, imagenes: [] },
    { id: 30, categoria: "pulseras", nombre: "Pulsera rombo full zirconia", desc: "Pulsera en oro rosa con rombos de zirconia.", precio: 200, cantidad: 2, imagenes: ["/img/pulseras-zirconia-ojo-turco.jpg"] },
    { id: 31, categoria: "pulseras", nombre: "Pulsera ojo turco", desc: "Pulsera delicada con ojitos turcos.", precio: 70, cantidad: 3, imagenes: ["/img/pulseras-zirconia-ojo-turco.jpg"] },
    { id: 32, categoria: "pulseras", nombre: "Pulsera de perlitas 18k", desc: "Pulsera de perlas con detalles en baño de oro 18k.", precio: 140, cantidad: 1, imagenes: ["/img/pulseras-perlas.jpg"] },

    // ---------- Anillos ----------
    { id: 33, categoria: "anillos", nombre: "Anillo de flor", desc: "Anillo dorado con flor de zirconias.", precio: 70, cantidad: 2, imagenes: ["/img/anillos-set-3.jpg"], destacado: true },
    { id: 34, categoria: "anillos", nombre: "Anillo ojo turco", desc: "Anillo dorado con ojitos turcos.", precio: 60, cantidad: 2, imagenes: ["/img/anillos-set-3.jpg"] },
    { id: 35, categoria: "anillos", nombre: "Anillo de serpiente", desc: "Anillo dorado de serpiente con zirconias verdes.", precio: 50, cantidad: 2, imagenes: ["/img/anillos-set-3.jpg"] },
    { id: 36, categoria: "anillos", nombre: "Anillo zirconia azul", desc: "Anillo con zirconia azul.", precio: 50, cantidad: 2, imagenes: [] },
    { id: 37, categoria: "anillos", nombre: "Anillo zirconia blanca", desc: "Anillo con zirconia blanca.", precio: 50, cantidad: 2, imagenes: [] },

    // ---------- Aretes ----------
    { id: 38, categoria: "aretes", nombre: "Aretes de hilo con zirconias", marca: "Xuping", desc: "Aretes largos que atraviesan la oreja, con zirconias en zigzag.", precio: 65, cantidad: 1, imagenes: ["/img/aretes-xuping.jpg"], destacado: true },
    { id: 39, categoria: "aretes", nombre: "Aretes bolita blanca mariposa", desc: "Aretes de bolita blanca con mariposa.", precio: 50, cantidad: 2, imagenes: [] },
    { id: 40, categoria: "aretes", nombre: "Aretes bolita 18k", desc: "Aretes de bolita con baño de oro 18k.", precio: 60, cantidad: 2, imagenes: [] },
    { id: 41, categoria: "aretes", nombre: "Aretes trébol plateados", desc: "Aretes de trébol en tono plata.", precio: 75, cantidad: 1, imagenes: [] },
    { id: 42, categoria: "aretes", nombre: "Aretes trébol dorados", desc: "Aretes de trébol en tono dorado.", precio: 75, cantidad: 1, imagenes: [] }
];

module.exports = { categorias, productos };
