// Catálogo de Drea Sparkle.
// precio: en quetzales (Q). Si un producto no tiene precio (null), la página
// muestra "Consultar precio" y el mensaje de WhatsApp pregunta por él.
// cantidad: piezas disponibles. Con 1 se muestra "Última pieza".
// imagenes: hasta 3 fotos; la primera es la de la tarjeta. [] muestra "Foto pronto".
// Las fotos de /img/detalle/ son acercamientos sacados de la foto original.
// specs: especificaciones que se ven en el detalle del producto.

// Fecha de la última actualización del catálogo (año-mes-día).
// Cámbiala cada vez que agregues productos o cambies precios: Google la lee en el sitemap.
const actualizado = "2026-10-19";

const categorias = [
    { id: "fragancias", nombre: "Cremas y fragancias", imagen: "/img/vs-love-spell.jpg" },
    { id: "facial", nombre: "Cuidado facial", imagen: "/img/ordinary-hialuronico.jpg" },
    { id: "pulseras", nombre: "Pulseras", imagen: "/img/pulsera-dijes-dorada.jpg" },
    { id: "anillos", nombre: "Anillos", imagen: "/img/anillos-set-3.jpg" },
    { id: "aretes", nombre: "Aretes", imagen: "/img/aretes-xuping.jpg" },
    { id: "maquillaje", nombre: "Maquillaje", imagen: "/img/rhode-lip-treatment.jpg" }
];

// Foto propia del producto + sus dos acercamientos
const fotos = (id, original) => [original, "/img/detalle/" + id + "-a.jpg", "/img/detalle/" + id + "-b.jpg"];
// Producto que sale en una foto de grupo: primero su acercamiento, luego la foto completa
const fotosDeGrupo = (id, original) => ["/img/detalle/" + id + "-a.jpg", original, "/img/detalle/" + id + "-b.jpg"];

const usoMist = "Rocía a unos 15 cm sobre la piel o la ropa.";

const productos = [
    // ---------- Cremas y fragancias (sin precio en la lista: "Consultar precio") ----------
    { id: 1, categoria: "fragancias", nombre: "Body mist Temptation", marca: "Victoria's Secret", desc: "Bruma perfumada para el cuerpo, tamaño de viaje.", precio: null, imagenes: fotosDeGrupo(1, "/img/vs-trio-mini-mists.jpg"),
        specs: [["Tipo", "Body mist (bruma perfumada)"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 2, categoria: "fragancias", nombre: "Body mist Love Spell", marca: "Victoria's Secret", desc: "Bruma perfumada con flor de cerezo y durazno, tamaño de viaje.", precio: null, imagenes: ["/img/nuevas/vs-love-spell-mist.jpg", "/img/nuevas/vs-love-spell-mist-a.jpg", "/img/nuevas/vs-love-spell-mist-b.jpg"],
        specs: [["Tipo", "Body mist (bruma perfumada)"], ["Aroma", "Flor de cerezo y durazno"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 3, categoria: "fragancias", nombre: "Body mist Fruit Crush", marca: "Victoria's Secret", desc: "Bruma perfumada frutal y dulce, tamaño de viaje.", precio: null, imagenes: ["/img/nuevas/vs-fruit-crush-mist.jpg", "/img/nuevas/vs-fruit-crush-mist-a.jpg", "/img/nuevas/vs-fruit-crush-mist-b.jpg"],
        specs: [["Tipo", "Body mist (bruma perfumada)"], ["Aroma", "Frutal y dulce"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 4, categoria: "fragancias", nombre: "Body mist Coconut Passion", marca: "Victoria's Secret", desc: "Bruma con brillo y aroma a coco y vainilla.", precio: null, imagenes: ["/img/nuevas/vs-coconut-passion-mist.jpg", "/img/nuevas/vs-coconut-passion-mist-a.jpg", "/img/nuevas/vs-coconut-passion-mist-b.jpg"],
        specs: [["Tipo", "Body mist con brillo (shimmer)"], ["Aroma", "Coco y vainilla"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 5, categoria: "fragancias", nombre: "Body mist Aqua Kiss", marca: "Victoria's Secret", desc: "Bruma con brillo, fresca y ligera.", precio: null, imagenes: ["/img/nuevas/vs-aqua-kiss-mist.jpg", "/img/nuevas/vs-aqua-kiss-mist-a.jpg", "/img/nuevas/vs-aqua-kiss-mist-b.jpg"],
        specs: [["Tipo", "Body mist con brillo (shimmer)"], ["Aroma", "Fresco y floral"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 6, categoria: "fragancias", nombre: "Body mist Bombshell", marca: "Victoria's Secret", desc: "Bruma con brillo, tamaño de viaje.", precio: null, imagenes: ["/img/nuevas/vs-bombshell-mist.jpg", "/img/nuevas/vs-bombshell-mist-a.jpg", "/img/nuevas/vs-bombshell-mist-b.jpg"],
        specs: [["Tipo", "Body mist con brillo (shimmer)"], ["Contenido", "75 ml"], ["Uso", usoMist]] },
    { id: 7, categoria: "fragancias", nombre: "Dúo Velvet Petals", marca: "Victoria's Secret", desc: "Body mist y crema perfumada, floral y cremoso.", precio: null, imagenes: fotos(7, "/img/vs-velvet-petals.jpg"),
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "Mist 250 ml · Loción 236 ml"], ["Aroma", "Floral y cremoso"], ["Uso", "Aplica la loción después del baño y rocía el mist encima para que el aroma dure más."]] },
    { id: 8, categoria: "fragancias", nombre: "Dúo Rush", marca: "Victoria's Secret", desc: "Body mist y crema perfumada, aroma intenso.", precio: null, imagenes: fotos(8, "/img/vs-rush.jpg"),
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "Mist 250 ml · Loción 236 ml"], ["Uso", "Aplica la loción después del baño y rocía el mist encima para que el aroma dure más."]] },
    { id: 9, categoria: "fragancias", nombre: "Dúo Pure Seduction", marca: "Victoria's Secret", desc: "Body mist y crema perfumada con ciruela y fresia.", precio: null, imagenes: fotos(9, "/img/vs-pure-seduction.jpg"), destacado: true,
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "Mist 250 ml · Loción 236 ml"], ["Aroma", "Ciruela roja y fresia"], ["Uso", "Aplica la loción después del baño y rocía el mist encima para que el aroma dure más."]] },
    { id: 10, categoria: "fragancias", nombre: "Dúo pequeño Bare Vanilla", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño, vainilla suave.", precio: null, imagenes: fotos(10, "/img/vs-bare-vanilla.jpg"),
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "125 ml cada uno"], ["Aroma", "Vainilla y cachemira"], ["Ideal para", "Llevar en la bolsa o regalar"]] },
    { id: 11, categoria: "fragancias", nombre: "Dúo pequeño Love Spell", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño.", precio: null, imagenes: fotos(11, "/img/vs-love-spell.jpg"),
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "125 ml cada uno"], ["Aroma", "Flor de cerezo y durazno"], ["Ideal para", "Llevar en la bolsa o regalar"]] },
    { id: 12, categoria: "fragancias", nombre: "Dúo pequeño Fruit Crush", marca: "Victoria's Secret", desc: "Body mist y crema en tamaño pequeño.", precio: null, imagenes: fotos(12, "/img/vs-fruit-crush.jpg"),
        specs: [["Incluye", "Body mist y loción perfumada"], ["Contenido", "125 ml cada uno"], ["Aroma", "Frutal y dulce"], ["Ideal para", "Llevar en la bolsa o regalar"]] },
    { id: 13, categoria: "fragancias", nombre: "Cheirosa 59", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: ["/img/nuevas/sdj-cheirosa-59.jpg", "/img/nuevas/sdj-cheirosa-59-a.jpg", "/img/nuevas/sdj-cheirosa-59-b.jpg"], destacado: true,
        specs: [["Tipo", "Perfume mist para cuerpo y cabello"], ["Uso", "Rocía sobre la piel y el cabello. Puedes combinarla con otra Cheirosa."]] },
    { id: 14, categoria: "fragancias", nombre: "Cheirosa 76", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: ["/img/nuevas/sdj-cheirosa-76.jpg", "/img/nuevas/sdj-cheirosa-76-a.jpg", "/img/nuevas/sdj-cheirosa-76-b.jpg"],
        specs: [["Tipo", "Perfume mist para cuerpo y cabello"], ["Uso", "Rocía sobre la piel y el cabello. Puedes combinarla con otra Cheirosa."]] },
    { id: 15, categoria: "fragancias", nombre: "Cheirosa 39", marca: "Sol de Janeiro", desc: "Bruma perfumada para cuerpo y cabello.", precio: null, imagenes: fotosDeGrupo(15, "/img/sdj-76-39.jpg"),
        specs: [["Tipo", "Perfume mist para cuerpo y cabello"], ["Uso", "Rocía sobre la piel y el cabello. Puedes combinarla con otra Cheirosa."]] },
    { id: 16, categoria: "fragancias", nombre: "Tan Lines", marca: "Sol de Janeiro", desc: "Bruma perfumada con tuberosa solar y leche de coco.", precio: null, imagenes: ["/img/nuevas/sdj-tan-lines.jpg", "/img/nuevas/sdj-tan-lines-a.jpg", "/img/nuevas/sdj-tan-lines-b.jpg"],
        specs: [["Tipo", "Perfume mist para cuerpo y cabello"], ["Aroma", "Tuberosa solar y leche de coco"], ["Uso", "Rocía sobre la piel y el cabello."]] },

    // ---------- Cuidado facial ----------
    { id: 17, categoria: "facial", nombre: "Peeling AHA 30% + BHA 2%", marca: "The Ordinary", desc: "Exfoliante de 10 minutos para textura y poros.", precio: 50, cantidad: 3, imagenes: fotos(17, "/img/ordinary-aha-bha.jpg"),
        specs: [["Tipo", "Peeling exfoliante facial"], ["Contenido", "30 ml"], ["Ayuda con", "Textura, poros y tono disparejo"], ["Uso", "Por la noche, sobre piel seca. Déjalo máximo 10 minutos y enjuaga. No más de 2 veces por semana."], ["Importante", "Usa protector solar al día siguiente. No lo uses en piel sensible o irritada."]] },
    { id: 18, categoria: "facial", nombre: "Ácido hialurónico 2% + B5", marca: "The Ordinary", desc: "Sérum hidratante para todo tipo de piel.", precio: 50, cantidad: 3, imagenes: fotos(18, "/img/ordinary-hialuronico.jpg"), destacado: true,
        specs: [["Tipo", "Sérum hidratante"], ["Contenido", "30 ml"], ["Tipo de piel", "Todo tipo de piel"], ["Uso", "Mañana y noche, unas gotas antes de tu crema."]] },
    { id: 19, categoria: "facial", nombre: "Cafeína 5% + EGCG", marca: "The Ordinary", desc: "Sérum para ojeras e hinchazón del contorno de ojos.", precio: 50, cantidad: 3, imagenes: fotos(19, "/img/ordinary-cafeina.jpg"),
        specs: [["Tipo", "Sérum para contorno de ojos"], ["Contenido", "30 ml"], ["Ayuda con", "Ojeras e hinchazón"], ["Uso", "Mañana y noche, una gota con toques suaves alrededor del ojo."]] },
    { id: 20, categoria: "facial", nombre: "Crema Vitamina C 23% + HA", marca: "The Ordinary", desc: "Crema con vitamina C para dar luz y unificar el tono.", precio: 50, cantidad: 3, imagenes: fotos(20, "/img/ordinary-vitamina-c.jpg"),
        specs: [["Tipo", "Crema con vitamina C (sin agua ni silicona)"], ["Contenido", "30 ml"], ["Ayuda con", "Luminosidad y tono disparejo"], ["Uso", "Una capa delgada sobre el rostro limpio. Puede dar un leve hormigueo al inicio."]] },
    { id: 21, categoria: "facial", nombre: "Acne Foaming Cream Cleanser", marca: "CeraVe", desc: "Limpiador en crema espumosa para piel con acné.", precio: 45, cantidad: 3, imagenes: [],
        specs: [["Tipo", "Limpiador facial en crema espumosa"], ["Ideal para", "Piel con tendencia al acné"], ["Uso", "Sobre el rostro húmedo, masajea y enjuaga."]] },
    { id: 22, categoria: "facial", nombre: "Set Vitamina C", marca: "Dr. Rashel", desc: "Set de cuidado facial con vitamina C para una piel más luminosa.", precio: 225, imagenes: ["/img/nuevas/dr-rashel-vitamina-c.jpg", "/img/nuevas/dr-rashel-vitamina-c-a.jpg", "/img/nuevas/dr-rashel-vitamina-c-b.jpg"],
        specs: [["Tipo", "Set de cuidado facial"], ["Línea", "Vitamina C"], ["Contenido", "Pregúntanos qué incluye el set"]] },
    { id: 48, categoria: "facial", nombre: "Set White Skin", marca: "Dr. Rashel", desc: "Set de cuidado facial de 4 piezas de la línea White Skin.", precio: 225, imagenes: ["/img/nuevas/dr-rashel-white-skin.jpg", "/img/nuevas/dr-rashel-white-skin-a.jpg", "/img/nuevas/dr-rashel-white-skin-b.jpg"],
        specs: [["Tipo", "Set de cuidado facial"], ["Línea", "White Skin"], ["Contenido", "4 piezas con estuche"]] },

    // ---------- Maquillaje ----------
    { id: 23, categoria: "maquillaje", nombre: "Peptide Lip Treatment caja roja", marca: "Rhode", desc: "Bálsamo de labios con péptidos, tubo blanco.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-rojo.jpg", "/img/nuevas/rhode-treatment-rojo-a.jpg", "/img/nuevas/rhode-treatment-rojo-b.jpg"], destacado: true,
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo sin color)"], ["Tonos", "Pregúntanos qué tonos hay disponibles"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 43, categoria: "maquillaje", nombre: "Peptide Lip Tint rosa claro", marca: "Rhode", desc: "Bálsamo de labios con péptidos y color rosa claro, caja con letras rosas.", precio: 25, imagenes: ["/img/nuevas/rhode-tint-rosa-1.jpg", "/img/nuevas/rhode-tint-rosa-3.jpg", "/img/nuevas/rhode-tint-rosa-1-b.jpg"],
        specs: [["Tipo", "Peptide Lip Tint (bálsamo con color)"], ["Color", "Rosa claro"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y color."]] },
    { id: 51, categoria: "maquillaje", nombre: "Peptide Lip Tint rosa fuerte", marca: "Rhode", desc: "Bálsamo de labios con péptidos y color rosa fuerte, caja con letras blancas.", precio: 25, imagenes: ["/img/nuevas/rhode-tint-rosa-2.jpg", "/img/nuevas/rhode-tint-rosa-2-a.jpg", "/img/nuevas/rhode-tint-rosa-2-b.jpg"],
        specs: [["Tipo", "Peptide Lip Tint (bálsamo con color)"], ["Color", "Rosa fuerte"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y color."]] },
    { id: 44, categoria: "maquillaje", nombre: "Peptide Lip Treatment caja amarilla", marca: "Rhode", desc: "Bálsamo de labios con péptidos, tubo amarillo.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-amarillo.jpg", "/img/nuevas/rhode-treatment-amarillo-a.jpg", "/img/nuevas/rhode-treatment-amarillo-b.jpg"],
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo)"], ["Tonos", "Pregúntanos qué tonos hay disponibles"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 45, categoria: "maquillaje", nombre: "Peptide Lip Treatment tubo blanco", marca: "Rhode", desc: "Bálsamo de labios con péptidos, caja rosa y tubo blanco.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-blanco.jpg", "/img/nuevas/rhode-treatment-blanco-a.jpg", "/img/nuevas/rhode-treatment-blanco-b.jpg"],
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo)"], ["Tonos", "Pregúntanos qué tonos hay disponibles"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 46, categoria: "maquillaje", nombre: "Peptide Lip Treatment tubo gris", marca: "Rhode", desc: "Bálsamo de labios con péptidos, caja blanca y tubo gris.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-gris.jpg", "/img/nuevas/rhode-treatment-gris-2.jpg"],
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo)"], ["Tonos", "Pregúntanos qué tonos hay disponibles"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 47, categoria: "maquillaje", nombre: "Peptide Lip Treatment caja rosa", marca: "Rhode", desc: "Bálsamo de labios con péptidos, caja rosa y tubo gris.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-gris-3.jpg", "/img/nuevas/rhode-treatment-gris-3-a.jpg", "/img/nuevas/rhode-treatment-gris-3-b.jpg"],
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo)"], ["Tonos", "Pregúntanos qué tonos hay disponibles"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 49, categoria: "maquillaje", nombre: "Peptide Lip Treatment caja de rayas", marca: "Rhode", desc: "Bálsamo de labios con péptidos, edición de caja con rayas y tubo celeste.", precio: 25, imagenes: ["/img/nuevas/rhode-treatment-rayas.jpg", "/img/nuevas/rhode-treatment-rayas-a.jpg", "/img/nuevas/rhode-treatment-rayas-b.jpg"],
        specs: [["Tipo", "Peptide Lip Treatment (bálsamo)"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y brillo."]] },
    { id: 50, categoria: "maquillaje", nombre: "Peptide Lip Tint celeste", marca: "Rhode", desc: "Bálsamo de labios con péptidos y color, caja y tubo celeste.", precio: 25, imagenes: ["/img/nuevas/rhode-tint-celeste.jpg", "/img/nuevas/rhode-tint-celeste-a.jpg", "/img/nuevas/rhode-tint-celeste-b.jpg"],
        specs: [["Tipo", "Peptide Lip Tint (bálsamo con color)"], ["Uso", "Aplica directo sobre los labios cuando quieras hidratación y color."]] },
    { id: 24, categoria: "maquillaje", nombre: "Dúo de primer", marca: "e.l.f.", desc: "Dos primers para preparar la piel antes del maquillaje.", precio: 50, cantidad: 2, imagenes: [],
        specs: [["Incluye", "2 primers"], ["Uso", "Aplica una capa delgada antes de la base para que el maquillaje dure más."]] },
    { id: 25, categoria: "maquillaje", nombre: "Blender", desc: "Esponja para aplicar base y difuminar.", precio: 15, cantidad: 5, imagenes: ["/img/nuevas/blender-makeup-tools.jpg", "/img/nuevas/blender-makeup-tools-a.jpg", "/img/nuevas/blender-makeup-tools-b.jpg"],
        specs: [["Tipo", "Esponja de maquillaje en forma de gota"], ["Ideal para", "Base, corrector y difuminar"], ["Uso", "Humedécela y exprímela antes de usar. Aplica con toques suaves."], ["Cuidado", "Lávala con jabón suave cada semana y déjala secar al aire."]] },
    { id: 26, categoria: "maquillaje", nombre: "Mini blender", desc: "Set de esponjas pequeñas para corrector y detalles.", precio: 10, cantidad: 5, imagenes: ["/img/nuevas/esponjas-correct.jpg", "/img/nuevas/esponjas-correct-a.jpg", "/img/nuevas/esponjas-correct-b.jpg"],
        specs: [["Tipo", "Esponjas pequeñas de maquillaje (powder puff)"], ["Ideal para", "Corrector, ojeras y zonas pequeñas"], ["Uso", "Humedécelas y exprímelas antes de usar."], ["Cuidado", "Lávalas con jabón suave cada semana y déjalas secar al aire."]] },

    // ---------- Pulseras ----------
    { id: 27, categoria: "pulseras", nombre: "Pulsera de dijes dorada", desc: "Brazalete ajustable con dijes de Snoopy, corazón y cristales.", precio: 140, cantidad: 2,
        imagenes: ["/img/pulsera-dijes-dorada.jpg", "/img/pulsera-dijes-dorada-2.jpg", "/img/detalle/27-a.jpg"], destacado: true,
        specs: [["Tipo", "Brazalete rígido de cable"], ["Tono", "Dorado"], ["Ajuste", "Abertura ajustable a la muñeca"], ["Dijes", "Snoopy con corazón, hueso, cuentas de cristal y tornasol"]] },
    { id: 28, categoria: "pulseras", nombre: "Pulsera de dijes plateada", desc: "Brazalete ajustable con dijes de Snoopy, hueso y cristales.", precio: 120, cantidad: 2, imagenes: fotos(28, "/img/pulsera-dijes-plateada.jpg"),
        specs: [["Tipo", "Brazalete rígido de cable"], ["Tono", "Plateado"], ["Ajuste", "Abertura ajustable a la muñeca"], ["Dijes", "Snoopy con corazón, hueso, cuentas de cristal y tornasol"]] },
    { id: 29, categoria: "pulseras", nombre: "Pulsera de dijes con flor", desc: "Brazalete de dijes con detalle de flor.", precio: 70, cantidad: 2, imagenes: [],
        specs: [["Tipo", "Pulsera de dijes"], ["Detalle", "Dije de flor"]] },
    { id: 30, categoria: "pulseras", nombre: "Pulsera rombo full zirconia", desc: "Pulsera en oro rosa con rombos de zirconia.", precio: 200, cantidad: 2, imagenes: fotosDeGrupo(30, "/img/pulseras-zirconia-ojo-turco.jpg"),
        specs: [["Tipo", "Pulsera de eslabones"], ["Tono", "Oro rosa"], ["Piedras", "Zirconias en forma de rombo"]] },
    { id: 31, categoria: "pulseras", nombre: "Pulsera ojo turco", desc: "Pulsera delicada con ojitos turcos.", precio: 70, cantidad: 3, imagenes: fotosDeGrupo(31, "/img/pulseras-zirconia-ojo-turco.jpg"),
        specs: [["Tipo", "Pulsera fina de cadena"], ["Detalle", "Ojitos turcos celestes"]] },
    { id: 32, categoria: "pulseras", nombre: "Pulsera de perlitas 18k", desc: "Pulsera de perlas con detalles en baño de oro 18k.", precio: 140, cantidad: 1, imagenes: fotos(32, "/img/pulseras-perlas.jpg"),
        specs: [["Tipo", "Pulsera de perlitas"], ["Material", "Perlas con detalles en baño de oro 18k"]] },

    // ---------- Anillos ----------
    { id: 33, categoria: "anillos", nombre: "Anillo de flor", desc: "Anillo dorado con flor de zirconias.", precio: 70, cantidad: 2, imagenes: fotosDeGrupo(33, "/img/anillos-set-3.jpg"), destacado: true,
        specs: [["Tono", "Dorado"], ["Piedras", "Zirconias blancas con centro azul"], ["Talla", "Escríbenos para confirmar tu talla"]] },
    { id: 34, categoria: "anillos", nombre: "Anillo ojo turco", desc: "Anillo dorado con ojitos turcos.", precio: 60, cantidad: 2, imagenes: fotosDeGrupo(34, "/img/anillos-set-3.jpg"),
        specs: [["Tono", "Dorado"], ["Detalle", "Fila de ojitos turcos"], ["Talla", "Escríbenos para confirmar tu talla"]] },
    { id: 35, categoria: "anillos", nombre: "Anillo de serpiente", desc: "Anillo dorado de serpiente con zirconias verdes.", precio: 50, cantidad: 2, imagenes: fotosDeGrupo(35, "/img/anillos-set-3.jpg"),
        specs: [["Tono", "Dorado"], ["Diseño", "Serpiente envolvente"], ["Piedras", "Zirconias verdes"], ["Talla", "Escríbenos para confirmar tu talla"]] },
    { id: 36, categoria: "anillos", nombre: "Anillo zirconia azul", desc: "Anillo con zirconia azul.", precio: 50, cantidad: 2, imagenes: [],
        specs: [["Piedras", "Zirconia azul"], ["Talla", "Escríbenos para confirmar tu talla"]] },
    { id: 37, categoria: "anillos", nombre: "Anillo zirconia blanca", desc: "Anillo con zirconia blanca.", precio: 50, cantidad: 2, imagenes: [],
        specs: [["Piedras", "Zirconia blanca"], ["Talla", "Escríbenos para confirmar tu talla"]] },

    // ---------- Aretes ----------
    { id: 38, categoria: "aretes", nombre: "Aretes de hilo con zirconias", marca: "Xuping", desc: "Aretes largos que atraviesan la oreja, con zirconias en zigzag.", precio: 65, cantidad: 1, imagenes: fotos(38, "/img/aretes-xuping.jpg"), destacado: true,
        specs: [["Tipo", "Aretes de hilo largos"], ["Piedras", "Zirconias en zigzag"], ["Se usan", "El hilo pasa por la perforación y cuelga por detrás de la oreja"]] },
    { id: 39, categoria: "aretes", nombre: "Aretes bolita blanca mariposa", desc: "Aretes de bolita blanca con mariposa.", precio: 50, cantidad: 2, imagenes: [],
        specs: [["Tipo", "Aretes de bolita"], ["Detalle", "Bolita blanca con mariposa"]] },
    { id: 40, categoria: "aretes", nombre: "Aretes bolita 18k", desc: "Aretes de bolita con baño de oro 18k.", precio: 60, cantidad: 2, imagenes: [],
        specs: [["Tipo", "Aretes de bolita"], ["Material", "Baño de oro 18k"]] },
    { id: 41, categoria: "aretes", nombre: "Aretes trébol plateados", desc: "Aretes de trébol en tono plata.", precio: 75, cantidad: 1, imagenes: [],
        specs: [["Diseño", "Trébol"], ["Tono", "Plateado"]] },
    { id: 42, categoria: "aretes", nombre: "Aretes trébol dorados", desc: "Aretes de trébol en tono dorado.", precio: 75, cantidad: 1, imagenes: [],
        specs: [["Diseño", "Trébol"], ["Tono", "Dorado"]] }
];

module.exports = { categorias, productos, actualizado };
